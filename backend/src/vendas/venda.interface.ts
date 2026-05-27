export interface CriarVendaPayload {
  clienteId: number;
  itens: Array<{
    produtoId: number;
    quantidade: number;
    precoUnitario?: number;
  }>;
}
