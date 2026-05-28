-- BI Views for Dashboard and Analysis

-- 1. Sales per day
CREATE OR REPLACE VIEW vw_vendas_por_dia AS
SELECT 
    CAST(data AS DATE) as data,
    COUNT(id) as total_vendas,
    SUM(total) as faturamento
FROM bi_vendas
WHERE status = 'ATIVO'
GROUP BY CAST(data AS DATE)
ORDER BY data;

-- 2. Sales by state
CREATE OR REPLACE VIEW vw_vendas_por_estado AS
SELECT 
    c.estado,
    SUM(v.total) as faturamento
FROM bi_vendas v
JOIN bi_clientes c ON v.clienteId = c.id
WHERE v.status = 'ATIVO'
GROUP BY c.estado
ORDER BY faturamento DESC;

-- 3. Sales by city
CREATE OR REPLACE VIEW vw_vendas_por_cidade AS
SELECT 
    c.cidade,
    c.estado,
    SUM(v.total) as faturamento
FROM bi_vendas v
JOIN bi_clientes c ON v.clienteId = c.id
WHERE v.status = 'ATIVO'
GROUP BY c.cidade, c.estado
ORDER BY faturamento DESC;

-- 4. Sales by country
CREATE OR REPLACE VIEW vw_vendas_por_pais AS
SELECT 
    c.pais,
    SUM(v.total) as faturamento
FROM bi_vendas v
JOIN bi_clientes c ON v.clienteId = c.id
WHERE v.status = 'ATIVO'
GROUP BY c.pais
ORDER BY faturamento DESC;

-- 5. Top clients by total spent
CREATE OR REPLACE VIEW vw_top_clientes AS
SELECT 
    c.id as cliente_id,
    c.nome,
    SUM(v.total) as total_comprado
FROM bi_vendas v
JOIN bi_clientes c ON v.clienteId = c.id
WHERE v.status = 'ATIVO'
GROUP BY c.id, c.nome
ORDER BY total_comprado DESC;

-- 6. Most sold products
CREATE OR REPLACE VIEW vw_produto_mais_vendido AS
SELECT 
    p.id as produto_id,
    p.nome,
    p.marca,
    SUM(vi.quantidade) as total_vendido
FROM bi_venda_itens vi
JOIN bi_produtos p ON vi.produtoId = p.id
JOIN bi_vendas v ON vi.vendaId = v.id
WHERE v.status = 'ATIVO'
GROUP BY p.id, p.nome, p.marca
ORDER BY total_vendido DESC;

-- 7. Revenue by category
CREATE OR REPLACE VIEW vw_faturamento_por_categoria AS
SELECT 
    cat.nome as categoria,
    SUM(vi.subtotal) as faturamento
FROM bi_venda_itens vi
JOIN bi_produtos p ON vi.produtoId = p.id
JOIN bi_categorias cat ON p.categoriaId = cat.id
JOIN bi_vendas v ON vi.vendaId = v.id
WHERE v.status = 'ATIVO'
GROUP BY cat.nome
ORDER BY faturamento DESC;

-- 8. Revenue by brand
CREATE OR REPLACE VIEW vw_faturamento_por_marca AS
SELECT 
    p.marca,
    SUM(vi.subtotal) as faturamento
FROM bi_venda_itens vi
JOIN bi_produtos p ON vi.produtoId = p.id
JOIN bi_vendas v ON vi.vendaId = v.id
WHERE v.status = 'ATIVO'
GROUP BY p.marca
ORDER BY faturamento DESC;

-- 9. Low stock products (below 10 units)
CREATE OR REPLACE VIEW vw_estoque_baixo AS
SELECT 
    id as produto_id,
    nome,
    marca,
    estoque
FROM bi_produtos
WHERE estoque < 10
ORDER BY estoque ASC;

-- 10. Average ticket per client
CREATE OR REPLACE VIEW vw_ticket_medio_cliente AS
SELECT 
    c.id as cliente_id,
    c.nome,
    AVG(v.total) as ticket_medio,
    COUNT(v.id) as total_pedidos
FROM bi_vendas v
JOIN bi_clientes c ON v.clienteId = c.id
WHERE v.status = 'ATIVO'
GROUP BY c.id, c.nome
ORDER BY ticket_medio DESC;

-- 11. Churn Features for ML
CREATE OR REPLACE VIEW vw_churn_features AS
WITH ultimas_compras AS (
    SELECT 
        clienteId,
        MAX(data) as data_ultima_compra
    FROM bi_vendas
    WHERE status = 'ATIVO'
    GROUP BY clienteId
)
SELECT 
    c.id as cliente_id,
    COUNT(v.id) / NULLIF(EXTRACT(DAY FROM (NOW() - MIN(v.data)))/30.0, 0) as frequencia_compra, -- per month
    AVG(v.total) as ticket_medio,
    COUNT(v.id) as total_pedidos,
    EXTRACT(DAY FROM (NOW() - uc.data_ultima_compra)) as dias_sem_comprar,
    SUM(v.total) as valor_total_gasto
FROM bi_clientes c
LEFT JOIN bi_vendas v ON c.id = v.clienteId AND v.status = 'ATIVO'
LEFT JOIN ultimas_compras uc ON c.id = uc.clienteId
GROUP BY c.id, uc.data_ultima_compra;
