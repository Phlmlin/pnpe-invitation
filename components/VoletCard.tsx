'use client';

import React, { useState } from 'react';
import { Check, MapPin, CheckCircle2, AlertCircle, PlusCircle, Maximize2, Eye } from 'lucide-react';
import { VoletConfig } from '@/lib/types';
import ImageModal from '@/components/ImageModal';

interface VoletCardProps {
  volet: VoletConfig;
  isSelected: boolean;
  onToggle: (id: string) => void;
  disabled?: boolean;
  hideImage?: boolean;
}

export default function VoletCard({
  volet,
  isSelected,
  onToggle,
  disabled = false,
  hideImage = false,
}: VoletCardProps) {
  const isBlue = volet.theme === 'blue';
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  const rawBadge = volet.badge || '';
  const displayBadge = rawBadge
    .replace(/^volet\s*(\d+)/i, 'Activité $1')
    .replace(/volet/gi, 'Activité') || (volet.id === 'volet-2' ? 'Activité 2' : 'Activité 1');

  return (
    <>
      <div
        onClick={() => !disabled && onToggle(volet.id)}
        role="checkbox"
        aria-checked={isSelected}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if (!disabled && (e.key === ' ' || e.key === 'Enter')) {
            e.preventDefault();
            onToggle(volet.id);
          }
        }}
        className={`relative p-5 sm:p-6 lg:p-7 rounded-3xl border-2 transition-all duration-200 cursor-pointer select-none text-left shadow-sm h-full flex flex-col justify-between ${
          isSelected
            ? isBlue
              ? 'bg-gradient-to-br from-indigo-50/95 via-white to-blue-50/90 border-indigo-600 ring-4 ring-indigo-500/20 shadow-modern-lg scale-[1.008]'
              : 'bg-gradient-to-br from-emerald-50/95 via-white to-teal-50/90 border-emerald-600 ring-4 ring-emerald-500/20 shadow-modern-lg scale-[1.008]'
            : 'bg-white hover:bg-slate-50/90 border-slate-200 hover:border-slate-400'
        } ${disabled ? 'opacity-85 cursor-default' : 'hover:-translate-y-0.5'}`}
      >
        {/* Contenu principal : Disposition Image + Infos */}
        <div className={`flex flex-col ${!hideImage && volet.imageUrl ? 'md:flex-row gap-6 items-stretch' : 'gap-4'} w-full flex-1 justify-between`}>
          {/* Image dédiée à l'activité : affichée uniquement si non masquée */}
          {!hideImage && volet.imageUrl && (
            <div className="w-full md:w-72 lg:w-84 xl:w-96 flex-shrink-0 group/img relative rounded-2xl overflow-hidden border border-slate-200/90 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 shadow-md flex flex-col justify-between min-h-[260px] sm:min-h-[300px] md:min-h-[340px]">
              {/* Badge supérieur sur le visuel */}
              <div className="absolute top-2.5 left-2.5 z-10">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950/85 backdrop-blur-md text-[10px] font-bold text-white border border-white/10 uppercase tracking-wider shadow-xs">
                  <Eye className="w-3 h-3 text-indigo-400" />
                  <span>Aperçu Visuel</span>
                </span>
              </div>

              {/* Image principale : object-contain pour que tout le texte du flyer reste parfaitement lisible */}
              <div className="w-full h-full flex items-center justify-center p-2 sm:p-3 relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={volet.imageUrl}
                  alt={volet.title || displayBadge}
                  className="w-full h-auto max-h-[320px] md:max-h-[380px] object-contain transition-transform duration-300 group-hover/img:scale-[1.02]"
                />
              </div>

              {/* Barre d'action inférieure sur l'image */}
              <div className="p-2 bg-gradient-to-t from-slate-950/90 via-slate-950/60 to-transparent flex items-center justify-between text-white text-[11px] z-10">
                <span className="text-[10px] text-slate-300 font-medium px-1 truncate">
                  {displayBadge}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsZoomOpen(true);
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-white font-bold backdrop-blur-md transition-colors shadow-xs border border-white/20 cursor-pointer"
                  title="Agrandir l'affiche de l'activité en plein écran"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Agrandir</span>
                </button>
              </div>
            </div>
          )}

          {/* Colonne d'informations de l'activité */}
          <div className="flex-1 min-w-0 w-full flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              {/* Ligne d'en-tête : Badge + Date/Heure + Checkbox */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center px-3.5 py-1 rounded-full text-xs font-black tracking-wide uppercase shadow-xs ${
                      isBlue
                        ? 'bg-gradient-to-r from-blue-700 to-indigo-700 text-white shadow-blue-500/20'
                        : 'bg-gradient-to-r from-emerald-700 to-teal-700 text-white shadow-emerald-500/20'
                    }`}
                  >
                    <span>{displayBadge}</span>
                  </span>

                  <span className="font-mono text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
                    {volet.date}
                  </span>

                  <span className="font-mono text-xs font-extrabold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
                    {volet.time}
                  </span>
                </div>

                {/* Bouton Checkbox Stylé */}
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-2xl border-2 flex items-center justify-center transition-all ${
                    isSelected
                      ? isBlue
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-500/40'
                        : 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-500/40'
                      : 'border-slate-300 bg-slate-50 text-slate-400'
                  }`}
                  aria-hidden="true"
                >
                  {isSelected ? (
                    <Check className="w-5 h-5 stroke-[3]" />
                  ) : (
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                  )}
                </div>
              </div>

              {/* Titre de l'activité */}
              <h3 className="text-base sm:text-lg lg:text-xl font-extrabold text-slate-900 leading-snug tracking-tight">
                {volet.title}
              </h3>

              {/* Description de l'activité */}
              {volet.description && (
                <p className="text-xs sm:text-sm text-slate-600 font-sans leading-relaxed whitespace-pre-line">
                  {volet.description}
                </p>
              )}
            </div>

            {/* Lieu et Statut du lieu */}
            <div className="pt-3 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                <div className="w-5 h-5 rounded-md bg-slate-100 flex items-center justify-center text-slate-500">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <span>{volet.location}</span>
              </div>

              <div>
                {volet.locationStatus === 'negotiation' ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-300/80">
                    <AlertCircle className="w-3 h-3 text-amber-600" />
                    NÉGOCIATION EN COURS
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-300/80">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    LIEU CONFIRMÉ
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Pied de carte d'interaction explicite */}
        <div className="mt-3.5 pt-2.5 border-t border-dashed border-slate-200 flex items-center justify-between text-xs font-bold">
          {isSelected ? (
            <span
              className={`inline-flex items-center gap-1.5 ${
                isBlue ? 'text-indigo-700' : 'text-emerald-700'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Activité cochée pour mon inscription</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-800">
              <PlusCircle className="w-4 h-4 text-slate-400" />
              <span>Cliquer pour cocher cette activité</span>
            </span>
          )}

          <span
            className={`text-[11px] uppercase font-mono px-2 py-0.5 rounded ${
              isSelected
                ? isBlue
                  ? 'bg-indigo-100 text-indigo-800'
                  : 'bg-emerald-100 text-emerald-800'
                : 'bg-slate-100 text-slate-500'
            }`}
          >
            {isSelected ? 'Inscrit' : 'Non coché'}
          </span>
        </div>
      </div>

      {/* Modal Zoom Image Activité */}
      {volet.imageUrl && (
        <ImageModal
          isOpen={isZoomOpen}
          imageUrl={volet.imageUrl}
          onClose={() => setIsZoomOpen(false)}
          title={`Visuel : ${volet.title || displayBadge}`}
        />
      )}
    </>
  );
}
