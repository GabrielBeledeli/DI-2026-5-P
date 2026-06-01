export interface Cliente {
  id: bigint;
  nome: string;
  email: string;
  cidade: string;
  estado: string;
  pais: string;
  dataCadastro: Date;
}

export type ClientePayload = Omit<Cliente, 'id' | 'dataCadastro'>;
