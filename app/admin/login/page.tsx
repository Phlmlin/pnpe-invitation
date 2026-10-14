'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, Mail, ArrowRight, AlertCircle, Zap, Sparkles } from 'lucide-react';
import { auth } from '@/lib/auth';
import OfficialHeader from '@/components/OfficialHeader';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@pnpe.ga');
  const [code, setCode] = useState('2026');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setLoading(true);

    const result = auth.login(email, code);
    if (result.success) {
      router.push('/admin');
    } else {
      setError(result.error || 'Identifiants invalides');
      setLoading(false);
    }
  };

  const handleQuickLogin = () => {
    setEmail('admin@pnpe.ga');
    setCode('2026');
    const result = auth.login('admin@pnpe.ga', '2026');
    if (result.success) {
      router.push('/admin');
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between bg-slate-50 relative overflow-hidden">
      <OfficialHeader
        organization="PÔLE NATIONAL DE PROMOTION DE L'EMPLOI (PNPE)"
        subtitle="Espace Sécurisé d'Administration & Création d'Invitations"
      />

      <div className="max-w-md mx-auto px-4 py-10 sm:py-14 w-full">
        {/* Carte de connexion moderne */}
        <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-3xl p-7 sm:p-9 shadow-modern-lg relative overflow-hidden">
          
          {/* Liseré subtil au sommet */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500" />

          {/* Logo Officiel PNPE & Titre */}
          <div className="text-center mb-6">
            <div className="w-24 h-24 rounded-3xl bg-white border border-slate-200/90 shadow-sm p-3 mx-auto mb-4 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo-pnpe.png"
                alt="Logo PNPE"
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Connexion Direction PNPE
            </h1>
            <p className="text-xs text-slate-500 mt-1.5">
              Accès réservé pour créer les invitations et suivre les inscrits en direct
            </p>
          </div>

          {/* Bouton d'accès rapide 1 clic */}
          <button
            type="button"
            onClick={handleQuickLogin}
            className="w-full mb-5 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-indigo-500/25 flex items-center justify-center gap-2 hover:scale-[1.01]"
          >
            <Zap className="w-4 h-4 text-amber-300 animate-bounce" />
            <span>Connexion Rapide (admin@pnpe.ga)</span>
          </button>

          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-slate-200 w-full"></div>
            <span className="bg-white px-3 text-[11px] font-mono text-slate-400 uppercase">ou manuellement</span>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Email Administrateur
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@pnpe.ga"
                  className="w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 text-slate-900 transition-all font-sans"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Mot de Passe / Code d'accès
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="2026"
                  className="w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 text-slate-900 font-mono tracking-widest transition-all"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1 font-mono">
                Code officiel par défaut : <span className="text-slate-700 font-bold">2026</span>
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <span>Se Connecter à l'Espace Admin</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

        </div>
      </div>

      <footer className="border-t border-slate-200/80 py-4 text-center text-xs text-slate-400 font-medium">
        Portail de gestion d'événements &amp; invitations • PNPE Gabon 2026
      </footer>
    </div>
  );
}
