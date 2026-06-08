import os
import logging
import warnings

# Prevent hangs during numpy import on Windows with debugger
os.environ["OPENBLAS_NUM_THREADS"] = "1"
os.environ["MKL_NUM_THREADS"] = "1"
os.environ["OMP_NUM_THREADS"] = "1"

# Ignore specific warnings
warnings.filterwarnings('ignore', category=UserWarning)

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

logger.info("Initializing Advanced ML Churn & Scoring Engine...")

import numpy as np
import pandas as pd
import psycopg2
from psycopg2.extras import execute_values
from typing import Tuple
from dotenv import load_dotenv
from scipy import stats
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import MinMaxScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '..', '.env'), override=True)

class KickHubCustomerAnalytics:
    def __init__(self) -> None:
        self.bi_config = {
            'host': os.getenv('BI_HOST', 'localhost'),
            'port': os.getenv('BI_PORT', '5432'),
            'database': os.getenv('BI_DB', 'kickhub_bi'),
            'user': os.getenv('BI_USER', 'postgres'),
            'password': os.getenv('BI_PASSWORD', 'postgres')
        }
        self.features = [
            'recencia_dias', 
            'frequencia_total', 
            'valor_total', 
            'ticket_medio', 
            'tempo_relacionamento_dias'
        ]
        self.churn_threshold_days = 90 # Definição de negócio: > 90 dias sem comprar é churn

    def get_bi_connection(self) -> psycopg2.extensions.connection:
        """Establishes a connection to the BI database."""
        return psycopg2.connect(**self.bi_config)

    def ensure_table_schema(self) -> None:
        """Creates the ML results table with an expanded schema."""
        logger.info("Ensuring ML results table schema exists...")
        query = """
        CREATE TABLE IF NOT EXISTS ml_cliente_scores (
            cliente_id BIGINT PRIMARY KEY,
            recencia_dias INTEGER,
            frequencia_total INTEGER,
            valor_total FLOAT,
            ticket_medio FLOAT,
            tempo_relacionamento_dias INTEGER,
            score_compra_rfm FLOAT,
            probabilidade_churn FLOAT,
            risco_churn VARCHAR(50),
            calculado_em TIMESTAMP DEFAULT NOW()
        );
        """
        conn = None
        try:
            conn = self.get_bi_connection()
            cursor = conn.cursor()
            cursor.execute(query)
            conn.commit()
            logger.info("Table ml_cliente_scores is ready.")
        except Exception as e:
            if conn: conn.rollback()
            logger.error(f"Error creating table schema: {e}")
        finally:
            if conn: conn.close()

    def extract_features(self) -> pd.DataFrame:
        """Extrai métricas RFM diretamente das tabelas do BI via SQL robusto."""
        logger.info("Extracting raw RFM features from BI database...")
        query = """
        WITH metricas_vendas AS (
            SELECT 
                clienteId,
                COUNT(id) as frequencia_total,
                SUM(total) as valor_total,
                AVG(total) as ticket_medio,
                MAX(dataVenda) as ultima_compra,
                MIN(dataVenda) as primeira_compra
            FROM bi_vendas
            WHERE status = 'CONCLUIDA'
            GROUP BY clienteId
        )
        SELECT 
            c.id as cliente_id,
            COALESCE(mv.frequencia_total, 0) as frequencia_total,
            COALESCE(mv.valor_total, 0.0) as valor_total,
            COALESCE(mv.ticket_medio, 0.0) as ticket_medio,
            COALESCE(EXTRACT(DAY FROM (NOW() - mv.ultima_compra)), 365) as recencia_dias, -- 365 default p/ quem nunca comprou
            COALESCE(EXTRACT(DAY FROM (NOW() - mv.primeira_compra)), EXTRACT(DAY FROM (NOW() - c.dataCadastro)), 0) as tempo_relacionamento_dias
        FROM bi_clientes c
        LEFT JOIN metricas_vendas mv ON c.id = mv.clienteId;
        """
        try:
            conn = self.get_bi_connection()
            df = pd.read_sql(query, conn)
            conn.close()
            logger.info(f"Extracted data for {len(df)} clients.")
            return df
        except Exception as e:
            logger.error(f"Error extracting features: {e}")
            return pd.DataFrame()

    def data_quality_pipeline(self, df: pd.DataFrame) -> pd.DataFrame:
        """Executa a rotina rigorosa de qualidade de dados."""
        logger.info("--- Starting Data Quality Pipeline ---")
        initial_count = len(df)
        
        # 1. Tratamento de Duplicidades
        df = df.drop_duplicates(subset=['cliente_id'])
        duplicates_removed = initial_count - len(df)
        logger.info(f"[DQ] Duplicates removed: {duplicates_removed}")

        # 2. Tratamento de Nulos/Inconsistências
        nulls_count = df.isnull().sum().sum()
        df = df.fillna(0) # Preenchimento conservador
        
        # Correção de inconsistências (valores negativos não fazem sentido aqui)
        for col in self.features:
            inconsistent_mask = df[col] < 0
            inconsistencies = inconsistent_mask.sum()
            if inconsistencies > 0:
                logger.info(f"[DQ] Correcting {inconsistencies} negative values in {col}")
                df.loc[inconsistent_mask, col] = 0

        logger.info(f"[DQ] Nulls treated: {nulls_count}")

        # 3. Tratamento de Outliers (Z-Score apenas para clientes com compras para não distorcer)
        df_compradores = df[df['frequencia_total'] > 0]
        if len(df_compradores) > 10:
            z_scores = np.abs(stats.zscore(df_compradores[['valor_total', 'frequencia_total']]))
            # Mantém quem está dentro de 3 desvios padrões (99.7% da distribuição normal)
            outliers_mask = (z_scores > 3).any(axis=1)
            outliers_ids = df_compradores[outliers_mask]['cliente_id'].values
            
            df = df[~df['cliente_id'].isin(outliers_ids)]
            logger.info(f"[DQ] Outliers removed (Z-Score > 3 on Value/Freq): {len(outliers_ids)}")
        else:
            logger.info("[DQ] Not enough active buyers to compute Z-Score reliably. Skipping outlier removal.")

        logger.info(f"--- Data Quality Pipeline Finished. Final valid records: {len(df)} ---")
        return df

    def calculate_customer_score(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Calcula o Score do Cliente (0 a 100) usando lógica ponderada RFM.
        """
        logger.info("Calculating Weighted RFM Customer Score...")
        if df.empty: return df

        # Aplicando MinMaxScaler para colocar cada métrica na escala de 0 a 100
        scaler = MinMaxScaler(feature_range=(0, 100))
        
        # R (Recência) -> Invertido. Quanto menor a recência, maior o score.
        max_recencia = df['recencia_dias'].max() if df['recencia_dias'].max() > 0 else 1
        score_r = 100 - ((df['recencia_dias'] / max_recencia) * 100)
        
        # F (Frequência) e M (Monetário)
        score_f = scaler.fit_transform(df[['frequencia_total']]).flatten()
        score_m = scaler.fit_transform(df[['valor_total']]).flatten()
        score_l = scaler.fit_transform(df[['tempo_relacionamento_dias']]).flatten()

        # Pesos de Negócio (Justificados no README)
        W_R, W_F, W_M, W_L = 0.20, 0.35, 0.35, 0.10

        # Fórmula
        df['score_compra_rfm'] = (W_R * score_r) + (W_F * score_f) + (W_M * score_m) + (W_L * score_l)
        
        # Ajuste fino: Se não tem compra, score é 0
        df.loc[df['frequencia_total'] == 0, 'score_compra_rfm'] = 0.0
        
        # Arredondar para duas casas decimais
        df['score_compra_rfm'] = df['score_compra_rfm'].round(2)
        logger.info(f"Score calculation complete. Average score: {df['score_compra_rfm'].mean():.2f}")
        return df

    def train_churn_model(self, df: pd.DataFrame) -> pd.DataFrame:
        """Treina o Random Forest para prever a probabilidade de Churn."""
        logger.info("Preparing Random Forest Model for Churn Prediction...")
        
        # Variável Alvo (Label)
        # 1 = Churn (Recência > threshold), 0 = Ativo
        y = (df['recencia_dias'] > self.churn_threshold_days).astype(int)
        
        # Se só temos uma classe (ex: ninguém deu churn ainda ou todo mundo deu), não podemos treinar
        if len(np.unique(y)) < 2:
            logger.warning("Target variable has only one class. Cannot train model. Assigning heuristic probabilities.")
            df['probabilidade_churn'] = (df['recencia_dias'] / self.churn_threshold_days).clip(0, 1)
        else:
            X = df[self.features]
            
            # Normalização (crucial para estabilidade)
            scaler = MinMaxScaler()
            X_scaled = scaler.fit_transform(X)

            # Split
            X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42, stratify=y)

            # Modelo - Random Forest é robusto para relacionamentos não-lineares
            model = RandomForestClassifier(n_estimators=150, max_depth=10, random_state=42, class_weight='balanced')
            model.fit(X_train, y_train)

            # Avaliação Rigorosa
            y_pred = model.predict(X_test)
            y_prob = model.predict_proba(X_test)[:, 1]

            logger.info("--- Model Evaluation Metrics ---")
            logger.info(f"Accuracy:  {accuracy_score(y_test, y_pred):.4f} (Proporção de acertos totais)")
            logger.info(f"Precision: {precision_score(y_test, y_pred, zero_division=0):.4f} (Qnd prevê Churn, qt vezes acerta?)")
            logger.info(f"Recall:    {recall_score(y_test, y_pred, zero_division=0):.4f} (Dos que dão Churn, qts o modelo captura?)")
            logger.info(f"F1 Score:  {f1_score(y_test, y_pred, zero_division=0):.4f} (Equilíbrio Precisão/Recall)")
            
            try:
                auc = roc_auc_score(y_test, y_prob)
                logger.info(f"ROC AUC:   {auc:.4f} (Capacidade de separar as classes)")
            except ValueError:
                pass # Pode falhar se y_test tiver só 1 classe num dataset muito pequeno

            # Previsão final para base toda
            rf_probs = model.predict_proba(X_scaled)[:, 1]
            
            # --- HYBRID GRANULARITY ENGINE (The absolute fix) ---
            # Linear Decay: We normalize recency to 120 days.
            # 30 days = 0.25 (Médio), 60 days = 0.50 (Alto), 90 days = 0.75 (Crítico)
            recency_decay = (df['recencia_dias'] / 120).clip(0, 1)
            
            # Hybrid Blend: 30% AI Pattern + 70% Strict Time Decay
            # This forces the granularity even if the ML is "too certain"
            df['probabilidade_churn'] = (rf_probs * 0.3) + (recency_decay * 0.7)

        # Regras de Classificação de Risco (Granularidade Simples: 25/50/75)
        def classify_risk(prob: float) -> str:
            if prob >= 0.75: return 'Crítico'
            if prob >= 0.50: return 'Alto'
            if prob >= 0.25: return 'Médio'
            return 'Baixo'

        df['probabilidade_churn'] = df['probabilidade_churn'].round(4)
        df['risco_churn'] = df['probabilidade_churn'].apply(classify_risk)
        
        logger.info("Churn prediction generated and classified.")
        return df

    def save_results(self, df: pd.DataFrame) -> None:
        """Salva as análises na tabela final."""
        if df.empty: return
        logger.info("Saving results to database...")

        conn = None
        try:
            conn = self.get_bi_connection()
            cursor = conn.cursor()

            # Em vez de TRUNCATE, usamos ON CONFLICT para manter o histórico caso precisemos no futuro
            # Mas como não temos histórico configurado na PK, faremos um TRUNCATE limpo + INSERT para o snapshot atual
            cursor.execute("TRUNCATE TABLE ml_cliente_scores")
            
            columns = [
                'cliente_id', 'recencia_dias', 'frequencia_total', 'valor_total', 
                'ticket_medio', 'tempo_relacionamento_dias', 'score_compra_rfm', 
                'probabilidade_churn', 'risco_churn'
            ]
            
            # Converter df para lista de tuplas nativas do python
            records = df[columns].replace({np.nan: None}).to_records(index=False).tolist()
            
            query = f"""
            INSERT INTO ml_cliente_scores (
                {', '.join(columns)}
            ) VALUES %s
            """
            
            execute_values(cursor, query, records)
            conn.commit()
            logger.info(f"Successfully saved analytics for {len(records)} clients.")
            
        except Exception as e:
            if conn: conn.rollback()
            logger.error(f"Error saving results: {e}")
        finally:
            if conn: conn.close()

    def run(self) -> None:
        """Executa o Pipeline Completo de Advanced Analytics."""
        logger.info("====== INITIATING CUSTOMER ANALYTICS BATCH ======")
        self.ensure_table_schema()
        
        df = self.extract_features()
        if not df.empty:
            df = self.data_quality_pipeline(df)
            df = self.calculate_customer_score(df)
            df = self.train_churn_model(df)
            self.save_results(df)
        else:
            logger.warning("No data found to process.")
        
        logger.info("====== CUSTOMER ANALYTICS BATCH FINISHED ======")

if __name__ == "__main__":
    pipeline = KickHubCustomerAnalytics()
    pipeline.run()
