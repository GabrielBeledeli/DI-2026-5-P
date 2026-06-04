import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 1. Obtém o token do cookie (nomeado no backend como 'access_token')
  const token = request.cookies.get('access_token')?.value;

  // 2. Define as rotas que são públicas (não precisam de login)
  const isLoginPage = request.nextUrl.pathname === '/login';
  const isPublicFile = request.nextUrl.pathname.match(/\.(.*)$/); // arquivos estáticos, imagens, etc.

  // 3. REGRA DE REDIRECIONAMENTO:
  // Se não houver token e o usuário tentar acessar qualquer página que NÃO seja o login
  if (!token && !isLoginPage && !isPublicFile) {
    const loginUrl = new URL('/login', request.url);
    // Opcional: Salva a URL que ele tentou acessar para redirecionar de volta depois
    loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 4. Se houver token e o usuário tentar ir para o login, manda ele para a home/vendas
  if (token && isLoginPage) {
    return NextResponse.redirect(new URL('/vendas', request.url));
  }

  return NextResponse.next();
}

// Configura em quais caminhos o middleware deve rodar
// Aqui dizemos para rodar em tudo, exceto arquivos estáticos (_next/static, favicon, etc)
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public|api).*)',
  ],
};
