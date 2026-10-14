'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  Printer,
  Calendar,
  Building,
  User,
  Phone,
  Mail,
  MapPin,
  QrCode,
  IdCard,
  FileText,
  RotateCcw
} from 'lucide-react';
import { RSVPRegistration, Invitation } from '@/lib/types';
import ParticipantBadge from '@/components/ParticipantBadge';

interface ConfirmationPassProps {
  rsvp: RSVPRegistration;
  invitation: Invitation;
  onReset?: () => void;
}

export default function ConfirmationPass({
  rsvp,
  invitation,
  onReset
}: ConfirmationPassProps) {
  const [activeView, setActiveView] = useState<'badge' | 'details'>('badge');
  const selectedVolets = invitation.volets.filter((v) => rsvp.volets.includes(v.id));

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-3xl mx-auto my-4 space-y-6 animate-in fade-in zoom-in-95 duration-200">
      {/* Bannière de félicitations */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-modern text-center relative overflow-hidden">
        {/* Liseré supérieur Gabon */}
        <div className="absolute top-0 left-0 right-0 h-2 flex">
          <div className="w-1/3 h-full bg-[#009E60]" />
          <div className="w-1/3 h-full bg-[#FCD116]" />
          <div className="w-1/3 h-full bg-[#3A75C4]" />
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-xs uppercase tracking-wider mb-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Inscription confirmée avec succès</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Bienvenue, {rsvp.participantName} !
        </h2>
        <p className="text-sm text-slate-600 mt-1 max-w-lg mx-auto">
          Votre enregistrement pour <span className="font-semibold text-slate-800">{invitation.title}</span> a bien été pris en compte.
        </p>

        {/* Sélecteur de vue : Badge officiel vs Détails */}
        <div className="mt-6 inline-flex p-1 rounded-2xl bg-slate-100 border border-slate-200/80">
          <button
            onClick={() => setActiveView('badge')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all ${
              activeView === 'badge'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <IdCard className="w-4 h-4" />
            <span>Mon Badge Officiel (PDF)</span>
          </button>

          <button
            onClick={() => setActiveView('details')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all ${
              activeView === 'details'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Récapitulatif &amp; Programme</span>
          </button>
        </div>
      </div>

      {/* VUE 1 : BADGE OFFICIEL TÉLÉCHARGEABLE */}
      {activeView === 'badge' ? (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-modern">
          <div className="text-center mb-6">
            <h3 className="text-lg font-extrabold text-slate-900">
              Votre Badge Tour de Cou Officiel
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Téléchargez votre badge en PDF ou enregistrez-le comme image pour le présenter à l&apos;entrée.
            </p>
          </div>

          <ParticipantBadge
            rsvp={rsvp}
            invitation={invitation}
            showActions={true}
          />

          {onReset && (
            <div className="mt-8 pt-4 border-t border-slate-100 flex justify-center">
              <button
                onClick={onReset}
                className="inline-flex items-center gap-2 text-xs text-slate-500 hover:text-indigo-600 font-bold transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Enregistrer un autre participant</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        /* VUE 2 : RÉCAPITULATIF DÉTAILLÉ DU PASS */
        <div className="bg-white border border-slate-200/90 rounded-3xl shadow-modern overflow-hidden">
          {/* En-tête pass */}
          <div className="p-7 sm:p-8 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white text-center">
            <p className="text-xs text-indigo-200 font-mono uppercase tracking-widest font-bold">
              Code de Validation Unique
            </p>
            <p className="text-2xl sm:text-3xl font-mono font-black tracking-wider text-amber-300 mt-1">
              {rsvp.confirmationCode}
            </p>
            <p className="text-xs text-slate-300 mt-2">
              {invitation.organization}
            </p>
          </div>

          {/* Corps des informations */}
          <div className="p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-6 border-b border-slate-100">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                  ENTREPRISE / OPÉRATEUR
                </p>
                <p className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Building className="w-4 h-4 text-indigo-600" />
                  {rsvp.company}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                  REPRÉSENTANT &amp; FONCTION
                </p>
                <p className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-indigo-600" />
                  {rsvp.participantName}
                </p>
                <p className="text-xs text-slate-500 ml-6">{rsvp.jobTitle}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                  COORDONNÉES
                </p>
                <p className="text-xs text-slate-700 font-medium flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {rsvp.phone}
                </p>
                <p className="text-xs text-slate-700 font-medium flex items-center gap-2 mt-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {rsvp.email}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                  PARTICIPANTS ATTENDUS
                </p>
                <p className="text-sm font-bold text-slate-900">
                  {rsvp.attendeesCount} personne(s)
                </p>
                {rsvp.comments && (
                  <p className="text-xs text-slate-500 italic mt-1 line-clamp-2">
                    &ldquo;{rsvp.comments}&rdquo;
                  </p>
                )}
              </div>
            </div>

            {/* Séquences retenues */}
            <div>
              <h3 className="text-xs font-bold tracking-wider text-slate-500 uppercase mb-3 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                <span>SÉQUENCES RETENUES ({selectedVolets.length})</span>
              </h3>

              <div className="space-y-3">
                {selectedVolets.map((v) => {
                  const isBlue = v.theme === 'blue';
                  return (
                    <div
                      key={v.id}
                      className={`p-4 rounded-2xl border text-left ${
                        isBlue
                          ? 'bg-gradient-to-r from-blue-50 to-indigo-50/60 border-blue-200'
                          : 'bg-gradient-to-r from-emerald-50 to-teal-50/60 border-emerald-200'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span
                          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full text-white ${
                            isBlue ? 'bg-blue-600' : 'bg-emerald-600'
                          }`}
                        >
                          {v.badge}
                        </span>
                        <span className="font-mono text-xs font-bold text-slate-700">
                          {v.date} • {v.time}
                        </span>
                      </div>

                      <p className="text-sm font-bold text-slate-900">
                        {v.title}
                      </p>

                      <p className="text-xs text-slate-600 mt-2 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        {v.location}
                        {v.locationStatus === 'negotiation' && (
                          <span className="text-[10px] text-amber-700 font-bold">
                            (Négociation en cours)
                          </span>
                        )}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Consignes */}
            <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-xs text-slate-700 flex items-start gap-3">
              <QrCode className="w-7 h-7 text-indigo-600 flex-shrink-0" />
              <div>
                <p className="font-bold text-slate-900">
                  Badge &amp; Émargement sur place
                </p>
                <p className="mt-0.5 text-slate-600">
                  Présentez ce pass sur votre téléphone ou imprimez-le pour signer la feuille d&apos;émargement officielle lors de votre arrivée.
                </p>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
              {onReset && (
                <button
                  onClick={onReset}
                  className="text-xs text-slate-500 hover:text-slate-900 underline underline-offset-4 font-semibold"
                >
                  &larr; Enregistrer une autre personne
                </button>
              )}

              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold uppercase tracking-wider transition-colors shadow-sm ml-auto"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimer</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
