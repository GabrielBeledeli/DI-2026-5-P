import { Produto } from "@/types";
import api from "./api";
import { extractArray, extractPaginated } from "./responseUtils";

export type ProdutoCreatePayload = Omit<Produto, "id" | "categoria">;
export type ProdutoUpdatePayload = Partial<Omit<Produto, "id" | "categoria">>;
type ListarPaginadoParams = {
  page?: number;
  limit?: number;
  search?: string;
};

export const produtoService = {
  listar: async () => {
    const response = await api.get<unknown>("/produtos");
    return extractArray<Produto>(response.data, ["produtos"]);
  },

  listarPaginado: async (params: ListarPaginadoParams = {}) => {
    const response = await api.get<unknown>("/produtos", {
      params: {
        page: params.page ?? 1,
        limit: params.limit ?? 50,
        search: params.search?.trim() || undefined,
      },
    });
    return extractPaginated<Produto>(response.data);
  },

  buscarPorId: async (id: number) => {
    const response = await api.get<Produto>(`/produtos/${id}`);
    return response.data;
  },

  criar: async (dados: ProdutoCreatePayload) => {
    const response = await api.post<Produto>("/produtos", dados);
    return response.data;
  },

  atualizar: async (id: number, dados: ProdutoUpdatePayload) => {
    const response = await api.put<Produto>(`/produtos/${id}`, dados);
    return response.data;
  },

  deletar: async (id: number) => {
    await api.delete(`/produtos/${id}`);
  },
};
