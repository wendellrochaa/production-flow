import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';

export default async function LoginRoute() {
  const user = await getCurrentUser();
  if (user) {
    redirect(user.perfil === 'GESTOR' ? '/dashboard' : '/funcionario');
  }

  return <div />;
}
