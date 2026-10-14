'use client';

import React, { useEffect, useState, use } from 'react';
import {
  Maximize2,
  CheckCircle2,
  AlertCircle,
  Building,
  User,
  Briefcase,
  Phone,
  Mail,
  Users,
  ArrowRight,
  ShieldAlert,
  Loader2,
  Calendar,
  Share2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { store } from '@/lib/store';
import { Invitation, RSVPRegistration } from '@/lib/types';
import OfficialHeader from '@/components/OfficialHeader';
import VoletCard from '@/components/VoletCard';
import ImageModal from '@/components/ImageModal';
import ConfirmationPass from '@/components/ConfirmationPass';

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
  const [selectedVolets, setSelectedVolets] = useState<string[]>(['volet-1', 'volet-2']); // Par défaut les 2 sont présélectionnés
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [confirmedRSVP, setConfirmedRSVP] = useState<RSVPRegistration | null>(null);

  // Formulaire
  const [company, setCompany] = useState('');
  const [participantName, setParticipantName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [attendeesCount, setAttendeesCount] = useState<number>(1);
  const [comments, setComments] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadInvitation() {
      setLoading(true);
      const data = await store.getInvitationBySlug(slug);
      if (data) {
        setInvitation(data);
      }
      setLoading(false);
    }
    loadInvitation();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
        <div className="flex flex-col items-center gap-3 text-slate-500 font-mono text-xs">
          <Loader2 className="w-7 h-7 animate-spin text-indigo-600" />
          <span>Chargement de l'invitation...</span>
        </div>
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50">
        <ShieldAlert className="w-12 h-12 text-slate-400 mb-3" />
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Invitation non trouvée</h1>
        <p className="text-sm text-slate-600 max-w-md mb-6">
          Ce lien d'invitation n'existe pas ou a expiré.
        </p>
        <a
          href="/invite/ogooue-maritime-2026"
          className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider"
        >
          Voir l'invitation officielle
        </a>
      </div>
    );
  }

  const handleToggleVolet = (id: string) => {
    setErrorMessage(null);
    setSelectedVolets((prev) => {
      if (prev.includes(id)) {
        return prev.filter((vId) => vId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (selectedVolets.length === 0) {
      setErrorMessage('Veuillez sélectionner au moins un volet ci-dessus.');
      return;
    }

    if (!company.trim() || !participantName.trim() || !phone.trim() || !email.trim()) {
      setErrorMessage('Veuillez remplir tous les champs obligatoires (*).');
      return;
    }

    setIsSubmitting(true);

    try {
      const randomCode = Math.floor(1000 + Math.random() * 9000);
      const code = `PNPE-OG-${randomCode}`;

      const newRSVP: RSVPRegistration = {
        id: `rsvp-${Date.now()}`,
        invitationId: invitation.id,
        confirmationCode: code,
        company: company.trim(),
        participantName: participantName.trim(),
        jobTitle: jobTitle.trim() || 'Représentant',
        phone: phone.trim(),
        email: email.trim().toLowerCase(),
        volets: selectedVolets,
        attendeesCount: Number(attendeesCount) || 1,
        comments: comments.trim() || undefined,
        createdAt: new Date().toISOString(),
      };

      await store.saveRSVP(newRSVP);

      try {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#4F46E5', '#10B981', '#FCD116', '#3B82F6']
        });
      } catch {
        // ignorer
      }

      setConfirmedRSVP(newRSVP);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error(err);
      setErrorMessage("Une erreur est survenue lors de l'enregistrement.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 relative">
      <OfficialHeader
        organization={invitation.organization}
      />

      {confirmedRSVP ? (
        // ÉCRAN DE CONFIRMATION OFFICIEL
        <div className="max-w-3xl mx-auto px-4 py-10 w-full animate-in fade-in duration-200">
          <ConfirmationPass
            rsvp={confirmedRSVP}
            invitation={invitation}
            onReset={() => {
              setConfirmedRSVP(null);
              setCompany('');
              setParticipantName('');
              setPhone('');
              setEmail('');
              setComments('');
            }}
          />
        </div>
      ) : (
        // MISE EN PAGE INVITÉ MODERNE
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* COLONNE GAUCHE : Affiche Officielle dans un cadre moderne */}
            <div className="lg:col-span-5 space-y-6">
              {invitation.imageUrl && (
                <div className="bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-3xl p-3 shadow-modern relative group">
                  <div className="relative overflow-hidden rounded-2xl bg-slate-900">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={invitation.imageUrl}
                      alt={invitation.title}
                      className="w-full h-auto object-cover cursor-pointer transition-transform duration-300 group-hover:scale-[1.02]"
                      onClick={() => setIsImageModalOpen(true)}
                    />
                    
                    <button
                      type="button"
                      onClick={() => setIsImageModalOpen(true)}
                      className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/85 hover:bg-slate-900 text-white text-xs font-semibold backdrop-blur-md transition-all shadow-md"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>Agrandir l'affiche</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Contexte & Description */}
              <div className="bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-modern space-y-3">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200/60 text-indigo-700 text-[11px] font-bold uppercase tracking-wider">
                  <Calendar className="w-3 h-3 text-indigo-600" />
                  Invitation Officielle
                </div>

                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-snug">
                  {invitation.title}
                </h1>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {invitation.introMessage}
                </p>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-mono">
                  <span>Réf : {invitation.slug}</span>
                  <span className="text-emerald-700 font-bold">● Inscriptions ouvertes</span>
                </div>
              </div>
            </div>

            {/* COLONNE DROITE : Sélection des Volets + Formulaire RSVP */}
            <div className="lg:col-span-7 space-y-8">
              
              {/* ÉTAPE 1 : CHOIX DES VOLETS */}
              <div>
                <div className="mb-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/60 text-blue-800 text-xs font-bold uppercase tracking-wider mb-2">
                    <span>Étape 1 sur 2</span>
                  </div>
                  <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                    Sélectionnez vos séquences de présence
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Cliquez sur les volets ci-dessous pour activer votre inscription au Volet 1, au Volet 2 ou aux deux.
                  </p>
                </div>

                {/* Blocs Volets Tactiles */}
                <div className="space-y-4">
                  {invitation.volets.map((volet) => (
                    <VoletCard
                      key={volet.id}
                      volet={volet}
                      isSelected={selectedVolets.includes(volet.id)}
                      onToggle={handleToggleVolet}
                    />
                  ))}
                </div>

                {/* Indicateur de sélection interactif */}
                <div className="mt-4 p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-between gap-2 text-xs font-medium">
                  {selectedVolets.length === 2 ? (
                    <div className="text-emerald-800 flex items-center gap-2 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>Vous participez aux DEUX VOLETS (Ven. 16/10 + Sam. 17/10)</span>
                    </div>
                  ) : selectedVolets.length === 1 ? (
                    <div className="text-indigo-800 flex items-center gap-2 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                      <span>
                        Vous participez à 1 VOLET : {selectedVolets[0] === 'volet-1' ? 'Volet 1 (Ven. 16/10)' : 'Volet 2 (Sam. 17/10)'}
                      </span>
                    </div>
                  ) : (
                    <div className="text-amber-800 flex items-center gap-2 font-bold">
                      <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                      <span>Veuillez cliquer sur au moins un volet ci-dessus.</span>
                    </div>
                  )}
                  <span className="text-slate-400 font-mono text-[11px] hidden sm:inline">
                    {selectedVolets.length}/2 sélectionné(s)
                  </span>
                </div>
              </div>

              {/* ÉTAPE 2 : FORMULAIRE D'ENREGISTREMENT RSVP */}
              <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-modern">
                <div className="mb-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
                    <span>Étape 2 sur 2</span>
                  </div>
                  <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                    Enregistrement de votre Entreprise
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Renseignez vos coordonnées pour valider votre pass de présence.
                  </p>
                </div>

                {errorMessage && (
                  <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Entreprise */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Nom de l'Entreprise / Opérateur *
                    </label>
                    <div className="relative">
                      <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        required
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder="Ex: TotalEnergies, Perenco, Assala Energy, PME..."
                        className="w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 text-slate-900 transition-all font-sans"
                      />
                    </div>
                  </div>

                  {/* Nom & Fonction */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Nom &amp; Prénom du Participant *
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          required
                          value={participantName}
                          onChange={(e) => setParticipantName(e.target.value)}
                          placeholder="Ex: Marc Obame"
                          className="w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 text-slate-900 transition-all font-sans"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Fonction / Poste
                      </label>
                      <div className="relative">
                        <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          value={jobTitle}
                          onChange={(e) => setJobTitle(e.target.value)}
                          placeholder="Ex: Directeur Général, DRH..."
                          className="w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 text-slate-900 transition-all font-sans"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Téléphone & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Téléphone / WhatsApp *
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+241 77 12 34 56"
                          className="w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 text-slate-900 transition-all font-sans"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Adresse E-mail *
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="contact@entreprise.ga"
                          className="w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 text-slate-900 transition-all font-sans"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Nombre de personnes */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Nombre de Personnes Présentes
                    </label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setAttendeesCount(num)}
                          className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${
                            attendeesCount === num
                              ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {num} {num === 1 ? 'pers.' : 'pers.'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Commentaires / Besoins Stand */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Commentaires ou Besoins <span className="text-slate-400 font-normal">(Optionnel, ex: réservation de stand)</span>
                    </label>
                    <textarea
                      rows={2}
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      placeholder="Ex: Nous souhaitons réserver un stand pour le Mini-salon du samedi..."
                      className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 text-slate-900 transition-all font-sans"
                    />
                  </div>

                  {/* Bouton de confirmation */}
                  <div className="pt-3">
                    <button
                      type="submit"
                      disabled={isSubmitting || selectedVolets.length === 0}
                      className={`w-full py-4 px-6 rounded-2xl font-bold text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md ${
                        selectedVolets.length === 0
                          ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-indigo-600/25 hover:scale-[1.01]'
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Validation en cours...</span>
                        </>
                      ) : (
                        <>
                          <span>Confirmer mon enregistrement</span>
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>
                    <p className="text-[11px] text-center text-slate-400 mt-2 font-medium">
                      Génère immédiatement votre pass d'accès officiel avec code unique.
                    </p>
                  </div>
                </form>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* Modal Affiche Agrandie */}
      {invitation.imageUrl && (
        <ImageModal
          isOpen={isImageModalOpen}
          imageUrl={invitation.imageUrl}
          onClose={() => setIsImageModalOpen(false)}
          title={`Affiche Officielle : ${invitation.title}`}
        />
      )}
    </div>
  );
}
