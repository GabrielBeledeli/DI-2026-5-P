import api from './api';
import { Produto } from '@/types';
import { extractArray } from './responseUtils';

const mockProdutos: Produto[] = [
  { id: 1, nome: 'Air Jordan 1 Retro High', preco: 1200, estoque: 10, categoriaId: 1, categoria: { id: 1, nome: 'Casual' } },
  { id: 2, nome: 'Nike Dunk Low Panda', preco: 850, estoque: 3, categoriaId: 1, categoria: { id: 1, nome: 'Casual' } },
  { id: 3, nome: 'Adidas Yeezy Boost 350', preco: 2100, estoque: 15, categoriaId: 1, categoria: { id: 1, nome: 'Casual' } },
  { id: 4, nome: 'New Balance 550 White', preco: 950, estoque: 2, categoriaId: 1, categoria: { id: 1, nome: 'Casual' } },
  { id: 5, nome: 'Asics Gel-Kayano 29', preco: 1100, estoque: 8, categoriaId: 2, categoria: { id: 2, nome: 'Running' } },
];

export const produtoService = {
  listar: async () => {
    try {
      const response = await api.get<unknown>('/produtos');
      return extractArray<Produto>(response.data, ['produtos']);
    } catch {
      console.warn('Backend offline, usando dados mockados');
      return mockProdutos;
    }
  },
  buscarPorId: async (id: number) => {
    try {
      const response = await api.get<Produto>(`/produtos/${id}`);
      return response.data;
    } catch {
      return mockProdutos.find(p => p.id === id) || mockProdutos[0];
    }
  },
  criar: async (dados: Omit<Produto, 'id'>) => {
    try {
      const response = await api.post<Produto>('/produtos', dados);
      return response.data;
    } catch {
      return { id: Math.floor(Math.random() * 1000), ...dados };
    }
  },
  atualizar: async (id: number, dados: Partial<Produto>) => {
    try {
      const response = await api.put<Produto>(`/produtos/${id}`, dados);
      return response.data;
    } catch {
      return { id, ...dados } as Produto;
    }
  },
  deletar: async (id: number) => {
    try {
      await api.delete(`/produtos/${id}`);
    } catch {
      console.warn('Mock: Produto deletado');
    }
  },
};
