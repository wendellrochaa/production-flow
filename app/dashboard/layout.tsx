'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const gestorLinks = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/ordens', label: 'Ordens de Produção' },
  { href: '/planejamento', label: 'Planejamento' },
  { href: '/tarefas', label: 'Tarefas' },
  { href: '/funcionarios', label: 'Funcionários' },
  { href: '/maquinas', label: 'Máquinas' },
  { href: '/estoque', label: 'Estoque' },
  { href: '/ocorrencias', label: 'Ocorrências' },
  { href: '/relatorios', label: 'Relatórios' },
  { href: '/auditoria', label: 'Auditoria' },
  { href: '/configuracoes', label: 'Configurações' },
];

const funcionarioLinks = [
  { href: '/funcionario', label: 'Início' },
  { href: '/funcionario/tarefas', label: 'Minhas Tarefas' },
  { href: '/funcionario/pedidos', label: 'Pedidos' },
  { href: '/funcionario/ocorrencias', label: 'Ocorrências' },
  { href: '/funcionario/atividades', label: 'Minhas Atividades' },
  { href: '/funcionario/perfil', label: 'Perfil' },
];

export default function Sidebar({ perfil }: { perfil: 'GESTOR' | 'FUNCIONARIO' }) {
  const pathname = usePathname();
  const links = perfil === 'GESTOR' ? gestorLinks : funcionarioLinks;

  return (
    <aside className="hidden min-h-screen w-72 shrink-0 border-r border-slate-200 bg-slate-900 text-white md:flex md:flex-col">
      <div className="border-b border-slate-800 px-6 py-5">
        <div className="text-2xl font-bold text-cyan-300">ProductionFlow</div>
        <div className="mt-2 text-sm text-slate-400">{perfil === 'GESTOR' ? 'Gestor' : 'Funcionário'}</div>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {links.map((link) => {
          const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center rounded-xl px-3 py-2 text-sm font-medium transition ${
                active ? 'bg-cyan-500 text-slate-950' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-800 p-4">
        <form action={async () => { 'use server'; } }>
          <button type="submit" className="w-full rounded-xl bg-slate-800 px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-700">
            Sair
          </button>
        </form>
      </div>
    </aside>
  );
}
