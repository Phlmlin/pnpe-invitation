'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ShieldAlert,
  Loader2,
  Calendar,
  AlertCircle,
  HelpCircle,
  PlusCircle,
  CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { store } from '@/lib/store';
import { Invitation, RSVPRegistration } from '@/lib/types';
import OfficialHeader from '@/components/OfficialHeader';
import VoletCard from '@/components/VoletCard';
import ActivityPoster from '@/components/ActivityPoster';

interface InvitePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function InvitePage({ params }: InvitePageProps) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVolets, setSelectedVolets] = useState<string[]>([]);
  const [confirmedRSVP, setConfirmedRSVP] = useState<RSVPRegistration | null>(null);
  const [isSingleVoletModalOpen, setIsSingleVoletModalOpen] = useState(false);

  // Champs Demandeur d'emploi
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [pnpeNumber, setPnpeNumber] = useState('');
  const [profil, setProfil] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadInvitation() {
      setLoading(true);
      const data = await store.getInvitationBySlug(slug);
      if (data) {
        setInvitation(data);
        // Par défaut, présélectionner automatiquement l'activité de l'invitation
        if (data.volets && data.volets.length > 0) {
          setSelectedVolets(data.volets.map((v) => v.id));
        }
      }
      setLoading(false);
    }
    loadInvitation();
  }, [slug]);

  // Si une seule activité est configurée, s'assurer qu'elle est toujours cochée par défaut
  useEffect(() => {
    if (invitation && invitation.volets && invitation.volets.length === 1) {
      const singleId = invitation.volets[0].id;
      if (!selectedVolets.includes(singleId)) {
        setSelectedVolets([singleId]);
      }
    }
  }, [invitation, selectedVolets]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
        <div className="flex flex-col items-center gap-3 text-slate-500 font-mono text-xs">
          <Loader2 className="w-7 h-7 animate-spin text-indigo-600" />
          <span>Chargement de l'activité...</span>
        </div>
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50">
        <ShieldAlert className="w-12 h-12 text-slate-400 mb-3" />
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Activité non trouvée</h1>
        <p className="text-sm text-slate-600 max-w-md mb-6">
          Ce lien d'activité n'existe pas ou a expiré.
        </p>
        <Link
          href="/"
          className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
        >
          Retour à l'accueil
        </Link>
      </div>
    );
  }

  const handleToggleVolet = (id: string) => {
    setErrorMessage(null);
    // S'il n'y a qu'une seule activité, elle reste cochée par défaut
    if (invitation && invitation.volets.length === 1) {
      setSelectedVolets([id]);
      return;
    }
    setSelectedVolets((prev) => {
      if (prev.includes(id)) {
        return prev.filter((vId) => vId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Exécution finale de l'enregistrement avec les activités confirmées
  const executeRegistration = async (voletsToSave: string[]) => {
    if (!invitation) return;
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const randomCode = Math.floor(1000 + Math.random() * 9000);
      const code = `PNPE-OG-${randomCode}`;

      const finalParticipantName = `${nom.trim().toUpperCase()} ${prenom.trim()}`;
      const finalCompany = pnpeNumber.trim()
        ? `Demandeur d'emploi (N° PNPE: ${pnpeNumber.trim()})`
        : "Demandeur d'emploi";
      const finalJobTitle = profil.trim();
      const finalAttendees = 1;
      const finalComments = pnpeNumber.trim()
        ? `Numéro PNPE : ${pnpeNumber.trim()}`
        : undefined;

      const newRSVP: RSVPRegistration = {
        id: `rsvp-${Date.now()}`,
        invitationId: invitation.id,
        confirmationCode: code,
        company: finalCompany,
        participantName: finalParticipantName,
        jobTitle: finalJobTitle,
        phone: phone.trim() || 'Non renseigné',
        email: email.trim().toLowerCase() || 'non-renseigne@pnpe.ga',
        volets: voletsToSave,
        attendeesCount: finalAttendees,
        comments: finalComments,
        createdAt: new Date().toISOString(),
      };

      // Déclenchement immédiat de l'écran de succès et des confettis (zéro latence)
      setConfirmedRSVP(newRSVP);
      setIsSingleVoletModalOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });

      try {
        confetti({
          particleCount: 60,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#009E60', '#FCD116', '#3A75C4', '#4F46E5']
        });
      } catch {
        // ignorer
      }

      // Sauvegarde locale instantanée et synchronisation Supabase
      await store.saveRSVP(newRSVP);
    } catch (err) {
      console.error(err);
      setErrorMessage("Une erreur est survenue lors de l'enregistrement.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation obligatoire : au moins une activité cochée
    if (selectedVolets.length === 0) {
      setErrorMessage('Veuillez sélectionner au moins une activité pour valider votre inscription.');
      return;
    }

    if (!nom.trim() || !prenom.trim() || !profil.trim()) {
      setErrorMessage('Veuillez renseigner votre Nom, Prénom et Profil (*).');
      return;
    }

    // Si le participant a sélectionné 1 seule activité alors que l'invitation en compte plusieurs :
    if (selectedVolets.length === 1 && invitation && invitation.volets.length > 1) {
      setIsSingleVoletModalOpen(true);
      return;
    }

    // Validation directe
    await executeRegistration(selectedVolets);
  };

  const formatActivityBadge = (badge?: string, fallbackId?: string) => {
    if (!badge) return fallbackId === 'volet-2' ? 'Activité 2' : 'Activité 1';
    return badge.replace(/^volet\s*(\d+)/i, 'Activité $1').replace(/volet/gi, 'Activité');
  };

  const singleVolet =
    invitation && selectedVolets.length === 1
      ? invitation.volets.find((v) => v.id === selectedVolets[0])
      : null;

  const missingVolet =
    invitation && selectedVolets.length === 1
      ? invitation.volets.find((v) => v.id !== selectedVolets[0])
      : null;

  const isMultiActivity = invitation ? invitation.volets.length > 1 : false;

  return (
    <div className="flex-1 flex flex-col bg-slate-50 relative">
      <OfficialHeader organization={invitation.organization} />

      {confirmedRSVP ? (
        // ÉCRAN DE CONFIRMATION OFFICIEL
        <div className="max-w-2xl mx-auto px-4 py-8 sm:py-14 w-full animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-modern text-center space-y-6 relative overflow-hidden">
            {/* Liseré supérieur Gabon */}
            <div className="absolute top-0 left-0 right-0 h-2 flex">
              <div className="w-1/3 h-full bg-[#009E60]" />
              <div className="w-1/3 h-full bg-[#FCD116]" />
              <div className="w-1/3 h-full bg-[#3A75C4]" />
            </div>

            {/* Grande icône de confirmation */}
            <div className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-200 text-emerald-600 mx-auto flex items-center justify-center shadow-md shadow-emerald-500/10">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 stroke-[2.5]" />
            </div>

            {/* Titre & Message officiel */}
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Félicitations, votre inscription a réussi !
              </h2>
              <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                Votre inscription a bien été enregistrée pour les activités sélectionnées.
              </p>
            </div>

            {/* Récapitulatif clair de l'inscription */}
            <div className="bg-slate-50/90 border border-slate-200/80 rounded-2xl p-5 text-left space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Participant
                </span>
                <span className="text-sm font-extrabold text-slate-900">
                  {confirmedRSVP.participantName}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Profil / Structure
                </span>
                <span className="text-xs font-bold text-slate-800">
                  {confirmedRSVP.company}
                </span>
              </div>

              {confirmedRSVP.email && confirmedRSVP.email !== 'non-renseigne@pnpe.ga' && (
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    E-mail
                  </span>
                  <span className="text-xs font-medium text-slate-700">
                    {confirmedRSVP.email}
                  </span>
                </div>
              )}

              {confirmedRSVP.phone && confirmedRSVP.phone !== 'Non renseigné' && (
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Téléphone
                  </span>
                  <span className="text-xs font-medium text-slate-700">
                    {confirmedRSVP.phone}
                  </span>
                </div>
              )}

              {/* Activités sélectionnées */}
              <div className="pt-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Activité(s) validée(s)
                </span>
                <div className="space-y-2">
                  {invitation.volets
                    .filter((v) => confirmedRSVP.volets.includes(v.id))
                    .map((v) => (
                      <div
                        key={v.id}
                        className="p-3 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between gap-3 shadow-xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[11px] font-black uppercase text-white ${
                              v.theme === 'blue' ? 'bg-indigo-700' : 'bg-emerald-700'
                            }`}
                          >
                            {formatActivityBadge(v.badge, v.id)}
                          </span>
                          <span className="text-xs font-bold text-slate-800 truncate">
                            {v.title}
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-slate-500 whitespace-nowrap">
                          {v.date}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Bouton nouvelle inscription */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setConfirmedRSVP(null);
                  setNom('');
                  setPrenom('');
                  setPnpeNumber('');
                  setProfil('');
                  setPhone('');
                  setEmail('');
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
              >
                <span>Inscrire un autre participant</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        // PAGE D'INVITATION & D'INSCRIPTION PRINCIPALE
        <div className="max-w-5xl lg:max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full space-y-8 flex-1">
          {/* 1. EN-TÊTE DYNAMIQUE */}
          <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-modern text-left space-y-3 relative overflow-hidden">
            {/* Liseré supérieur Gabon */}
            <div className="absolute top-0 left-0 right-0 h-2 flex">
              <div className="w-1/3 h-full bg-[#009E60]" />
              <div className="w-1/3 h-full bg-[#FCD116]" />
              <div className="w-1/3 h-full bg-[#3A75C4]" />
            </div>

            {/* Badge / Sur-titre : ACTIVITÉ */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-black uppercase tracking-widest">
              <Calendar className="w-3.5 h-3.5 text-indigo-600" />
              <span>ACTIVITÉ</span>
            </div>

            {/* Titre Principal de l'Invitation */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-snug">
              {invitation.title}
            </h1>

            {/* Message d'introduction si renseigné */}
            {invitation.introMessage && (
              <p className="text-xs sm:text-sm lg:text-base text-slate-600 leading-relaxed pt-1">
                {invitation.introMessage}
              </p>
            )}

            {/* Sous-titre / Statut : Réf : [Lien Public] ● Inscriptions ouvertes */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-mono">
              <span className="font-bold text-slate-700">Réf : {invitation.slug}</span>
              <span className="text-emerald-700 font-bold">● Inscriptions ouvertes</span>
            </div>
          </div>

          {/* 2. SÉLECTION DES ACTIVITÉS */}
          <div className="bg-white/95 backdrop-blur-md border-2 border-indigo-100 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-modern space-y-6">
            {isMultiActivity && (
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-900 text-xs font-black uppercase tracking-wider">
                  <span>Étape 1 sur 2</span>
                </div>
              </div>
            )}

            {/* Grille en 2 colonnes distinctes : Grandes affiches à gauche | Cartes d'informations à droite */}
            <div className="space-y-8 pt-2">
              {invitation.volets.map((volet) => (
                <div key={volet.id} className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-stretch">
                  {/* Colonne de gauche (sur desktop) / En premier (sur mobile) : Affiche en grand, indépendante et non enfermée dans la carte */}
                  {volet.imageUrl && (
                    <div className="md:col-span-5 flex flex-col">
                      <ActivityPoster
                        volet={volet}
                        isSelected={selectedVolets.includes(volet.id)}
                        onToggle={handleToggleVolet}
                        hideSelectionUI={!isMultiActivity}
                      />
                    </div>
                  )}

                  {/* Colonne de droite (sur desktop) / En second (sur mobile) : Carte interactive d'informations sans image */}
                  <div className={volet.imageUrl ? 'md:col-span-7 flex flex-col' : 'md:col-span-12 flex flex-col'}>
                    <VoletCard
                      volet={volet}
                      isSelected={selectedVolets.includes(volet.id)}
                      onToggle={handleToggleVolet}
                      hideImage={true}
                      hideSelectionUI={!isMultiActivity}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Indicateur de sélection */}
            {isMultiActivity && (
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-600">
                  {selectedVolets.length === 0 ? (
                    <strong className="text-rose-600">Aucune activité sélectionnée</strong>
                  ) : (
                    <span>
                      <strong className="text-indigo-900">{selectedVolets.length}</strong> sur {invitation.volets.length} activité(s) sélectionnée(s)
                    </span>
                  )}
                </span>
                <span className="text-slate-500 font-mono font-bold">
                  {selectedVolets.length}/{invitation.volets.length}
                </span>
              </div>
            )}
          </div>

          {/* 3. FORMULAIRE D'INSCRIPTION DES PARTICIPANTS */}
          <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-modern space-y-6 text-left">
            <div className="pb-4 border-b border-slate-200/80 space-y-2">
              {isMultiActivity && (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-bold uppercase tracking-wider">
                  <span>Étape 2 sur 2</span>
                </div>
              )}
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
                Inscrivez-vous pour participer
              </h2>
            </div>

            {/* MESSAGE D'ERREUR */}
            {errorMessage && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 shadow-xs">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <span className="font-semibold">{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Nom (Obligatoire) */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Nom *
                  </label>
                  <input
                    type="text"
                    required
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    placeholder="Ex: OBAME"
                    className="w-full px-3.5 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-slate-900 transition-all font-sans"
                  />
                </div>

                {/* Prénom (Obligatoire) */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    required
                    value={prenom}
                    onChange={(e) => setPrenom(e.target.value)}
                    placeholder="Ex: Jean-Marc"
                    className="w-full px-3.5 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-slate-900 transition-all font-sans"
                  />
                </div>
              </div>

              {/* Ligne 2 : Numéro PNPE & Contact (Facultatifs) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Numéro PNPE (Facultatif) */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Numéro PNPE <span className="text-slate-400 font-normal">(Facultatif)</span>
                  </label>
                  <input
                    type="text"
                    value={pnpeNumber}
                    onChange={(e) => setPnpeNumber(e.target.value)}
                    placeholder="Ex: PNPE-12345"
                    className="w-full px-3.5 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-slate-900 transition-all font-sans font-mono"
                  />
                </div>

                {/* Contact / Téléphone (Facultatif) */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    CONTACT <span className="text-slate-400 font-normal">(FACULTATIF)</span>
                  </label>
                  <input
                    type="tel"
                    required={false}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ex: 077 00 00 00 / 066 00 00 00"
                    className="w-full px-3.5 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-slate-900 transition-all font-sans"
                  />
                </div>
              </div>

              {/* Ligne 3 : Profil (Pleine largeur) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Profil *
                </label>
                <input
                  type="text"
                  required
                  value={profil}
                  onChange={(e) => setProfil(e.target.value)}
                  placeholder="Ex: Comptable, Développeur Web, Électricien..."
                  className="w-full px-3.5 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-slate-900 transition-all font-sans"
                />
              </div>

                  {/* Bouton de confirmation Demandeur */}
                  <div className="pt-3">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 px-6 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 shadow-md bg-black text-white hover:bg-emerald-600 shadow-black/20 hover:shadow-emerald-600/30 hover:scale-[1.01] cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Validation en cours...</span>
                        </>
                      ) : (
                        <>
                          <span>Confirmer mon inscription</span>
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>
                    <p className="text-[11px] text-center text-slate-400 mt-2 font-medium">
                      Votre inscription sera immédiatement enregistrée pour les activités sélectionnées.
                    </p>
                  </div>
                </form>
              </div>
        </div>
      )}

      {/* MODALE DE CONFIRMATION DE PARTICIPATION À UNE SEULE ACTIVITÉ */}
      {isSingleVoletModalOpen && singleVolet && missingVolet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-in zoom-in-95 duration-200 text-left">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mb-4">
              <HelpCircle className="w-6 h-6 text-amber-600" />
            </div>

            <h3 className="text-xl font-black text-slate-900 tracking-tight">
              Confirmation de votre présence
            </h3>

            <p className="text-sm text-slate-700 mt-3 leading-relaxed">
              Vous avez sélectionné uniquement l'<strong className="text-indigo-950 font-bold">{formatActivityBadge(singleVolet.badge, singleVolet.id)}</strong> ({singleVolet.title}).
            </p>

            <p className="text-sm text-slate-700 mt-2 leading-relaxed">
              Souhaitez-vous confirmer votre inscription à cette seule activité ou souhaitez-vous également participer à l'<strong className="text-indigo-950 font-bold">{formatActivityBadge(missingVolet.badge, missingVolet.id)}</strong> ({missingVolet.title}) ?
            </p>

            <div className="mt-6 flex flex-col gap-3">
              {/* Choix 2 : Ajouter la seconde activité */}
              <button
                type="button"
                onClick={() => {
                  const both = [singleVolet.id, missingVolet.id];
                  setSelectedVolets(both);
                  executeRegistration(both);
                }}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-emerald-600/25 transition-all cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Ajouter l'{formatActivityBadge(missingVolet.badge, missingVolet.id)} à mon inscription</span>
              </button>

              {/* Choix 1 : Confirmer cette seule activité */}
              <button
                type="button"
                onClick={() => executeRegistration(selectedVolets)}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider transition-colors border border-slate-200 cursor-pointer"
              >
                <span>Confirmer mon inscription à l'{formatActivityBadge(singleVolet.badge, singleVolet.id)} uniquement</span>
              </button>

              <button
                type="button"
                onClick={() => setIsSingleVoletModalOpen(false)}
                className="text-xs text-slate-400 hover:text-slate-600 underline text-center mt-1 cursor-pointer"
              >
                Modifier mon choix sur le formulaire
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
