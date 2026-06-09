import api from "./api";

export interface DashboardStats {
  perfil: string;
  resumo: {
    totalVendas: number;
    faturamentoTotal: number;
    ticketMedio: number;
  };
  vendasMensais: Array<{
    mes: string;
    total: number;
    quantidade: number;
    faturamento: number;
  }>;
  vendasCategoria: Array<{
    categoria: string;
    faturamento: number;
  }>;
  topClientes: Array<{
    nome: string;
    vendas: number;
    totalGasto: number;
    score: number;
    risco: string;
  }>;
  biEstrategico?: {
    totalClientes: number;
    totalVendasHistorico: number;
    taxaChurn: string;
    clvMedio: string;
    distribuicaoRisco: Array<{
      label: string;
      valor: number;
    }>;
    topChurn: Array<{
      nome: string;
      risco: string;
      probabilidade: string;
    }>;
    ultimaCarga?: string;
  };
}

export interface DashboardParams {
  usuarioId?: string;
  dataInicio?: string;
  dataFim?: string;
}

export interface CustomerAnalysisParams {
  search?: string;
  estado?: string;
  cidade?: string;
  pais?: string;
  risco?: string;
  classificacao?: string;
  isOutlier?: string;
  page?: string;
  limit?: string;
}

export const dashboardService = {
  getStats: async (params: DashboardParams = {}): Promise<DashboardStats> => {
    const response = await api.get<DashboardStats>("/dashboard/stats", { params });
    return response.data;
  },
  
  getCustomerAnalysis: async (params: CustomerAnalysisParams = {}): Promise<any> => {
    const response = await api.get("/dashboard/customer-analysis", { params });
    return response.data;
  },
  
  downloadManagerialReport: async (): Promise<void> => {
    const response = await api.get("/dashboard/report/managerial", { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `relatorio_gerencial_${new Date().toISOString().split('T')[0]}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  downloadStrategicReport: async (): Promise<void> => {
    const response = await api.get("/dashboard/report/strategic", { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `relatorio_estrategico_${new Date().toISOString().split('T')[0]}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },
  
  getChurnReport: async (): Promise<any[]> => {
    const response = await api.get("/dashboard/churn-report");
    return response.data;
  },
  
  getScoreReport: async (): Promise<any[]> => {
    const response = await api.get("/dashboard/score-report");
    return response.data;
  },

  refreshIntelligence: async (): Promise<{ message: string }> => {
    const response = await api.post("/dashboard/refresh-intelligence");
    return response.data;
  }
};
