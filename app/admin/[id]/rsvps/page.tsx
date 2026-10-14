'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Users,
  Search,
  Download,
  Plus,
  Trash2,
  ExternalLink,
  MessageCircle,
  Building,
  User,
  Calendar,
  CheckCircle2,
  Filter,
  X,
  Phone,
  Mail,
  Loader2,
  ArrowLeft,
  Activity,
  IdCard
} from 'lucide-react';
import { auth } from '@/lib/auth';
import { store } from '@/lib/store';
import { Invitation, RSVPRegistration } from '@/lib/types';
import AdminLayout from '@/components/AdminLayout';
import { exportRSVPsToCSV } from '@/lib/exportCsv';
import ParticipantBadge from '@/components/ParticipantBadge';

interface AdminRSVPsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function AdminRSVPsPage({ params }: AdminRSVPsPageProps) {
  const resolvedParams = use(params);
  const invitationId = resolvedParams.id;
  const router = useRouter();

  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [rsvps, setRsvps] = useState<RSVPRegistration[]>([]);
  const [loading, setLoading] = useState(true);

  const [filterTab, setFilterTab] = useState<'all' | 'volet-1' | 'volet-2' | 'both'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal Badge
  const [badgeRSVP, setBadgeRSVP] = useState<RSVPRegistration | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCompany, setNewCompany] = useState('');
  const [newParticipant, setNewParticipant] = useState('');
  const [newJobTitle, setNewJobTitle] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newVolets, setNewVolets] = useState<string[]>(['volet-1', 'volet-2']);
  const [newAttendees, setNewAttendees] = useState(1);
  const [newComments, setNewComments] = useState('');

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push('/admin/login');
      return;
    }

    async function loadData() {
      setLoading(true);
      let inv = await store.getInvitationById(invitationId);
      if (!inv) {
        inv = await store.getInvitationBySlug(invitationId);
      }

      if (inv) {
        setInvitation(inv);
        const list = await store.getRSVPs(inv.id);
        setRsvps(list);
      }
      setLoading(false);
    }

    loadData();
    return store.subscribe(loadData);
  }, [invitationId, router]);

  const handleDeleteRSVP = async (id: string, companyName: string) => {
    if (confirm(`Confirmez-vous la suppression de "${companyName}" ?`)) {
      await store.deleteRSVP(id);
      if (invitation) {
        const updated = await store.getRSVPs(invitation.id);
        setRsvps(updated);
      }
    }
  };

  const handleAddManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invitation || !newCompany.trim() || !newParticipant.trim()) return;

    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const newEntry: RSVPRegistration = {
      id: `rsvp-manual-${Date.now()}`,
      invitationId: invitation.id,
      confirmationCode: `PNPE-MANUAL-${randomCode}`,
      company: newCompany.trim(),
      participantName: newParticipant.trim(),
      jobTitle: newJobTitle.trim() || 'Représentant',
      phone: newPhone.trim() || '+241...',
      email: newEmail.trim() || 'contact@entreprise.ga',
      volets: newVolets.length > 0 ? newVolets : ['volet-1'],
      attendeesCount: Number(newAttendees) || 1,
      comments: newComments.trim() ? `[Ajout Tél.] ${newComments.trim()}` : '[Ajout Manuel]',
      createdAt: new Date().toISOString(),
    };

    await store.saveRSVP(newEntry);
    setIsAddModalOpen(false);
    setNewCompany('');
    setNewParticipant('');
    setNewJobTitle('');
    setNewPhone('');
    setNewEmail('');
    setNewComments('');
  };

  const totalRegistrations = rsvps.length;
  const countVolet1 = rsvps.filter((r) => r.volets.includes('volet-1')).length;
  const countVolet2 = rsvps.filter((r) => r.volets.includes('volet-2')).length;
  const countBoth = rsvps.filter((r) => r.volets.includes('volet-1') && r.volets.includes('volet-2')).length;

  const filteredRSVPs = rsvps.filter((r) => {
    if (filterTab === 'volet-1' && !r.volets.includes('volet-1')) return false;
    if (filterTab === 'volet-2' && !r.volets.includes('volet-2')) return false;
    if (filterTab === 'both' && !(r.volets.includes('volet-1') && r.volets.includes('volet-2'))) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchComp = r.company.toLowerCase().includes(q);
      const matchName = r.participantName.toLowerCase().includes(q);
      const matchPhone = r.phone.toLowerCase().includes(q);
      const matchEmail = r.email.toLowerCase().includes(q);
      return matchComp || matchName || matchPhone || matchEmail;
    }

    return true;
  });

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      </AdminLayout>
    );
  }

  if (!invitation) {
    return (
      <AdminLayout>
        <div className="p-8 text-center">
          <p className="text-slate-600 font-semibold">Invitation introuvable.</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout currentInvitationSlug={invitation.slug} currentInvitationId={invitation.id}>
      <div className="space-y-6">
        
        {/* Fil d'Ariane & Titre */}
        <div className="mb-6">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors mb-2 font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Retour à Mes Invitations</span>
          </Link>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/60 text-indigo-700 text-xs font-bold uppercase tracking-wider">
                <Activity className="w-3 h-3 text-indigo-600" />
                <span>Suivi Live • /{invitation.slug}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1.5">
                Participants &amp; Entreprises Enregistrées
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold tracking-wider border border-slate-200 transition-colors shadow-xs"
              >
                <Plus className="w-4 h-4 text-indigo-600" />
                <span>Ajout Manuel (Téléphone)</span>
              </button>

              <button
                onClick={() => exportRSVPsToCSV(filteredRSVPs, invitation)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold tracking-wider transition-all shadow-sm shadow-emerald-500/20"
                title="Exporter pour Microsoft Excel"
              >
                <Download className="w-4 h-4 text-[#FCD116]" />
                <span>Exporter en Excel (.CSV)</span>
              </button>
            </div>
          </div>
        </div>

        {/* LES 4 CARTES KPI MODERNES */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="p-5 rounded-3xl bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-modern">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Total Inscrits
            </span>
            <p className="text-3xl font-extrabold text-slate-900 tabular-nums">
              {totalRegistrations}
            </p>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Entreprises enregistrées
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-gradient-to-br from-blue-50/90 to-indigo-50/60 border border-blue-200/80 shadow-modern">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 block mb-1">
              Volet 1 (Ven. 16/10)
            </span>
            <p className="text-3xl font-extrabold text-blue-900 tabular-nums">
              {countVolet1}
            </p>
            <p className="text-xs text-blue-700 mt-1 font-medium">
              Présentation Forum Paris
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-50/90 to-teal-50/60 border border-emerald-200/80 shadow-modern">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 block mb-1">
              Volet 2 (Sam. 17/10)
            </span>
            <p className="text-3xl font-extrabold text-emerald-900 tabular-nums">
              {countVolet2}
            </p>
            <p className="text-xs text-emerald-700 mt-1 font-medium">
              Mini-salon de l'emploi
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-50/90 to-orange-50/60 border border-amber-200/80 shadow-modern">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 block mb-1">
              Les Deux Volets
            </span>
            <p className="text-3xl font-extrabold text-amber-900 tabular-nums">
              {countBoth}
            </p>
            <p className="text-xs text-amber-700 mt-1 font-medium">
              Participation intégrale
            </p>
          </div>
        </div>

        {/* FILTRES & RECHERCHE */}
        <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-4 mb-6 shadow-xs flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setFilterTab('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                filterTab === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Tous ({totalRegistrations})
            </button>

            <button
              onClick={() => setFilterTab('volet-1')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                filterTab === 'volet-1'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
              }`}
            >
              Volet 1 ({countVolet1})
            </button>

            <button
              onClick={() => setFilterTab('volet-2')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                filterTab === 'volet-2'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              Volet 2 ({countVolet2})
            </button>

            <button
              onClick={() => setFilterTab('both')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                filterTab === 'both'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
              }`}
            >
              Les 2 Volets ({countBoth})
            </button>
          </div>

          <div className="relative min-w-[280px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher entreprise, nom, tél..."
              className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:bg-white text-slate-900"
            />
          </div>
        </div>

        {/* TABLEAU MODERNE */}
        <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-3xl overflow-hidden shadow-modern">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-400 font-bold text-[10px] uppercase tracking-wider">
                  <th className="p-4">Date / Code</th>
                  <th className="p-4">Entreprise</th>
                  <th className="p-4">Représentant</th>
                  <th className="p-4">Contacts / WhatsApp</th>
                  <th className="p-4">Volets</th>
                  <th className="p-4 text-center">Personnes</th>
                  <th className="p-4">Besoins / Stand</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-sans">
                {filteredRSVPs.map((r) => {
                  const cleanPhone = r.phone.replace(/[^0-9+]/g, '');
                  const whatsappUrl = `https://wa.me/${cleanPhone.replace('+', '')}?text=${encodeURIComponent(
                    `Bonjour ${r.participantName}, confirmation officielle de votre inscription PNPE pour l'événement (Réf: ${r.confirmationCode}).`
                  )}`;

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 whitespace-nowrap">
                        <p className="font-bold text-slate-900 font-mono">
                          {new Date(r.createdAt).toLocaleDateString('fr-FR')}
                        </p>
                        <span className="font-mono text-[10px] text-indigo-600 font-bold">
                          {r.confirmationCode}
                        </span>
                      </td>

                      <td className="p-4 font-bold text-slate-900">
                        {r.company}
                      </td>

                      <td className="p-4">
                        <p className="font-semibold text-slate-900">{r.participantName}</p>
                        <p className="text-[11px] text-slate-500">{r.jobTitle}</p>
                      </td>

                      <td className="p-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div>
                            <p className="font-mono text-slate-800 text-[11px]">{r.phone}</p>
                            <p className="text-[10px] text-slate-400">{r.email}</p>
                          </div>
                          
                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white transition-colors border border-emerald-200"
                            title="Ouvrir WhatsApp directement"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </td>

                      <td className="p-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          {r.volets.includes('volet-1') && (
                            <span className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                              Volet 1 (Ven. 16)
                            </span>
                          )}
                          {r.volets.includes('volet-2') && (
                            <span className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Volet 2 (Sam. 17)
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-4 text-center whitespace-nowrap font-bold font-mono">
                        {r.attendeesCount}
                      </td>

                      <td className="p-4 max-w-xs text-xs text-slate-500 italic">
                        {r.comments || '-'}
                      </td>

                      <td className="p-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setBadgeRSVP(r)}
                            className="px-2.5 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white transition-all inline-flex items-center gap-1 font-bold text-xs shadow-xs"
                            title="Voir et télécharger le Badge PDF"
                          >
                            <IdCard className="w-3.5 h-3.5" />
                            <span>Badge</span>
                          </button>
                          <button
                            onClick={() => handleDeleteRSVP(r.id, r.company)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL AJOUT MANUEL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div
            className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-lg text-slate-900">
                Ajouter un Participant (Téléphone)
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddManualSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold uppercase text-slate-700 mb-1">
                  Entreprise *
                </label>
                <input
                  type="text"
                  required
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  placeholder="Nom de la société..."
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase text-slate-700 mb-1">
                    Nom &amp; Prénom *
                  </label>
                  <input
                    type="text"
                    required
                    value={newParticipant}
                    onChange={(e) => setNewParticipant(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase text-slate-700 mb-1">
                    Téléphone
                  </label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+241..."
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL APERÇU ET TÉLÉCHARGEMENT BADGE */}
      {badgeRSVP && invitation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative my-8 border border-slate-200">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <IdCard className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                  Badge Officiel Participant
                </h3>
              </div>
              <button
                onClick={() => setBadgeRSVP(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <ParticipantBadge
              rsvp={badgeRSVP}
              invitation={invitation}
              showActions={true}
            />
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
