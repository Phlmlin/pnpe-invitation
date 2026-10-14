'use client';

import React from 'react';
import { Check, Calendar, Clock, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';
import { VoletConfig } from '@/lib/types';

interface VoletCardProps {
  volet: VoletConfig;
  isSelected: boolean;
  onToggle: (id: string) => void;
  disabled?: boolean;
}

export default function VoletCard({
  volet,
  isSelected,
  onToggle,
  disabled = false,
}: VoletCardProps) {
  const isBlue = volet.theme === 'blue';

  return (
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
      className={`relative p-5 sm:p-6 rounded-2xl border transition-all duration-200 cursor-pointer select-none text-left shadow-sm ${
        isSelected
          ? isBlue
            ? 'bg-gradient-to-br from-indigo-50/90 via-white to-blue-50/80 border-indigo-500 ring-2 ring-indigo-500/30 shadow-glow'
            : 'bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/80 border-emerald-500 ring-2 ring-emerald-500/30 shadow-glow-emerald'
          : 'bg-white hover:bg-slate-50/80 border-slate-200 hover:border-slate-300'
      } ${disabled ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-0.5'}`}
    >
      {/* Badge indicateur sélectionné en haut à droite */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase shadow-xs ${
              isBlue
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-500/20'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-emerald-500/20'
            }`}
          >
            <span>{volet.badge}</span>
          </span>

          <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            {volet.date}
          </span>

          <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
            {volet.time}
          </span>
        </div>

        {/* Bouton Checkbox Stylé / Switch tactile */}
        <div
          className={`flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
            isSelected
              ? isBlue
                ? 'bg-indigo-600 border-indigo-600 text-white scale-110 shadow-sm shadow-indigo-500/50'
                : 'bg-emerald-600 border-emerald-600 text-white scale-110 shadow-sm shadow-emerald-500/50'
              : 'border-slate-300 bg-white text-transparent'
          }`}
          aria-hidden="true"
        >
          <Check className="w-4 h-4 stroke-[3]" />
        </div>
      </div>

      {/* Titre / Objet du rendez-vous */}
      <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug tracking-tight mb-2">
        {volet.title}
      </h3>

      {/* Description complémentaire */}
      {volet.description && (
        <p className="text-xs sm:text-sm text-slate-600 font-sans leading-relaxed mb-4">
          {volet.description}
        </p>
      )}

      {/* Lieu et Statut du lieu */}
      <div className="pt-3 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-slate-700 font-medium">
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

      {/* Pied de carte d'interaction */}
      <div className="mt-3.5 pt-2 flex items-center justify-between text-xs">
        <span
          className={`font-semibold text-xs flex items-center gap-1 ${
            isSelected
              ? isBlue
                ? 'text-indigo-700'
                : 'text-emerald-700'
              : 'text-slate-400'
          }`}
        >
          {isSelected ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Sélectionné pour mon enregistrement</span>
            </>
          ) : (
            <span>+ Cliquez pour sélectionner ce volet</span>
          )}
        </span>
      </div>
    </div>
  );
}
