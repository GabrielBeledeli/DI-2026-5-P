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
print(f"Conectando ao banco: {os.getenv('OLTP_DB')} em {os.getenv('OLTP_HOST')}:{os.getenv('OLTP_PORT')}...")
conn = psycopg2.connect(
    host=os.getenv('OLTP_HOST'),
    port=os.getenv('OLTP_PORT'),
    dbname=os.getenv('OLTP_DB'),
    user=os.getenv('OLTP_USER'),
    password=os.getenv('OLTP_PASSWORD')
)
cur = conn.cursor()

# Configuration
now = datetime.now()
QTD_CLIENTES  = 500
QTD_PRODUTOS  = 120 # Mais produtos para diversidade
QTD_VENDAS_TOTAL = 3500 # Aumentando densidade

STATUS = ['CONCLUIDA', 'CANCELADO', 'PENDENTE_PAGAMENTO']
SENHA_ADMIN_HASH = '$2b$10$U6t5GfmXzxK78KeBxXgfBO04ikdiN/VBPHZnZZnGisf6AvYDiiQQW'
SENHA_VENDEDOR_HASH = '$2b$10$AvM.0TukIPjxEI999xOK6u1YtWREgfUvwqEoZGCtYgfZ4sgCB.UX6'

# Real-world Sneakers Catalog
MARCAS_MODELOS = {
    'Nike': ['Air Max 90', 'Air Force 1', 'Dunk Low', 'Jordan 1 High', 'Pegasus 40', 'Vaporfly'],
    'Adidas': ['Samba OG', 'Gazelle', 'Ultraboost 1.0', 'Forum Low', 'Stan Smith', 'NMD R1'],
    'Mizuno': ['Wave Prophecy', 'Wave Creation', 'Wave Sky', 'Wave Viper'],
    'Asics': ['Gel-Nimbus 25', 'Gel-Kayano 30', 'Gel-Lyte III', 'Novablast'],
    'Vans': ['Old Skool', 'SK8-Hi', 'Authentic', 'Era'],
    'Puma': ['Suede Classic', 'RS-X', 'Clyde', 'Palermo'],
    'New Balance': ['550', '574', '9060', '1906R', '2002R'],
    'Reebok': ['Club C 85', 'Classic Leather', 'Nano X3']
}

MARCAS = list(MARCAS_MODELOS.keys())
CORES = ['Preto', 'Branco', 'Cinza', 'Azul Marinho', 'Vermelho', 'Verde Oliva', 'Bege', 'Multicolor']
GENEROS = ['masculino', 'feminino', 'unisex']
TAMANHOS = [str(x) for x in range(36, 45)] # 36 ao 44
CATEGORIAS = ['Casual', 'Running', 'Basquete', 'Skate', 'Performance']

print("Iniciando carga de dados REALISTA e de ALTA DENSIDADE...")

# 1. Categorias
cur.execute("TRUNCATE categorias CASCADE")
for nome in CATEGORIAS:
    cur.execute('INSERT INTO categorias (nome) VALUES (%s)', (nome,))

# 2. Usuarios
cur.execute("TRUNCATE usuarios CASCADE")
USUARIOS_SISTEMA = [
    {'nome': 'Gabriel Beledeli Hul', 'email': 'gabriel@kickhub.com', 'senha': SENHA_ADMIN_HASH, 'perfil': 'GESTOR'},
    {'nome': 'Nicolas Miguel', 'email': 'nicolas@kickhub.com', 'senha': SENHA_ADMIN_HASH, 'perfil': 'VENDEDOR'},
    {'nome': 'Vinicius Buskievicz', 'email': 'vinicius@kickhub.com', 'senha': SENHA_VENDEDOR_HASH, 'perfil': 'VENDEDOR'},
    {'nome': 'Alisson Eraldo', 'email': 'alisson@kickhub.com', 'senha': SENHA_VENDEDOR_HASH, 'perfil': 'VENDEDOR'}
]
for user in USUARIOS_SISTEMA:
    cur.execute('INSERT INTO usuarios (nome, email, senha, perfil) VALUES (%s, %s, %s, %s)', 
                (user['nome'], user['email'], user['senha'], user['perfil']))

