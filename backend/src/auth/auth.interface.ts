import { UsuarioPerfil } from '@prisma/client';

export interface LoginPayload {
  email: string;
  senha: string;
}

export interface AuthUsuario {
  id: bigint;
  nome: string;
  email: string;
  perfil: UsuarioPerfil;
}

export interface LoginResponse {
  usuario: AuthUsuario;
}
