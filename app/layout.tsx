import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import ProtocolBanner from '@/components/ProtocolBanner';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "PNPE Invitation - Portail Officiel & Inscriptions",
  description:
    "Plateforme moderne d'invitations officielles et de suivi en temps réel des participants pour le Pôle National de Promotion de l'Emploi.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="fr"
      className={`${plusJakartaSans.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased font-sans">
        <div className="mesh-gradient-bg" aria-hidden="true" />
        <ProtocolBanner />
        <main className="flex-1 flex flex-col">{children}</main>
      </body>
    </html>
  );
}
