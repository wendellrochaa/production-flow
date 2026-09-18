import { prisma } from '@/lib/prisma';
import { createMovimentacaoAction, createProdutoAction } from '@/lib/actions';
import { requireRole } from '@/lib/auth';
import { statusClass } from '@/lib/ui';

export default async function EstoquePage() {
  await requireRole(['GESTOR']);
  const produtos = await prisma.produto.findMany({ include: { estoque: true }, orderBy: { nome: 'asc' } });

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Estoque</p>
          <h1 className="text-3xl font-bold text-slate-900">Controle de materiais</h1>
        </div>

        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Cadastrar produto</h2>
          <form action={createProdutoAction} className="grid gap-4 md:grid-cols-4">
            <input name="nome" placeholder="Produto" className="rounded-xl border border-slate-300 px-3 py-2" required />
            <input name="codigo" placeholder="Código" className="rounded-xl border border-slate-300 px-3 py-2" required />
            <input name="unidade" placeholder="Unidade" className="rounded-xl border border-slate-300 px-3 py-2" defaultValue="kg" />
            <input name="estoqueMinimo" type="number" placeholder="Estoque mínimo" className="rounded-xl border border-slate-300 px-3 py-2" />
            <button type="submit" className="md:col-span-4 rounded-xl bg-cyan-600 px-4 py-2 font-semibold text-white hover:bg-cyan-500">Salvar produto</button>
          </form>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-semibold text-slate-700">Produto</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Código</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Quantidade</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Mínimo</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {produtos.map((produto) => (
                <tr key={produto.id}>
                  <td className="px-4 py-3 font-medium text-slate-900">{produto.nome}</td>
                  <td className="px-4 py-3">{produto.codigo}</td>
                  <td className="px-4 py-3">{produto.estoque?.quantidade ?? 0} {produto.unidade}</td>
                  <td className="px-4 py-3">{produto.estoqueMinimo}</td>
                  <td className="px-4 py-3"><span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${statusClass(produto.estoque?.status ?? 'NORMAL')}`}>{produto.estoque?.status ?? 'NORMAL'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Registrar movimentação</h2>
          <form action={createMovimentacaoAction} className="grid gap-4 md:grid-cols-4">
            <select name="produtoId" className="rounded-xl border border-slate-300 px-3 py-2">
              {produtos.map((prod) => (
                <option key={prod.id} value={prod.id}>{prod.nome}</option>
              ))}
            </select>
            <select name="tipo" className="rounded-xl border border-slate-300 px-3 py-2">
              <option value="ENTRADA">Entrada</option>
              <option value="SAIDA">Saída</option>
            </select>
            <input name="quantidade" type="number" min="1" placeholder="Quantidade" className="rounded-xl border border-slate-300 px-3 py-2" />
            <input name="observacao" placeholder="Observação" className="rounded-xl border border-slate-300 px-3 py-2" />
            <button type="submit" className="md:col-span-4 rounded-xl bg-cyan-600 px-4 py-2 font-semibold text-white hover:bg-cyan-500">Registrar</button>
          </form>
        </div>
      </div>
    </main>
  );
}
