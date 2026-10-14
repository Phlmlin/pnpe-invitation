'use client';

import React, { useEffect, useState } from 'react';
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
  Layers,
  IdCard
} from 'lucide-react';
import { auth } from '@/lib/auth';
import { store } from '@/lib/store';
import { Invitation, RSVPRegistration } from '@/lib/types';
import AdminLayout from '@/components/AdminLayout';
import { exportRSVPsToCSV } from '@/lib/exportCsv';
import ParticipantBadge from '@/components/ParticipantBadge';

export default function GlobalRSVPsPage() {
  const router = useRouter();

  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [selectedInvId, setSelectedInvId] = useState<string>('');
  const [rsvps, setRsvps] = useState<RSVPRegistration[]>([]);
  const [loading, setLoading] = useState(true);

  const [filterTab, setFilterTab] = useState<'all' | 'volet-1' | 'volet-2' | 'both'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal Badge
  const [badgeRSVP, setBadgeRSVP] = useState<RSVPRegistration | null>(null);

  // Modal Ajout Manuel
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
      const list = await store.getInvitations();
      setInvitations(list);

      if (list.length > 0) {
        // Garder l'invitation déjà sélectionnée ou prendre la première
        const currentId = selectedInvId && list.some((i) => i.id === selectedInvId)
          ? selectedInvId
          : list[0].id;
        setSelectedInvId(currentId);
        const dataRsvps = await store.getRSVPs(currentId);
        setRsvps(dataRsvps);
      } else {
        setRsvps([]);
      }
      setLoading(false);
    }

    loadData();
    return store.subscribe(loadData);
  }, [router, selectedInvId]);

  const handleSelectInvitation = async (id: string) => {
    setSelectedInvId(id);
    const dataRsvps = await store.getRSVPs(id);
    setRsvps(dataRsvps);
  };

  const selectedInvitation = invitations.find((i) => i.id === selectedInvId);

  const handleDeleteRSVP = async (id: string, companyName: string) => {
    if (confirm(`Confirmez-vous la suppression de "${companyName}" ?`)) {
      await store.deleteRSVP(id);
      if (selectedInvId) {
        const updated = await store.getRSVPs(selectedInvId);
        setRsvps(updated);
      }
    }
  };

  const handleAddManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvitation || !newCompany.trim() || !newParticipant.trim()) return;

    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const newEntry: RSVPRegistration = {
      id: `rsvp-manual-${Date.now()}`,
      invitationId: selectedInvitation.id,
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

  const currentUser = auth.getSession();
  const isViewer = currentUser?.role === 'viewer';

  const totalRegistrations = rsvps.length;
  const countVolet1 = rsvps.filter((r) => r.volets && r.volets.includes('volet-1')).length;
  const countVolet2 = rsvps.filter((r) => r.volets && r.volets.includes('volet-2')).length;
  const countBoth = rsvps.filter(
    (r) => r.volets && r.volets.includes('volet-1') && r.volets.includes('volet-2')
  ).length;

  const filteredRSVPs = rsvps.filter((r) => {
    if (filterTab === 'volet-1' && !(r.volets && r.volets.includes('volet-1'))) return false;
    if (filterTab === 'volet-2' && !(r.volets && r.volets.includes('volet-2'))) return false;
    if (
      filterTab === 'both' &&
      !(r.volets && r.volets.includes('volet-1') && r.volets.includes('volet-2'))
    )
      return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchComp = (r.company || '').toLowerCase().includes(q);
      const matchName = (r.participantName || '').toLowerCase().includes(q);
      const matchPhone = (r.phone || '').toLowerCase().includes(q);
      const matchEmail = (r.email || '').toLowerCase().includes(q);
      return matchComp || matchName || matchPhone || matchEmail;
    }

    return true;
  });

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center p-16">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      </AdminLayout>
    );
  }

  // Si aucune invitation n'existe
  if (invitations.length === 0) {
    return (
      <AdminLayout>
        <div className="bg-white/80 backdrop-blur-md border border-dashed border-slate-300 rounded-3xl p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Users className="w-8 h-8 text-indigo-500" />
          </div>
          <div className="max-w-md">
            <h3 className="text-lg font-bold text-slate-800">Aucune activité en cours</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Vous n'avez pas encore d'activité active. Créez votre première activité pour suivre les inscriptions de vos participants.
            </p>
          </div>
          <Link
            href="/admin/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-indigo-600/25"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Créer une activité</span>
          </Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      currentInvitationSlug={selectedInvitation?.slug}
      currentInvitationId={selectedInvitation?.id}
    >
      <div className="space-y-6">
        {/* Fil d'Ariane & Titre */}
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors mb-2 font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Retour au Tableau de Bord</span>
          </Link>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/60 text-indigo-700 text-xs font-bold uppercase tracking-wider">
                <Activity className="w-3 h-3 text-indigo-600" />
                <span>Suivi Live des Inscriptions</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                Demandeurs d'emploi Enregistrés
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {!isViewer && (
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold tracking-wider border border-slate-200 transition-colors shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-indigo-600" />
                  <span>Ajout Manuel (Demandeur)</span>
                </button>
              )}

              {selectedInvitation && (
                <button
                  onClick={() => exportRSVPsToCSV(filteredRSVPs, selectedInvitation)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold tracking-wider transition-all shadow-sm shadow-emerald-500/20 cursor-pointer"
                  title="Exporter pour Microsoft Excel"
                >
                  <Download className="w-4 h-4 text-[#FCD116]" />
                  <span>Exporter en Excel (.CSV)</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* SÉLECTEUR D'ACTIVITÉ (SI MULTIPLES) */}
        {invitations.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs font-bold uppercase text-slate-400 whitespace-nowrap mr-1">
              Activité :
            </span>
            {invitations.map((inv) => (
              <button
                key={inv.id}
                onClick={() => handleSelectInvitation(inv.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                  inv.id === selectedInvId
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-500/20'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {inv.title}
              </button>
            ))}
          </div>
        )}

        {/* BANNIÈRE DE L'ACTIVITÉ SÉLECTIONNÉE */}
        {selectedInvitation && (
          <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-slate-900">
                  {selectedInvitation.title}
                </h2>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                  <span className="font-mono text-indigo-600">/{selectedInvitation.slug}</span>
                  <span>•</span>
                  <span>{selectedInvitation.volets.length} activité(s) configurée(s)</span>
                </div>
              </div>
            </div>

            <Link
              href={`/invite/${selectedInvitation.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
            >
              <span>Voir le lien public</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* LES 4 CARTES KPI MODERNES */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-modern">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Total Inscrits
            </span>
            <p className="text-3xl font-extrabold text-slate-900 tabular-nums">
              {totalRegistrations}
            </p>
            <p className="text-xs text-slate-500 mt-1 font-medium">Demandeurs enregistrés</p>
          </div>

          <div className="p-5 rounded-3xl bg-gradient-to-br from-blue-50/90 to-indigo-50/60 border border-blue-200/80 shadow-modern">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 block mb-1">
              Activité 1
            </span>
            <p className="text-3xl font-extrabold text-blue-900 tabular-nums">
              {countVolet1}
            </p>
            <p className="text-xs text-blue-700 mt-1 font-medium">Inscrits Activité 1</p>
          </div>

          <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-50/90 to-teal-50/60 border border-emerald-200/80 shadow-modern">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 block mb-1">
              Activité 2
            </span>
            <p className="text-3xl font-extrabold text-emerald-900 tabular-nums">
              {countVolet2}
            </p>
            <p className="text-xs text-emerald-700 mt-1 font-medium">Inscrits Activité 2</p>
          </div>

          <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-50/90 to-orange-50/60 border border-amber-200/80 shadow-modern">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 block mb-1">
              Toutes les Activités
            </span>
            <p className="text-3xl font-extrabold text-amber-900 tabular-nums">
              {countBoth}
            </p>
            <p className="text-xs text-amber-700 mt-1 font-medium">Participation aux 2 activités</p>
          </div>
        </div>

        {/* BARRE DE RECHERCHE ET ONGLETS DE FILTRE */}
        <div className="bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 shadow-modern flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setFilterTab('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                filterTab === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Tous ({totalRegistrations})
            </button>
            <button
              onClick={() => setFilterTab('volet-1')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                filterTab === 'volet-1'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-blue-700 hover:bg-blue-50'
              }`}
            >
              Activité 1 ({countVolet1})
            </button>
            <button
              onClick={() => setFilterTab('volet-2')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                filterTab === 'volet-2'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              Activité 2 ({countVolet2})
            </button>
            <button
              onClick={() => setFilterTab('both')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                filterTab === 'both'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-amber-700 hover:bg-amber-50'
              }`}
            >
              Les 2 Activités ({countBoth})
            </button>
          </div>

          <div className="relative flex-1 sm:max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher un demandeur, profil, N° PNPE..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-600 text-slate-900"
            />
          </div>
        </div>

        {/* TABLEAU DES DEMANDEURS */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/90 shadow-modern overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="py-4 px-6">Demandeur d'emploi</th>
                  <th className="py-4 px-6">Profil &amp; Métier</th>
                  <th className="py-4 px-6">Contact</th>
                  <th className="py-4 px-6">Activités Choisies</th>
                  <th className="py-4 px-6 text-center">N° PNPE</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRSVPs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      Aucune inscription enregistrée pour ce filtre.
                    </td>
                  </tr>
                ) : (
                  filteredRSVPs.map((r) => {
                    const hasV1 = r.volets && r.volets.includes('volet-1');
                    const hasV2 = r.volets && r.volets.includes('volet-2');
                    const cleanPhone = r.phone.replace(/[^0-9+]/g, '');

                    // Extraction du numéro PNPE
                    const pnpeNumber = r.comments?.includes('Numéro PNPE :')
                      ? r.comments.replace('Numéro PNPE :', '').trim()
                      : r.company?.includes('N° PNPE:')
                      ? r.company.split('N° PNPE:')[1]?.replace(')', '').trim()
                      : '-';

                    return (
                      <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-6">
                          <p className="font-extrabold text-slate-900 text-sm">{r.participantName}</p>
                          <span className="font-mono text-[10px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 mt-1 inline-block">
                            {r.confirmationCode}
                          </span>
                        </td>

                        <td className="py-4 px-6">
                          <p className="font-bold text-slate-800">{r.jobTitle || 'Demandeur'}</p>
                          <p className="text-[11px] text-slate-400">
                            Inscrit le {new Date(r.createdAt).toLocaleDateString('fr-FR')}
                          </p>
                        </td>

                        <td className="py-4 px-6 space-y-1">
                          <div className="flex items-center gap-1.5 text-slate-700">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span>{r.phone || 'Non renseigné'}</span>
                            {r.phone && r.phone !== 'Non renseigné' && (
                              <a
                                href={`https://wa.me/${cleanPhone.replace('+', '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-emerald-600 hover:text-emerald-700 ml-1"
                                title="Contacter sur WhatsApp"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                          {r.email && r.email !== 'non-renseigne@pnpe.ga' && (
                            <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                              <Mail className="w-3.5 h-3.5 text-slate-400" />
                              <span>{r.email}</span>
                            </div>
                          )}
                        </td>

                        <td className="py-4 px-6">
                          <div className="flex flex-wrap gap-1.5">
                            {hasV1 && (
                              <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                Activité 1
                              </span>
                            )}
                            {hasV2 && (
                              <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Activité 2
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-4 px-6 text-center font-mono text-xs text-slate-700 font-semibold">
                          {pnpeNumber}
                        </td>

                        <td className="py-4 px-6 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setBadgeRSVP(r)}
                              className="px-2.5 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white transition-all inline-flex items-center gap-1 font-bold text-xs shadow-xs cursor-pointer"
                              title="Voir et télécharger le Badge PDF"
                            >
                              <IdCard className="w-3.5 h-3.5" />
                              <span>Badge</span>
                            </button>

                            {!isViewer && (
                              <button
                                onClick={() => handleDeleteRSVP(r.id, r.participantName || r.company)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Supprimer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODAL AJOUT MANUEL */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">
                  Enregistrement Manuel d'un Participant
                </h3>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddManualSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Entreprise / Organisation *
                  </label>
                  <input
                    type="text"
                    required
                    value={newCompany}
                    onChange={(e) => setNewCompany(e.target.value)}
                    placeholder="Ex: TotalEnergies Gabon"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Nom du Représentant *
                    </label>
                    <input
                      type="text"
                      required
                      value={newParticipant}
                      onChange={(e) => setNewParticipant(e.target.value)}
                      placeholder="Ex: Jean Nguema"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Fonction</label>
                    <input
                      type="text"
                      value={newJobTitle}
                      onChange={(e) => setNewJobTitle(e.target.value)}
                      placeholder="Ex: DRH"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Téléphone</label>
                    <input
                      type="text"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      placeholder="+241..."
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">E-mail</label>
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="contact@..."
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                  >
                    Enregistrer
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL APERÇU ET TÉLÉCHARGEMENT BADGE */}
        {badgeRSVP && selectedInvitation && (
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
                invitation={selectedInvitation}
                showActions={true}
              />
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
