# 🌱 KickHub Data Seeder

Este módulo é responsável por popular o banco de dados transacional (**OLTP**) com dados fictícios e realistas. Ele permite simular diferentes cenários de negócio para testar a eficácia dos modelos de Machine Learning e a clareza dos relatórios PDF.

## ⚙️ Cenários de Simulação

Ao executar o script, você pode escolher entre dois cenários que impactam diretamente o **Relatório Estratégico**:

1.  **Base Saudável:** Gera uma grande massa de vendas recentes. Os modelos de IA detectarão baixo risco de Churn e alta fidelidade, resultando em um diagnóstico de **"SAUDÁVEL"** no relatório estratégico.
2.  **Base Problemática:** Gera vendas concentradas em datas antigas. Os modelos de IA identificarão que os clientes pararam de comprar, resultando em um diagnóstico de **"ALERTA CRÍTICO"** e alta **Receita em Risco**.

---

## 🛠️ Regras de Geração de Dados

*   **Vendedores Reais:** O seeder atribui vendas apenas para os usuários com perfil `VENDEDOR` (Nicolas, Vinicius e Alisson). O usuário `GESTOR` (Gabriel) não é vinculado a vendas, simulando o comportamento real de um administrador.
*   **Precificação Realista:** Os preços dos produtos foram ajustados para a faixa de **R$ 189,90 a R$ 899,90**.
*   **Ticket Médio Controlado:** As vendas agora possuem entre 1 e 2 itens por pedido, evitando valores astronômicos e mantendo o ticket médio condizente com uma loja de calçados de alta performance.
*   **Status de Venda:** A maioria das vendas (80%) é gerada como `CONCLUIDA`, com pequenas margens para cancelamentos e pendências.

---

## 🚀 Como Executar o Seeder

### 1. Criar o Ambiente Virtual (venv)
Dentro da pasta `bi/python/seeder/`, execute:
```powershell
python -m venv venv
```

### 2. Ativar o Ambiente e Instalar Dependências
```powershell
# Ativar no Windows:
.\venv\Scripts\activate

# Instalar bibliotecas (Faker e Psycopg2):
pip install -r requirements.txt
```

### 3. Executar a Carga de Dados
```powershell
python seeder.py
```
*O script solicitará no terminal que você escolha o cenário (1 ou 2).*

---
*Módulo desenvolvido para garantir a integridade dos testes de BI na KickHub.*
