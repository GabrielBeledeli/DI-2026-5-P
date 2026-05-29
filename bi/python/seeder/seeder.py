# seeder.py
import os
import random
from faker import Faker
import psycopg2
from datetime import datetime, timedelta
from dotenv import load_dotenv

# Setup Faker
fake = Faker('pt_BR')

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '..', '.env'), override=True)

# Connection to OLTP (Source)
print(f"🔌 Conectando ao banco: {os.getenv('OLTP_DB')} em {os.getenv('OLTP_HOST')}:{os.getenv('OLTP_PORT')}...")
conn = psycopg2.connect(
    host=os.getenv('OLTP_HOST'),
    port=os.getenv('OLTP_PORT'),
    dbname=os.getenv('OLTP_DB'),
    user=os.getenv('OLTP_USER'),
    password=os.getenv('OLTP_PASSWORD')
)
cur = conn.cursor()

# ───────────────────────────────────────────
QTD_CLIENTES  = 500
QTD_PRODUTOS  = 80
QTD_VENDAS    = 2000
# ───────────────────────────────────────────

MARCAS = ['Nike', 'Adidas', 'New Balance', 'Puma', 'Vans', 'Mizuno', 'Asics', 'Fila']
MODELOS = ['Air Max', 'Samba', 'Fresh Foam', 'Suede', 'Old Skool', 'Wave', 'Gel-Nimbus', 'Disruptor']
CORES = ['Preto', 'Branco', 'Cinza', 'Azul', 'Vermelho', 'Verde', 'Bege', 'Laranja']
GENEROS = ['masculino', 'feminino', 'unisex', 'infantil']
TAMANHOS = ['34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44']
CATEGORIAS = ['Casual', 'Running', 'Social', 'Outdoor', 'Kids']
STATUS = ['CONCLUIDA', 'CANCELADO', 'PENDENTE_PAGAMENTO']

print("Iniciando seeder...")

# 1. Categorias
print("  → categorias...")
cur.execute("TRUNCATE categorias CASCADE")
for nome in CATEGORIAS:
    cur.execute('INSERT INTO categorias (nome) VALUES (%s)', (nome,))
conn.commit()

# 2. Usuarios
print("  → usuarios...")
cur.execute("TRUNCATE usuarios CASCADE")
perfis = ['GESTOR', 'VENDEDOR']
for i in range(10):
    cur.execute('''
        INSERT INTO usuarios (nome, email, senha, perfil)
        VALUES (%s, %s, %s, %s)
    ''', (
        fake.name(),
        fake.unique.email(),
        '$2b$10$hashedpassword',
        'GESTOR' if i == 0 else 'VENDEDOR'
    ))
conn.commit()

# 3. Clientes
print(f"  → {QTD_CLIENTES} clientes...")
cur.execute("TRUNCATE clientes CASCADE")
for _ in range(QTD_CLIENTES):
    cur.execute('''
        INSERT INTO clientes (nome, email, cidade, estado, pais, "dataCadastro")
        VALUES (%s, %s, %s, %s, %s, %s)
    ''', (
        fake.name(),
        fake.unique.email(),
        fake.city(),
        fake.estado_sigla(),
        'Brasil',
        fake.date_time_between(start_date='-2y', end_date='now')
    ))
conn.commit()

# 4. Produtos
print(f"  → {QTD_PRODUTOS} produtos...")
cur.execute("TRUNCATE produtos CASCADE")
cur.execute("SELECT id FROM categorias")
cat_ids = [r[0] for r in cur.fetchall()]

for _ in range(QTD_PRODUTOS):
    cur.execute('''
        INSERT INTO produtos ("categoriaId", marca, nome, cor, genero, tamanho, preco, estoque)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    ''', (
        random.choice(cat_ids),
        random.choice(MARCAS),
        random.choice(MODELOS),
        random.choice(CORES),
        random.choice(GENEROS),
        random.choice(TAMANHOS),
        round(random.uniform(129.90, 1299.90), 2),
        random.randint(0, 150)
    ))
conn.commit()

# 5. Vendas + itens
print(f"  → {QTD_VENDAS} vendas com itens...")
cur.execute("TRUNCATE vendas CASCADE")
cur.execute("TRUNCATE venda_itens CASCADE")

cur.execute("SELECT id FROM clientes")
cli_ids = [r[0] for r in cur.fetchall()]

cur.execute("SELECT id, preco FROM produtos")
produtos = cur.fetchall()  # [(id, preco), ...]

cur.execute("SELECT id FROM usuarios")
usr_ids = [r[0] for r in cur.fetchall()]

for _ in range(QTD_VENDAS):
    cliente_id  = random.choice(cli_ids)
    usuario_id  = random.choice(usr_ids)
    # Status: 70% Concluída, 10% Cancelada, 20% Pendente
    status      = random.choices(STATUS, weights=[70, 10, 20])[0] 
    data_venda  = fake.date_time_between(start_date='-1y', end_date='now')
    itens       = random.sample(produtos, k=random.randint(1, 5))

    total = 0
    itens_payload = []
    for prod_id, preco in itens:
        qtd      = random.randint(1, 3)
        subtotal = round(preco * qtd, 2)
        total   += subtotal
        itens_payload.append((prod_id, qtd, preco, subtotal))

    cur.execute('''
        INSERT INTO vendas ("usuarioId", "clienteId", total, status, "dataVenda")
        VALUES (%s, %s, %s, %s, %s) RETURNING id
    ''', (usuario_id, cliente_id, round(total, 2), status, data_venda))
    
    venda_id = cur.fetchone()[0]

    for prod_id, qtd, preco, subtotal in itens_payload:
        cur.execute('''
            INSERT INTO venda_itens ("vendaId", "produtoId", quantidade, "precoUnitario", subtotal)
            VALUES (%s, %s, %s, %s, %s)
        ''', (venda_id, prod_id, qtd, preco, subtotal))

conn.commit()

cur.close()
conn.close()

print(f"""
   Seeder concluído!
   clientes  : {QTD_CLIENTES}
   produtos  : {QTD_PRODUTOS}
   vendas    : {QTD_VENDAS}
   usuarios  : 10
""")
