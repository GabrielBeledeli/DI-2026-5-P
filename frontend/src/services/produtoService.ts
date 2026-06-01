import { Produto } from "@/types";
import api from "./api";
import { extractArray } from "./responseUtils";

export type ProdutoCreatePayload = Omit<Produto, "id" | "categoria">;
export type ProdutoUpdatePayload = Partial<Omit<Produto, "id" | "categoria">>;

export const produtoService = {
  listar: async () => {
    const response = await api.get<unknown>("/produtos");
    return extractArray<Produto>(response.data, ["produtos"]);
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
