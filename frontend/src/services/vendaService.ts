import { Venda } from '@/types';
import api from './api';
import { extractArray, extractPaginated } from './responseUtils';

type CriarVendaData = {
  clienteId: number;
  itens: Array<{
    produtoId: number;
    quantidade: number;
    precoUnitario: number;
  }>;
};

type ListarPaginadoParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  dataInicio?: string;
  dataFim?: string;
};

export const vendaService = {
  listar: async () => {
    const response = await api.get<unknown>('/vendas');
    return extractArray<Venda>(response.data, ['vendas']);
  },

  listarPaginado: async (params: ListarPaginadoParams = {}) => {
    const response = await api.get<unknown>('/vendas', {
      params: {
        page: params.page ?? 1,
        limit: params.limit ?? 50,
        search: params.search || undefined,
        status: params.status || undefined,
        dataInicio: params.dataInicio || undefined,
        dataFim: params.dataFim || undefined,
      },
    });
    return extractPaginated<Venda>(response.data);
  },

  buscarPorId: async (id: number) => {
    const response = await api.get<Venda>(`/vendas/${id}`);
    return response.data;
  },

  criar: async (dados: CriarVendaData) => {
    const response = await api.post<Venda>('/vendas', dados);
    return response.data;
  },

  cancelar: async (id: number) => {
    const response = await api.patch<Venda>(`/vendas/${id}/cancelar`);
    return response.data;
  },

  atualizar: async (id: number, dados: Partial<CriarVendaData> & { status?: string }) => {
    const response = await api.patch<Venda>(`/vendas/${id}`, dados);
    return response.data;
  },

  deletar: async (id: number) => {
    await api.delete(`/vendas/${id}`);
  },
};
