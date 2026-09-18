import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import { updatePerfilAction } from '@/lib/actions';

export default async function FuncionarioPerfilPage() {
  const user = await requireRole(['GESTOR', 'FUNCIONARIO']);
  const perfil = await prisma.usuario.findUnique({ where: { id: user.id } });

  if (!perfil) return null;

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Perfil</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Dados do usuário</h1>

        <form action={updatePerfilAction} className="mt-6 space-y-4">
          <input name="nome" defaultValue={perfil.nome} className="w-full rounded-xl border border-slate-300 px-3 py-2" required />
          <input name="cargo" defaultValue={perfil.cargo} className="w-full rounded-xl border border-slate-300 px-3 py-2" />
          <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700">E-mail: {perfil.email}</div>
          <button type="submit" className="w-full rounded-xl bg-cyan-600 px-4 py-2 font-semibold text-white hover:bg-cyan-500">Salvar alterações</button>
        </form>
      </div>
    </main>
  );
}
