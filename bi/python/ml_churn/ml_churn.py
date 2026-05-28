import os
import logging
import numpy as np
import pandas as pd
import psycopg2
from typing import Tuple
from dotenv import load_dotenv
from scipy import stats
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import MinMaxScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '.env'))

class MLChurn:
    def __init__(self) -> None:
        self.bi_config = {
            'host': os.getenv('BI_HOST'),
            'port': os.getenv('BI_PORT'),
            'database': os.getenv('BI_DB'),
            'user': os.getenv('BI_USER'),
            'password': os.getenv('BI_PASSWORD')
        }
        self.features = [
            'frequencia_compra', 
            'ticket_medio', 
            'total_pedidos', 
            'dias_sem_comprar', 
            'valor_total_gasto'
        ]

    def get_bi_connection(self) -> psycopg2.extensions.connection:
        """Establishes a connection to the BI database."""
        return psycopg2.connect(**self.bi_config)

    def fetch_features(self) -> pd.DataFrame:
        """Fetches churn features from the BI view."""
        try:
            conn = self.get_bi_connection()
            query = "SELECT * FROM vw_churn_features"
            df = pd.read_sql(query, conn)
            conn.close()
            return df
        except Exception as e:
            logger.error(f"Error fetching features: {str(e)}")
            return pd.DataFrame()

    def preprocess_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """Cleans and normalizes the data."""
        if df.empty:
            return df

        # Fill NaNs
        df = df.fillna(0)

        # Remove duplicates
        df = df.drop_duplicates()

        # Remove outliers using Z-Score > 3
        z_scores = np.abs(stats.zscore(df[self.features]))
        df = df[(z_scores < 3).all(axis=1)]

        return df

    def train_and_predict(self, df: pd.DataFrame) -> pd.DataFrame:
        """Trains a Random Forest model and generates scores."""
        if df.empty or len(df) < 5:
            logger.warning("Not enough data to train the model.")
            return df

        X = df[self.features]
        
        # Min-Max Normalization
        scaler = MinMaxScaler()
        X_scaled = scaler.fit_transform(X)
        
        # Creating a synthetic target for training (since we don't have real labels)
        # Churn = 1 if dias_sem_comprar > 90 days (example heuristic)
        y = (df['dias_sem_comprar'] > 90).astype(int)

        # Split for metrics
        X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42)

        # Random Forest Model
        model = RandomForestClassifier(n_estimators=100, random_state=42)
        model.fit(X_train, y_train)

        # Metrics
        y_pred = model.predict(X_test)
        acc = accuracy_score(y_test, y_pred)
        logger.info(f"Model Accuracy: {acc:.2f}")
        logger.info(f"Features used: {self.features}")

        # Predictions for all clients
        # score_compra is the inverse of churn probability
        probs = model.predict_proba(X_scaled)
        
        df['risco_churn'] = probs[:, 1] # Probability of class 1 (churn)
        df['score_compra'] = 1 - df['risco_churn']
        
        # Classification
        def classify(risk: float) -> str:
            if risk > 0.7: return 'alto'
            if risk > 0.3: return 'medio'
            return 'baixo'

        df['classificacao'] = df['risco_churn'].apply(classify)
        
        return df

    def save_scores(self, df: pd.DataFrame) -> None:
        """Saves scores to the BI database."""
        if df.empty:
            return

        conn = None
        try:
            conn = self.get_bi_connection()
            cursor = conn.cursor()

            # TRUNCATE + INSERT
            cursor.execute("TRUNCATE TABLE ml_cliente_scores")
            
            for _, row in df.iterrows():
                cursor.execute(
                    """
                    INSERT INTO ml_cliente_scores 
                    (cliente_id, score_compra, risco_churn, classificacao)
                    VALUES (%s, %s, %s, %s)
                    """,
                    (int(row['cliente_id']), float(row['score_compra']), float(row['risco_churn']), row['classificacao'])
                )
            
            conn.commit()
            logger.info(f"Saved scores for {len(df)} clients.")
        except Exception as e:
            if conn:
                conn.rollback()
            logger.error(f"Error saving scores: {str(e)}")
        finally:
            if conn:
                conn.close()

    def run(self) -> None:
        """Executes the full ML pipeline."""
        logger.info("Starting ML Churn Pipeline...")
        df = self.fetch_features()
        if not df.empty:
            df = self.preprocess_data(df)
            df = self.train_and_predict(df)
            self.save_scores(df)
        logger.info("ML Pipeline finished.")

if __name__ == "__main__":
    ml = MLChurn()
    ml.run()
