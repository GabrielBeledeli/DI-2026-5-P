-- BI Tables (Mirroring OLTP for Analytical Use)

CREATE TABLE IF NOT EXISTS bi_usuarios (
    id INTEGER PRIMARY KEY,
    nome VARCHAR(255),
    email VARCHAR(255),
    senha VARCHAR(255),
    perfil VARCHAR(50),
    createdAt TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bi_clientes (
    id INTEGER PRIMARY KEY,
    nome VARCHAR(255),
    email VARCHAR(255),
    cidade VARCHAR(255),
    estado VARCHAR(255),
    pais VARCHAR(255),
    dataCadastro TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bi_categorias (
    id INTEGER PRIMARY KEY,
    nome VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS bi_produtos (
    id INTEGER PRIMARY KEY,
    categoriaId INTEGER,
    marca VARCHAR(255),
    nome VARCHAR(255),
    cor VARCHAR(255),
    genero VARCHAR(255),
    tamanho VARCHAR(255),
    preco FLOAT,
    estoque INTEGER,
    createdAt TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bi_vendas (
    id INTEGER PRIMARY KEY,
    usuarioId INTEGER,
    clienteId INTEGER,
    total FLOAT,
    status VARCHAR(50),
    data TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bi_venda_itens (
    id INTEGER PRIMARY KEY,
    vendaId INTEGER,
    produtoId INTEGER,
    quantidade INTEGER,
    precoUnitario FLOAT,
    subtotal FLOAT
);

-- ML Scores Table
CREATE TABLE IF NOT EXISTS ml_cliente_scores (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER,
    score_compra FLOAT,       -- 0.0 to 1.0, propensity to buy
    risco_churn FLOAT,        -- 0.0 to 1.0
    classificacao VARCHAR(50), -- 'alto', 'medio', 'baixo'
    calculado_em TIMESTAMP DEFAULT NOW()
);
