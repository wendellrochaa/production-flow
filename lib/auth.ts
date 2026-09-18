import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

export const SESSION_COOKIE = 'productionflow_session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

type SessionPayload = {
  userId: number;
  perfil: 'GESTOR' | 'FUNCIONARIO';
  email: string;
  exp: number;
};

export type UserSession = Omit<SessionPayload, 'exp'>;

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret && process.env.NODE_ENV === 'production') {
    throw new Error('SESSION_SECRET deve estar configurado em produção.');
  }
  return secret || 'development-secret-change-me';
}

export function signSession(payload: UserSession) {
  const session: SessionPayload = { ...payload, exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE };
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'PF_SESSION' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(session)).toString('base64url');
  const signature = crypto.createHmac('sha256', getSecret()).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${signature}`;
}

export function verifySessionToken(token: string): UserSession | null {
  try {
    const [header, body, signature] = token.split('.');
    if (!header || !body || !signature) return null;
    const expected = crypto.createHmac('sha256', getSecret()).update(`${header}.${body}`).digest('base64url');
    if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) return null;
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as SessionPayload;
    if (!payload.userId || !payload.email || !payload.perfil || payload.exp <= Math.floor(Date.now() / 1000)) return null;
    if (payload.perfil !== 'GESTOR' && payload.perfil !== 'FUNCIONARIO') return null;
    return { userId: payload.userId, email: payload.email, perfil: payload.perfil };
  } catch {
    return null;
  }
}

export function setSessionCookie(token: string) {
  cookies().set(SESSION_COOKIE, token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: SESSION_MAX_AGE });
}

export function clearSessionCookie() {
  cookies().set(SESSION_COOKIE, '', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 0, expires: new Date(0) });
}

export async function getCurrentUser() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = verifySessionToken(token);
  if (!session) return null;
  return prisma.usuario.findUnique({ where: { id: session.userId }, select: { id: true, nome: true, email: true, perfil: true, cargo: true, status: true } });
}

export async function requireSession() {
  const user = await getCurrentUser();
  if (!user || user.status !== 'ATIVO') {
    clearSessionCookie();
    redirect('/login');
  }
  return user;
}

export async function requireRole(roles: string[]) {
  const user = await requireSession();
  if (!roles.includes(user.perfil)) redirect(user.perfil === 'GESTOR' ? '/dashboard' : '/funcionario');
  return user;
}

export async function registerAudit({ usuarioId, acao, entidade, entidadeId, descricao, ip }: { usuarioId: number; acao: string; entidade: string; entidadeId?: string | number | null; descricao: string; ip?: string | null }) {
  await prisma.auditLog.create({ data: { usuarioId, acao, entidade, entidadeId: entidadeId?.toString() ?? null, descricao, ip: ip ?? null } });
}
