import os
import time
import logging
from typing import List, Dict
import psycopg2
from psycopg2.extras import execute_values
from datetime import datetime
from dotenv import load_dotenv

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load environment variables
# Look for .env in the root directory
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '..', '.env'), override=True)

class ETLPipeline:
    def __init__(self) -> None:
        self.oltp_config = {
            'host': os.getenv('OLTP_HOST'),
            'port': os.getenv('OLTP_PORT'),
            'database': os.getenv('OLTP_DB'),
            'user': os.getenv('OLTP_USER'),
            'password': os.getenv('OLTP_PASSWORD')
        }
        self.bi_config = {
            'host': os.getenv('BI_HOST'),
            'port': os.getenv('BI_PORT'),
            'database': os.getenv('BI_DB'),
            'user': os.getenv('BI_USER'),
            'password': os.getenv('BI_PASSWORD')
        }
        # Table mapping: OLTP table name -> BI table name
        self.tables: Dict[str, str] = {
            'usuarios': 'bi_usuarios',
            'clientes': 'bi_clientes',
            'categorias': 'bi_categorias',
            'produtos': 'bi_produtos',
            'vendas': 'bi_vendas',
            'venda_itens': 'bi_venda_itens'
        }
        # Path to the DDL file
        self.ddl_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'ddl', '001_criar_tabelas_bi.sql'))

    def get_connection(self, config: Dict[str, str]) -> psycopg2.extensions.connection:
        """Establishes a connection to a PostgreSQL database."""
        return psycopg2.connect(**config)

    def ensure_infrastructure(self) -> None:
        """Reads the DDL and creates tables with the dtregistrocarga column."""
        logger.info(f"Checking BI infrastructure using DDL: {self.ddl_path}")
        if not os.path.exists(self.ddl_path):
            logger.error(f"DDL file not found at {self.ddl_path}")
            return

        with open(self.ddl_path, 'r', encoding='utf-8') as f:
            sql_content = f.read()

        # Split SQL by semicolons to execute each statement
        statements = sql_content.split(';')
        
        bi_conn = None
        try:
            bi_conn = self.get_connection(self.bi_config)
            bi_cursor = bi_conn.cursor()
            
            for statement in statements:
                stmt = statement.strip()
                if not stmt:
                    continue
   
                # Inject dtregistrocarga column if not already mentioned in the DDL
                if "dtregistrocarga" not in stmt.lower():
                    # Find the last closing parenthesis
                    last_paren = stmt.rfind(')')
                    if last_paren != -1:
                        stmt = stmt[:last_paren] + ",\n    dtregistrocarga TIMESTAMP DEFAULT NOW()" + stmt[last_paren:]
                
                logger.info(f"Executing: {stmt[:50]}...")
                bi_cursor.execute(stmt)
            
            bi_conn.commit()
            logger.info("BI Infrastructure (tables) ensured successfully.")
        except Exception as e:
            if bi_conn:
                bi_conn.rollback()
            logger.error(f"Error ensuring infrastructure: {str(e)}")
        finally:
            if bi_conn:
                bi_conn.close()

    def sync_table(self, source_table: str, target_table: str) -> None:
        """Synchronizes a single table from OLTP to BI using TRUNCATE + INSERT."""
        oltp_conn = None
        bi_conn = None
        try:
            oltp_conn = self.get_connection(self.oltp_config)
            bi_conn = self.get_connection(self.bi_config)
            
            oltp_cursor = oltp_conn.cursor()
            bi_cursor = bi_conn.cursor()

            # 1. Read from OLTP
            oltp_cursor.execute(f'SELECT * FROM "{source_table}"')
            rows: List[tuple] = oltp_cursor.fetchall()
            col_names: List[str] = [desc[0] for desc in oltp_cursor.description]
            
            # 2. TRUNCATE and INSERT into BI
            bi_cursor.execute(f'TRUNCATE TABLE "{target_table}" RESTART IDENTITY CASCADE')
            
            if rows:
                # Add current timestamp for dtregistrocarga
                now = datetime.now()
                rows_with_timestamp = [row + (now,) for row in rows]
                
                target_cols = col_names + ['dtregistrocarga']
                placeholders = ', '.join(['%s'] * len(target_cols))
                
                query = f'INSERT INTO "{target_table}" ({", ".join(target_cols)}) VALUES %s'
                execute_values(bi_cursor, query, rows_with_timestamp)
            
            bi_conn.commit()
            logger.info(f"Table {source_table} synced successfully to {target_table}. Records: {len(rows)}")

        except Exception as e:
            if bi_conn:
                bi_conn.rollback()
            logger.error(f"Error syncing table {source_table}: {str(e)}")
        finally:
            if oltp_conn:
                oltp_conn.close()
            if bi_conn:
                bi_conn.close()

    def run(self) -> None:
        """Runs the ETL process once."""
        logger.info("Initializing ETL Pipeline...")
        
        # Step 1: Ensure tables exist
        self.ensure_infrastructure()

        # Step 2: One-time synchronization
        logger.info("Starting synchronization cycle...")
        for source, target in self.tables.items():
            self.sync_table(source, target)
        
        logger.info("ETL process completed successfully.")

if __name__ == "__main__":
    pipeline = ETLPipeline()
    pipeline.run()
