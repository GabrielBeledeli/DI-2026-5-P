export interface ProdutoPayload {
  nome: string;
  preco: number | string;
  estoque: number;
  categoriaId: number | string | bigint | null;
  marca?: string;
  cor?: string;
  genero?: string;
  tamanho?: string;
}
