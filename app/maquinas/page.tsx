import { prisma } from '@/lib/prisma';
import { createUsuarioAction } from '@/lib/actions';
import { requireRole } from '@/lib/auth';
import { statusClass } from '@/lib/ui';

export default async function FuncionariosPage() {
  await requireRole(['GESTOR']);
  const funcionarios = await prisma.usuario.findMany({ orderBy: { createdAt: 'desc' } });

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Funcionários</p>
          <h1 className="text-3xl font-bold text-slate-900">Cadastro de funcionários</h1>
        </div>

        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Novo usuário</h2>
          <form action={createUsuarioAction} className="grid gap-4 md:grid-cols-3">
            <input name="nome" placeholder="Nome" className="rounded-xl border border-slate-300 px-3 py-2" required />
            <input name="email" type="email" placeholder="E-mail" className="rounded-xl border border-slate-300 px-3 py-2" required />
            <input name="senha" type="password" placeholder="Senha" className="rounded-xl border border-slate-300 px-3 py-2" required />
            <select name="perfil" className="rounded-xl border border-slate-300 px-3 py-2">
              <option value="FUNCIONARIO">Funcionário</option>
              <option value="GESTOR">Gestor</option>
            </select>
            <select name="cargo" className="rounded-xl border border-slate-300 px-3 py-2">
              <option value="OPERADOR">Operador</option>
              <option value="SUPERVISOR">Supervisor</option>
              <option value="PCP">PCP</option>
              <option value="GESTOR">Gestor</option>
            </select>
            <button type="submit" className="rounded-xl bg-cyan-600 px-4 py-2 font-semibold text-white hover:bg-cyan-500">Salvar</button>
          </form>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-semibold text-slate-700">Nome</th>
                <th className="px-4 py-3 font-semibold text-slate-700">E-mail</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Perfil</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {funcionarios.map((funcionario) => (
                <tr key={funcionario.id}>
                  <td className="px-4 py-3 font-medium text-slate-900">{funcionario.nome}</td>
                  <td className="px-4 py-3">{funcionario.email}</td>
                  <td className="px-4 py-3"><span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${statusClass(funcionario.perfil)}`}>{funcionario.perfil}</span></td>
                  <td className="px-4 py-3"><span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${statusClass(funcionario.status)}`}>{funcionario.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
