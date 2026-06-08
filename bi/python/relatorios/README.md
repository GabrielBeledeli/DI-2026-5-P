# 🚀 KickHub Analytics - Motor de Relatórios Corporativos

Este módulo é responsável pelo processamento de dados analíticos e geração automática de relatórios executivos em PDF para a KickHub. O sistema consome dados da base de Business Intelligence (PostgreSQL) e aplica lógicas de IA e heurísticas para entregar diagnósticos prontos para tomada de decisão.

## 🛠️ Tecnologias e Bibliotecas

*   **Python 3.x**: Core do processamento.
*   **Pandas**: Motor de manipulação de dados, agrupamentos e pivoteamento (Cohort).
*   **ReportLab**: Geração de documentos PDF com layout fluido e controle de quebra de página.
*   **Matplotlib**: Renderização de gráficos de alta qualidade com eixos duplos.
*   **Seaborn**: Utilizado especificamente para o mapa de calor da análise Cohort.
*   **Psycopg2**: Conexão de baixa latência com o banco de dados PostgreSQL.

---

## 📊 1. Relatório Gerencial

Focado em **Controle Operacional** e **Giro de Estoque**.

### Indicadores Principais:
*   **Resumo Gerencial:** KPIs de vendas totais, faturamento bruto, ticket médio e valor total de ativos em estoque.
*   **Evolução Histórica:** Gráfico dos últimos 12 meses concluídos para identificar sazonalidade e tendências de volume.
*   **Pulso do Mês (MTD):** Comparativo vertical entre o Mês Anterior (Fechado) e o Mês Atual (Corrente), com indicadores de crescimento percentual.
*   **Análises Temporais (7d, 30d, Total):** Desempenho detalhado por Categoria, Marca, Modelo (hbar), Tamanho e Gênero (pie).
*   **Dashboard de Estoque:** Visão física do estoque atual distribuída por Marca, Modelo, Tamanho e Gênero.

---

## 🧠 2. Relatório Estratégico

Focado em **Inteligência de Cliente**, **Retenção** e **Previsibilidade Financeira**.

### Indicadores de Inteligência:
*   **Resumo Executivo Dinâmico:** Diagnóstico automático (Saudável/Atenção/Crítico) baseado em heurísticas de Churn e LTV.
*   **Receita em Risco:** Cálculo financeiro do LTV total dos clientes classificados como risco Alto ou Crítico.
*   **Análise Cohort (Retenção):** Mapa de calor cronológico que rastreia a fidelidade das safras de clientes desde o primeiro contato.
*   **Segmentação RFM de Elite:** Identificação dos 20 clientes "Diamante" com maior score de fidelidade.
*   **Oportunidades de Reativação:** Listagem técnica de clientes de alto valor que não realizam compras há mais de 60 dias.
*   **Ticket por Marca:** Gráfico de rentabilidade média que orienta estratégias de Upsell.

---

## 🔍 Consultas SQL Principais (Queries)

### 1. Resumo Gerencial (KPIs Globais)
```sql
SELECT 
    (SELECT COUNT(*) FROM bi_vendas WHERE status = 'CONCLUIDA') as total_vendas,
    (SELECT COALESCE(SUM(total), 0) FROM bi_vendas WHERE status = 'CONCLUIDA') as revenue,
    (SELECT COALESCE(AVG(total), 0) FROM bi_vendas WHERE status = 'CONCLUIDA') as avg_ticket,
    (SELECT COUNT(*) FROM bi_clientes) as total_customers,
    (SELECT COALESCE(SUM(estoque), 0) FROM bi_produtos) as total_stock_units,
    (SELECT COALESCE(SUM(estoque * preco), 0) FROM bi_produtos) as stock_asset_value;
```

---

## 🎨 Identidade Visual (Branding)

*   **Títulos Dual-Color:** Padrão "Primeira palavra Dark / Restante KickHub Red".
*   **KeepTogether Logic:** Regra de layout que impede que títulos fiquem isolados de seus respectivos gráficos.
*   **Clean Axis:** Remoção de eixos laterais redundantes, priorizando a leitura via **Data Labels** (balões de valor).

---

## 🚀 Como Gerar os Relatórios

Siga os passos abaixo para configurar o ambiente e gerar os documentos:

### 1. Criar o Ambiente Virtual (venv)
Dentro da pasta `bi/python/relatorios/`, execute:
```powershell
python -m venv venv
```

### 2. Ativar o Ambiente e Instalar Dependências
```powershell
# Ativar no Windows:
.\venv\Scripts\activate

# Instalar bibliotecas necessárias:
pip install -r requirements.txt
```

### 3. Gerar os Relatórios
Com o ambiente ativo, execute o script principal:
```powershell
python gerar_relatorios.py
```

Os arquivos serão salvos automaticamente na pasta `/arquivos`.

---
*Relatórios gerados pelo Motor de Inteligência KickHub BI.*
