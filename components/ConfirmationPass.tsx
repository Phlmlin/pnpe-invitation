'use client';

import React from 'react';
import { CheckCircle2, Printer, Calendar, Building, User, Phone, Mail, MapPin, ArrowRight, QrCode } from 'lucide-react';
import { RSVPRegistration, Invitation } from '@/lib/types';

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
  const selectedVolets = invitation.volets.filter((v) => rsvp.volets.includes(v.id));

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-2xl mx-auto my-6 bg-white border border-slate-200/90 rounded-3xl shadow-modern-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
      {/* Liseré supérieur Gabon */}
      <div className="h-2 w-full flex">
        <div className="w-1/3 h-full bg-[#009E60]" />
        <div className="w-1/3 h-full bg-[#FCD116]" />
        <div className="w-1/3 h-full bg-[#3A75C4]" />
      </div>

      {/* En-tête du Pass Digital */}
      <div className="p-7 sm:p-9 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white text-center relative overflow-hidden">
        <div className="w-16 h-16 rounded-2xl bg-white p-2 shadow-md mx-auto mb-3 flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-pnpe.png" alt="Logo PNPE" className="w-full h-full object-contain" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider mb-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          Enregistrement Confirmé
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Pass d'Accès Officiel
        </h2>
        <p className="text-xs text-slate-300 font-medium mt-1">
          {invitation.organization}
        </p>

        {/* Code de confirmation stylisé */}
        <div className="mt-5 inline-block bg-slate-950/80 border border-indigo-500/30 px-6 py-3 rounded-2xl shadow-inner">
          <p className="text-[10px] uppercase font-mono tracking-widest text-slate-400 font-bold">
            CODE DE VALIDATION UNIQUE
          </p>
          <p className="text-xl sm:text-2xl font-mono font-extrabold tracking-wider text-amber-300 mt-0.5">
            {rsvp.confirmationCode}
          </p>
        </div>
      </div>

      {/* Corps du Pass */}
      <div className="p-6 sm:p-8 space-y-6">
        {/* Infos Entreprise & Représentant */}
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

        {/* Détail des volets retenus */}
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
          <QrCode className="w-8 h-8 text-indigo-600 flex-shrink-0" />
          <div>
            <p className="font-bold text-slate-900">
              Badge &amp; Émargement sur place
            </p>
            <p className="mt-0.5 text-slate-600">
              Présentez ce pass sur votre téléphone ou imprimé le jour de l'événement pour signer la feuille d'émargement officielle.
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
            <span>Imprimer / PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
}
