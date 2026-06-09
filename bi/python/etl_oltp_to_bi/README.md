# 🔄 KickHub ETL - Pipeline OLTP para BI

Este módulo é o coração da integração de dados da KickHub. Ele é responsável por extrair dados do banco de dados transacional (**OLTP**) e carregá-los na base analítica (**BI**), garantindo que as tabelas estejam estruturadas e prontas para o processamento de inteligência e relatórios.

## ⚙️ Funcionamento

O pipeline executa as seguintes etapas:
1.  **Garantia de Infraestrutura:** Lê o arquivo DDL (`bi/ddl/001_criar_tabelas_bi.sql`) e cria as tabelas necessárias no banco de BI caso não existam.
2.  **Injeção de Metadados:** Adiciona automaticamente a coluna `dtregistrocarga` em todas as tabelas para controle de auditoria de dados.
3.  **Sincronização Total:** Realiza uma carga do tipo "Full Load" (TRUNCATE + INSERT) para as tabelas:
    *   `usuarios` → `bi_usuarios`
    *   `clientes` → `bi_clientes`
    *   `categorias` → `bi_categorias`
    *   `produtos` → `bi_produtos`
    *   `vendas` → `bi_vendas`
    *   `venda_itens` → `bi_venda_itens`

---

## 🌍 Onde os dados são visualizados?

A sincronização realizada por este ETL é o que permite a visualização de dados atualizados em todo o ecossistema KickHub:
1.  **Frontend Gestores:** Dashboards, tabelas e gráficos em tempo real no portal administrativo.
2.  **Relatório Gerencial (PDF):** Acompanhamento diário de metas e giro de estoque.
3.  **Relatório Estratégico (PDF):** Inteligência de longo prazo, Cohort e saúde da base.

---

## 🛠️ Tecnologias e Bibliotecas

*   **Python 3.x**: Linguagem de script principal.
*   **Psycopg2**: Driver de alta performance para PostgreSQL, utilizando `execute_values` para inserções em massa (bulk insert).
*   **python-dotenv**: Gerenciamento de credenciais e conexões via variáveis de ambiente.

---

## 🚀 Como Executar o Pipeline

Siga os passos abaixo para preparar o ambiente e rodar a sincronização:

### 1. Criar o Ambiente Virtual (venv)
Dentro da pasta `bi/python/etl_oltp_to_bi/`, execute:
```powershell
python -m venv venv
```

### 2. Ativar o Ambiente e Instalar Dependências
```powershell
# Ativar no Windows:
.\venv\Scripts\activate

# Instalar bibliotecas:
pip install -r requirements.txt
```

### 3. Executar a Sincronização
Com o ambiente ativo e as variáveis de ambiente configuradas no `.env` da raiz do projeto, execute:
```powershell
python etl_pipeline.py
```

---

## 🔍 Detalhes Técnicos

*   **Estratégia de Carga:** O script limpa a tabela destino (`TRUNCATE`) antes de inserir os dados frescos do OLTP. Isso garante que o BI seja um espelho fiel do transacional.
*   **Logging:** Todas as etapas, desde a conexão até o número de registros inseridos por tabela, são registradas no console para monitoramento.
*   **Segurança:** Utiliza mapeamento de colunas dinâmico para garantir que os dados sejam inseridos na ordem correta, independente do esquema do banco.

---
