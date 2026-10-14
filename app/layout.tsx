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
  title: "PNPE Activités - Portail Officiel & Inscriptions",
  description:
    "Plateforme officielle des activités et de suivi en temps réel des inscriptions pour le Pôle National de Promotion de l'Emploi (PNPE Gabon).",
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
