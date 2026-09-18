import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';

export default async function FuncionarioAtividadesPage() {
  const user = await requireRole(['FUNCIONARIO']);
  const logs = await prisma.auditLog.findMany({
    where: { usuarioId: user.id },
    orderBy: { dataHora: 'desc' },
    take: 20,
  });

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Minhas atividades</p>
          <h1 className="text-3xl font-bold text-slate-900">Últimas ações</h1>
        </div>

        <div className="space-y-3">
          {logs.map((log) => (
            <div key={log.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="font-medium text-slate-900">{log.acao}</p>
              <p className="mt-1 text-sm text-slate-600">{log.descricao}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
