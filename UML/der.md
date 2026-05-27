erDiagram

    USUARIO {
        int     id_usuario PK
        varchar nome
        varchar email
        varchar senha
        varchar perfil
    }

    CLIENTE {
        int       id_cliente    PK
        varchar   nome
        varchar   email
        varchar   cidade
        varchar   estado
        varchar   pais
        timestamp data_cadastro
    }

    CATEGORIA {
        int     id_categoria PK
        varchar nome
    }

    PRODUTO {
        int       id_produto   PK
        int       id_categoria FK
        varchar   marca
        varchar   nome
        varchar   cor
        varchar   genero
        varchar   tamanho
        decimal   preco
        int       estoque
        timestamp created_at
    }

    PEDIDO {
        int       id_pedido    PK
        int       id_usuario   FK
        int       id_cliente   FK
        timestamp data_pedido
        decimal   valor_total
        varchar   status
    }

    ITEM_PEDIDO {
        int     id_item        PK
        int     id_pedido      FK
        int     id_produto     FK
        int     quantidade
        decimal preco_unitario
        decimal subtotal
    }

    USUARIO   ||--o{ PEDIDO      : ""
    CLIENTE   ||--o{ PEDIDO      : ""
    PEDIDO    ||--|{ ITEM_PEDIDO  : ""
    PRODUTO   ||--o{ ITEM_PEDIDO  : ""
    CATEGORIA ||--o{ PRODUTO      : ""