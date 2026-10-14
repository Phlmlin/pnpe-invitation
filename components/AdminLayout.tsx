'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  PlusCircle,
  Users,
  Mail,
  LogOut,
  ExternalLink,
  Search,
  Menu,
  X
} from 'lucide-react';
import { auth } from '@/lib/auth';
import { store } from '@/lib/store';

interface AdminLayoutProps {
  children: React.ReactNode;
  currentInvitationSlug?: string;
  currentInvitationId?: string;
}

export default function AdminLayout({
  children,
  currentInvitationSlug,
  currentInvitationId,
}: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [activeSlug, setActiveSlug] = useState<string | null>(currentInvitationSlug || null);

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push('/admin/login');
      return;
    }
    const session = auth.getSession();
    if (session) {
      setUser(session);
    }
    setIsCheckingAuth(false);

    async function loadActiveSlug() {
      if (currentInvitationSlug) {
        setActiveSlug(currentInvitationSlug);
        return;
      }
      const list = await store.getInvitations();
      if (list.length > 0) {
        setActiveSlug(list[0].slug);
      } else {
        setActiveSlug(null);
      }
    }

    loadActiveSlug();
    return store.subscribe(loadActiveSlug);
  }, [router, currentInvitationSlug]);

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
      label: 'Suivi Inscriptions (RSVP)',
      href: '/admin/rsvps',
      icon: Users,
      active: pathname.startsWith('/admin/rsvps') || pathname.includes('/rsvps'),
    },
    {
      label: 'Générateur Kit E-mail',
      href: '/admin/email',
      icon: Mail,
      active: pathname.startsWith('/admin/email') || pathname.includes('/email'),
    },
  ];

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white font-sans">
        <div className="flex flex-col items-center gap-4 text-center px-4">
          <div className="w-16 h-16 rounded-2xl bg-white p-2 shadow-2xl flex items-center justify-center animate-bounce">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-pnpe.png" alt="Logo PNPE" className="w-full h-full object-contain" />
          </div>
          <div>
            <p className="text-sm font-bold text-white tracking-wide">Pôle National de Promotion de l'Emploi</p>
            <p className="text-xs text-slate-400 font-mono mt-1">Vérification de la session administrateur...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 font-sans">
      
      {/* SIDEBAR GAUCHE PERMANENTE */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 border-r border-slate-800 flex flex-col justify-between transition-transform duration-200 lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* En-tête Workspace avec Logo Officiel PNPE */}
          <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white border border-slate-700/60 flex items-center justify-center p-1.5 shadow-md shadow-black/20 flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo-pnpe.png"
                  alt="Logo PNPE"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="overflow-hidden">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-white text-sm tracking-tight truncate">
                    PNPE Gabon
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0"></span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium truncate">
                  Portail Direction
                </p>
              </div>
            </div>

            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Principale */}
          <div className="px-3 py-5 space-y-1">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Menu Principal
            </p>

            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    item.active
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Raccourci vers le lien public de test */}
          {activeSlug && (
            <div className="px-5 pt-3">
              <div className="p-3 rounded-2xl bg-slate-800/50 border border-slate-700/60 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] uppercase font-mono font-bold text-slate-400">
                    Lien Public Actif
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                </div>
                <p className="text-white font-medium text-[11px] truncate mb-2" title={`/invite/${activeSlug}`}>
                  /invite/{activeSlug}
                </p>
                <a
                  href={`/invite/${activeSlug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-slate-700/80 hover:bg-slate-700 text-slate-200 text-[11px] font-medium transition-colors"
                >
                  <span>Tester page invité</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Pied de sidebar : Profil Admin & Déconnexion */}
        <div className="p-4 border-t border-slate-800/80">
          <div className="flex items-center justify-between p-2 rounded-2xl bg-slate-800/40 border border-slate-800">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-white p-1 flex items-center justify-center flex-shrink-0 shadow-xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo-pnpe.png" alt="PNPE" className="w-full h-full object-contain" />
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-white truncate">
                  {user?.name || 'Administrateur'}
                </p>
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>Connecté</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
              title="Se déconnecter"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ZONE CENTRALE DE CONTENU */}
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
        
        {/* EN-TÊTE SUPÉRIEUR SAAS ÉPURÉ */}
        <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="relative w-full hidden sm:block">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher une activité, un demandeur... (⌘K)"
                className="w-full pl-10 pr-4 py-2 text-xs bg-slate-100/80 border border-slate-200/70 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-600 text-slate-800 transition-all font-medium"
              />
            </div>
          </div>

          {/* Bouton Action Primaire */}
          <div className="flex items-center gap-3">
            <Link
              href="/admin/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-indigo-600/20 hover:scale-[1.02]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Nouvelle Activité</span>
            </Link>
          </div>
        </header>

        {/* CONTENU DE LA PAGE */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          {children}
        </main>

      </div>

      {/* Overlay sombre pour mobile */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-30 bg-slate-950/60 backdrop-blur-xs lg:hidden"
        />
      )}

    </div>
  );
}
