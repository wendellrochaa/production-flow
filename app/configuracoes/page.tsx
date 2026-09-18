import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';

export default async function AuditoriaPage() {
  await requireRole(['GESTOR']);
  const logs = await prisma.auditLog.findMany({
    include: { usuario: true },
    orderBy: { dataHora: 'desc' },
    take: 50,
  });

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Auditoria</p>
          <h1 className="text-3xl font-bold text-slate-900">Histórico do sistema</h1>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-semibold text-slate-700">Usuário</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Ação</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Entidade</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Descrição</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className="px-4 py-3 font-medium text-slate-900">{log.usuario.nome}</td>
                  <td className="px-4 py-3">{log.acao}</td>
                  <td className="px-4 py-3">{log.entidade}</td>
                  <td className="px-4 py-3">{log.descricao}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
