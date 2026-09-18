import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SESSION_COOKIE, verifySessionToken } from '@/lib/auth';

const adminRoutes = ['/dashboard', '/ordens', '/planejamento', '/tarefas', '/funcionarios', '/maquinas', '/estoque', '/ocorrencias', '/relatorios', '/auditoria', '/configuracoes'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === '/') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value ?? null;
  const user = token ? verifySessionToken(token) : null;

  if (pathname === '/login') {
    if (user) {
      const redirectUrl = user.perfil === 'GESTOR' ? '/dashboard' : '/funcionario';
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
    return NextResponse.next();
  }

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const isAdminRoute = adminRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
  const isEmployeeRoute = pathname === '/funcionario' || pathname.startsWith('/funcionario/');

  if (user.perfil === 'FUNCIONARIO' && isAdminRoute) {
    return NextResponse.redirect(new URL('/funcionario', request.url));
  }

  if (user.perfil === 'GESTOR' && isEmployeeRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
