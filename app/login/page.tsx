'use client';

import { useActionState } from 'react';
import { loginAction } from '@/lib/actions';

const initialState = {
  error: '',
  success: false,
};

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl shadow-slate-950/60">
        <div className="border-b border-slate-800 bg-slate-900 px-6 py-5 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-cyan-500/15 text-2xl font-bold text-cyan-300">P</div>
          <h1 className="text-2xl font-bold text-white">ProductionFlow</h1>
          <p className="mt-1 text-sm text-slate-400">Sistema de PCP e produção</p>
        </div>

        <form action={formAction} className="space-y-5 p-6">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-200">
              E-mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="nome@adm.com"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-slate-50 outline-none transition focus:border-cyan-400"
            />
          </div>

          <div>
            <label htmlFor="senha" className="mb-2 block text-sm font-medium text-slate-200">
              Senha
            </label>
            <input
              id="senha"
              name="senha"
              type="password"
              required
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-slate-50 outline-none transition focus:border-cyan-400"
            />
          </div>

          {state?.error ? (
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {state.error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-xl bg-cyan-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </main>
  );
}
