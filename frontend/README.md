# 🎨 KickHub Frontend — Interface de Alta Performance

Bem-vindo à documentação técnica do **Frontend do KickHub**. Esta interface foi desenvolvida para oferecer uma experiência de usuário (UX) moderna, rápida e visualmente impactante, focada na gestão de sneakers e inteligência de mercado.

---

## 🏗️ Arquitetura e Tecnologias de Ponta

O frontend utiliza as tecnologias mais recentes do ecossistema React para garantir performance e manutenibilidade.

### Stack Principal
- **Framework:** [Next.js 15](https://nextjs.org/) (App Router) - Renderização híbrida e roteamento otimizado.
- **Linguagem:** [TypeScript](https://www.typescriptlang.org/) - Type Safety em toda a aplicação.
- **Estilização:** [Tailwind CSS 4](https://tailwindcss.com/) - A versão mais recente e performática do framework utility-first.
- **Gráficos & BI:** [Chart.js 4](https://www.chartjs.org/) + `react-chartjs-2` + `chartjs-plugin-datalabels`.
- **Gerenciamento de Formulários:** [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) (Validação de Esquemas).
- **Comunicação:** [Axios](https://axios-http.com/) com suporte a Cookies HttpOnly.
- **Feedback Visual:** [Lucide Icons](https://lucide.dev/) e [SweetAlert2](https://sweetalert2.github.io/).

---

## 📂 Estrutura do Projeto (`/src`)

A organização de pastas segue o padrão de **Design de Sistemas Modulares**:

- **`app/`**: Contém as rotas da aplicação (App Router).
  - **`(admin)/`**: Grupo de rotas protegidas (Dashboard, Clientes, Vendas, etc.).
  - **`login/`**: Rota pública de autenticação.
- **`components/`**: Peças reutilizáveis da interface.
  - **`ui/`**: Componentes atômicos (Botões, Cards, Inputs, Badges).
  - **`layout/`**: Estrutura global (Sidebar, Header).
  - **`forms/`**: Componentes de formulários complexos com lógica de negócio.
- **`services/`**: Camada de integração com a API. Centraliza as chamadas HTTP e tipagem de dados.
- **`lib/`**: Utilitários de sistema, alertas e configurações globais.
- **`types/`**: Definições de interfaces TypeScript compartilhadas.
- **`middleware.ts`**: O "Guardião" das rotas. Verifica a existência do token de sessão antes de permitir o acesso.

---

## 🔐 Segurança e Gestão de Sessão

O KickHub utiliza uma abordagem de **Segurança de Camada Dupla**:

1.  **Middleware:** Antes de carregar qualquer página administrativa, o Next.js executa o `middleware.ts` para verificar se o cookie `access_token` está presente. Se não estiver, o usuário é redirecionado para o login.
2.  **Cookies HttpOnly:** O token de autenticação nunca é exposto ao JavaScript, o que anula ataques de roubo de sessão (XSS).
3.  **Axios Interceptors:** Todas as requisições para o backend incluem automaticamente as credenciais de segurança (`withCredentials: true`).

---

## 🛰️ Mapeamento de Rotas (App Router)

A navegação é organizada de forma semântica, separando o acesso público das operações administrativas.

### 🔑 Acesso Público
| Rota | Descrição |
|:--- | :--- |
| `/login` | Página de autenticação e validação de credenciais. |

### 🛡️ Área Administrativa (Protegida)
*Todas as rotas abaixo são protegidas pelo `middleware.ts` e utilizam o Layout Administrativo (Sidebar/Header).*

#### 📊 Inteligência & BI
| Rota | Propósito |
|:--- | :--- |
| `/dashboard` | **Visão Geral:** KPIs de performance e gráficos de evolução. |
| `/dashboard/analise-clientes` | **Exploração ML:** Tabela analítica com Scores RFM e Churn. |
| `/dashboard/relatorios` | **Geração de PDF:** Orquestração de relatórios via Python. |

#### 👟 Gestão de Produtos & Estoque
| Rota | Propósito |
|:--- | :--- |
| `/produtos` | Listagem completa e busca por SKU. |
| `/produtos/novo` | Cadastro de novos sneakers no catálogo. |
| `/produtos/[id]/editar` | Ajuste de dados técnicos e saldo de estoque. |

#### 💰 Fluxo de Vendas
| Rota | Propósito |
|:--- | :--- |
| `/vendas` | Histórico completo e status das transações. |
| `/vendas/nova` | **PDV Digital:** Registro de pedidos com carrinho dinâmico. |
| `/vendas/[id]/editar` | Detalhes da venda e opção de estorno/cancelamento. |

#### 👥 Clientes & Categorias
| Rota | Propósito |
|:--- | :--- |
| `/clientes` | Cadastro e gestão da base de consumidores. |
| `/categorias` | Gerenciamento de marcas e coleções (Jordan, Dunk, etc). |

---

## 🧠 Inteligência de Negócio (BI) na Interface

O Dashboard é o coração analítico do frontend e possui funcionalidades avançadas:

### Gráficos Dinâmicos
- **Evolução:** Gráfico de linha com dois eixos (Y) para comparar Faturamento vs. Volume de Vendas.
- **Performance:** Gráficos de barras horizontais para faturamento por categoria com rótulos de dados compactos (ex: 250k).
- **Saúde da Base:** Visualização de risco de Churn (ML-driven) com ordenação semântica (Baixo -> Crítico).

### Orquestração em Tempo Real ⚡
O frontend possui botões exclusivos de **"Atualizar BI"**. Ao clicar, o sistema dispara uma cadeia de eventos no backend (ETL + Machine Learning) e recarrega os componentes da tela assim que os novos insights são gerados.

---

## 📝 Cadastro e Fluxo de Vendas

- **Carrinho Dinâmico:** Implementado com `useFieldArray` do React Hook Form, permitindo adicionar/remover produtos de uma venda com cálculo de subtotal em tempo real.
- **Validação Antecipada:** O Zod garante que nenhum dado inválido seja enviado para a API, exibindo mensagens de erro amigáveis ao usuário.
- **Autocomplete de Produtos:** Busca inteligente de sneakers por nome ou SKU para agilizar o atendimento no balcão.

---

## 🚀 Como Executar

```bash
npm install
npm run dev
```

---

> **KickHub Frontend** — Transformando dados complexos em uma interface simples e poderosa.
