import api from "./api";

export interface DashboardStats {
  resumo: {
    totalVendas: number;
    faturamentoTotal: number;
    totalClientes: number;
    ticketMedio: number;
    estoqueBaixo: number;
  };
  vendasMensais: Array<{
    mes: string;
    total: number;
  }>;
  vendasCategoria: Array<{
    categoria: string;
    faturamento: number;
  }>;
  topClientes: Array<{
    nome: string;
    vendas: number;
    totalGasto: number;
  }>;
}

export interface DashboardParams {
  usuarioId?: string;
  dataInicio?: string;
  dataFim?: string;
}

export const dashboardService = {
  getStats: async (params: DashboardParams = {}): Promise<DashboardStats> => {
    const response = await api.get<DashboardStats>("/dashboard/stats", { params });
    return response.data;
  },
};
