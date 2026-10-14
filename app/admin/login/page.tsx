'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { auth } from '@/lib/auth';
import OfficialHeader from '@/components/OfficialHeader';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('greenmoundounga@gmail.com');
  const [code, setCode] = useState('phlmlingreen@1992');
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

  return (
    <div className="flex-1 flex flex-col justify-between bg-slate-50 relative overflow-hidden">
      <OfficialHeader
        organization="PÔLE NATIONAL DE PROMOTION DE L'EMPLOI (PNPE)"
      />

      <div className="max-w-md mx-auto px-4 py-12 sm:py-16 w-full">
        {/* Carte de connexion sobre et institutionnelle */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-7 sm:p-9 shadow-modern relative overflow-hidden">
          
          {/* Liseré Gabon au sommet */}
          <div className="absolute top-0 left-0 right-0 h-1.5 flex">
            <div className="w-1/3 h-full bg-[#009E60]" />
            <div className="w-1/3 h-full bg-[#FCD116]" />
            <div className="w-1/3 h-full bg-[#3A75C4]" />
          </div>

          {/* Logo Officiel PNPE & Titre */}
          <div className="text-center mb-7 pt-2">
            <div className="w-24 h-24 rounded-3xl bg-white border border-slate-200 shadow-xs p-3 mx-auto mb-4 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo-pnpe.png"
                alt="Logo Officiel PNPE"
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

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Email Administrateur
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="greenmoundounga@gmail.com"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 text-slate-900 transition-all font-sans"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Mot de Passe
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 text-slate-900 transition-all font-sans"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <span>Se Connecter à l'Espace Admin</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

        </div>
      </div>

      <footer className="border-t border-slate-200/80 py-4 text-center text-xs text-slate-400 font-medium">
        Portail officiel d'invitations &amp; suivi • PNPE Gabon 2026
      </footer>
    </div>
  );
}
