import type { Metadata } from 'next';
import Providers from '@/components/Providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'ProductionFlow',
  description: 'Sistema de PCP com autenticação, produtividade e rastreabilidade.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-slate-100 text-slate-900 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
