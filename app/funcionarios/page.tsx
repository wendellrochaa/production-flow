import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import { createTarefaAction } from '@/lib/actions';
import { statusClass } from '@/lib/ui';

export default async function TarefasPage() {
  await requireRole(['GESTOR']);
  const tarefas = await prisma.tarefa.findMany({
    include: { responsavel: true, criadaPor: true },
    orderBy: { createdAt: 'desc' },
  });
  const funcionarios = await prisma.usuario.findMany({ where: { status: 'ATIVO' }, select: { id: true, nome: true } });

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Tarefas</p>
          <h1 className="text-3xl font-bold text-slate-900">Gestão de tarefas</h1>
        </div>

        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Nova tarefa</h2>
          <form action={createTarefaAction} className="grid gap-4 md:grid-cols-3">
            <input name="titulo" placeholder="Título" className="rounded-xl border border-slate-300 px-3 py-2 md:col-span-2" required />
            <select name="prioridade" className="rounded-xl border border-slate-300 px-3 py-2">
              <option value="BAIXA">Baixa</option>
              <option value="MEDIA" selected>Média</option>
              <option value="ALTA">Alta</option>
            </select>
            <textarea name="descricao" placeholder="Descrição" className="md:col-span-3 rounded-xl border border-slate-300 px-3 py-2" rows={3} required />
            <select name="responsavelId" className="rounded-xl border border-slate-300 px-3 py-2">
              <option value="">Sem responsável</option>
              {funcionarios.map((func) => (
                <option key={func.id} value={func.id}>{func.nome}</option>
              ))}
            </select>
            <input name="prazo" type="date" className="rounded-xl border border-slate-300 px-3 py-2" />
            <button type="submit" className="rounded-xl bg-cyan-600 px-4 py-2 font-semibold text-white hover:bg-cyan-500">Salvar tarefa</button>
          </form>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-semibold text-slate-700">Tarefa</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Responsável</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Status</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Prioridade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tarefas.map((tarefa) => (
                <tr key={tarefa.id}>
                  <td className="px-4 py-3"><div className="font-medium text-slate-900">{tarefa.titulo}</div><div className="text-xs text-slate-500">{tarefa.descricao}</div></td>
                  <td className="px-4 py-3">{tarefa.responsavel?.nome ?? '—'}</td>
                  <td className="px-4 py-3"><span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${statusClass(tarefa.status)}`}>{tarefa.status}</span></td>
                  <td className="px-4 py-3">{tarefa.prioridade}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
