import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginPayload, LoginResponse } from './auth.interface';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async login(payload: Partial<LoginPayload>): Promise<LoginResponse> {
    const email = payload.email?.trim().toLowerCase();
    const senha = payload.senha ?? '';

    if (!email || !senha) {
      throw new BadRequestException('E-mail e senha sao obrigatorios.');
    }

    const usuario = await this.prisma.usuario.findUnique({
      where: { email },
      select: {
        id: true,
        nome: true,
        email: true,
        senha: true,
        perfil: true,
      },
    });

    if (!usuario || !(await bcrypt.compare(senha, usuario.senha))) {
      throw new UnauthorizedException('E-mail ou senha incorretos.');
    }

    return {
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil,
      },
    };
  }
}
