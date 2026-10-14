'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Eye, ShieldCheck, RotateCcw, Sparkles } from 'lucide-react';
import { store } from '@/lib/store';

export default function DemoBar() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');
  const isInvite = pathname.startsWith('/invite');

  const handleReset = () => {
    if (confirm('Voulez-vous réinitialiser toutes les données de test ?')) {
      store.resetToDefault();
      window.location.reload();
    }
  };

  return (
    <aside aria-label="Bandeau de navigation démo" className="w-full bg-slate-900/95 backdrop-blur-md text-slate-300 border-b border-slate-800/80 text-xs py-2 px-4 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[11px] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>PNPE DIRECT</span>
          </div>
          <span className="hidden sm:inline text-slate-400 text-[11px] font-medium">
            Plateforme d'invitations &amp; RSVP
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/invite/ogooue-maritime-2026"
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              isInvite
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-500/25 scale-105'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Vue Invité</span>
          </Link>

          <Link
            href="/admin"
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              isAdmin
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm shadow-emerald-500/25 scale-105'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Espace Admin</span>
          </Link>

          <button
            onClick={handleReset}
            title="Réinitialiser les données de démo"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] text-slate-400 hover:text-amber-300 hover:bg-slate-800 transition-colors ml-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden md:inline">Reset</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
