import { Cliente } from '@/types';
import api from './api';
import { extractArray, extractPaginated } from './responseUtils';

type ListarPaginadoParams = {
  page?: number;
  limit?: number;
  search?: string;
};

export const clienteService = {
  listar: async () => {
    const response = await api.get<unknown>('/clientes');
    return extractArray<Cliente>(response.data, ['clientes']);
  },

  listarPaginado: async (params: ListarPaginadoParams = {}) => {
    const response = await api.get<unknown>('/clientes', {
      params: {
        page: params.page ?? 1,
        limit: params.limit ?? 50,
        search: params.search?.trim() || undefined,
      },
    });
    return extractPaginated<Cliente>(response.data);
  },

  buscarPorId: async (id: number) => {
    const response = await api.get<Cliente>(`/clientes/${id}`);
    return response.data;
  },

  criar: async (dados: Omit<Cliente, 'id'>) => {
    const response = await api.post<Cliente>('/clientes', dados);
    return response.data;
  },

  atualizar: async (id: number, dados: Partial<Cliente>) => {
    const response = await api.put<Cliente>(`/clientes/${id}`, dados);
    return response.data;
  },

  deletar: async (id: number) => {
    await api.delete(`/clientes/${id}`);
  },
};
