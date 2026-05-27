export interface ProdutoPayload {
  nome: string;
  preco: number | string;
  estoque: number;
  categoriaId: number | string | null;
}
