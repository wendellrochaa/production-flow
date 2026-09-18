import { getCurrentUser } from '@/lib/auth';
import Sidebar from '@/components/Sidebar';
import { redirect } from 'next/navigation';

export default async function EstoqueLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user || user.perfil !== 'GESTOR') redirect('/login');

  return (
    <div className="flex min-h-screen">
      <Sidebar perfil={user.perfil} />
      <div className="flex-1">{children}</div>
    </div>
  );
}
