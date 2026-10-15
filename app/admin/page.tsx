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
  MoreVertical,
  Trash2
} from 'lucide-react';
import { store } from '@/lib/store';
import { auth } from '@/lib/auth';
import { Invitation, AdminUser, RSVPRegistration } from '@/lib/types';
import AdminLayout from '@/components/AdminLayout';
import AnalyticsCharts from '@/components/AnalyticsCharts';

export default function AdminDashboardPage() {
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [allRSVPs, setAllRSVPs] = useState<RSVPRegistration[]>([]);
  const [statsMap, setStatsMap] = useState<Record<string, { total: number; v1: number; v2: number; both: number; attendees: number; withPnpe: number; withoutPnpe: number }>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletedToast, setDeletedToast] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setCurrentUser(auth.getSession());

    async function loadData() {
      const list = await store.getInvitations();
      setInvitations(list);

      const stats: Record<string, { total: number; v1: number; v2: number; both: number; attendees: number; withPnpe: number; withoutPnpe: number }> = {};
      const collected: RSVPRegistration[] = [];

      for (const inv of list) {
        const s = await store.getStats(inv.id);
        const rsvps = await store.getRSVPs(inv.id);
        collected.push(...rsvps);

        const withPnpe = rsvps.filter((r) => {
          const num = r.comments?.includes('Numéro PNPE :')
            ? r.comments.replace('Numéro PNPE :', '').trim()
            : r.company?.includes('N° PNPE:')
            ? r.company.split('N° PNPE:')[1]?.replace(')', '').trim()
            : '';
          return !!num && num !== '-';
        }).length;

        stats[inv.id] = {
          total: s.totalCompanies,
          v1: s.volet1Count,
          v2: s.volet2Count,
          both: s.bothVoletsCount,
          attendees: s.totalAttendees,
          withPnpe,
          withoutPnpe: s.totalCompanies - withPnpe,
        };
      }
      setAllRSVPs(collected);
      setStatsMap(stats);
      setLoading(false);
    }

    loadData();
    return store.subscribe(loadData);
  }, []);

  const handleDeleteInvitation = async (id: string, title: string) => {
    if (
      window.confirm(
        `Êtes-vous sûr de vouloir supprimer définitivement l'activité "${title}" ?\n\nToutes les inscriptions associées seront également supprimées de la base de données.`
      )
    ) {
      try {
        await store.deleteInvitation(id);
        setInvitations((prev) => prev.filter((i) => i.id !== id));
        setDeletedToast(title);
        setTimeout(() => setDeletedToast(null), 3500);
      } catch (err) {
        console.error(err);
        alert('Erreur lors de la suppression de l\'activité.');
      }
    }
  };

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
    const message = `🏛️ *ACTIVITÉ OFFICIELLE PNPE*\n${inv.title}\n\nVeuillez confirmer votre participation via ce lien :\n👉 ${url}`;
    return `https://wa.me/?text=${encodeURIComponent(message)}`;
  };

  const isViewer = currentUser?.role === 'viewer';
  const totalCompaniesAll = Object.values(statsMap).reduce((acc, curr) => acc + curr.total, 0);
  const totalVolet1All = Object.values(statsMap).reduce((acc, curr) => acc + curr.v1, 0);
  const totalVolet2All = Object.values(statsMap).reduce((acc, curr) => acc + curr.v2, 0);
  const totalBothAll = Object.values(statsMap).reduce((acc, curr) => acc + curr.both, 0);
  const totalWithPnpeAll = Object.values(statsMap).reduce((acc, curr) => acc + (curr.withPnpe || 0), 0);
  const totalWithoutPnpeAll = totalCompaniesAll - totalWithPnpeAll;

  const isSingleActivityAll = totalVolet2All === 0 || invitations.every((inv) => !inv.volets || inv.volets.length <= 1);
  const firstInv = invitations[0];
  const firstVolet = firstInv?.volets?.[0];
  const v1SubtitleAll = firstVolet
    ? `${firstVolet.location || 'Centre Culturel'}${firstVolet.date ? ` (${new Date(firstVolet.date + 'T00:00:00').toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })})` : ''}`
    : 'Activité principale';
  const secondVolet = firstInv?.volets?.[1];
  const v2SubtitleAll = secondVolet
    ? `${secondVolet.location || 'Deuxième site'}${secondVolet.date ? ` (${new Date(secondVolet.date + 'T00:00:00').toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })})` : ''}`
    : 'Deuxième activité';

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
              Tableau de Bord des Activités
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              Suivez les inscriptions des demandeurs d'emploi et accédez aux statistiques en direct.
            </p>
          </div>

          {!isViewer && (
            <Link
              href="/admin/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-indigo-600/25 hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Créer une Activité</span>
            </Link>
          )}
        </div>

        {/* 4 CARTES MÉTRIQUES SAAS (SQUIRCLES COLORÉS) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Métrique 1 : Total Demandeurs */}
          <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-slate-200/80 shadow-modern hover:shadow-modern-lg transition-all flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                TOTAL DEMANDEURS
              </p>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 tabular-nums">
                {totalCompaniesAll}
              </p>
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-bold mt-1">
                <TrendingUp className="w-3 h-3" />
                <span>Demandeurs enregistrés</span>
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs">
              <Users className="w-6 h-6" />
            </div>
          </div>

          {/* Métrique 2 : Inscrits Activité 1 */}
          <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-slate-200/80 shadow-modern hover:shadow-modern-lg transition-all flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
                INSCRITS ACTIVITÉ 1
              </p>
              <p className="text-2xl sm:text-3xl font-extrabold text-blue-900 mt-1 tabular-nums">
                {totalVolet1All}
              </p>
              <span className="text-[11px] text-blue-600 font-medium mt-1 block truncate max-w-[170px]" title={v1SubtitleAll}>
                {v1SubtitleAll}
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-xs">
              <Calendar className="w-6 h-6" />
            </div>
          </div>

          {/* Métrique 3 : Inscrits Activité 2 ou Immatriculés PNPE */}
          {isSingleActivityAll ? (
            <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-slate-200/80 shadow-modern hover:shadow-modern-lg transition-all flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                  IMMATRICULÉS PNPE
                </p>
                <p className="text-2xl sm:text-3xl font-extrabold text-emerald-900 mt-1 tabular-nums">
                  {totalWithPnpeAll}
                </p>
                <span className="text-[11px] text-emerald-600 font-medium mt-1 block">
                  Avec N° PNPE renseigné
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-xs">
                <ShieldCheck className="w-6 h-6" />
              </div>
            </div>
          ) : (
            <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-slate-200/80 shadow-modern hover:shadow-modern-lg transition-all flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                  INSCRITS ACTIVITÉ 2
                </p>
                <p className="text-2xl sm:text-3xl font-extrabold text-emerald-900 mt-1 tabular-nums">
                  {totalVolet2All}
                </p>
                <span className="text-[11px] text-emerald-600 font-medium mt-1 block truncate max-w-[170px]" title={v2SubtitleAll}>
                  {v2SubtitleAll}
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-xs">
                <Briefcase className="w-6 h-6" />
              </div>
            </div>
          )}

          {/* Métrique 4 : Les Deux Activités ou Sans N° PNPE */}
          {isSingleActivityAll ? (
            <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-slate-200/80 shadow-modern hover:shadow-modern-lg transition-all flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
                  SANS N° PNPE
                </p>
                <p className="text-2xl sm:text-3xl font-extrabold text-amber-900 mt-1 tabular-nums">
                  {totalWithoutPnpeAll}
                </p>
                <span className="text-[11px] text-amber-600 font-medium mt-1 block">
                  À immatriculer / accompagner
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shadow-xs">
                <Building2 className="w-6 h-6" />
              </div>
            </div>
          ) : (
            <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-slate-200/80 shadow-modern hover:shadow-modern-lg transition-all flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
                  LES DEUX ACTIVITÉS
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
          )}
        </div>

        {/* 2 GRAPHIQUES VISUELS EN TEMPS RÉEL (SVG NATIF & TAILWIND) */}
        <AnalyticsCharts rsvps={allRSVPs} />

        {/* NOTIFICATION TOAST FLOTTANTE (COPIE) */}
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

        {/* NOTIFICATION TOAST FLOTTANTE (SUPPRESSION) */}
        {deletedToast && (
          <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-rose-500/40 animate-in fade-in slide-in-from-bottom-4 duration-200">
            <div className="w-7 h-7 rounded-full bg-rose-500 flex items-center justify-center text-white flex-shrink-0">
              <Trash2 className="w-4 h-4 stroke-[2]" />
            </div>
            <div>
              <p className="font-bold text-xs">Activité supprimée</p>
              <p className="text-[11px] text-slate-300">L'activité a été définitivement supprimée.</p>
            </div>
          </div>
        )}

        {/* LISTE DES ACTIVITÉS STYLE SAAS MODERNE */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>Vos Activités Programmées ({invitations.length})</span>
            </h2>
          </div>

          {invitations.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-md border border-dashed border-slate-300 rounded-3xl p-10 sm:p-14 text-center flex flex-col items-center justify-center space-y-4 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <Layers className="w-7 h-7 text-indigo-500" />
              </div>
              <div className="max-w-md">
                <h3 className="text-base sm:text-lg font-bold text-slate-800">
                  Aucune activité active
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Toutes les activités ont été supprimées ou aucune n'a encore été créée.
                </p>
              </div>
              <Link
                href="/admin/new"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-indigo-600/25 hover:scale-[1.02]"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Créer une activité</span>
              </Link>
            </div>
          ) : (
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
                          {inv.volets.length} activité(s) configurée(s)
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
                        <span>Demandeurs inscrits ({stats.total})</span>
                      </Link>

                      {!isViewer && (
                        <>
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

                          <button
                            type="button"
                            onClick={() => handleDeleteInvitation(inv.id, inv.title)}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-700 hover:border-rose-200 border border-transparent text-xs font-semibold transition-all cursor-pointer"
                            title="Supprimer définitivement cette invitation"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                            <span className="hidden sm:inline">Supprimer</span>
                          </button>
                        </>
                      )}
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
          )}
        </div>

      </div>
    </AdminLayout>
  );
}
