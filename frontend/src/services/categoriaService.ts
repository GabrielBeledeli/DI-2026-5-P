import { Categoria } from '@/types';
import api from './api';
import { extractArray, extractPaginated } from './responseUtils';

type ListarPaginadoParams = {
  page?: number;
  limit?: number;
};

export const categoriaService = {
  listar: async () => {
    const response = await api.get<unknown>('/categorias');
    return extractArray<Categoria>(response.data, ['categorias']);
  },

  listarPaginado: async (params: ListarPaginadoParams = {}) => {
    const response = await api.get<unknown>('/categorias', {
      params: { page: params.page ?? 1, limit: params.limit ?? 50 },
    });
    return extractPaginated<Categoria>(response.data);
  },

  buscarPorId: async (id: number) => {
    const response = await api.get<Categoria>(`/categorias/${id}`);
    return response.data;
  },

  criar: async (dados: Omit<Categoria, 'id'>) => {
    const response = await api.post<Categoria>('/categorias', dados);
    return response.data;
  },

  atualizar: async (id: number, dados: Partial<Categoria>) => {
    const response = await api.put<Categoria>(`/categorias/${id}`, dados);
    return response.data;
  },

  deletar: async (id: number) => {
    await api.delete(`/categorias/${id}`);
  },
};
