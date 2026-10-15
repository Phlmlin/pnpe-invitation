'use client';

import React, { useState } from 'react';
import { Eye, Maximize2, CheckCircle2, PlusCircle } from 'lucide-react';
import { VoletConfig } from '@/lib/types';
import ImageModal from '@/components/ImageModal';

interface ActivityPosterProps {
  volet: VoletConfig;
  isSelected: boolean;
  onToggle: (id: string) => void;
  disabled?: boolean;
  hideSelectionUI?: boolean;
}

export default function ActivityPoster({
  volet,
  isSelected,
  onToggle,
  disabled = false,
  hideSelectionUI = false,
}: ActivityPosterProps) {
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const isBlue = volet.theme === 'blue';

  const rawBadge = volet.badge || '';
  const displayBadge = rawBadge
    .replace(/^volet\s*(\d+)/i, 'Activité $1')
    .replace(/volet/gi, 'Activité') || (volet.id === 'volet-2' ? 'Activité 2' : 'Activité 1');

  if (!volet.imageUrl) return null;

  return (
    <>
      <div
        onClick={() => !disabled && !hideSelectionUI && onToggle(volet.id)}
        role={hideSelectionUI ? undefined : "button"}
        tabIndex={disabled || hideSelectionUI ? -1 : 0}
        onKeyDown={(e) => {
          if (!disabled && !hideSelectionUI && (e.key === ' ' || e.key === 'Enter')) {
            e.preventDefault();
            onToggle(volet.id);
          }
        }}
        className={`group relative rounded-3xl border-2 transition-all duration-200 select-none overflow-hidden flex flex-col justify-between shadow-md h-full min-h-[340px] sm:min-h-[380px] lg:min-h-[420px] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 ${
          hideSelectionUI ? 'cursor-default' : 'cursor-pointer'
        } ${
          isSelected
            ? isBlue
              ? 'border-indigo-600 ring-4 ring-indigo-500/25 shadow-modern-lg scale-[1.008]'
              : 'border-emerald-600 ring-4 ring-emerald-500/25 shadow-modern-lg scale-[1.008]'
            : 'border-slate-800 hover:border-slate-600 hover:-translate-y-0.5'
        }`}
      >
        {/* En-tête supérieur du visuel */}
        <div className="p-3.5 sm:p-4 flex items-center justify-between gap-2 z-10 bg-gradient-to-b from-slate-950/90 to-transparent">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider text-white shadow-xs ${
              isBlue ? 'bg-indigo-600/90' : 'bg-emerald-600/90'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Affiche {displayBadge}</span>
          </span>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsZoomOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 hover:bg-white/25 text-white text-xs font-bold backdrop-blur-md transition-colors shadow-xs border border-white/20 cursor-pointer"
            title="Agrandir l'affiche en plein écran"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Plein écran</span>
          </button>
        </div>

        {/* Zone centrale de l'affiche : object-contain pour afficher l'intégralité du visuel sans rognage */}
        <div className="w-full flex-1 flex items-center justify-center p-3 sm:p-5 relative min-h-[260px] sm:min-h-[300px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={volet.imageUrl}
            alt={volet.title || displayBadge}
            className="w-full h-auto max-h-[380px] lg:max-h-[440px] object-contain rounded-xl transition-transform duration-300 group-hover:scale-[1.02]"
          />
        </div>

        {/* Pied d'affiche avec état de sélection */}
        {!hideSelectionUI && (
          <div className="p-3.5 sm:p-4 bg-slate-950/80 backdrop-blur-sm border-t border-slate-800/80 flex items-center justify-between text-xs z-10">
            <div className="flex items-center gap-2">
              {isSelected ? (
                <span className={`inline-flex items-center gap-1.5 font-bold ${
                  isBlue ? 'text-indigo-400' : 'text-emerald-400'
                }`}>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{displayBadge} cochée</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-slate-400 font-medium group-hover:text-slate-200">
                  <PlusCircle className="w-4 h-4 text-slate-500" />
                  <span>Cliquer pour cocher</span>
                </span>
              )}
            </div>

            <span
              className={`text-[10px] uppercase font-mono px-2.5 py-0.5 rounded font-bold ${
                isSelected
                  ? isBlue
                    ? 'bg-indigo-900/60 text-indigo-300 border border-indigo-700/50'
                    : 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/50'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {isSelected ? 'Sélectionnée' : 'Non cochée'}
            </span>
          </div>
        )}
      </div>

      {/* Modal Zoom Plein Écran */}
      <ImageModal
        isOpen={isZoomOpen}
        imageUrl={volet.imageUrl}
        onClose={() => setIsZoomOpen(false)}
        title={`Affiche officielle : ${volet.title || displayBadge}`}
      />
    </>
  );
}
