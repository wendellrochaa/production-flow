import { getDashboardData } from '@/lib/ui';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { statusClass } from '@/lib/ui';

export default async function DashboardPage() {
  await requireRole(['GESTOR']);

  const metrics = await getDashboardData();
  const ordens = await prisma.ordem.findMany({
    take: 5,
    orderBy: { dataCriacao: 'desc' },
    include: { responsavel: true, maquina: true },
  });

  const tarefas = await prisma.tarefa.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { responsavel: true },
  });

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Dashboard</p>
            <h1 className="text-3xl font-bold text-slate-900">Visão geral da produção</h1>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Total de ordens', value: metrics.totalOrdens },
            { label: 'Aguardando', value: metrics.aguardando },
            { label: 'Em produção', value: metrics.emProducao },
            { label: 'Concluídas', value: metrics.concluidas },
            { label: 'Atrasadas', value: metrics.atrasadas },
            { label: 'Funcionários ativos', value: metrics.ativos },
            { label: 'Máquinas disponíveis', value: metrics.maquinasDisponiveis },
            { label: 'Estoque baixo', value: metrics.estoqueBaixo },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">{item.label}</p>
              <p className="mt-3 text-3xl font-bold text-slate-900">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Ordens recentes</h2>
            <div className="space-y-3">
              {ordens.map((ordem) => (
                <div key={ordem.id} className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
                  <div>
                    <p className="font-semibold text-slate-900">{ordem.codigo}</p>
                    <p className="text-sm text-slate-600">{ordem.produto}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${statusClass(ordem.status)}`}>
                      {ordem.status}
                    </span>
                    <p className="mt-1 text-xs text-slate-500">{ordem.responsavel?.nome ?? 'Sem responsável'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Tarefas recentes</h2>
            <div className="space-y-3">
              {tarefas.map((tarefa) => (
                <div key={tarefa.id} className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
                  <div>
                    <p className="font-semibold text-slate-900">#{tarefa.id} {tarefa.titulo}</p>
                    <p className="text-sm text-slate-600">{tarefa.responsavel?.nome ?? 'Sem responsável'}</p>
                  </div>
                  <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${statusClass(tarefa.status)}`}>
                    {tarefa.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
