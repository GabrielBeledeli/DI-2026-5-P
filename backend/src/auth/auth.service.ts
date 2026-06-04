import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginPayload, LoginResponse } from './auth.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(payload: Partial<LoginPayload>): Promise<LoginResponse> {
    const email = payload.email?.trim().toLowerCase();
    const senha = payload.senha ?? '';

    if (!email || !senha) {
      throw new BadRequestException('E-mail e senha sao obrigatorios.');
    }

    const usuario = await this.prisma.usuario.findUnique({
      where: { email },
    });

    if (!usuario || !(await bcrypt.compare(senha, usuario.senha))) {
      throw new UnauthorizedException('E-mail ou senha incorretos.');
    }

    const jwtPayload = { 
      sub: usuario.id.toString(), 
      email: usuario.email, 
      perfil: usuario.perfil 
    };

    return {
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil,
      },
      access_token: this.jwtService.sign(jwtPayload),
    };
  }
}
