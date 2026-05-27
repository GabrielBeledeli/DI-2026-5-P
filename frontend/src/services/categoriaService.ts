import { Categoria } from '@/types';
import api from './api';
import { extractArray } from './responseUtils';

export const categoriaService = {
  listar: async () => {
    const response = await api.get<unknown>('/categorias');
    return extractArray<Categoria>(response.data, ['categorias']);
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
