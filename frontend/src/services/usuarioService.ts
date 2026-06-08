import api from "./api";

export interface Vendedor {
  id: number;
  nome: string;
  email: string;
  perfil: string;
}

export const usuarioService = {
  listarVendedores: async (): Promise<Vendedor[]> => {
    const response = await api.get<Vendedor[]>("/usuarios/vendedores");
    return response.data;
  },
};
