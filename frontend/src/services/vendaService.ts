import api from './api';
import { Venda } from '@/types';

const mockVendas: Venda[] = [
  { id: 1, clienteId: 1, total: 2400, status: 'ATIVO', data: new Date().toISOString(), cliente: { id: 1, nome: 'João Silva', email: 'joao@nike.com', cidade: 'SP', estado: 'SP', pais: 'Brasil' } },
  { id: 2, clienteId: 2, total: 850, status: 'ATIVO', data: new Date().toISOString(), cliente: { id: 2, nome: 'Maria Oliveira', email: 'maria@adidas.com', cidade: 'RJ', estado: 'RJ', pais: 'Brasil' } },
  { id: 3, clienteId: 3, total: 4200, status: 'CANCELADO', data: new Date().toISOString(), cliente: { id: 3, nome: 'Carlos Santos', email: 'carlos@puma.com', cidade: 'PR', estado: 'PR', pais: 'Brasil' } },
];

export const vendaService = {
  listar: async () => {
    try {
      const response = await api.get<Venda[]>('/vendas');
      return response.data;
    } catch (error) {
      console.warn('Backend offline, usando dados mockados');
      return mockVendas;
    }
  },
  buscarPorId: async (id: number) => {
    try {
      const response = await api.get<Venda>(`/vendas/${id}`);
      return response.data;
    } catch (error) {
      return mockVendas.find(v => v.id === id) || mockVendas[0];
    }
  },
  criar: async (dados: any) => {
    try {
      const response = await api.post<Venda>('/vendas', dados);
      return response.data;
    } catch (error) {
      return { id: Math.floor(Math.random() * 1000), ...dados, status: 'ATIVO', data: new Date().toISOString() };
    }
  },
  cancelar: async (id: number) => {
    try {
      const response = await api.patch<Venda>(`/vendas/${id}/cancelar`);
      return response.data;
    } catch (error) {
      console.warn('Mock: Venda cancelada');
      return { id, status: 'CANCELADO' } as Venda;
    }
  },
  deletar: async (id: number) => {
    try {
      await api.delete(`/vendas/${id}`);
    } catch (error) {
      console.warn('Mock: Venda deletada');
    }
  },
};
