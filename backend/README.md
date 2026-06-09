# 🚀 KickHub API — Backend Core

Bem-vindo à documentação técnica do **Backend do KickHub**. Este documento detalha a arquitetura, as tecnologias utilizadas e mapeia todos os endpoints da API para facilitar o entendimento e a manutenção do sistema.

---

## 🏗️ Arquitetura e Tecnologias

O backend foi construído seguindo os princípios de escalabilidade e modularidade, utilizando o framework **NestJS**.

### Stack Principal
- **Framework:** [NestJS](https://nestjs.com/) (Node.js) - Arquitetura baseada em módulos, controllers e services.
- **ORM:** [Prisma](https://www.prisma.io/) - Gerenciamento de banco de dados e Type Safety.
- **Bancos de Dados (Estratégia Dupla):**
  - **OLTP (PostgreSQL):** Banco transacional para o dia a dia (vendas, estoque, usuários).
  - **BI (PostgreSQL):** Banco analítico otimizado para consultas pesadas e Machine Learning.
- **Segurança:** 
  - **Passport JWT:** Autenticação via tokens.
  - **Cookies HttpOnly:** Proteção contra ataques XSS ao armazenar o token.
  - **Guards Globais:** Todas as rotas são protegidas por padrão.
- **Integração:** Módulo `child_process` para orquestração de scripts Python externos.

---

## 🔐 Segurança e Autenticação

### Fluxo de Login
1. O usuário envia credenciais para `/auth/login`.
2. O servidor valida e gera um token JWT.
3. O token é enviado de volta em um **Cookie HttpOnly**. Isso significa que o JavaScript do navegador não consegue ler o token, impedindo roubo de sessões.
4. Para cada requisição subsequente, o `JwtAuthGuard` valida o cookie automaticamente.

### Perfis de Acesso (RBAC)
- **VENDEDOR:** Acesso às operações de balcão (vendas, clientes, produtos).
- **GESTOR:** Acesso total, incluindo dashboards estratégicos e geração de relatórios Python.

---

## 🛰️ Mapeamento de Rotas (Endpoints)

### 🔑 Módulo de Autenticação (`/auth`)
| Método | Rota | Descrição | Acesso |
|:--- | :--- | :--- | :--- |
| `POST` | `/auth/login` | Valida credenciais e gera cookie de sessão | Público |
| `POST` | `/auth/logout` | Limpa o cookie de sessão | Autenticado |
| `GET` | `/auth/me` | Retorna os dados do usuário logado | Autenticado |

### 📊 Módulo Dashboard & BI (`/dashboard`)
*Orquestra a inteligência do negócio e a ponte com o Python.*

| Método | Rota | Descrição | Acesso |
|:--- | :--- | :--- | :--- |
| `GET` | `/dashboard/stats` | Retorna KPIs, vendas mensais e faturamento | Autenticado |
| `GET` | `/dashboard/report/managerial` | **Ponte Python:** Executa script de BI e retorna PDF Gerencial | **GESTOR** |
| `GET` | `/dashboard/report/strategic` | **Ponte Python:** Executa script de ML e retorna PDF Estratégico | **GESTOR** |

> **Nota Técnica:** Ao chamar os relatórios, o NestJS ativa o ambiente virtual (`venv`), executa o script Python, aguarda a geração do arquivo em disco e o envia como um `StreamableFile` para o frontend.

### 👟 Módulo de Produtos (`/produtos`)
| Método | Rota | Descrição | Acesso |
|:--- | :--- | :--- | :--- |
| `GET` | `/produtos` | Lista todos os produtos (suporta filtros/busca) | Autenticado |
| `POST` | `/produtos` | Cadastro de novo sneaker (SKU único) | Autenticado |
| `PATCH` | `/produtos/:id` | Atualiza dados ou estoque | Autenticado |
| `DELETE` | `/produtos/:id` | Remove produto do catálogo | Autenticado |

### 💰 Módulo de Vendas (`/vendas`)
*Este módulo utiliza **Transações do Prisma** para garantir que a venda só seja concluída se o estoque for baixado com sucesso.*

| Método | Rota | Descrição | Acesso |
|:--- | :--- | :--- | :--- |
| `GET` | `/vendas` | Histórico completo de vendas | Autenticado |
| `POST` | `/vendas` | **Cria Venda:** Valida estoque, cria registro e baixa estoque | Autenticado |
| `PATCH` | `/vendas/:id/cancelar` | Estorna a venda e devolve itens ao estoque | Autenticado |

### 👥 Módulo de Clientes (`/clientes`)
| Método | Rota | Descrição | Acesso |
|:--- | :--- | :--- | :--- |
| `GET` | `/clientes` | Listagem e busca de clientes | Autenticado |
| `POST` | `/clientes` | Cadastro de novos clientes | Autenticado |

### 🏷️ Módulo de Categorias (`/categorias`)
| Método | Rota | Descrição | Acesso |
|:--- | :--- | :--- | :--- |
| `GET` | `/categorias` | Lista as categorias (Jordan, Dunk, etc.) | Autenticado |
| `POST` | `/categorias` | Criação de novas categorias | Autenticado |

---

## 🛠️ Comandos Úteis (Desenvolvedor)

### Gerenciamento de Banco (Prisma)
```bash
# Sincronizar banco com o schema atual
npx prisma migrate dev

# Abrir o visualizador de banco de dados (Prisma Studio)
npx prisma studio
```

### Execução
```bash
# Modo desenvolvimento com Hot-Reload
npm run start:dev
```

---

## ⚡ Orquestração BI

O grande diferencial tecnológico deste backend é a sua capacidade de atuar como um **Orquestrador de Inteligência de Dados**. 

### O Fluxo de Refresh Dinâmico:
Quando o endpoint `/dashboard/refresh-intelligence` é acionado:
1.  **Gatilho Transacional:** O NestJS intercepta a requisição e valida as permissões de Gestor.
2.  **Cadeia de Execução Assíncrona:**
    - **Step 1 (ETL):** Dispara o script Python de ETL que sincroniza as tabelas do PostgreSQL OLTP para o BI.
    - **Step 2 (Machine Learning):** Assim que o ETL termina, dispara o motor de ML que aplica algoritmos de regressão e clustering para atualizar os Scores de Clientes e Churn.
3.  **Feedback Instantâneo:** O backend retorna o sucesso e o Dashboard do frontend se recarrega com os novos insights.

### 📑 Relatórios com Auto-Refresh
Para garantir que nenhum PDF seja entregue com dados obsoletos, os métodos de geração de relatórios (`generateManagerialReport` e `generateStrategicReport`) **invocam a cadeia de sincronização automaticamente** antes de ler os arquivos de disco. Isso garante 100% de consistência entre o que o usuário vê na tela e o que sai no papel.

---

> **KickHub** — Transformando dados de sneakers em inteligência competitiva.
