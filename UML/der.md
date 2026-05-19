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
        varchar   nome
        decimal   preco
        int       estoque
        int       id_categoria FK
        timestamp created_at
    }

    PEDIDO {
        int       id_pedido   PK
        int       id_usuario  FK
        int       id_cliente  FK
        timestamp data_pedido
        decimal   valor_total
        varchar   status
    }

    ITEM_PEDIDO {
        int     id_item    PK
        int     id_pedido  FK
        int     id_produto FK
        int     quantidade
        decimal subtotal
    }

    USUARIO   ||--o{ PEDIDO      : "1 : N"
    CLIENTE   ||--o{ PEDIDO      : "1 : N"
    PEDIDO    ||--|{ ITEM_PEDIDO : "1 : N"
    PRODUTO   ||--o{ ITEM_PEDIDO : "1 : N"
    CATEGORIA ||--o{ PRODUTO     : "1 : N"