cur.execute("SELECT id FROM usuarios WHERE perfil = 'VENDEDOR'")
vendedor_ids = [r[0] for r in cur.fetchall()]

# 3. Clientes
cur.execute("TRUNCATE clientes CASCADE")
for _ in range(QTD_CLIENTES):
    cur.execute('INSERT INTO clientes (nome, email, cidade, estado, pais, "dataCadastro") VALUES (%s, %s, %s, %s, %s, %s)',
                (fake.name(), fake.unique.email(), fake.city(), fake.estado_sigla(), 'Brasil', now - timedelta(days=600)))

cur.execute("SELECT id FROM clientes")
cli_ids = [r[0] for r in cur.fetchall()]

# 4. Produtos
cur.execute("TRUNCATE produtos CASCADE")
cur.execute("SELECT id FROM categorias")
cat_ids = [r[0] for r in cur.fetchall()]

for _ in range(QTD_PRODUTOS):
    marca = random.choice(MARCAS)
    modelo = random.choice(MARCAS_MODELOS[marca])
    cur.execute('INSERT INTO produtos ("categoriaId", marca, nome, cor, genero, tamanho, preco, estoque) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)',
                (random.choice(cat_ids), marca, modelo, random.choice(CORES), random.choice(GENEROS), 
                 random.choice(TAMANHOS), round(random.uniform(249.90, 899.90), 2), random.randint(10, 100)))

cur.execute("SELECT id, preco FROM produtos")
produtos = cur.fetchall()

# 5. SEGMENTATION FOR CONTINUOUS RISK SPECTRUM (BASED ON PREVIOUS CALIBRATION)
random.shuffle(cli_ids)
n = QTD_CLIENTES
# 40% Super Active (0-15 days) -> BAIXO
# 20% Slipping (30-50 days)     -> MÉDIO
# 20% Danger (65-85 days)       -> ALTO
# 20% Lost (120+ days)          -> CRÍTICO

g_loyal    = cli_ids[:int(n*0.40)]
g_medium   = cli_ids[int(n*0.40):int(n*0.60)]
g_high     = cli_ids[int(n*0.60):int(n*0.80)]
g_critical = cli_ids[int(n*0.80):]

cur.execute("TRUNCATE vendas CASCADE")
cur.execute("TRUNCATE venda_itens CASCADE")

def insert_sale(c_id, date_venda):
    u_id = random.choice(vendedor_ids)
    p_id, preco = random.choice(produtos)
    status = random.choices(STATUS, weights=[92, 2, 6])[0]
    cur.execute('INSERT INTO vendas ("usuarioId", "clienteId", total, status, "dataVenda") VALUES (%s, %s, %s, %s, %s) RETURNING id',
                (u_id, c_id, preco, status, date_venda))
    v_id = cur.fetchone()[0]
    cur.execute('INSERT INTO venda_itens ("vendaId", "produtoId", quantidade, "precoUnitario", subtotal) VALUES (%s, %s, %s, %s, %s)',
                (v_id, p_id, 1, preco, preco))

print("Gerando histórico denso e variado...")
for c_id in cli_ids:
    # Every client gets a base of 5 to 15 historical sales for high frequency
    for _ in range(random.randint(5, 15)):
        hist_date = datetime(2025, 1, 1) + timedelta(days=random.randint(0, 320))
        insert_sale(c_id, hist_date)

print("Forçando Padrões de Churn Granulares...")
for c_id in g_loyal:
    insert_sale(c_id, now - timedelta(days=random.randint(1, 15)))

for c_id in g_medium:
    insert_sale(c_id, now - timedelta(days=random.randint(30, 50)))

for c_id in g_high:
    insert_sale(c_id, now - timedelta(days=random.randint(65, 85)))

conn.commit()
cur.close()
conn.close()

print(f"\nCarga REALISTA concluída!")
print(f"Diversidade: {len(MARCAS)} marcas, grade 36-44, Gêneros M/F.")
print(f"Volume: {QTD_VENDAS_TOTAL if 'QTD_VENDAS_TOTAL' in locals() else 'Focado em Densidade'} transações geradas.")
