import { prisma } from '@/lib/prisma';
import { createOrdemAction } from '@/lib/actions';
import { requireRole } from '@/lib/auth';
import { statusClass } from '@/lib/ui';

export default async function OrdensPage() {
  await requireRole(['GESTOR']);
  const ordens = await prisma.ordem.findMany({
    include: { responsavel: true, maquina: true, criadoPor: true },
    orderBy: { dataCriacao: 'desc' },
  });
  const funcionarios = await prisma.usuario.findMany({ where: { status: 'ATIVO' }, select: { id: true, nome: true } });
  const maquinas = await prisma.maquina.findMany({ orderBy: { nome: 'asc' } });

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Ordens</p>
            <h1 className="text-3xl font-bold text-slate-900">Ordens de produção</h1>
          </div>
        </div>

        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Nova ordem</h2>
          <form action={createOrdemAction} className="grid gap-4 md:grid-cols-3">
            <input name="produto" placeholder="Produto" className="rounded-xl border border-slate-300 px-3 py-2" required />
            <input name="quantidadePlanejada" type="number" min="1" placeholder="Quantidade" className="rounded-xl border border-slate-300 px-3 py-2" required />
            <select name="prioridade" className="rounded-xl border border-slate-300 px-3 py-2">
              <option value="BAIXA">Baixa</option>
              <option value="MEDIA" selected>Média</option>
              <option value="ALTA">Alta</option>
            </select>
            <select name="responsavelId" className="rounded-xl border border-slate-300 px-3 py-2">
              <option value="">Sem responsável</option>
              {funcionarios.map((func) => (
                <option key={func.id} value={func.id}>{func.nome}</option>
              ))}
            </select>
            <select name="maquinaId" className="rounded-xl border border-slate-300 px-3 py-2">
              <option value="">Sem máquina</option>
              {maquinas.map((maquina) => (
                <option key={maquina.id} value={maquina.id}>{maquina.nome}</option>
              ))}
            </select>
            <input name="prazo" type="date" className="rounded-xl border border-slate-300 px-3 py-2" />
            <textarea name="observacoes" placeholder="Observações" className="md:col-span-3 rounded-xl border border-slate-300 px-3 py-2" rows={3} />
            <button type="submit" className="md:col-span-3 rounded-xl bg-cyan-600 px-4 py-2 font-semibold text-white hover:bg-cyan-500">Criar ordem</button>
          </form>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-semibold text-slate-700">Código</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Produto</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Status</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Responsável</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Máquina</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Quantidade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ordens.map((ordem) => (
                <tr key={ordem.id}>
                  <td className="px-4 py-3 font-medium text-slate-900">{ordem.codigo}</td>
                  <td className="px-4 py-3">{ordem.produto}</td>
                  <td className="px-4 py-3"><span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${statusClass(ordem.status)}`}>{ordem.status}</span></td>
                  <td className="px-4 py-3">{ordem.responsavel?.nome ?? '—'}</td>
                  <td className="px-4 py-3">{ordem.maquina?.nome ?? '—'}</td>
                  <td className="px-4 py-3">{ordem.quantidadeProduzida}/{ordem.quantidadePlanejada}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
