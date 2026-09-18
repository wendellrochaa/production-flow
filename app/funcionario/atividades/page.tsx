import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import { createOcorrenciaAction } from '@/lib/actions';

export default async function FuncionarioOcorrenciasPage() {
  const user = await requireRole(['FUNCIONARIO']);
  const ocorrencias = await prisma.ocorrencia.findMany({ where: { usuarioId: user.id }, orderBy: { createdAt: 'desc' } });
  const maquinas = await prisma.maquina.findMany({ orderBy: { nome: 'asc' } });

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Ocorrências</p>
          <h1 className="text-3xl font-bold text-slate-900">Minhas reclamações</h1>
        </div>

        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Abrir ocorrência</h2>
          <form action={createOcorrenciaAction} className="grid gap-4 md:grid-cols-2">
            <input name="tipo" placeholder="Tipo" className="rounded-xl border border-slate-300 px-3 py-2" required />
            <input name="titulo" placeholder="Título" className="rounded-xl border border-slate-300 px-3 py-2" required />
            <textarea name="descricao" placeholder="Descrição" className="md:col-span-2 rounded-xl border border-slate-300 px-3 py-2" rows={3} required />
            <select name="maquinaId" className="rounded-xl border border-slate-300 px-3 py-2">
              <option value="">Máquina opcional</option>
              {maquinas.map((maquina) => <option key={maquina.id} value={maquina.id}>{maquina.nome}</option>)}
            </select>
            <select name="prioridade" className="rounded-xl border border-slate-300 px-3 py-2">
              <option value="BAIXA">Baixa</option>
              <option value="MEDIA" selected>Média</option>
              <option value="ALTA">Alta</option>
            </select>
            <button type="submit" className="md:col-span-2 rounded-xl bg-cyan-600 px-4 py-2 font-semibold text-white hover:bg-cyan-500">Salvar ocorrência</button>
          </form>
        </div>

        <div className="space-y-4">
          {ocorrencias.map((ocorrencia) => (
            <div key={ocorrencia.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-lg font-bold text-slate-900">{ocorrencia.titulo}</p>
                  <p className="text-sm text-slate-600">{ocorrencia.tipo}</p>
                </div>
                <span className="rounded-full bg-rose-100 px-2 py-1 text-xs font-semibold text-rose-700">{ocorrencia.status}</span>
              </div>
              <p className="mt-3 text-sm text-slate-600">{ocorrencia.descricao}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
