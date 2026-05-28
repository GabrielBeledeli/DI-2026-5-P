import os
import logging
from datetime import datetime
from typing import List, Any
import psycopg2
import pandas as pd
from dotenv import load_dotenv
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '.env'))

class ReportGenerator:
    def __init__(self) -> None:
        self.bi_config = {
            'host': os.getenv('BI_HOST'),
            'port': os.getenv('BI_PORT'),
            'database': os.getenv('BI_DB'),
            'user': os.getenv('BI_USER'),
            'password': os.getenv('BI_PASSWORD')
        }
        self.styles = getSampleStyleSheet()

    def get_bi_connection(self) -> psycopg2.extensions.connection:
        """Establishes a connection to the BI database."""
        return psycopg2.connect(**self.bi_config)

    def fetch_data(self, view_name: str) -> pd.DataFrame:
        """Fetches data from a BI view and returns a pandas DataFrame."""
        try:
            conn = self.get_bi_connection()
            query = f"SELECT * FROM {view_name}"
            df = pd.read_sql(query, conn)
            conn.close()
            return df
        except Exception as e:
            logger.error(f"Error fetching data from {view_name}: {str(e)}")
            return pd.DataFrame()

    def create_pdf(self, filename: str, title: str, sections: List[Dict[str, Any]]) -> None:
        """Creates a PDF report with multiple tables."""
        doc = SimpleDocTemplate(filename, pagesize=A4)
        elements = []

        # Title
        elements.append(Paragraph(title, self.styles['Title']))
        elements.append(Spacer(1, 12))
        elements.append(Paragraph(f"Data de geração: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}", self.styles['Normal']))
        elements.append(Spacer(1, 24))

        for section in sections:
            elements.append(Paragraph(section['title'], self.styles['Heading2']))
            elements.append(Spacer(1, 12))

            df = section['data']
            if df.empty:
                elements.append(Paragraph("Nenhum dado encontrado para esta seção.", self.styles['Normal']))
            else:
                # Convert DataFrame to list for ReportLab
                data = [df.columns.tolist()] + df.values.tolist()
                
                # Format numbers for display
                for i in range(1, len(data)):
                    for j in range(len(data[i])):
                        if isinstance(data[i][j], (float, int)) and not isinstance(data[i][j], bool):
                             # Basic formatting for currency-like columns
                             if 'faturamento' in df.columns[j].lower() or 'total' in df.columns[j].lower() or 'preco' in df.columns[j].lower():
                                 data[i][j] = f"R$ {data[i][j]:,.2f}"
                             elif 'data' in df.columns[j].lower():
                                 data[i][j] = str(data[i][j])

                t = Table(data, hAlign='LEFT')
                t.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                    ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                    ('FONTSIZE', (0, 0), (-1, 0), 12),
                    ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                    ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                    ('GRID', (0, 0), (-1, -1), 1, colors.black)
                ]))
                elements.append(t)
            
            elements.append(Spacer(1, 24))

        doc.build(elements)
        logger.info(f"Report {filename} generated successfully.")

    def generate_sales_report(self) -> None:
        """Generates the Sales Management Report."""
        today = datetime.now().strftime('%Y-%m-%d')
        filename = f"relatorio_vendas_{today}.pdf"
        
        sections = [
            {'title': 'Vendas por Dia', 'data': self.fetch_data('vw_vendas_por_dia')},
            {'title': 'Produtos Mais Vendidos', 'data': self.fetch_data('vw_produto_mais_vendido')},
            {'title': 'Faturamento por Categoria', 'data': self.fetch_data('vw_faturamento_por_categoria')}
        ]
        
        self.create_pdf(filename, "Relatório Gerencial de Vendas", sections)

    def generate_stock_report(self) -> None:
        """Generates the Stock Management Report."""
        today = datetime.now().strftime('%Y-%m-%d')
        filename = f"relatorio_estoque_{today}.pdf"
        
        sections = [
            {'title': 'Produtos com Estoque Baixo (< 10 unidades)', 'data': self.fetch_data('vw_estoque_baixo')},
            {'title': 'Faturamento por Marca', 'data': self.fetch_data('vw_faturamento_por_marca')}
        ]
        
        self.create_pdf(filename, "Relatório Gerencial de Estoque", sections)

if __name__ == "__main__":
    generator = ReportGenerator()
    generator.generate_sales_report()
    generator.generate_stock_report()
