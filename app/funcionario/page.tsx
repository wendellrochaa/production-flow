import { requireRole } from '@/lib/auth';

export default async function ConfiguracoesPage() {
  await requireRole(['GESTOR']);

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Configurações</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Configurações do sistema</h1>
        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          Configure DATABASE_URL, SESSION_SECRET e tokens de produção neste ambiente. Para deploy em Vercel + PostgreSQL, sincronize as variáveis do projeto e rode as migrations.
        </div>
      </div>
    </main>
  );
}
