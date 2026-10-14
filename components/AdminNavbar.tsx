'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  PlusCircle,
  Users,
  Mail,
  LogOut,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { auth } from '@/lib/auth';

interface AdminNavbarProps {
  currentInvitationSlug?: string;
  currentInvitationId?: string;
}

export default function AdminNavbar({
  currentInvitationSlug = 'ogooue-maritime-2026',
  currentInvitationId = 'inv-og-2026'
}: AdminNavbarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    auth.logout();
    router.push('/admin/login');
  };

  const navItems = [
    {
      label: 'Mes Activités',
      href: '/admin',
      icon: LayoutDashboard,
      active: pathname === '/admin',
    },
    {
      label: 'Créer une Activité',
      href: '/admin/new',
      icon: PlusCircle,
      active: pathname === '/admin/new',
    },
    {
      label: 'Suivi Inscriptions',
      href: `/admin/${currentInvitationId}/rsvps`,
      icon: Users,
      active: pathname.includes('/rsvps'),
    },
    {
      label: 'Kit E-mail',
      href: `/admin/${currentInvitationId}/email`,
      icon: Mail,
      active: pathname.includes('/email'),
    },
  ];

  return (
    <aside aria-label="Menu principal administrateur" className="bg-slate-900 text-slate-300 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Logo / Marque Admin */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-extrabold text-xs text-white shadow-md shadow-indigo-600/30">
            PNPE
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white tracking-tight">
                Direction PNPE
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-700/60">
                ADMIN
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Gestion des activités &amp; inscriptions
            </p>
          </div>
        </div>

        {/* Liens de Navigation Modernes */}
        <nav aria-label="Navigation interne administrateur" className="flex items-center gap-1.5 overflow-x-auto py-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  item.active
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-500/25'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Actions Rapides */}
        <div className="flex items-center gap-2">
          <Link
            href={`/invite/${currentInvitationSlug}`}
            target="_blank"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition-colors border border-slate-700"
            title="Ouvrir la page invité"
          >
            <span>Voir invité</span>
            <ExternalLink className="w-3 h-3" />
          </Link>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition-colors border border-rose-900/40"
            title="Déconnexion"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Quitter</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
