# 👟 KickHub

> **Sistema Corporativo de Gestão de Vendas, Estoque e Business Intelligence**  
> Desafio Integrador — Engenharia de Software — 5° Período — 2026

---

## 📋 Sobre o Projeto

O **KickHub** é uma plataforma de gestão centralizada desenvolvida para o mercado de calçados. O sistema une a operação de balcão (vendas e estoque) com a inteligência de negócios (BI), permitindo que vendedores registrem pedidos de forma fluida e gestores tomem decisões baseadas em indicadores reais e Machine Learning.

### 🌟 Funcionalidades de Destaque

- **Fluxo de Vendas:** Registro de pedidos com carrinho dinâmico, buscador de produtos estilo autocomplete e gestão de estoque em tempo real.
- **Segurança:** Autenticação via **JWT com Cookies HttpOnly**, protegendo dados sensíveis contra ataques XSS.
- **Gestão de Estoque:** Controle rígido de entrada e saída, com alertas visuais de estoque baixo e identificação por SKU.
- **Business Intelligence (BI):** Módulo Python integrado para análise de Churn, RFM, relatórios gerenciais e dashboards estratégicos.
- **Integração Completa:** Comunicação nativa entre Frontend (Next.js), Backend (NestJS) e Motores de Análise (Python).

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia |
|:--- | :--- |
| **Frontend** | Next.js 15, TypeScript, TailwindCSS, Lucide Icons, SweetAlert2 |
| **Backend** | NestJS, TypeScript, Prisma ORM, Passport JWT (HttpOnly) |
| **Banco de Dados** | PostgreSQL (Dockerizado) |
| **Data & ML** | Python 3.10+, Scikit-learn, Pandas, Psycopg2 |
| **Infraestrutura** | Docker + Docker Compose |

---

## 🚀 Como Executar o Projeto (Passo a Passo)

Siga a ordem abaixo para garantir que todas as dependências e bancos de dados estejam configurados corretamente.

### 📦 Parte 1: Aplicação & Infraestrutura

#### 1. Clonar e Iniciar o Docker
Certifique-se de ter o **Docker** e o **Node.js** instalados.

```bash
# Clone o repositório
git clone https://github.com/gabriel-hulbe/DI-2026-5-P.git
cd DI-2026-5-P

# Inicie o banco de dados via Docker
docker-compose up -d

# Configure o .env na raiz
cp .env.exemplo .env
```

#### 2. Configurar o Backend (NestJS)
```bash
cd backend
npm install
npx prisma migrate dev
npm run start:dev
```
O backend rodará em `http://localhost:3001`.

#### 3. Configurar o Frontend (Next.js)
Abra um novo terminal na pasta raiz:
```bash
cd frontend
npm install
npm run dev
```
O frontend estará disponível em `http://localhost:3000`.

---

### 📊 Parte 2: Motores de BI & Inteligência Artificial

Agora vamos preparar os motores de análise. **Você só precisa fazer este passo uma única vez** para configurar o ambiente. Depois, poderá atualizar tudo com um clique dentro do sistema!

#### 1. Preparar Ambientes Python (Venv)
Execute os comandos abaixo para cada módulo de BI para garantir que as dependências estejam prontas:

```bash
# Repita este processo para as pastas: seeder, etl_oltp_to_bi, ml_churn_rfm, relatorios
cd bi/python/[NOME_DA_PASTA]
python -m venv venv
# Ative a venv (Windows: .\venv\Scripts\activate | Linux: source venv/bin/activate)
pip install -r requirements.txt
```

#### 2. Popular a Base de Dados (Seeder)
Para que o sistema tenha produtos, usuários e um histórico de vendas para analisar, você deve rodar o seeder inicial:

```bash
cd bi/python/seeder
# Garanta que a venv está ativa
python seeder.py
```

#### 3. Sincronização em Tempo Real 🚀
Com os ambientes prontos e o seeder executado, o controle agora é total via interface:
1. Acesse o sistema como **Gestor** (`gabriel@kickhub.com` / `gestor123`).
2. Vá ao **Dashboard** e clique no botão **"Atualizar BI"**.
3. O sistema orquestra automaticamente o **ETL** (sincronização) e o **ML** (IA), atualizando todos os indicadores instantaneamente.

---

## 🔐 Credenciais de Acesso (Padrão)

| Perfil | E-mail | Senha |
| :--- | :--- | :--- |
| **Gestor** | `gabriel@kickhub.com` | `gestor123` |
| **Gestor** | `nicolas@kickhub.com` | `gestor123` |
| **Vendedor** | `vinicius@kickhub.com` | `vendedor123` |
| **Vendedor** | `alisson@kickhub.com` | `vendedor123` |

---

## 🗂️ Estrutura do Repositório

```
DI-2026-5-P/
├── backend/           # API NestJS + Prisma (Porta 3001)
├── frontend/          # Interface Next.js 15 (Porta 3000)
├── bi/                # Inteligência de Negócio e Machine Learning
│   ├── python/        # Seeder, ETL, ML Churn e Relatórios
│   └── ddl/           # Scripts de Banco BI (Data Warehouse)
├── UML/               # Documentação e Diagramas
└── docker-compose.yml # Infraestrutura PostgreSQL
```

---

## 👥 Equipe DI - 2026

*   **Gabriel Beledeli Hul**
*   **Nicolas Miguel**
*   **Vinicius Buskievicz**
*   **Alisson Eraldo**

---

Engenharia de Software 5A — Centro Universitário Campo Real
