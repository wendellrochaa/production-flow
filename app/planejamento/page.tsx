import { prisma } from '@/lib/prisma';
import { createOcorrenciaAction } from '@/lib/actions';
import { requireRole } from '@/lib/auth';
import { statusClass } from '@/lib/ui';

export default async function OcorrenciasPage() {
  await requireRole(['GESTOR']);
  const ocorrencias = await prisma.ocorrencia.findMany({
    include: { usuario: true, maquina: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Ocorrências</p>
          <h1 className="text-3xl font-bold text-slate-900">Reclamações e ocorrências</h1>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-semibold text-slate-700">Título</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Tipo</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Máquina</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Funcionário</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ocorrencias.map((oc) => (
                <tr key={oc.id}>
                  <td className="px-4 py-3"><div className="font-medium text-slate-900">{oc.titulo}</div><div className="text-xs text-slate-500">{oc.descricao}</div></td>
                  <td className="px-4 py-3">{oc.tipo}</td>
                  <td className="px-4 py-3">{oc.maquina?.nome ?? '—'}</td>
                  <td className="px-4 py-3">{oc.usuario?.nome ?? '—'}</td>
                  <td className="px-4 py-3"><span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${statusClass(oc.status)}`}>{oc.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
