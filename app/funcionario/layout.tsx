import { requireRole } from '@/lib/auth';
import Sidebar from '@/components/Sidebar';

export default async function FuncionarioLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole(['FUNCIONARIO']);

  return (
    <div className="flex min-h-screen">
      <Sidebar perfil={user.perfil as 'GESTOR' | 'FUNCIONARIO'} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
