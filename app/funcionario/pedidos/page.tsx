import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import { updateTarefaStatusAction } from '@/lib/actions';

export default async function FuncionarioTarefasPage() {
  const user = await requireRole(['FUNCIONARIO']);

  const tarefas = await prisma.tarefa.findMany({
    where: { responsavelId: user.id },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Minhas tarefas</p>
          <h1 className="text-3xl font-bold text-slate-900">Atividades atribuídas</h1>
        </div>

        <div className="space-y-4">
          {tarefas.map((tarefa) => (
            <div key={tarefa.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-bold text-slate-900">{tarefa.titulo}</p>
                  <p className="text-sm text-slate-600">{tarefa.descricao}</p>
                </div>
                <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700">{tarefa.status}</span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {['ACEITA', 'EM_ANDAMENTO', 'CONCLUIDA'].map((status) => (
                  <form key={status} action={async () => { 'use server'; await updateTarefaStatusAction(tarefa.id, status); }}>
                    <button type="submit" className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">{status}</button>
                  </form>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
