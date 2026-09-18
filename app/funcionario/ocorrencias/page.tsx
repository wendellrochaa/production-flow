import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import { createPedidoAction } from '@/lib/actions';

export default async function FuncionarioPedidosPage() {
  const user = await requireRole(['FUNCIONARIO']);
  const pedidos = await prisma.pedido.findMany({ where: { usuarioId: user.id }, orderBy: { createdAt: 'desc' } });

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Pedidos</p>
          <h1 className="text-3xl font-bold text-slate-900">Meus pedidos</h1>
        </div>

        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Novo pedido</h2>
          <form action={createPedidoAction} className="grid gap-4 md:grid-cols-2">
            <input name="tipo" placeholder="Tipo" className="rounded-xl border border-slate-300 px-3 py-2" required />
            <input name="titulo" placeholder="Título" className="rounded-xl border border-slate-300 px-3 py-2" required />
            <textarea name="descricao" placeholder="Descrição" className="md:col-span-2 rounded-xl border border-slate-300 px-3 py-2" rows={3} required />
            <select name="prioridade" className="rounded-xl border border-slate-300 px-3 py-2">
              <option value="BAIXA">Baixa</option>
              <option value="MEDIA" selected>Média</option>
              <option value="ALTA">Alta</option>
            </select>
            <input name="observacao" placeholder="Observação" className="rounded-xl border border-slate-300 px-3 py-2" />
            <button type="submit" className="md:col-span-2 rounded-xl bg-cyan-600 px-4 py-2 font-semibold text-white hover:bg-cyan-500">Salvar pedido</button>
          </form>
        </div>

        <div className="space-y-4">
          {pedidos.map((pedido) => (
            <div key={pedido.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-lg font-bold text-slate-900">{pedido.titulo}</p>
                  <p className="text-sm text-slate-600">{pedido.tipo}</p>
                </div>
                <span className="rounded-full bg-indigo-100 px-2 py-1 text-xs font-semibold text-indigo-700">{pedido.status}</span>
              </div>
              <p className="mt-3 text-sm text-slate-600">{pedido.descricao}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
