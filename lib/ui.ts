import { getCurrentUser, requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

function formatPercent(value: number) {
  return `${Math.max(0, value).toFixed(0)}%`;
}

function statusClass(value: string) {
  const map: Record<string, string> = {
    AGUARDANDO: 'bg-slate-200 text-slate-700',
    EM_PRODUCAO: 'bg-blue-100 text-blue-700',
    CONCLUIDA: 'bg-emerald-100 text-emerald-700',
    PAUSADA: 'bg-amber-100 text-amber-700',
    ATRASADA: 'bg-red-100 text-red-700',
    CANCELADA: 'bg-gray-200 text-gray-700',
    PENDENTE: 'bg-slate-200 text-slate-700',
    ACEITA: 'bg-violet-100 text-violet-700',
    EM_ANDAMENTO: 'bg-blue-100 text-blue-700',
    ABERTA: 'bg-rose-100 text-rose-700',
    RESOLVIDA: 'bg-emerald-100 text-emerald-700',
    BAIXO: 'bg-amber-100 text-amber-700',
    NORMAL: 'bg-emerald-100 text-emerald-700',
    GESTOR: 'bg-cyan-100 text-cyan-700',
    FUNCIONARIO: 'bg-indigo-100 text-indigo-700',
  };

  return map[value] ?? 'bg-slate-200 text-slate-700';
}

export { formatPercent, statusClass, prisma, getCurrentUser, requireRole };
