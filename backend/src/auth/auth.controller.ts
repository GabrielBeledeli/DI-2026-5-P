import { Body, Controller, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { Public } from './public.decorator';
import type { LoginPayload } from './auth.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  async login(
    @Body() payload: Partial<LoginPayload>,
    @Res({ passthrough: true }) response: Response,
  ) {
    const loginData = await this.authService.login(payload);

    // Configura o Cookie HttpOnly
    response.cookie('access_token', loginData.access_token, {
      httpOnly: true, // Segurança contra XSS
      secure: process.env.NODE_ENV === 'production', // Apenas HTTPS em produção
      sameSite: 'strict', // Proteção contra CSRF
      maxAge: 8 * 60 * 60 * 1000, // 8 horas (mesmo tempo do JWT)
      path: '/',
    });

    // Retorna os dados do usuário, mas o token agora viaja oculto no Cookie
    return {
      usuario: loginData.usuario,
    };
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) response: Response) {
    // Limpa o cookie no logout
    response.clearCookie('access_token');
    return { message: 'Sessao encerrada com sucesso' };
  }
}
