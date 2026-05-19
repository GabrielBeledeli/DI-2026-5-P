---
config:
  layout: fixed
---
flowchart RL
 subgraph Atores["Atores"]
    direction TB
        Vendedor(["👤 Vendedor"])
        Gestor(["👔 Gestor"])
  end
 subgraph Clientes["📋 Gestão de Clientes"]
    direction TB
        UC1["Cadastrar Cliente"]
        UC2["Editar Cliente"]
        UC3["Excluir Cliente"]
        UC4["Listar Clientes"]
        UC5["Validar E-mail"]
  end
 subgraph Produtos["👟 Gestão de Produtos"]
    direction TB
        UC6["Cadastrar Produto"]
        UC7["Editar Produto"]
        UC8["Excluir Produto"]
        UC9["Listar Produtos"]
        UC10["Consultar Estoque"]
        UC11["Alertar Estoque Baixo"]
  end
 subgraph Pedidos["🛒 Gestão de Pedidos"]
    direction TB
        UC12["Criar Pedido"]
        UC13["Adicionar Itens"]
        UC14["Calcular Total"]
        UC15["Atualizar Estoque"]
        UC16["Listar Pedidos"]
  end
 subgraph Relatorios["📊 Relatórios e Dashboards"]
    direction TB
        UC17["Visualizar Dashboards Analíticos"]
  end
 subgraph IA["🧠 Inteligência Artificial"]
    direction TB
        UC27["Classificar Clientes"]
        UC28["Calcular Taxa de Churn"]
        UC29["Gerar Scoring de Clientes"]
        UC30["Identificar Clientes em Risco"]
  end
    UC1 --- Vendedor
    UC2 --- Vendedor
    UC3 --- Vendedor
    UC4 --- Vendedor
    UC6 --- Vendedor
    UC7 --- Vendedor
    UC8 --- Vendedor
    UC9 --- Vendedor
    UC10 --- Vendedor
    UC12 --- Vendedor
    UC16 --- Vendedor
    Vendedor --> Gestor
    UC17 --- Gestor
    UC27 --- Gestor
    UC5 -. include .-> UC1
    UC11 -. extend .-> UC10
    UC13 -. include .-> UC12
    UC14 -. include .-> UC12
    UC15 -. include .-> UC12
    UC28 -. include .-> UC27
    UC29 -. include .-> UC27
    UC30 -. include .-> UC28