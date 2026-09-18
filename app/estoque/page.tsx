import { prisma } from '@/lib/prisma';
import { createMaquinaAction } from '@/lib/actions';
import { requireRole } from '@/lib/auth';
import { statusClass } from '@/lib/ui';

export default async function MaquinasPage() {
  await requireRole(['GESTOR']);
  const maquinas = await prisma.maquina.findMany({ orderBy: { nome: 'asc' } });

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Máquinas</p>
          <h1 className="text-3xl font-bold text-slate-900">Parque industrial</h1>
        </div>

        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Cadastrar máquina</h2>
          <form action={createMaquinaAction} className="grid gap-4 md:grid-cols-4">
            <input name="nome" placeholder="Nome" className="rounded-xl border border-slate-300 px-3 py-2" required />
            <input name="codigo" placeholder="Código" className="rounded-xl border border-slate-300 px-3 py-2" required />
            <input name="setor" placeholder="Setor" className="rounded-xl border border-slate-300 px-3 py-2" defaultValue="PRODUCAO" />
            <input name="capacidade" type="number" placeholder="Capacidade" className="rounded-xl border border-slate-300 px-3 py-2" />
            <textarea name="observacao" placeholder="Observação" className="md:col-span-4 rounded-xl border border-slate-300 px-3 py-2" rows={3} />
            <button type="submit" className="md:col-span-4 rounded-xl bg-cyan-600 px-4 py-2 font-semibold text-white hover:bg-cyan-500">Salvar máquina</button>
          </form>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {maquinas.map((maquina) => (
            <div key={maquina.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xl font-bold text-slate-900">{maquina.nome}</p>
                  <p className="text-sm text-slate-500">{maquina.codigo}</p>
                </div>
                <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${statusClass(maquina.status)}`}>{maquina.status}</span>
              </div>
              <div className="mt-4 space-y-1 text-sm text-slate-600">
                <p>Setor: {maquina.setor}</p>
                <p>Capacidade: {maquina.capacidade}</p>
                <p>Observação: {maquina.observacao ?? '—'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
