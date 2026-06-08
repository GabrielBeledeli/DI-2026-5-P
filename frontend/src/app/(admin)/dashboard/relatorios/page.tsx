"use client";

import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  RefreshCw, 
  TrendingDown, 
  Activity,
  ShieldAlert,
  BarChart3,
  ChevronRight
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { dashboardService } from '@/services/dashboardService';
import { showErrorAlert, showSuccessAlert } from '@/lib/alerts';

export default function RelatoriosPDFPage() {
  const [loadingGerencial, setLoadingGerencial] = useState(false);
  const [loadingEstrategico, setLoadingEstrategico] = useState(false);

  const handleDownloadGerencial = async () => {
    try {
      setLoadingGerencial(true);
      await dashboardService.downloadManagerialReport();
      showSuccessAlert("Sucesso", "Relatório Gerencial gerado com sucesso.");
    } catch (error) {
      console.error(error);
      showErrorAlert(error, "Erro ao gerar relatório gerencial.");
    } finally {
      setLoadingGerencial(false);
    }
  };

  const handleDownloadStrategic = async () => {
    try {
      setLoadingEstrategico(true);
      await dashboardService.downloadStrategicReport();
      showSuccessAlert("Sucesso", "Relatório Estratégico gerado com sucesso.");
    } catch (error) {
      console.error(error);
      showErrorAlert(error, "Erro ao gerar relatório estratégico.");
    } finally {
      setLoadingEstrategico(false);
    }
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight uppercase italic">
            Central <span className="text-red-600">Relatórios PDF</span>
          </h1>
          <p className="text-neutral-500">Geração de documentos analíticos para tomada de decisão.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Card Relatório Gerencial */}
        <div className="group relative overflow-hidden rounded-3xl border border-neutral-800 bg-[#1a1a1a] p-1 transition-all hover:border-red-600/30">
          <div className="relative z-10 p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div className="rounded-2xl bg-red-600/10 p-4 text-red-600">
                <BarChart3 size={32} />
              </div>
              <Badge variant="info">Gerencial</Badge>
            </div>
            
            <div>
              <h2 className="text-2xl font-black text-white uppercase italic tracking-tight">
                Relatório <span className="text-red-600">Comercial</span>
              </h2>
              <p className="mt-2 text-sm text-neutral-400 leading-relaxed">
                Indicadores de performance de vendas, faturamento acumulado, 
                análise de categorias e alertas de estoque crítico. Ideal para acompanhamento diário da operação.
              </p>
            </div>

            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-xs text-neutral-500">
                <ChevronRight size={14} className="text-red-600" /> KPIs de Vendas e Faturamento
              </li>
              <li className="flex items-center gap-2 text-xs text-neutral-500">
                <ChevronRight size={14} className="text-red-600" /> Distribuição por Categoria
              </li>
              <li className="flex items-center gap-2 text-xs text-neutral-500">
                <ChevronRight size={14} className="text-red-600" /> Auditoria de Estoque Baixo
              </li>
            </ul>

            <Button 
              className="w-full h-12 rounded-xl font-black uppercase italic tracking-wider shadow-[0_0_20px_rgba(220,38,38,0.2)]"
              leftIcon={loadingGerencial ? <RefreshCw className="animate-spin" size={20} /> : <Download size={20} />}
              onClick={handleDownloadGerencial}
              disabled={loadingGerencial}
            >
              {loadingGerencial ? "Gerando PDF..." : "Gerar Relatório PDF"}
            </Button>
          </div>
          <div className="absolute -right-8 -top-8 text-neutral-800/10 pointer-events-none">
            <FileText size={200} />
          </div>
        </div>

        {/* Card Relatório Estratégico */}
        <div className="group relative overflow-hidden rounded-3xl border border-neutral-800 bg-[#1a1a1a] p-1 transition-all hover:border-red-600/30 shadow-2xl">
          <div className="relative z-10 p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div className="rounded-2xl bg-red-600/10 p-4 text-red-600">
                <Activity size={32} />
              </div>
              <Badge variant="error">Estratégico</Badge>
            </div>
            
            <div>
              <h2 className="text-2xl font-black text-white uppercase italic tracking-tight">
                Análise <span className="text-red-600">Estratégica ML</span>
              </h2>
              <p className="mt-2 text-sm text-neutral-400 leading-relaxed">
                Insights baseados em Machine Learning: Previsão de Churn, Segmentação RFM (VIPs) 
                e plano de ação para retenção de clientes críticos.
              </p>
            </div>

            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-xs text-neutral-500">
                <ChevronRight size={14} className="text-red-600" /> Saúde da Base (Churn Probability)
              </li>
              <li className="flex items-center gap-2 text-xs text-neutral-500">
                <ChevronRight size={14} className="text-red-600" /> Listagem de Clientes VIP (Diamante)
              </li>
              <li className="flex items-center gap-2 text-xs text-neutral-500">
                <ChevronRight size={14} className="text-red-600" /> Foco em Recuperação Crítica
              </li>
            </ul>

            <Button 
              className="w-full h-12 rounded-xl font-black uppercase italic tracking-wider shadow-[0_0_20px_rgba(220,38,38,0.2)]"
              leftIcon={loadingEstrategico ? <RefreshCw className="animate-spin" size={20} /> : <Download size={20} />}
              onClick={handleDownloadStrategic}
              disabled={loadingEstrategico}
            >
              {loadingEstrategico ? "Processando IA..." : "Gerar Análise Estratégica"}
            </Button>
          </div>
          <div className="absolute -right-8 -top-8 text-neutral-800/10 pointer-events-none">
            <ShieldAlert size={200} />
          </div>
        </div>
      </div>

      <Card className="bg-red-600/5 border-red-600/20">
        <div className="flex gap-4">
          <div className="text-red-600">
            <Activity size={24} />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white uppercase italic">Nota sobre processamento</h4>
            <p className="text-xs text-neutral-500">
              Estes relatórios são gerados em tempo real consultando a inteligência de dados do KickHub BI. 
              O formato PDF garante a integridade dos dados para apresentações gerenciais e reuniões estratégicas.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

function Badge({ children, variant = 'default' }: { children: React.ReactNode, variant?: 'default' | 'info' | 'error' }) {
  const styles = {
    default: 'bg-neutral-800 text-neutral-400',
    info: 'bg-blue-600/20 text-blue-400 border border-blue-600/20',
    error: 'bg-red-600/20 text-red-500 border border-red-600/20'
  };
  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${styles[variant]}`}>
      {children}
    </span>
  );
}
