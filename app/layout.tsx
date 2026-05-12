import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FigsCopa — Controle de Figurinhas',
  description: 'Gerencie seu álbum, encontre trocas e converse com amigos.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
