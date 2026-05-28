import os
import time
import logging
from typing import List, Dict
import psycopg2
from psycopg2.extras import execute_values
from dotenv import load_dotenv

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load environment variables
# Look for .env in the current dir, then in parent dirs (bi/)
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '.env'))

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

    def get_connection(self, config: Dict[str, str]) -> psycopg2.extensions.connection:
        """Establishes a connection to a PostgreSQL database."""
        return psycopg2.connect(**config)

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
            oltp_cursor.execute(f"SELECT * FROM {source_table}")
            rows: List[tuple] = oltp_cursor.fetchall()
            col_names: List[str] = [desc[0] for desc in oltp_cursor.description]
            
            # 2. TRUNCATE and INSERT into BI
            bi_cursor.execute(f"TRUNCATE TABLE {target_table}")
            
            if rows:
                query = f"INSERT INTO {target_table} ({', '.join(col_names)}) VALUES %s"
                execute_values(bi_cursor, query, rows)
            
            bi_conn.commit()
            logger.info(f"Table {source_table} synced successfully. Records: {len(rows)}")

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
        """Main loop for the ETL process."""
        logger.info("Starting ETL Pipeline...")
        while True:
            logger.info("Starting synchronization cycle...")
            for source, target in self.tables.items():
                self.sync_table(source, target)
            
            logger.info("Cycle completed. Sleeping for 300 seconds.")
            time.sleep(300)

if __name__ == "__main__":
    pipeline = ETLPipeline()
    pipeline.run()
