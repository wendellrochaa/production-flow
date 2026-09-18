import { prisma } from '@/lib/prisma';
import { createPlanejamentoAction } from '@/lib/actions';
import { requireRole } from '@/lib/auth';

export default async function PlanejamentoPage() {
  await requireRole(['GESTOR']);
  const planejamentos = await prisma.planejamento.findMany({ include: { ordem: true, maquina: true }, orderBy: { data: 'asc' } });
  const ordens = await prisma.ordem.findMany({ select: { id: true, codigo: true, produto: true } });
  const maquinas = await prisma.maquina.findMany({ select: { id: true, nome: true } });

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Planejamento</p>
          <h1 className="text-3xl font-bold text-slate-900">Cronograma de produção</h1>
        </div>

        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Adicionar planejamento</h2>
          <form action={createPlanejamentoAction} className="grid gap-4 md:grid-cols-4">
            <select name="ordemId" className="rounded-xl border border-slate-300 px-3 py-2">
              {ordens.map((ordem) => <option key={ordem.id} value={ordem.id}>{ordem.codigo} - {ordem.produto}</option>)}
            </select>
            <select name="maquinaId" className="rounded-xl border border-slate-300 px-3 py-2">
              {maquinas.map((maquina) => <option key={maquina.id} value={maquina.id}>{maquina.nome}</option>)}
            </select>
            <input name="data" type="date" className="rounded-xl border border-slate-300 px-3 py-2" />
            <input name="horarioInicio" type="time" className="rounded-xl border border-slate-300 px-3 py-2" />
            <input name="horarioFim" type="time" className="rounded-xl border border-slate-300 px-3 py-2 md:col-span-2" />
            <button type="submit" className="md:col-span-2 rounded-xl bg-cyan-600 px-4 py-2 font-semibold text-white hover:bg-cyan-500">Salvar</button>
          </form>
        </div>

        <div className="space-y-4">
          {planejamentos.map((item) => (
            <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex justify-between gap-4">
                <div>
                  <p className="text-lg font-bold text-slate-900">{item.ordem.codigo}</p>
                  <p className="text-sm text-slate-500">{item.ordem.produto}</p>
                </div>
                <div className="text-right text-sm text-slate-600">
                  <p>{item.maquina.nome}</p>
                  <p>{new Date(item.data).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
              <div className="mt-3 text-sm text-slate-600">
                {item.horarioInicio} às {item.horarioFim}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
