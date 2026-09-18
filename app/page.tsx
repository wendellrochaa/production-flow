import { redirect } from 'next/navigation';

/**
 * A rota raiz não renderiza menu, dashboard ou conteúdo público.
 * Toda visita inicial é encaminhada diretamente para a tela de login.
 */
export default function HomePage(): never {
  redirect('/login');
}
