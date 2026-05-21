import api from './api';
import { Categoria } from '@/types';

const mockCategorias: Categoria[] = [
  { id: 1, nome: 'Casual', totalProdutos: 24 },
  { id: 2, nome: 'Running', totalProdutos: 12 },
  { id: 3, nome: 'Social', totalProdutos: 8 },
  { id: 4, nome: 'Outdoor', totalProdutos: 15 },
  { id: 5, nome: 'Kids', totalProdutos: 20 },
];

export const categoriaService = {
  listar: async () => {
    try {
      const response = await api.get<Categoria[]>('/categorias');
      return response.data;
    } catch (error) {
      console.warn('Backend offline, usando dados mockados');
      return mockCategorias;
    }
  },
  buscarPorId: async (id: number) => {
    try {
      const response = await api.get<Categoria>(`/categorias/${id}`);
      return response.data;
    } catch (error) {
      return mockCategorias.find(c => c.id === id) || mockCategorias[0];
    }
  },
  criar: async (dados: Omit<Categoria, 'id'>) => {
    try {
      const response = await api.post<Categoria>('/categorias', dados);
      return response.data;
    } catch (error) {
      return { id: Math.floor(Math.random() * 1000), ...dados };
    }
  },
  atualizar: async (id: number, dados: Partial<Categoria>) => {
    try {
      const response = await api.put<Categoria>(`/categorias/${id}`, dados);
      return response.data;
    } catch (error) {
      return { id, ...dados } as Categoria;
    }
  },
  deletar: async (id: number) => {
    try {
      await api.delete(`/categorias/${id}`);
    } catch (error) {
      console.warn('Mock: Categoria deletada');
    }
  },
};
