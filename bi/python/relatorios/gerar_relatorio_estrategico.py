import os
import pandas as pd
import psycopg2
import matplotlib
import warnings
from datetime import datetime
from dotenv import load_dotenv

# Set non-interactive backend for matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

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

class KickHubEstrategicoReporter:
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

    def draw_header_footer(self, canvas, doc, report_type="ESTRATÉGICO"):
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

    def build_pdf_safely(self, doc, elements, filename, report_type="ESTRATÉGICO"):
        try:
            handler = lambda canvas, doc: self.draw_header_footer(canvas, doc, report_type)
            doc.build(elements, onFirstPage=handler, onLaterPages=handler)
            print(f"Relatório gerado com sucesso: {filename}")
        except PermissionError: print(f"ERRO: O arquivo {filename} está aberto.")

    def run(self):
        filename = "relatorio_estrategico.pdf"; filepath = os.path.join(self.output_dir, filename); doc = SimpleDocTemplate(filepath, pagesize=A4, leftMargin=1*cm, rightMargin=1*cm, topMargin=1.5*cm, bottomMargin=1.5*cm)
        elements = []; conn = self.get_connection()
        q_intel = "SELECT AVG(valor_total) as avg_ltv, COUNT(CASE WHEN UPPER(risco_churn) IN ('ALTO', 'CRÍTICO') THEN 1 END) as churn_count, (COUNT(CASE WHEN UPPER(risco_churn) IN ('ALTO', 'CRÍTICO') THEN 1 END)::float / COUNT(*)) * 100 as churn_rate, (COUNT(CASE WHEN frequencia_total > 1 THEN 1 END)::float / COUNT(*)) * 100 as recurrence_rate, SUM(CASE WHEN UPPER(risco_churn) IN ('ALTO', 'CRÍTICO') THEN valor_total ELSE 0 END) as revenue_at_risk FROM ml_cliente_scores"
        intel = pd.read_sql(q_intel, conn).iloc[0]
        
        elements.append(Paragraph(self.style_title("Inteligência Estratégica"), self.styles['KH_SectionTitle']))
        i_row = [self.draw_kpi_card("LTV Médio", self.format_currency(intel['avg_ltv']), width=6.1*cm, small_font=True), self.draw_kpi_card("Receita em Risco", self.format_currency(intel['revenue_at_risk']), width=6.1*cm, small_font=True), self.draw_kpi_card("Clientes em Risco", int(intel['churn_count']), width=6.1*cm)]
        elements.append(Table([i_row], colWidths=[6.1*cm]*3)); elements.append(Spacer(1, 1*cm))
        
        # Churn Chart on Page 1 (Semantic Colors & Order)
        df_risk = pd.read_sql("SELECT risco_churn as label, COUNT(*) as t FROM ml_cliente_scores GROUP BY label", conn)
        risk_order = ['Baixo', 'Médio', 'Alto', 'Crítico']
        df_risk['label'] = pd.Categorical(df_risk['label'], categories=risk_order, ordered=True)
        df_risk = df_risk.sort_values('label').dropna(subset=['label'])
        
        color_map = {
            'Baixo': '#cbd5e1',   # Light Slate
            'Médio': '#94a3b8',   # Medium Slate
            'Alto': '#f87171',    # Soft Red
            'Crítico': '#dc2626'   # KickHub Red
        }
        actual_colors = [color_map[l] for l in df_risk['label']]
        
        c_path = os.path.join(self.output_dir, 'strat_churn_risk.png')
        
        # New Column Chart for Churn Risk Distribution
        plt.close('all')
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 6), facecolor='#f9fafb')
        
        # Plot 1: Volume Distribution
        bars1 = ax1.bar(df_risk['label'].astype(str), df_risk['t'], color=actual_colors, alpha=0.85)
        ax1.set_title('Distribuição de Risco (Volume)', fontweight='bold', color=DARK_BLACK)
        ax1.set_ylabel('Nº de Clientes')
        for b in bars1:
            h = b.get_height()
            ax1.annotate(f'{h:,.0f}'.replace(',', '.'), xy=(b.get_x() + b.get_width()/2, h), 
                        xytext=(0, 3), textcoords="offset points", ha='center', va='bottom', fontweight='bold')
        
        # Plot 2: Revenue Distribution
        df_rev_risk = pd.read_sql("SELECT risco_churn as label, SUM(valor_total) as total FROM ml_cliente_scores GROUP BY label", conn)
        df_rev_risk['label'] = pd.Categorical(df_rev_risk['label'], categories=risk_order, ordered=True)
        df_rev_risk = df_rev_risk.sort_values('label').dropna(subset=['label'])
        actual_colors_rev = [color_map[l] for l in df_rev_risk['label']]
        
        bars2 = ax2.bar(df_rev_risk['label'].astype(str), df_rev_risk['total'], color=actual_colors_rev, alpha=0.85)
        ax2.set_title('Receita em Risco (R$)', fontweight='bold', color=DARK_BLACK)
        ax2.set_ylabel('Valor (R$)')
        for b in bars2:
            h = b.get_height()
            ax2.annotate(self.format_currency(h), xy=(b.get_x() + b.get_width()/2, h), 
                        xytext=(0, 3), textcoords="offset points", ha='center', va='bottom', fontweight='bold', fontsize=8)
        
        plt.tight_layout()
        plt.savefig(c_path, dpi=120)
        
        elements.append(KeepTogether([Paragraph(self.style_title("Saúde Base"), self.styles['KH_SectionTitle']), Image(c_path, width=17.5*cm, height=8*cm)]))
        
        # NEW TABLE: CUSTOMERS AT HIGH/CRITICAL RISK
        elements.append(Paragraph(self.style_title("Clientes em Risco Crítico/Alto"), self.styles['KH_SectionTitle']))
        q_risk_clients = "SELECT c.nome, c.email, s.risco_churn, s.valor_total as ltv FROM ml_cliente_scores s JOIN bi_clientes c ON s.cliente_id = c.id WHERE UPPER(s.risco_churn) IN ('ALTO', 'CRÍTICO') ORDER BY s.valor_total DESC"
        df_risk_clients = pd.read_sql(q_risk_clients, conn)
        if not df_risk_clients.empty:
            data = [["Cliente", "E-mail", "Risco", "LTV"]]
            for _, r in df_risk_clients.iterrows():
                risk_color = color_map.get(r['risco_churn'], '#000000')
                risk_para = Paragraph(f'<b><font color="{risk_color}">{r["risco_churn"]}</font></b>', self.styles['KH_Normal'])
                data.append([str(r['nome'])[:25], str(r['email'])[:25], risk_para, self.format_currency(r['ltv'])])
            rtbl = Table(data, colWidths=[6*cm, 6*cm, 3.5*cm, 3.5*cm], repeatRows=1)
            rtbl.setStyle(TableStyle([('BACKGROUND', (0,0), (-1,0), COLOR_SECONDARY), ('TEXTCOLOR', (0,0), (-1,0), colors.white), ('GRID', (0,0), (-1,-1), 0.5, colors.grey), ('FONTSIZE', (0,0), (-1,-1), 9), ('ALIGN', (2,1), (2,-1), 'CENTER'), ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, COLOR_BG_LIGHT])]))
            elements.append(rtbl)
        else:
            elements.append(Paragraph("Nenhum cliente em risco alto ou crítico identificado.", self.styles['KH_Normal']))
            
        elements.append(PageBreak())
        
        # Page 2: Retenção
        elements.append(Paragraph(self.style_title("Análise Cohort"), self.styles['KH_SectionTitle']))
        elements.append(Paragraph("Acompanhamento de fidelidade: % de clientes que voltam a comprar nos meses seguintes à primeira aquisição (janela de 12 meses)", self.styles['KH_Normal_Styled']))
        
        q_c = """
        WITH fp AS (
            SELECT clienteId, DATE_TRUNC('month', MIN(dataVenda)) as c_m 
            FROM bi_vendas 
            WHERE status = 'CONCLUIDA' 
            GROUP BY clienteId
        ), 
        rb AS (
            SELECT 
                fp.c_m, 
                DATE_TRUNC('month', v.dataVenda) as b_m, 
                COUNT(DISTINCT v.clienteId) as a_c 
            FROM fp 
            JOIN bi_vendas v ON fp.clienteId = v.clienteId 
            WHERE v.status = 'CONCLUIDA' AND v.dataVenda >= fp.c_m 
            GROUP BY fp.c_m, DATE_TRUNC('month', v.dataVenda)
        ) 
        SELECT 
            c_m as cohort_month, 
            TO_CHAR(c_m, 'MM/YYYY') as mes_safra, 
            EXTRACT(YEAR FROM age(b_m, c_m))*12 + EXTRACT(MONTH FROM age(b_m, c_m)) as month_number, 
            a_c as active_customers 
        FROM rb 
        WHERE c_m >= DATE_TRUNC('month', NOW()) - INTERVAL '12 months'
          AND c_m < DATE_TRUNC('month', NOW())
          AND (EXTRACT(YEAR FROM age(b_m, c_m))*12 + EXTRACT(MONTH FROM age(b_m, c_m))) < 12
        ORDER BY c_m ASC, month_number ASC
        """
        df_c = pd.read_sql(q_c, conn)
        if not df_c.empty:
            piv = df_c.pivot(index='cohort_month', columns='month_number', values='active_customers').fillna(0)
            lmap = df_c.set_index('cohort_month')['mes_safra'].to_dict()
            piv.index = [lmap[i] for i in piv.index]
            piv.columns = piv.columns.astype(int)
            cpct = piv.div(piv[0].replace(0, 1), axis=0) * 100

            plt.close('all')
            fig, ax = plt.subplots(figsize=(12, 6), facecolor='#f9fafb')
            heatmap = ax.imshow(cpct.values, cmap='Reds', aspect='auto', vmin=0, vmax=100)
            ax.set_xticks(range(len(cpct.columns)))
            ax.set_xticklabels(cpct.columns)
            ax.set_yticks(range(len(cpct.index)))
            ax.set_yticklabels(cpct.index)
            ax.set_title("Taxa de Retenção Cohort (%)", fontweight='bold')
            ax.set_xlabel("")
            ax.set_ylabel("")

            for row_idx in range(cpct.shape[0]):
                for col_idx in range(cpct.shape[1]):
                    value = cpct.iloc[row_idx, col_idx]
                    text_color = 'white' if value >= 55 else DARK_BLACK
                    ax.text(col_idx, row_idx, f"{value:.1f}", ha='center', va='center', color=text_color, fontsize=8, fontweight='bold')

            fig.colorbar(heatmap, ax=ax, fraction=0.03, pad=0.02)
            c_path = os.path.join(self.output_dir, "strat_cohort.png")
            plt.tight_layout()
            plt.savefig(c_path, dpi=120)
            plt.close()
            elements.append(Image(c_path, width=17.5*cm, height=8.5*cm))
        
        elements.append(Paragraph(self.style_title("Clientes Diamante"), self.styles['KH_SectionTitle']))
        df_v = pd.read_sql("SELECT c.nome, s.valor_total, s.score_compra_rfm as score, mv.ultima_compra FROM ml_cliente_scores s JOIN bi_clientes c ON s.cliente_id = c.id LEFT JOIN (SELECT clienteId, MAX(dataVenda) as ultima_compra FROM bi_vendas GROUP BY clienteId) mv ON c.id = mv.clienteId WHERE s.score_compra_rfm >= 80 ORDER BY s.score_compra_rfm DESC LIMIT 20", conn)
        vd = [["Cliente", "LTV Acumulado", "Score RFM", "Última Compra"]]
        for _, r in df_v.iterrows(): vd.append([str(r['nome'])[:25], self.format_currency(r['valor_total']), f"{r['score']:.1f}", r['ultima_compra'].strftime('%d/%m/%Y') if pd.notnull(r['ultima_compra']) else 'N/A'])
        vtb = Table(vd, colWidths=[7*cm, 4*cm, 3.5*cm, 4*cm])
        vtb.setStyle(TableStyle([('BACKGROUND', (0,0), (-1,0), COLOR_SECONDARY), ('TEXTCOLOR', (0,0), (-1,0), colors.white), ('GRID', (0,0), (-1,-1), 0.5, colors.grey), ('FONTSIZE', (0,0), (-1,-1), 9), ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, COLOR_BG_LIGHT])]))
        elements.append(vtb); elements.append(PageBreak())

        # Page 3: Market & Acquisition
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
    reporter = KickHubEstrategicoReporter()
    reporter.run()
