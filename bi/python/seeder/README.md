# 🌱 KickHub Data Seeder

Este módulo é responsável por popular o banco de dados transacional (**OLTP**) com dados fictícios e realistas.

---

## 🚀 Como Executar o Seeder

### 1. Criar o Ambiente Virtual (venv)
Dentro da pasta `bi/python/seeder/`, execute:
```powershell
python -m venv venv
```

### 2. Ativar o Ambiente e Instalar Dependências
```powershell
# Ativar no Windows:
.\venv\Scripts\activate

# Instalar bibliotecas (Faker e Psycopg2):
pip install -r requirements.txt
```

### 3. Executar a Carga de Dados
```powershell
python seeder.py
```


---
