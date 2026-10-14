'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  Users,
  Copy,
  Mail,
  Edit,
  ExternalLink,
  Check,
  Calendar,
  Building2,
  ShieldCheck,
  Layers,
  Briefcase,
  Link as LinkIcon,
  MessageCircle,
  TrendingUp,
  ArrowUpRight,
  Clock,
  MoreVertical
} from 'lucide-react';
import { store } from '@/lib/store';
import { Invitation } from '@/lib/types';
import AdminLayout from '@/components/AdminLayout';

export default function AdminDashboardPage() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [statsMap, setStatsMap] = useState<Record<string, { total: number; v1: number; v2: number; both: number; attendees: number }>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const list = await store.getInvitations();
      setInvitations(list);

      const stats: Record<string, { total: number; v1: number; v2: number; both: number; attendees: number }> = {};
      for (const inv of list) {
        const s = await store.getStats(inv.id);
        stats[inv.id] = {
          total: s.totalCompanies,
          v1: s.volet1Count,
          v2: s.volet2Count,
          both: s.bothVoletsCount,
          attendees: s.totalAttendees,
        };
      }
      setStatsMap(stats);
      setLoading(false);
    }

    loadData();
    return store.subscribe(loadData);
  }, []);

  const handleCopyLink = (slug: string, id: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${origin}/invite/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 3000);
  };

  const getWhatsAppShareUrl = (inv: Invitation) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${origin}/invite/${inv.slug}`;
    const message = `🏛️ *INVITATION OFFICIELLE PNPE*\n${inv.title}\n\nVeuillez confirmer votre participation et enregistrer votre entreprise via ce lien :\n👉 ${url}`;
    return `https://wa.me/?text=${encodeURIComponent(message)}`;
  };

  const totalCompaniesAll = Object.values(statsMap).reduce((acc, curr) => acc + curr.total, 0);
  const totalVolet1All = Object.values(statsMap).reduce((acc, curr) => acc + curr.v1, 0);
  const totalVolet2All = Object.values(statsMap).reduce((acc, curr) => acc + curr.v2, 0);
  const totalBothAll = Object.values(statsMap).reduce((acc, curr) => acc + curr.both, 0);

  return (
    <AdminLayout>
      <div className="space-y-8">
        
        {/* TITRE DE SECTION & BIENVENUE */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/60 text-indigo-700 text-xs font-bold mb-1">
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span>Vue d'ensemble en temps réel</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Tableau de Bord des Invitations
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              Générez vos cartes, partagez vos liens d'invitation et suivez les confirmations d'entreprises.
            </p>
          </div>

          <Link
            href="/admin/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-indigo-600/25 hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Créer une Invitation</span>
          </Link>
        </div>

        {/* 4 CARTES MÉTRIQUES SAAS (SQUIRCLES COLORÉS) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Métrique 1 : Total Entreprises */}
          <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-slate-200/80 shadow-modern hover:shadow-modern-lg transition-all flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Total Entreprises
              </p>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 tabular-nums">
                {totalCompaniesAll}
              </p>
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-bold mt-1">
                <TrendingUp className="w-3 h-3" />
                <span>Opérateurs enregistrés</span>
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs">
              <Users className="w-6 h-6" />
            </div>
          </div>

          {/* Métrique 2 : Inscrits Volet 1 */}
          <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-slate-200/80 shadow-modern hover:shadow-modern-lg transition-all flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
                Inscrits Volet 1
              </p>
              <p className="text-2xl sm:text-3xl font-extrabold text-blue-900 mt-1 tabular-nums">
                {totalVolet1All}
              </p>
              <span className="text-[11px] text-blue-600 font-medium mt-1 block">
                Présentation Paris (16/10)
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-xs">
              <Calendar className="w-6 h-6" />
            </div>
          </div>

          {/* Métrique 3 : Inscrits Volet 2 */}
          <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-slate-200/80 shadow-modern hover:shadow-modern-lg transition-all flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                Inscrits Volet 2
              </p>
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-900 mt-1 tabular-nums">
                {totalVolet2All}
              </p>
              <span className="text-[11px] text-emerald-600 font-medium mt-1 block">
                Mini-salon emploi (17/10)
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-xs">
              <Briefcase className="w-6 h-6" />
            </div>
          </div>

          {/* Métrique 4 : Les Deux Volets */}
          <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-slate-200/80 shadow-modern hover:shadow-modern-lg transition-all flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
                Les Deux Volets
              </p>
              <p className="text-2xl sm:text-3xl font-extrabold text-amber-900 mt-1 tabular-nums">
                {totalBothAll}
              </p>
              <span className="text-[11px] text-amber-600 font-medium mt-1 block">
                Présence aux 2 journées
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shadow-xs">
              <Building2 className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* NOTIFICATION TOAST FLOTTANTE */}
        {copiedId && (
          <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-500/40 animate-in fade-in slide-in-from-bottom-4 duration-200">
            <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center text-white flex-shrink-0">
              <Check className="w-4 h-4 stroke-[3]" />
            </div>
            <div>
              <p className="font-bold text-xs">Lien copié dans le presse-papier !</p>
              <p className="text-[11px] text-slate-300">Prêt à être collé dans WhatsApp, SMS ou vos e-mails.</p>
            </div>
          </div>
        )}

        {/* LISTE DES INVITATIONS STYLE SAAS MODERNE */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>Vos Cartes d'Invitation ({invitations.length})</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5">
            {invitations.map((inv) => {
              const stats = statsMap[inv.id] || { total: 0, v1: 0, v2: 0, both: 0, attendees: 0 };
              const isCopied = copiedId === inv.id;
              const waUrl = getWhatsAppShareUrl(inv);

              return (
                <div
                  key={inv.id}
                  className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-3xl p-6 shadow-modern hover:shadow-modern-lg transition-all flex flex-col xl:flex-row gap-6 items-start xl:items-center justify-between"
                >
                  {/* Miniature & Contenu */}
                  <div className="flex flex-col sm:flex-row gap-5 items-start flex-1 min-w-0">
                    {inv.imageUrl && (
                      <div className="w-24 h-32 sm:w-28 sm:h-36 rounded-2xl bg-slate-900 border border-slate-200/80 flex-shrink-0 overflow-hidden relative shadow-sm group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={inv.imageUrl}
                          alt={inv.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <Link
                          href={`/invite/${inv.slug}`}
                          target="_blank"
                          className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity text-xs font-bold"
                        >
                          Aperçu
                        </Link>
                      </div>
                    )}

                    <div className="space-y-2.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-mono font-bold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                          /{inv.slug}
                        </span>
                        <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                          ● Active
                        </span>
                        <span className="text-xs text-slate-400 font-medium">
                          {inv.volets.length} volets configurés
                        </span>
                      </div>

                      <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug tracking-tight">
                        {inv.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
                        {inv.introMessage}
                      </p>

                      {/* Volets programmés */}
                      <div className="flex flex-wrap gap-2 pt-1">
                        {inv.volets.map((v) => (
                          <span
                            key={v.id}
                            className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${
                              v.theme === 'blue'
                                ? 'bg-blue-50/80 text-blue-800 border-blue-200'
                                : 'bg-emerald-50/80 text-emerald-800 border-emerald-200'
                            }`}
                          >
                            {v.badge}: {v.date} ({v.time})
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* BOUTONS D'ACTION DIRECTE (Style SaaS) */}
                  <div className="flex flex-col sm:flex-row xl:flex-col items-stretch sm:items-center xl:items-end gap-3 w-full xl:w-auto pt-4 xl:pt-0 border-t xl:border-t-0 border-slate-100">
                    
                    {/* Boutons de Partage Direct */}
                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                      {/* 1. COPIER LE LIEN PUBLIC */}
                      <button
                        onClick={() => handleCopyLink(inv.slug, inv.id)}
                        className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-sm ${
                          isCopied
                            ? 'bg-emerald-600 text-white shadow-emerald-500/25 scale-105'
                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-500/20 hover:scale-[1.02]'
                        }`}
                      >
                        {isCopied ? <Check className="w-4 h-4 stroke-[3]" /> : <LinkIcon className="w-4 h-4" />}
                        <span>{isCopied ? 'Lien copié !' : 'Copier le lien public'}</span>
                      </button>

                      {/* 2. PARTAGER SUR WHATSAPP */}
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-200 font-bold text-xs uppercase tracking-wider transition-all shadow-xs"
                        title="Partager directement ce lien sur WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>WhatsApp</span>
                      </a>
                    </div>

                    {/* Actions de gestion : Inscrits / Kit E-mail / Modifier */}
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      <Link
                        href={`/admin/${inv.id}/rsvps`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors"
                      >
                        <Users className="w-3.5 h-3.5 text-indigo-300" />
                        <span>Inscrits ({stats.total})</span>
                      </Link>

                      <Link
                        href={`/admin/${inv.id}/email`}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                        title="Générateur de template e-mail"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Kit Mail</span>
                      </Link>

                      <Link
                        href={`/admin/${inv.id}/edit`}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                        title="Modifier l'invitation"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Modifier</span>
                      </Link>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
