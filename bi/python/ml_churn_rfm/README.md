# 🧠 KickHub Intelligence - ML Churn & RFM Scoring

Este módulo é o núcleo de inteligência analítica da KickHub. Ele utiliza algoritmos de Machine Learning e heurísticas estatísticas para processar o comportamento dos clientes e gerar scores de fidelidade (RFM) e probabilidade de perda (Churn).

## 🌍 Onde os dados são visualizados?

Os resultados gerados por este módulo alimentam as três principais interfaces de decisão da empresa:
1.  **Frontend Gestores:** Dashboards em tempo real com indicadores de risco e tabelas de clientes VIP.
2.  **Relatório Gerencial (PDF):** Visão tática e controle de vendas imediatas.
3.  **Relatório Estratégico (PDF):** Análise profunda de saúde da base, Receita em Risco e Resumo Executivo de IA.

---

## 🛠️ Tecnologias e Bibliotecas

*   **Python 3.x**: Core do processamento.
*   **Scikit-Learn**: Utilizado para modelagem preditiva e normalização de scores.
*   **Pandas**: Manipulação de dados e engenharia de atributos (Feature Engineering).
*   **Psycopg2**: Conexão de alta performance com a base de Business Intelligence.

---

## ⚙️ Pipeline de Processamento

O módulo segue um fluxo rigoroso de ciência de dados para garantir a precisão dos scores:
1.  **Extração:** Consumo dos dados brutos das tabelas de BI (`bi_vendas`, `bi_clientes`).
2.  **Tratamento de Dados (Cleaning):** Limpeza de registros inconsistentes, tratamento de valores nulos (NaN), padronização de formatos de data e remoção de outliers que poderiam distorcer os modelos.
3.  **Engenharia de Atributos:** Cálculo das métricas de recência, frequência e valor (LTV) por cliente.
4.  **Execução de Modelos:** Aplicação das heurísticas de Churn e algoritmos de normalização para o Score RFM.
5.  **Carga:** Atualização da tabela final `ml_cliente_scores` no PostgreSQL.

---

## 🔍 Inteligência e Atributos (RFM & Churn)

O sistema processa a tabela `bi_vendas` para gerar a tabela final `ml_cliente_scores` baseada nos seguintes pilares:

### 1. Score RFM (Recência, Frequência, Valor Monetário)
*   **Recência (R):** Dias desde a última compra. Quanto menor, maior o score.
*   **Frequência (F):** Total de pedidos realizados. Quanto maior, maior o score.
*   **Valor Monetário (M/LTV):** Valor total gasto na loja. Quanto maior, maior o score.
*   *Resultado:* Um score consolidado de 0 a 100 que identifica clientes **Diamante (Score >= 80)**.

### 2. Probabilidade de Churn
*   Analisa o tempo médio entre compras e o desvio padrão do comportamento do cliente.
*   Classifica os clientes em 4 níveis de risco: **Baixo, Médio, Alto e Crítico**.

---

## 🚀 Como Executar o Processamento

Siga os passos abaixo para atualizar os scores de inteligência:

### 1. Criar o Ambiente Virtual (venv)
Dentro da pasta `bi/python/ml_churn_rfm/`, execute:
```powershell
python -m venv venv
```

### 2. Ativar o Ambiente e Instalar Dependências
```powershell
# Ativar no Windows:
.\venv\Scripts\activate

# Instalar bibliotecas de Data Science:
pip install -r requirements.txt
```

### 3. Executar o Script de Inteligência
```powershell
python ml_churn_rfm.py
```
Ao final da execução, o banco de dados será atualizado e os novos dashboards e relatórios refletirão a inteligência mais recente.

---
