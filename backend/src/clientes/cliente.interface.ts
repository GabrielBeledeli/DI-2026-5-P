export interface Cliente {
  id: number;
  nome: string;
  email: string;
  cidade: string;
  estado: string;
  pais: string;
}

export type ClientePayload = Omit<Cliente, 'id'>;
