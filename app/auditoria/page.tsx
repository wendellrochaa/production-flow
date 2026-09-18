import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';

export default async function RelatoriosPage() {
  await requireRole(['GESTOR']);

  const ordensConcluidas = await prisma.ordem.count({ where: { status: 'CONCLUIDA' } });
  const ordensAtrasadas = await prisma.ordem.count({ where: { status: 'ATRASADA' } });
  const tarefasPorUsuario = await prisma.usuario.findMany({
    where: { perfil: 'FUNCIONARIO' },
    select: {
      id: true,
      nome: true,
      _count: { select: { tarefasResponsavel: true } },
    },
  });

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Relatórios</p>
          <h1 className="text-3xl font-bold text-slate-900">Produção e produtividade</h1>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">OPs concluídas</p>
            <p className="mt-3 text-3xl font-bold text-slate-900">{ordensConcluidas}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">OPs atrasadas</p>
            <p className="mt-3 text-3xl font-bold text-slate-900">{ordensAtrasadas}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Usuários ativos</p>
            <p className="mt-3 text-3xl font-bold text-slate-900">{tarefasPorUsuario.length}</p>
          </div>
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-semibold text-slate-700">Funcionário</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Tarefas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tarefasPorUsuario.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3 font-medium text-slate-900">{item.nome}</td>
                  <td className="px-4 py-3">{item._count.tarefasResponsavel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
