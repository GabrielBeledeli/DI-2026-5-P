-- BI Tables (Mirroring OLTP for Analytical Use)

CREATE TABLE IF NOT EXISTS bi_usuarios (
    id BIGINT PRIMARY KEY,
    nome VARCHAR(255),
    email VARCHAR(255),
    senha VARCHAR(255),
    perfil VARCHAR(50),
    createdAt TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bi_clientes (
    id BIGINT PRIMARY KEY,
    nome VARCHAR(255),
    email VARCHAR(255),
    cidade VARCHAR(255),
    estado VARCHAR(255),
    pais VARCHAR(255),
    dataCadastro TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bi_categorias (
    id BIGINT PRIMARY KEY,
    nome VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS bi_produtos (
    id BIGINT PRIMARY KEY,
    categoriaId BIGINT,
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
    id BIGINT PRIMARY KEY,
    usuarioId BIGINT,
    clienteId BIGINT,
    total FLOAT,
    status VARCHAR(50),
    dataVenda TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bi_venda_itens (
    id BIGINT PRIMARY KEY,
    vendaId BIGINT,
    produtoId BIGINT,
    quantidade INTEGER,
    precoUnitario FLOAT,
    subtotal FLOAT
);
