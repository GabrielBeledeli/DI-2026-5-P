import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsuariosService {
  constructor(private readonly prisma: PrismaService) {}

  async listarVendedores() {
    const usuarios = await this.prisma.usuario.findMany({
      select: {
        id: true,
        nome: true,
        email: true,
        perfil: true,
      },
      orderBy: { nome: 'asc' },
    });

    // Filtra apenas vendedores se necessário, ou retorna todos os usuários que podem vender
    return usuarios;
  }
}
