export interface Cliente {
  id: number;
  nome: string;
  email: string;
  cidade: string;
  estado: string;
  pais: string;
}

export interface Categoria {
  id: number;
  nome: string;
  totalProdutos?: number;
}

export interface Produto {
  id: number;
  nome: string;
  marca?: string;
  cor?: string;
  genero?: string;
  tamanho?: string;
  preco: number;
  estoque: number;
  categoriaId?: number;
  categoria?: Categoria;
  createdAt?: string;
}

export interface VendaItem {
  id: number;
  vendaId: number;
  produtoId: number;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
  produto?: Produto;
}

export interface Venda {
  id: number;
  clienteId: number;
  total: number;
  status: "CONCLUIDA" | "CANCELADO" | "PENDENTE_PAGAMENTO" | "ATIVO";
  data?: string;
  dataVenda?: string;
  cliente?: Cliente;
  usuario?: {
    id: number;
    nome: string;
    email: string;
    perfil: string;
  };
  itens?: VendaItem[];
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}
