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

| Camada             | Tecnologia                                                     |
| :----------------- | :------------------------------------------------------------- |
| **Frontend**       | Next.js 15, TypeScript, TailwindCSS, Lucide Icons, SweetAlert2 |
| **Backend**        | NestJS, TypeScript, Prisma ORM, Passport JWT (HttpOnly)        |
| **Banco de Dados** | PostgreSQL (Dockerizado)                                       |
| **Data & ML**      | Python 3.10+, Scikit-learn, Pandas, Psycopg2                   |
| **Infraestrutura** | Docker + Docker Compose                                        |

---

## 🚀 Como Executar o Projeto (Passo a Passo)

Siga a ordem abaixo para subir o projeto corretamente. O Docker agora roda os bancos, o backend e o frontend. As dependências Node são instaladas dentro das imagens, então você não precisa rodar `npm install` manualmente toda vez.

### 📦 Parte 1: Aplicação & Infraestrutura

#### 1. Clonar e Configurar o Projeto

Certifique-se de ter o **Docker** instalado e aberto.

```bash
# Clone o repositório
git clone https://github.com/gabriel-hulbe/DI-2026-5-P.git
cd DI-2026-5-P

# Configure o .env na raiz
cp .env.exemplo .env
```

No Windows PowerShell, se `cp` não funcionar:

```powershell
Copy-Item .env.exemplo .env
```

#### 2. Subir a Aplicação com Docker

Na primeira execução, rode:

```bash
docker compose up --build
```

Nas próximas execuções, rode apenas:

```bash
docker compose up
```

Use `--build` novamente apenas quando mudar `package.json`, `package-lock.json`, `Dockerfile` ou `docker-compose.yml`.

#### 3. Rodar as Migrations

Com os containers rodando, abra outro terminal na raiz do projeto:

```bash
docker compose exec backend npx prisma migrate dev
```

Se precisar apenas regenerar o Prisma Client:

```bash
docker compose exec backend npx prisma generate
```

#### 4. Acessos

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001`
- Banco transacional: `localhost:5432`
- Banco BI: `localhost:5433`

---

### 📊 Parte 2: Configuração dos Motores de BI & IA (Obrigatório)

Siga esta sequência exata para preparar a inteligência do sistema. Os comandos rodam dentro do container do backend, usando o Python já instalado na imagem Docker.

---

#### 1️⃣ Passo: Popular o Banco Transacional (Seeder)

```bash
docker compose exec backend /opt/kickhub-bi-seeder-venv/bin/python /bi/python/seeder/seeder.py
```

#### 2️⃣ Passo: Sincronizar o Banco de BI (ETL)

```bash
docker compose exec backend /opt/kickhub-bi-etl-venv/bin/python /bi/python/etl_oltp_to_bi/etl_pipeline.py
```

#### 3️⃣ Passo: Gerar a Inteligência de IA (ML Churn & RFM)

```bash
docker compose exec backend /opt/kickhub-bi-ml-venv/bin/python /bi/python/ml_churn_rfm/ml_churn_rfm.py
```

#### 4️⃣ Passo: Preparar o Motor de Relatórios PDF

No Docker, o motor de relatórios já fica preparado durante o build da imagem do backend. Não é necessário rodar `pip install -r requirements.txt` manualmente.

---

#### 🎯 Resultado Final

Após seguir os passos acima, o sistema estará com "as luzes acesas".

1. Acesse `http://localhost:3000` como **Gestor** (`gabriel@kickhub.com` / `gestor123`).
2. Tudo estará carregado: Dashboards, Scores de Clientes e Relatórios.

> **Dica:** Daqui para frente, você não precisa mais voltar ao terminal. Sempre que quiser dados novos, use o botão **"Atualizar BI"** dentro do próprio Dashboard.

#### Comandos Úteis

Parar os containers:

```bash
docker compose down
```

Parar os containers e apagar volumes:

```bash
docker compose down -v
```

Ver logs:

```bash
docker compose logs -f backend
docker compose logs -f frontend
```

---

## 🔐 Credenciais de Acesso (Padrão)

Utilize os seguintes usuários após a execução do seeder:

| Perfil       | E-mail                 | Senha         |
| :----------- | :--------------------- | :------------ |
| **Gestor**   | `gabriel@kickhub.com`  | `gestor123`   |
| **Gestor**   | `nicolas@kickhub.com`  | `vendedor123` |
| **Vendedor** | `vinicius@kickhub.com` | `vendedor123` |
| **Vendedor** | `alisson@kickhub.com`  | `vendedor123` |

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

- **Gabriel Beledeli Hul**
- **Nicolas Miguel**
- **Vinicius Buskievicz**
- **Alisson Eraldo**

---

Engenharia de Software 5A — Centro Universitário Campo Real
