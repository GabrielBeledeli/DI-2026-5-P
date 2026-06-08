import os
import pandas as pd
import psycopg2
import matplotlib
import warnings
from datetime import datetime, timedelta
from dotenv import load_dotenv

# Set non-interactive backend for matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.ticker

# Silence pandas DBAPI2 warning
warnings.filterwarnings('ignore', category=UserWarning, module='pandas')

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, PageBreak, KeepTogether
from reportlab.lib.enums import TA_CENTER, TA_LEFT

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '..', '.env'), override=True)

# Constants for Styling
KICKHUB_RED = "#dc2626"
SECONDARY_NAVY = "#1f2937"
DARK_BLACK = "#0f0f0f"
TEXT_GRAY = "#1f2937"
BG_LIGHT_GRAY = "#f9fafb"
WHITE_HEX = "#ffffff"

COLOR_KICKHUB = colors.HexColor(KICKHUB_RED)
COLOR_SECONDARY = colors.HexColor(SECONDARY_NAVY)
COLOR_DARK = colors.HexColor(DARK_BLACK)
COLOR_TEXT = colors.HexColor(TEXT_GRAY)
COLOR_BG_LIGHT = colors.HexColor(BG_LIGHT_GRAY)
COLOR_WHITE = colors.white

class KickHubProfessionalReporter:
    def __init__(self):
        self.bi_config = {
            'host': os.getenv('BI_HOST', 'localhost'),
            'port': os.getenv('BI_PORT', '5432'),
            'database': os.getenv('BI_DB', 'kickhub_bi'),
            'user': os.getenv('BI_USER', 'postgres'),
            'password': os.getenv('BI_PASSWORD', 'postgres')
        }
        self.output_dir = os.path.join(os.path.dirname(__file__), 'arquivos')
        if not os.path.exists(self.output_dir):
            os.makedirs(self.output_dir)
            
        self.styles = getSampleStyleSheet()
        self.setup_styles()

    def setup_styles(self):
        self.styles.add(ParagraphStyle(
            name='KH_MainTitle', fontSize=32, textColor=COLOR_DARK, alignment=TA_CENTER,
            fontName='Helvetica-Bold', spaceAfter=30, leading=36
        ))
        self.styles.add(ParagraphStyle(
            name='KH_SectionTitle', fontSize=20, textColor=COLOR_DARK, fontName='Helvetica-Bold',
            spaceBefore=25, spaceAfter=20, leading=24
        ))
        self.styles.add(ParagraphStyle(
            name='KH_SubTitle', fontSize=14, textColor=colors.grey, alignment=TA_CENTER,
            spaceAfter=25, fontName='Helvetica-Oblique'
        ))
        self.styles.add(ParagraphStyle(
            name='KPIValue', fontSize=22, textColor=COLOR_KICKHUB, alignment=TA_CENTER, fontName='Helvetica-Bold'
        ))
        self.styles.add(ParagraphStyle(
            name='KPIValueSmall', fontSize=18, textColor=COLOR_KICKHUB, alignment=TA_CENTER, fontName='Helvetica-Bold'
        ))
        self.styles.add(ParagraphStyle(
            name='KPITitle', fontSize=10, textColor=colors.grey, alignment=TA_CENTER,
            fontName='Helvetica-Bold', textTransform='uppercase'
        ))
        self.styles.add(ParagraphStyle(
            name='KH_Normal', fontSize=11, textColor=COLOR_TEXT, alignment=TA_LEFT, fontName='Helvetica-Bold', leading=14
        ))
        self.styles.add(ParagraphStyle(
            name='KH_Normal_Styled', fontSize=11, textColor=COLOR_DARK, alignment=TA_LEFT, fontName='Helvetica', leading=16
        ))

    def style_title(self, text):
        words = text.split(' ')
        if len(words) >= 2:
            first, rest = words[0], " ".join(words[1:])
            return f'<font color="{DARK_BLACK}">{first}</font> <font color="{KICKHUB_RED}">{rest}</font>'
        return f'<font color="{KICKHUB_RED}">{text}</font>'

    def get_connection(self):
        return psycopg2.connect(**self.bi_config)

    def format_currency(self, value):
        if value is None: value = 0.0
        return f"R$ {value:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")

    def format_number(self, value):
        if value is None: value = 0
        return f"{value:,.0f}".replace(",", ".")

    def draw_header_footer(self, canvas, doc, report_type="GERENCIAL"):
        canvas.saveState()
        canvas.setStrokeColor(COLOR_KICKHUB)
        canvas.setLineWidth(1.5)
        canvas.line(1*cm, A4[1]-1.5*cm, A4[0]-1*cm, A4[1]-1.5*cm)
        canvas.setFont('Helvetica-Bold', 14)
        canvas.setFillColor(COLOR_DARK)
        canvas.drawString(1*cm, A4[1]-1.2*cm, "HUB")
        canvas.setFillColor(COLOR_KICKHUB)
        canvas.drawString(2.3*cm, A4[1]-1.2*cm, "ANALYTICS")
        canvas.setFont('Helvetica-Bold', 10)
        canvas.setFillColor(colors.grey)
        canvas.drawRightString(A4[0]-1*cm, A4[1]-1.2*cm, f"RELATÓRIO {report_type}")
        canvas.line(1*cm, 1.5*cm, A4[0]-1*cm, 1.5*cm)
        canvas.setFont('Helvetica', 8)
        canvas.setFillColor(colors.grey)
        canvas.drawString(1*cm, 1.1*cm, f"Emitido em: {datetime.now().strftime('%d/%m/%Y %H:%M')}")
        canvas.drawRightString(A4[0]-1*cm, 1.1*cm, f"Página {doc.page}")
        canvas.restoreState()

    def draw_kpi_card(self, title, value, growth=None, width=8.5*cm, bgcolor=COLOR_BG_LIGHT, small_font=False):
        growth_text = ""
        if growth is not None:
            color_growth = "green" if growth >= 0 else "red"
            sign = "+" if growth >= 0 else ""
            growth_text = f'<br/><font size="8" color="{color_growth}">{sign}{growth:.1f}% vs anterior</font>'
        v_style = self.styles['KPIValueSmall'] if small_font else self.styles['KPIValue']
        data = [[Paragraph(title, self.styles['KPITitle'])], [Paragraph(f"{str(value)}{growth_text}", v_style)]]
        t = Table(data, colWidths=[width])
        t.setStyle(TableStyle([('BACKGROUND', (0,0), (-1,-1), bgcolor), ('BOTTOMPADDING', (0,0), (-1,-1), 12), ('TOPPADDING', (0,0), (-1,-1), 12), ('LINEBELOW', (0,0), (-1,0), 2, COLOR_KICKHUB), ('ALIGN', (0,0), (-1,-1), 'CENTER')]))
        return t

    def get_monthly_evolution(self, conn):
        q = "SELECT TO_CHAR(dataVenda, 'MM/YYYY') as mes_ano, SUM(total) as faturamento, COUNT(id) as volume, MIN(dataVenda) as data_ref FROM bi_vendas WHERE status = 'CONCLUIDA' AND dataVenda < DATE_TRUNC('month', NOW()) GROUP BY mes_ano ORDER BY data_ref DESC LIMIT 12"
        df = pd.read_sql(q, conn)
        return df.iloc[::-1]

    def get_mtd_pulse(self, conn):
        q = """
            WITH mtd AS (SELECT COALESCE(SUM(total), 0) as revenue, COUNT(id) as sales, COALESCE(AVG(total), 0) as ticket FROM bi_vendas WHERE status = 'CONCLUIDA' AND dataVenda >= DATE_TRUNC('month', NOW())),
            last_month_total AS (SELECT COALESCE(SUM(total), 0) as revenue, COUNT(id) as sales, COALESCE(AVG(total), 0) as ticket FROM bi_vendas WHERE status = 'CONCLUIDA' AND dataVenda >= DATE_TRUNC('month', NOW()) - INTERVAL '1 month' AND dataVenda < DATE_TRUNC('month', NOW())),
            last_month_same_period AS (SELECT COALESCE(SUM(total), 0) as revenue, COUNT(id) as sales, COALESCE(AVG(total), 0) as ticket FROM bi_vendas WHERE status = 'CONCLUIDA' AND dataVenda >= DATE_TRUNC('month', NOW()) - INTERVAL '1 month' AND dataVenda < NOW() - INTERVAL '1 month'),
            nc_mtd AS (SELECT COUNT(*) as count FROM bi_clientes WHERE dataCadastro >= DATE_TRUNC('month', NOW())),
            nc_last AS (SELECT COUNT(*) as count FROM bi_clientes WHERE dataCadastro >= DATE_TRUNC('month', NOW()) - INTERVAL '1 month' AND dataCadastro < DATE_TRUNC('month', NOW()))
            SELECT m.revenue as mtd_revenue, m.sales as mtd_sales, m.ticket as mtd_ticket, l_full.revenue as last_revenue, l_full.sales as last_sales, l_full.ticket as last_ticket, nc_mtd.count as mtd_new_customers, nc_last.count as last_new_customers, l_same.revenue as last_same_revenue
            FROM mtd m, last_month_total l_full, last_month_same_period l_same, nc_mtd, nc_last
        """
        pulse = pd.read_sql(q, conn).iloc[0]
        # Safety fill for None values that might slip through SQL drivers
        pulse = pulse.fillna(0)
        return pulse

    def get_temporal_df(self, conn, dimension, timeframe='Total'):
        where = ""
        if timeframe == '7d': where = "AND dataVenda >= NOW() - INTERVAL '7 days'"
        elif timeframe == '30d': where = "AND dataVenda >= NOW() - INTERVAL '30 days'"
        elif timeframe == 'mtd': where = "AND dataVenda >= DATE_TRUNC('month', NOW())"
        elif timeframe == 'prev_month': where = "AND dataVenda >= DATE_TRUNC('month', NOW()) - INTERVAL '1 month' AND dataVenda < DATE_TRUNC('month', NOW())"
        limit = "LIMIT 15"
        if dimension == 'categoria': q = f"SELECT c.nome as label, SUM(vi.subtotal) as total, SUM(vi.quantidade) as qtd FROM bi_venda_itens vi JOIN bi_vendas v ON vi.vendaId = v.id JOIN bi_produtos p ON vi.produtoId = p.id JOIN bi_categorias c ON p.categoriaId = c.id WHERE v.status = 'CONCLUIDA' {where} GROUP BY c.nome ORDER BY total DESC"
        elif dimension == 'marca': q = f"SELECT p.marca as label, SUM(vi.subtotal) as total, SUM(vi.quantidade) as qtd FROM bi_venda_itens vi JOIN bi_vendas v ON vi.vendaId = v.id JOIN bi_produtos p ON vi.produtoId = p.id WHERE v.status = 'CONCLUIDA' {where} GROUP BY p.marca ORDER BY total DESC {limit}"
        elif dimension == 'modelo': q = f"SELECT p.nome as label, SUM(vi.subtotal) as total, SUM(vi.quantidade) as qtd FROM bi_venda_itens vi JOIN bi_vendas v ON vi.vendaId = v.id JOIN bi_produtos p ON vi.produtoId = p.id WHERE v.status = 'CONCLUIDA' {where} GROUP BY p.nome ORDER BY total DESC {limit}"
        elif dimension == 'tamanho': q = f"SELECT p.tamanho as label, SUM(vi.subtotal) as total, SUM(vi.quantidade) as qtd FROM bi_venda_itens vi JOIN bi_vendas v ON vi.vendaId = v.id JOIN bi_produtos p ON vi.produtoId = p.id WHERE v.status = 'CONCLUIDA' {where} GROUP BY p.tamanho ORDER BY total DESC {limit}"
        elif dimension == 'genero': q = f"SELECT p.genero as label, SUM(vi.subtotal) as total, SUM(vi.quantidade) as qtd FROM bi_venda_itens vi JOIN bi_vendas v ON vi.vendaId = v.id JOIN bi_produtos p ON vi.produtoId = p.id WHERE v.status = 'CONCLUIDA' {where} GROUP BY p.genero ORDER BY total DESC"
        elif dimension == 'vendedor': q = f"SELECT u.nome as label, SUM(v.total) as total, COUNT(v.id) as qtd FROM bi_vendas v JOIN bi_usuarios u ON v.usuarioId = u.id WHERE v.status = 'CONCLUIDA' {where} GROUP BY u.nome ORDER BY total DESC"
        return pd.read_sql(q, conn)

    def generate_dual_chart(self, df, kind='bar', filename='chart.png', color='#dc2626'):
        plt.close('all'); path = os.path.join(self.output_dir, filename); fig_w, fig_h = 12, 6.5
        def f_scale(x, p):
            if x >= 1e6: return f'R$ {x*1e-6:.1f}M'
            if x >= 1e3: return f'R$ {x*1e-3:.0f}K'
            return f'R$ {x:.0f}'
        def f_qty(x, p): return f'{x:,.0f}'.replace(',', '.')
        if kind == 'hbar':
            df_plot = df.iloc[::-1]; fig, ax1 = plt.subplots(figsize=(fig_w, fig_h), facecolor='#f9fafb'); y_pos = range(len(df_plot)); h_bar = 0.4
            bars_t = ax1.barh([y + h_bar/2 for y in y_pos], df_plot['total'], height=h_bar, color=KICKHUB_RED, alpha=0.8, label='Faturamento')
            ax2 = ax1.twiny(); gray = '#9ca3af'; bars_q = ax2.barh([y - h_bar/2 for y in y_pos], df_plot['qtd'], height=h_bar, color=gray, alpha=0.7, label='Quantidade')
            ax1.set_xlim(0, df_plot['total'].max() * 1.35); ax2.set_xlim(0, df_plot['qtd'].max() * 1.6); ax1.set_xticklabels([]); ax1.tick_params(bottom=False); ax2.set_xticklabels([]); ax2.tick_params(top=False); ax1.set_yticks(y_pos); ax1.set_yticklabels(df_plot['label'].astype(str).str[:30], fontsize=9, fontweight='bold')
            for b in bars_t:
                w = b.get_width(); ax1.annotate(f_scale(w, None), xy=(w, b.get_y() + b.get_height()/2), xytext=(5, 0), textcoords="offset points", va='center', ha='left', fontsize=8, color=KICKHUB_RED, fontweight='bold', bbox=dict(boxstyle='round,pad=0.2', fc='white', ec=KICKHUB_RED, alpha=0.9))
            for b in bars_q:
                w = b.get_width(); ax2.annotate(f_qty(w, None), xy=(w, b.get_y() + b.get_height()/2), xytext=(5, 0), textcoords="offset points", va='center', ha='left', fontsize=8, color=DARK_BLACK, fontweight='bold', bbox=dict(boxstyle='round,pad=0.2', fc='white', ec=gray, alpha=0.9))
            ax1.grid(axis='x', linestyle='--', alpha=0.1); ax1.legend(loc='lower right', framealpha=0.9)
        else:
            fig, ax1 = plt.subplots(figsize=(fig_w, fig_h), facecolor='#f9fafb'); labels = df['label'].astype(str).str[:20]
            if kind == 'bar':
                max_t, max_q = df['total'].max() if df['total'].max() > 0 else 1, df['qtd'].max() if df['qtd'].max() > 0 else 1
                ax1.set_ylim(0, max_t / 0.85); ax2 = ax1.twinx(); ax2.set_ylim(0, max_q / 0.25); ax1.set_yticklabels([]); ax1.tick_params(left=False); ax2.set_yticklabels([]); ax2.tick_params(right=False)
                bars = ax1.bar(labels, df['total'], color=color, alpha=0.7, label='Faturamento')
                for b in bars:
                    h = b.get_height(); ax1.annotate(f_scale(h, None), xy=(b.get_x() + b.get_width()/2, h), xytext=(0, 10), textcoords="offset points", ha='center', va='bottom', fontsize=9, color=color, fontweight='bold', bbox=dict(boxstyle='round,pad=0.3', fc='white', ec=color, alpha=0.95))
                ax2.plot(labels, df['qtd'], color=DARK_BLACK, marker='o', linewidth=2.5, markersize=8, label='Quantidade')
                for i, v in enumerate(df['qtd']):
                    ax2.annotate(f_qty(v, None), xy=(i, v), xytext=(0, -20), textcoords="offset points", ha='center', va='top', fontsize=9, color=DARK_BLACK, fontweight='bold', bbox=dict(boxstyle='round,pad=0.3', fc='white', ec=DARK_BLACK, alpha=0.95))
                plt.xticks(rotation=45, ha='right', fontsize=10); ax1.grid(axis='y', linestyle='--', alpha=0.1); l1, lb1 = ax1.get_legend_handles_labels(); l2, lb2 = ax2.get_legend_handles_labels(); ax2.legend(l1+l2, lb1+lb2, loc='upper right', framealpha=0.9)
            elif kind == 'pie':
                fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 6), facecolor='#f9fafb'); clist = [KICKHUB_RED, '#f87171', '#94a3b8', '#cbd5e1', '#e5e7eb']
                df.set_index('label')['total'].plot(kind='pie', autopct='%1.1f%%', ax=ax1, colors=clist, startangle=90, textprops={'fontsize': 9})
                ax1.set_title('Faturamento %', fontweight='bold', color=KICKHUB_RED); ax1.set_ylabel('')
                df.set_index('label')['qtd'].plot(kind='pie', autopct='%1.1f%%', ax=ax2, colors=clist, startangle=90, textprops={'fontsize': 9})
                ax2.set_title('Quantidade %', fontweight='bold', color=DARK_BLACK); ax2.set_ylabel('')
        plt.tight_layout(); plt.savefig(path, dpi=120); plt.close(); return path

    def generate_simple_chart(self, df, kind='bar', filename='stock_chart.png', color=KICKHUB_RED):
        plt.close('all'); path = os.path.join(self.output_dir, filename); fig_w, fig_h = 12, 6.5; fig, ax = plt.subplots(figsize=(fig_w, fig_h), facecolor='#f9fafb')
        if kind == 'hbar':
            df_plot = df.iloc[::-1]; labels = df_plot.index.astype(str).str[:40]; values = df_plot.iloc[:, 0]; ax.set_xlim(0, values.max() * 1.3); ax.set_xticklabels([]); ax.tick_params(bottom=False); bars = ax.barh(labels, values, color=color, alpha=0.8)
            for b in bars:
                w = b.get_width(); ax.annotate(f"{w:,.0f}".replace(',', '.'), xy=(w, b.get_y() + b.get_height()/2), xytext=(5, 0), textcoords="offset points", va='center', ha='left', fontsize=9, color=color, fontweight='bold', bbox=dict(boxstyle='round,pad=0.2', fc='white', ec=color, alpha=0.95))
            ax.grid(axis='x', linestyle='--', alpha=0.1)
        else:
            labels = df.index.astype(str).str[:20]; values = df.iloc[:, 0]
            if kind == 'bar':
                ax.set_ylim(0, values.max() * 1.35); ax.set_yticklabels([]); ax.tick_params(left=False); bars = ax.bar(labels, values, color=color, alpha=0.8)
                for b in bars:
                    h = b.get_height(); ax.annotate(f"{h:,.0f}".replace(',', '.'), xy=(b.get_x() + b.get_width()/2, h), xytext=(0, 8), textcoords="offset points", ha='center', va='bottom', fontsize=10, color=color, fontweight='bold', bbox=dict(boxstyle='round,pad=0.3', fc='white', ec=color, alpha=0.95))
                plt.xticks(rotation=45, ha='right', fontsize=10); ax.grid(axis='y', linestyle='--', alpha=0.1)
            elif kind == 'pie':
                clist = [KICKHUB_RED, '#f87171', '#94a3b8', '#cbd5e1', '#e5e7eb']
                df.iloc[:, 0].plot(kind='pie', autopct='%1.1f%%', ax=ax, colors=clist, startangle=90, textprops={'fontsize': 10, 'fontweight': 'bold'})
                ax.set_ylabel('')
        plt.tight_layout(); plt.savefig(path, dpi=120); plt.close(); return path

    def build_pdf_safely(self, doc, elements, filename, report_type="GERENCIAL"):
        try:
            handler = lambda canvas, doc: self.draw_header_footer(canvas, doc, report_type)
            doc.build(elements, onFirstPage=handler, onLaterPages=handler)
            print(f"Relatório gerado com sucesso: {filename}")
        except PermissionError: print(f"ERRO: O arquivo {filename} está aberto.")

    def gerar_relatorio_gerencial(self):
        filename = "relatorio_gerencial.pdf"; filepath = os.path.join(self.output_dir, filename); doc = SimpleDocTemplate(filepath, pagesize=A4, leftMargin=1*cm, rightMargin=1*cm, topMargin=1.5*cm, bottomMargin=1.5*cm)
        elements = []; conn = self.get_connection()
        elements.append(Paragraph(self.style_title("Resumo Gerencial"), self.styles['KH_SectionTitle']))
        summary_query = "SELECT (SELECT COUNT(*) FROM bi_vendas WHERE status = 'CONCLUIDA') as total_vendas, (SELECT COALESCE(SUM(total), 0) FROM bi_vendas WHERE status = 'CONCLUIDA') as revenue, (SELECT COALESCE(AVG(total), 0) FROM bi_vendas WHERE status = 'CONCLUIDA') as avg_ticket, (SELECT COUNT(*) FROM bi_clientes) as total_customers, (SELECT COALESCE(SUM(estoque), 0) FROM bi_produtos) as total_stock_units, (SELECT COALESCE(SUM(estoque * preco), 0) FROM bi_produtos) as stock_asset_value"
        df_summary = pd.read_sql(summary_query, conn)
        r1 = [self.draw_kpi_card("Vendas Totais", self.format_number(df_summary['total_vendas'][0])), self.draw_kpi_card("Faturamento Bruto", self.format_currency(df_summary['revenue'][0]))]
        r2 = [self.draw_kpi_card("Ticket Médio", self.format_currency(df_summary['avg_ticket'][0])), self.draw_kpi_card("Total Clientes", self.format_number(df_summary['total_customers'][0]))]
        r3 = [self.draw_kpi_card("Itens Estoque", self.format_number(df_summary['total_stock_units'][0])), self.draw_kpi_card("Ativo Estoque", self.format_currency(df_summary['stock_asset_value'][0]))]
        elements.append(Table([r1], colWidths=[9.2*cm, 9.2*cm])); elements.append(Spacer(1, 0.1*cm))
        elements.append(Table([r2], colWidths=[9.2*cm, 9.2*cm])); elements.append(Spacer(1, 0.1*cm))
        elements.append(Table([r3], colWidths=[9.2*cm, 9.2*cm])); elements.append(Spacer(1, 0.3*cm))
        elements.append(Paragraph(self.style_title("Evolução Histórica"), self.styles['KH_SectionTitle']))
        df_evol = self.get_monthly_evolution(conn)
        if not df_evol.empty:
            df_e = df_evol.rename(columns={'mes_ano': 'label', 'faturamento': 'total', 'volume': 'qtd'})
            c_p = self.generate_dual_chart(df_e, kind='bar', filename="evol_real.png", color=SECONDARY_NAVY)
            elements.append(Image(c_p, width=18*cm, height=9.5*cm))
        elements.append(PageBreak()); pulse = self.get_mtd_pulse(conn); rv_g = ((pulse['mtd_revenue'] - pulse['last_same_revenue']) / pulse['last_same_revenue']) * 100 if pulse['last_same_revenue'] != 0 else 0; sl_g = ((pulse['mtd_sales'] - pulse['last_sales']) / pulse['last_sales']) * 100 if pulse['last_sales'] != 0 else 0; tk_g = ((pulse['mtd_ticket'] - pulse['last_ticket']) / pulse['last_ticket']) * 100 if pulse['last_ticket'] != 0 else 0; ct_g = ((pulse['mtd_new_customers'] - pulse['last_new_customers']) / pulse['last_new_customers']) * 100 if pulse['last_new_customers'] != 0 else 0
        elements.append(Paragraph(self.style_title("Mês Anterior"), self.styles['KH_SectionTitle'])); p1 = [self.draw_kpi_card("Faturamento Anterior", self.format_currency(pulse['last_revenue']), bgcolor=WHITE_HEX, width=9.2*cm), self.draw_kpi_card("Vendas Anterior", int(pulse['last_sales']), bgcolor=WHITE_HEX, width=9.2*cm)]; p2 = [self.draw_kpi_card("Ticket Anterior", self.format_currency(pulse['last_ticket']), bgcolor=WHITE_HEX, width=9.2*cm), self.draw_kpi_card("Novos Clientes Ant.", int(pulse['last_new_customers']), bgcolor=WHITE_HEX, width=9.2*cm)]; elements.append(Table([p1], colWidths=[9.2*cm, 9.2*cm])); elements.append(Spacer(1, 0.1*cm)); elements.append(Table([p2], colWidths=[9.2*cm, 9.2*cm])); elements.append(Spacer(1, 0.5*cm))
        elements.append(Paragraph(self.style_title("Mês Atual"), self.styles['KH_SectionTitle'])); c1 = [self.draw_kpi_card("Faturamento MTD", self.format_currency(pulse['mtd_revenue']), growth=rv_g, width=9.2*cm), self.draw_kpi_card("Vendas MTD", int(pulse['mtd_sales']), growth=sl_g, width=9.2*cm)]; c2 = [self.draw_kpi_card("Ticket Médio MTD", self.format_currency(pulse['mtd_ticket']), growth=tk_g, width=9.2*cm), self.draw_kpi_card("Novos Clientes MTD", int(pulse['mtd_new_customers']), growth=ct_g, width=9.2*cm)]; elements.append(Table([c1], colWidths=[9.2*cm, 9.2*cm])); elements.append(Spacer(1, 0.1*cm)); elements.append(Table([c2], colWidths=[9.2*cm, 9.2*cm])); elements.append(PageBreak())

        def add_evolution_table(elements, conn, dimension, title_text):
            elements.append(Paragraph(f"<b>EVOLUÇÃO: {title_text.upper()}</b>", self.styles['KH_Normal']))
            df_curr, df_prev = self.get_temporal_df(conn, dimension, 'mtd'), self.get_temporal_df(conn, dimension, 'prev_month')
            merged = pd.merge(df_prev, df_curr, on='label', how='outer', suffixes=('_prev', '_curr')).fillna(0); merged['growth'] = ((merged['total_curr'] - merged['total_prev']) / merged['total_prev'].replace(0, 1)) * 100; merged = merged.sort_values(by='total_curr', ascending=False).head(10); data = [["Item", "Mês Anterior", "Mês Atual", "Crescimento %"]]
            for _, r in merged.iterrows(): g = r['growth']; sign = "+" if g >= 0 else ""; data.append([str(r['label'])[:35], self.format_currency(r['total_prev']), self.format_currency(r['total_curr']), f"{sign}{g:.1f}%"])
            t = Table(data, colWidths=[8.5*cm, 4*cm, 4*cm, 2*cm]); t.setStyle(TableStyle([('BACKGROUND', (0,0), (-1,0), COLOR_SECONDARY), ('TEXTCOLOR', (0,0), (-1,0), colors.white), ('GRID', (0,0), (-1,-1), 0.5, colors.grey), ('FONTSIZE', (0,0), (-1,-1), 9), ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, COLOR_BG_LIGHT])])); elements.append(t); elements.append(Spacer(1, 0.4*cm))

        elements.append(Paragraph(self.style_title("Tendências e Evolução"), self.styles['KH_SectionTitle'])); add_evolution_table(elements, conn, 'categoria', "Categorias"); add_evolution_table(elements, conn, 'marca', "Marcas"); elements.append(PageBreak())

        def render_temporal_block(elements, conn, dimension, title_text, kind='bar', color=KICKHUB_RED):
            periods = [('7d', 'Últimos 7 Dias'), ('30d', 'Últimos 30 Dias'), ('Total', 'Histórico Total')]
            for code, label in periods:
                df = self.get_temporal_df(conn, dimension, code)
                if not df.empty:
                    cur_kind = 'hbar' if dimension == 'modelo' else kind; sub = [Paragraph(self.style_title(f"{title_text} - {label}"), self.styles['KH_SectionTitle'])]
                    c_path = self.generate_dual_chart(df, kind=cur_kind, filename=f"chart_{dimension}_{code}.png", color=color); sub.append(Image(c_path, width=17.5*cm, height=9.5*cm)); sub.append(Spacer(1, 0.5*cm)); elements.append(KeepTogether(sub)); data = [["Item", "Quantidade", "Faturamento Total"]]
                    for _, r in df.iterrows(): data.append([str(r['label'])[:45], int(r['qtd']), self.format_currency(r['total'])])
                    t = Table(data, colWidths=[10.5*cm, 3*cm, 4*cm]); t.setStyle(TableStyle([('BACKGROUND', (0,0), (-1,0), COLOR_SECONDARY), ('TEXTCOLOR', (0,0), (-1,0), colors.white), ('GRID', (0,0), (-1,-1), 0.5, colors.grey), ('FONTSIZE', (0,0), (-1,-1), 9), ('ALIGN', (1,0), (-1,-1), 'CENTER'), ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, COLOR_BG_LIGHT])])); elements.append(t); elements.append(Spacer(1, 1*cm))
                else: elements.append(Paragraph(self.style_title(f"{title_text} - {label}"), self.styles['KH_SectionTitle'])); elements.append(Paragraph("Sem dados para este período.", self.styles['KH_Normal']))
        
        render_temporal_block(elements, conn, 'categoria', "Faturamento Categoria"); render_temporal_block(elements, conn, 'marca', "Faturamento Marca", color=SECONDARY_NAVY); render_temporal_block(elements, conn, 'modelo', "Performance Modelo"); render_temporal_block(elements, conn, 'tamanho', "Performance Tamanho", color=DARK_BLACK); render_temporal_block(elements, conn, 'genero', "Performance Gênero", kind='pie'); render_temporal_block(elements, conn, 'vendedor', "Ranking Vendedores", color=KICKHUB_RED); elements.append(Paragraph(self.style_title("Estoque Atual"), self.styles['KH_SectionTitle'])); q_s = pd.read_sql("SELECT SUM(estoque) as u, SUM(estoque*preco) as a FROM bi_produtos", conn).iloc[0]; sk = [self.draw_kpi_card("Total Unidades", self.format_number(q_s['u'])), self.draw_kpi_card("Valor Ativo", self.format_currency(q_s['a']))]; elements.append(Table([sk], colWidths=[9.2*cm, 9.2*cm])); elements.append(Spacer(1, 0.5*cm)); dm = pd.read_sql("SELECT marca, SUM(estoque) as t FROM bi_produtos GROUP BY marca ORDER BY t DESC LIMIT 15", conn).set_index('marca'); c1 = self.generate_simple_chart(dm, kind='bar', filename='st_marca.png'); elements.append(KeepTogether([Paragraph(self.style_title("Estoque Marca"), self.styles['KH_SectionTitle']), Image(c1, width=17.5*cm, height=9.5*cm)])); dmod = pd.read_sql("SELECT nome, SUM(estoque) as t FROM bi_produtos GROUP BY nome ORDER BY t DESC LIMIT 15", conn).set_index('nome'); c2 = self.generate_simple_chart(dmod, kind='hbar', filename='st_modelo.png'); elements.append(KeepTogether([Paragraph(self.style_title("Estoque Modelo"), self.styles['KH_SectionTitle']), Image(c2, width=17.5*cm, height=9.5*cm)])); dt = pd.read_sql("SELECT tamanho, SUM(estoque) as t FROM bi_produtos GROUP BY tamanho ORDER BY tamanho ASC", conn).set_index('tamanho'); c3 = self.generate_simple_chart(dt, kind='bar', filename='st_tamanho.png', color=DARK_BLACK); elements.append(KeepTogether([Paragraph(self.style_title("Estoque Tamanho"), self.styles['KH_SectionTitle']), Image(c3, width=17.5*cm, height=9.5*cm)])); dg = pd.read_sql("SELECT genero, SUM(estoque) as t FROM bi_produtos GROUP BY genero", conn).set_index('genero'); c4 = self.generate_simple_chart(dg, kind='pie', filename='st_genero.png'); elements.append(KeepTogether([Paragraph(self.style_title("Estoque Gênero"), self.styles['KH_SectionTitle']), Image(c4, width=17.5*cm, height=9.5*cm)])); elements.append(PageBreak()); df_low = pd.read_sql("SELECT nome, marca, tamanho, estoque FROM bi_produtos WHERE estoque < 10 ORDER BY estoque ASC", conn)
        if not df_low.empty: elements.append(Paragraph(self.style_title("Alerta Estoque"), self.styles['KH_SectionTitle'])); ld = [["Produto", "Marca", "Tam", "Est"]] + [[str(r['nome'])[:35], r['marca'], r['tamanho'], r['estoque']] for _, r in df_low.iterrows()]; lt = Table(ld, colWidths=[9*cm, 4*cm, 2.5*cm, 2.5*cm]); lt.setStyle(TableStyle([('BACKGROUND', (0,0), (-1,0), COLOR_KICKHUB), ('TEXTCOLOR', (0,0), (-1,0), colors.white), ('GRID', (0,0), (-1,-1), 0.5, colors.grey)])); elements.append(lt); elements.append(Spacer(1, 1*cm))
        df_dead = pd.read_sql("SELECT nome, marca, estoque, preco, (estoque*preco) as v FROM bi_produtos WHERE id NOT IN (SELECT produtoId FROM bi_venda_itens) ORDER BY v DESC LIMIT 100", conn)
        if not df_dead.empty: elements.append(Paragraph(self.style_title("Estoque Parado"), self.styles['KH_SectionTitle'])); dd = [["Produto", "Marca", "Est", "Valor"]] + [[str(r['nome'])[:35], r['marca'], r['estoque'], self.format_currency(r['v'])] for _, r in df_dead.iterrows()]; dtbl = Table(dd, colWidths=[8*cm, 4*cm, 2*cm, 4*cm]); dtbl.setStyle(TableStyle([('BACKGROUND', (0,0), (-1,0), colors.grey), ('TEXTCOLOR', (0,0), (-1,0), colors.white), ('GRID', (0,0), (-1,-1), 0.5, colors.grey), ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, COLOR_BG_LIGHT])])); elements.append(dtbl); elements.append(Spacer(1, 1*cm))
        elements.append(Paragraph(self.style_title("Inventário Completo"), self.styles['KH_SectionTitle'])); df_inv = pd.read_sql("SELECT nome, marca, cor, tamanho, estoque, preco FROM bi_produtos ORDER BY marca, nome", conn); idat = [["Produto", "Marca", "Cor", "Tam", "Est", "Preço"]] + [[str(r['nome'])[:25], r['marca'], r['cor'], r['tamanho'], r['estoque'], self.format_currency(r['preco'])] for _, r in df_inv.iterrows()]; itbl = Table(idat, colWidths=[6*cm, 3*cm, 3*cm, 1.5*cm, 1.5*cm, 3*cm], repeatRows=1); itbl.setStyle(TableStyle([('BACKGROUND', (0,0), (-1,0), COLOR_DARK), ('TEXTCOLOR', (0,0), (-1,0), colors.white), ('FONTSIZE', (0,0), (-1,-1), 8), ('GRID', (0,0), (-1,-1), 0.5, colors.grey), ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, COLOR_BG_LIGHT])])); elements.append(itbl); conn.close(); self.build_pdf_safely(doc, elements, filename, "GERENCIAL")

    def gerar_relatorio_estrategico(self):
        filename = "relatorio_estrategico.pdf"; filepath = os.path.join(self.output_dir, filename); doc = SimpleDocTemplate(filepath, pagesize=A4, leftMargin=1*cm, rightMargin=1*cm, topMargin=1.5*cm, bottomMargin=1.5*cm)
        elements = []; conn = self.get_connection()
        q_intel = "SELECT AVG(valor_total) as avg_ltv, COUNT(CASE WHEN UPPER(risco_churn) IN ('ALTO', 'CRÍTICO') THEN 1 END) as churn_count, (COUNT(CASE WHEN UPPER(risco_churn) IN ('ALTO', 'CRÍTICO') THEN 1 END)::float / COUNT(*)) * 100 as churn_rate, (COUNT(CASE WHEN frequencia_total > 1 THEN 1 END)::float / COUNT(*)) * 100 as recurrence_rate, SUM(CASE WHEN UPPER(risco_churn) IN ('ALTO', 'CRÍTICO') THEN valor_total ELSE 0 END) as revenue_at_risk FROM ml_cliente_scores"
        intel = pd.read_sql(q_intel, conn).iloc[0]
        
        elements.append(Paragraph(self.style_title("Inteligência Estratégica"), self.styles['KH_SectionTitle']))
        i_row = [self.draw_kpi_card("LTV Médio", self.format_currency(intel['avg_ltv']), width=6.1*cm, small_font=True), self.draw_kpi_card("Receita em Risco", self.format_currency(intel['revenue_at_risk']), width=6.1*cm, small_font=True), self.draw_kpi_card("Clientes em Risco", int(intel['churn_count']), width=6.1*cm)]
        elements.append(Table([i_row], colWidths=[6.1*cm]*3)); elements.append(Spacer(1, 1*cm))
        # Churn Chart on Page 1 (Semantic Colors)
        df_risk = pd.read_sql("SELECT risco_churn as label, COUNT(*) as t FROM ml_cliente_scores GROUP BY label", conn)
        
        # Enforce order and specific colors
        risk_order = ['Baixo', 'Médio', 'Alto', 'Crítico']
        df_risk['label'] = pd.Categorical(df_risk['label'], categories=risk_order, ordered=True)
        df_risk = df_risk.sort_values('label')
        
        # Premium Brand Palette (No traffic lights)
        color_map = {
            'Baixo': '#cbd5e1',   # Light Slate (Safe)
            'Médio': '#94a3b8',   # Medium Slate (Attention)
            'Alto': '#f87171',    # Soft Red (Warning)
            'Crítico': '#dc2626'   # KickHub Red (Danger)
        }
        actual_colors = [color_map[l] for l in df_risk['label']]
        
        # Prepare for chart
        df_rl = pd.DataFrame({'label': df_risk['label'], 'total': df_risk['t'], 'qtd': df_risk['t']})
        
        # Create chart with specific colors
        plt.close('all'); fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 6), facecolor='#f9fafb')
        df_rl.set_index('label')['total'].plot(kind='pie', autopct='%1.1f%%', ax=ax1, colors=actual_colors, startangle=90, textprops={'fontsize': 10, 'fontweight': 'bold'})
        ax1.set_title('Distribuição de Risco (Volume)', fontweight='bold', color=DARK_BLACK); ax1.set_ylabel('')
        
        # Second pie: Revenue at risk per category
        df_rev_risk = pd.read_sql("SELECT risco_churn as label, SUM(valor_total) as total FROM ml_cliente_scores GROUP BY label", conn)
        df_rev_risk['label'] = pd.Categorical(df_rev_risk['label'], categories=risk_order, ordered=True)
        df_rev_risk = df_rev_risk.sort_values('label')
        actual_colors_rev = [color_map[l] for l in df_rev_risk['label']]
        
        df_rev_risk.set_index('label')['total'].plot(kind='pie', autopct='%1.1f%%', ax=ax2, colors=actual_colors_rev, startangle=90, textprops={'fontsize': 10, 'fontweight': 'bold'})
        ax2.set_title('Receita em Risco (R$)', fontweight='bold', color=DARK_BLACK); ax2.set_ylabel('')
        
        c_path = os.path.join(self.output_dir, 'strat_churn_risk.png')
        plt.tight_layout(); plt.savefig(c_path, dpi=120)
        
        elements.append(KeepTogether([Paragraph(self.style_title("Saúde Base"), self.styles['KH_SectionTitle']), Image(c_path, width=17.5*cm, height=8*cm)]))
        elements.append(PageBreak())
        elements.append(Paragraph(self.style_title("Análise Cohort"), self.styles['KH_SectionTitle'])); elements.append(Paragraph("Acompanhamento de fidelidade: % de clientes que voltam a comprar após a primeira aquisição", self.styles['KH_Normal_Styled'])); q_c = "WITH fp AS (SELECT clienteId, DATE_TRUNC('month', MIN(dataVenda)) as c_m FROM bi_vendas WHERE status = 'CONCLUIDA' GROUP BY clienteId), rb AS (SELECT fp.c_m, DATE_TRUNC('month', v.dataVenda) as b_m, COUNT(DISTINCT v.clienteId) as a_c FROM fp JOIN bi_vendas v ON fp.clienteId = v.clienteId WHERE v.status = 'CONCLUIDA' AND v.dataVenda >= fp.c_m GROUP BY 1, 2) SELECT c_m as cohort_month, TO_CHAR(c_m, 'MM/YYYY') as mes_safra, EXTRACT(YEAR FROM age(b_m, c_m))*12 + EXTRACT(MONTH FROM age(b_m, c_m)) as month_number, a_c as active_customers FROM rb WHERE c_m >= '2025-01-01' ORDER BY c_m ASC, month_number ASC"; df_c = pd.read_sql(q_c, conn)
        if not df_c.empty:
            piv = df_c.pivot(index='cohort_month', columns='month_number', values='active_customers').fillna(0); lmap = df_c.set_index('cohort_month')['mes_safra'].to_dict(); piv.index = [lmap[i] for i in piv.index]; piv.columns = piv.columns.astype(int); cpct = piv.div(piv[0], axis=0) * 100; plt.close('all'); fig, ax = plt.subplots(figsize=(12, 6), facecolor='#f9fafb'); import seaborn as sns; sns.heatmap(cpct, annot=True, fmt=".1f", cmap="Reds", cbar=False, ax=ax); plt.title("Taxa de Retenção Cohort (%)", fontweight='bold'); plt.xlabel(""); plt.ylabel(""); c_path = os.path.join(self.output_dir, "strat_cohort.png"); plt.tight_layout(); plt.savefig(c_path, dpi=120); elements.append(Image(c_path, width=17.5*cm, height=8.5*cm))
        
        # DIAMOND CLIENTS on Page 2
        elements.append(Paragraph(self.style_title("Clientes Diamante"), self.styles['KH_SectionTitle']))
        df_v = pd.read_sql("SELECT c.nome, s.valor_total, s.score_compra_rfm as score, mv.ultima_compra FROM ml_cliente_scores s JOIN bi_clientes c ON s.cliente_id = c.id LEFT JOIN (SELECT clienteId, MAX(dataVenda) as ultima_compra FROM bi_vendas GROUP BY clienteId) mv ON c.id = mv.clienteId WHERE s.score_compra_rfm >= 80 ORDER BY s.score_compra_rfm DESC LIMIT 20", conn)
        vd = [["Cliente", "LTV Acumulado", "Score RFM", "Última Compra"]]
        for _, r in df_v.iterrows(): vd.append([str(r['nome'])[:25], self.format_currency(r['valor_total']), f"{r['score']:.1f}", r['ultima_compra'].strftime('%d/%m/%Y') if pd.notnull(r['ultima_compra']) else 'N/A'])
        vtb = Table(vd, colWidths=[7*cm, 4*cm, 3.5*cm, 4*cm])
        vtb.setStyle(TableStyle([('BACKGROUND', (0,0), (-1,0), COLOR_SECONDARY), ('TEXTCOLOR', (0,0), (-1,0), colors.white), ('GRID', (0,0), (-1,-1), 0.5, colors.grey), ('FONTSIZE', (0,0), (-1,-1), 9), ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, COLOR_BG_LIGHT])]))
        elements.append(vtb); elements.append(PageBreak())

        # Page 3: Market
        elements.append(Paragraph(self.style_title("Ticket Marca"), self.styles['KH_SectionTitle']))
        df_btk = pd.read_sql("SELECT p.marca as label, AVG(v.total) as total, COUNT(v.id) as qtd FROM bi_vendas v JOIN bi_venda_itens vi ON v.id = vi.vendaId JOIN bi_produtos p ON vi.produtoId = p.id WHERE v.status = 'CONCLUIDA' GROUP BY p.marca ORDER BY total DESC LIMIT 15", conn)
        cb = self.generate_dual_chart(df_btk, kind='hbar', filename='strat_brand_ticket.png', color=SECONDARY_NAVY)
        elements.append(Image(cb, width=17.5*cm, height=9.5*cm)); elements.append(Spacer(1, 0.5*cm))

        elements.append(Paragraph(self.style_title("Curva Aquisição"), self.styles['KH_SectionTitle']))
        df_a = pd.read_sql("SELECT TO_CHAR(dataCadastro, 'MM/YYYY') as label, COUNT(*) as total, 0 as qtd FROM bi_clientes WHERE dataCadastro < DATE_TRUNC('month', NOW()) GROUP BY label, DATE_TRUNC('month', dataCadastro) ORDER BY DATE_TRUNC('month', dataCadastro) DESC LIMIT 12", conn).iloc[::-1]
        plt.close('all'); plt.figure(figsize=(12, 6), facecolor='#f9fafb'); plt.plot(df_a['label'], df_a['total'], color=KICKHUB_RED, marker='o', linewidth=3, markersize=10)
        for i, v in enumerate(df_a['total']): plt.annotate(str(v), xy=(i, v), xytext=(0, 10), textcoords="offset points", ha='center', fontweight='bold', bbox=dict(boxstyle='round', fc='white', ec=KICKHUB_RED))
        plt.title("Novos Clientes por Mês", fontweight='bold'); plt.xticks(rotation=45); plt.grid(alpha=0.2); ca = os.path.join(self.output_dir, "strat_acq.png"); plt.tight_layout(); plt.savefig(ca, dpi=120)
        elements.append(Image(ca, width=17.5*cm, height=8*cm)); elements.append(PageBreak())

        # Page 4: Reactivation
        elements.append(Paragraph(self.style_title("Oportunidades Reativação"), self.styles['KH_SectionTitle']))
        df_re = pd.read_sql("SELECT c.nome, c.email, s.valor_total, mv.ultima_compra FROM ml_cliente_scores s JOIN bi_clientes c ON s.cliente_id = c.id JOIN (SELECT clienteId, MAX(dataVenda) as ultima_compra FROM bi_vendas GROUP BY clienteId) mv ON c.id = mv.clienteId WHERE s.valor_total > 500 AND mv.ultima_compra < NOW() - INTERVAL '60 days' ORDER BY s.valor_total DESC LIMIT 20", conn)
        if not df_re.empty:
            rd = [["Cliente", "E-mail", "LTV Histórico", "Dias Inativo"]]
            for _, r in df_re.iterrows():
                days = (datetime.now() - r['ultima_compra']).days if pd.notnull(r['ultima_compra']) else 0
                rd.append([str(r['nome'])[:20], str(r['email'])[:20], self.format_currency(r['valor_total']), f"{days} dias"])
            rtb = Table(rd, colWidths=[6.5*cm, 6.5*cm, 3.5*cm, 2*cm])
            rtb.setStyle(TableStyle([('BACKGROUND', (0,0), (-1,0), COLOR_KICKHUB), ('TEXTCOLOR', (0,0), (-1,0), colors.white), ('GRID', (0,0), (-1,-1), 0.5, colors.grey), ('FONTSIZE', (0,0), (-1,-1), 9), ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, COLOR_BG_LIGHT])]))
            elements.append(rtb)
        
        conn.close(); self.build_pdf_safely(doc, elements, filename, "ESTRATÉGICO")

if __name__ == "__main__":
    reporter = KickHubProfessionalReporter()
    reporter.gerar_relatorio_gerencial()
    reporter.gerar_relatorio_estrategico()
