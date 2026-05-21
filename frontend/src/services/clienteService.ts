import api from './api';
import { Cliente } from '@/types';

const mockClientes: Cliente[] = [
  { id: 1, nome: 'João Silva', email: 'joao@nike.com', cidade: 'São Paulo', estado: 'SP', pais: 'Brasil' },
  { id: 2, nome: 'Maria Oliveira', email: 'maria@adidas.com', cidade: 'Rio de Janeiro', estado: 'RJ', pais: 'Brasil' },
  { id: 3, nome: 'Carlos Santos', email: 'carlos@puma.com', cidade: 'Curitiba', estado: 'PR', pais: 'Brasil' },
  { id: 4, nome: 'Ana Costa', email: 'ana@reebok.com', cidade: 'Belo Horizonte', estado: 'MG', pais: 'Brasil' },
  { id: 5, nome: 'Pedro Rocha', email: 'pedro@asics.com', cidade: 'Porto Alegre', estado: 'RS', pais: 'Brasil' },
];

export const clienteService = {
  listar: async () => {
    try {
      const response = await api.get<Cliente[]>('/clientes');
      return response.data;
    } catch (error) {
      console.warn('Backend offline, usando dados mockados');
      return mockClientes;
    }
  },
  buscarPorId: async (id: number) => {
    try {
      const response = await api.get<Cliente>(`/clientes/${id}`);
      return response.data;
    } catch (error) {
      return mockClientes.find(c => c.id === id) || mockClientes[0];
    }
  },
  criar: async (dados: Omit<Cliente, 'id'>) => {
    try {
      const response = await api.post<Cliente>('/clientes', dados);
      return response.data;
    } catch (error) {
      return { id: Math.floor(Math.random() * 1000), ...dados };
    }
  },
  atualizar: async (id: number, dados: Partial<Cliente>) => {
    try {
      const response = await api.put<Cliente>(`/clientes/${id}`, dados);
      return response.data;
    } catch (error) {
      return { id, ...dados } as Cliente;
    }
  },
  deletar: async (id: number) => {
    try {
      await api.delete(`/clientes/${id}`);
    } catch (error) {
      console.warn('Mock: Cliente deletado');
    }
  },
};
