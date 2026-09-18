import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';

export default async function FuncionarioDashboardPage() {
  const user = await requireRole(['FUNCIONARIO']);

  const tarefasPendentes = await prisma.tarefa.count({ where: { responsavelId: user.id, status: 'PENDENTE' } });
  const tarefasAndamento = await prisma.tarefa.count({ where: { responsavelId: user.id, status: 'EM_ANDAMENTO' } });
  const tarefasConcluidas = await prisma.tarefa.count({ where: { responsavelId: user.id, status: 'CONCLUIDA' } });
  const pedidos = await prisma.pedido.count({ where: { usuarioId: user.id } });
  const ocorrencias = await prisma.ocorrencia.count({ where: { usuarioId: user.id, status: 'ABERTA' } });

  const tarefas = await prisma.tarefa.findMany({
    where: { responsavelId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Funcionário</p>
          <h1 className="text-3xl font-bold text-slate-900">Olá, {user.nome}</h1>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <Card label="Tarefas pendentes" value={tarefasPendentes} />
          <Card label="Em andamento" value={tarefasAndamento} />
          <Card label="Concluídas" value={tarefasConcluidas} />
          <Card label="Pedidos" value={pedidos} />
          <Card label="Ocorrências abertas" value={ocorrencias} />
        </div>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Próximas tarefas</h2>
          <ul className="space-y-3">
            {tarefas.map((tarefa) => (
              <li key={tarefa.id} className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
                <div>
                  <p className="font-semibold text-slate-900">{tarefa.titulo}</p>
                  <p className="text-sm text-slate-600">{tarefa.descricao}</p>
                </div>
                <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700">{tarefa.status}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}

function Card({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-bold text-slate-900">{value}</p>
    </div>
  );
}
