# 👟 KickHub

> **Sistema Corporativo de Gestão de Vendas, Estoque e Business Intelligence para Sneakers**  
> Desafio Integrador — Engenharia de Software — 5° Período — 2026

---

## 📋 Sobre o Projeto

O **KickHub** é uma plataforma de gestão centralizada desenvolvida para o mercado de calçados. O sistema une a operação de balcão (vendas e estoque) com a inteligência de negócios (BI), permitindo que vendedores registrem pedidos de forma fluida e gestores tomem decisões baseadas em indicadores reais e Machine Learning.

### 🌟 Funcionalidades de Destaque

- **Fluxo de Vendas:** Registro de pedidos com carrinho dinâmico, buscador de produtos estilo autocomplete e gestão de estoque em tempo real.
- **Segurança Bancária:** Autenticação via **JWT com Cookies HttpOnly**, protegendo dados sensíveis contra ataques XSS.
- **Gestão de Estoque:** Controle rígido de entrada e saída, com alertas visuais de estoque baixo e identificação por SKU.
- **Business Intelligence (BI):** Módulo Python integrado para análise de Churn, relatórios gerenciais e dashboards estratégicos.
- **Integração Completa:** Comunicação nativa entre Frontend (Next.js), Backend (NestJS) e Motores de Análise (Python).

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| **Frontend** | Next.js 15, TypeScript, TailwindCSS, Lucide Icons, SweetAlert2 |
| **Backend** | NestJS, TypeScript, Prisma ORM, Passport JWT (HttpOnly) |
| **Banco de Dados** | PostgreSQL (Dockerizado) |
| **Data & ML** | Python 3.10+, Scikit-learn, Pandas, Psycopg2 |
| **Infraestrutura** | Docker + Docker Compose |

---

## 🚀 Como Executar o Projeto (Passo a Passo)

### 1. Clonar e Iniciar a Infraestrutura (Docker)

Primeiro, garanta que você tem o **Docker** e o **Node.js** instalados.

```bash
# Clone o repositório
git clone https://github.com/gabriel-hulbe/DI-2026-5-P.git
cd DI-2026-5-P

# Inicie o banco de dados via Docker
docker-compose up -d
```

### 2. Configurar Variáveis de Ambiente

Na raiz do projeto, crie o arquivo `.env` baseado no exemplo:

```bash
cp .env.exemplo .env
```

### 3. Configurar o Backend (NestJS)

```bash
cd backend

# Instalar dependências
npm install

# Rodar Migrations e Gerar o Client do Prisma
npx prisma migrate dev

# Iniciar o Servidor
npm run start:dev
```
O backend rodará em `http://localhost:3001`.

### 4. Configurar o Frontend (Next.js)

Abra um novo terminal na pasta raiz:

```bash
cd frontend

# Instalar dependências
npm install

# Iniciar o Servidor
npm run dev
```
O frontend estará disponível em `http://localhost:3000`.

### 5. Popular o Banco com Dados (Seeder Python)

Para que o sistema tenha produtos, clientes e usuários reais, rode o seeder:

```bash
cd bi/python/seeder

# Criar ambiente virtual
python -m venv venv
# Ativar: .\venv\Scripts\activate (Windows) ou source venv/bin/activate (Linux/Mac)

# Instalar requisitos
pip install -r requirements.txt

# Executar o sedder
python seeder.py
```

---

## 🔐 Credenciais de Acesso (Padrão)

Após rodar o seeder, utilize os seguintes usuários:

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
│   ├── python/        # ETL, ML Churn e Relatórios
│   └── ddl/           # Scripts de Banco BI
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

Projeto acadêmico — Desafio Integrador — 2026.
