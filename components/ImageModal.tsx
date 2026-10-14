'use client';

import React, { useEffect } from 'react';
import { X, ZoomIn, Download } from 'lucide-react';

interface ImageModalProps {
  isOpen: boolean;
  imageUrl: string;
  onClose: () => void;
  title?: string;
}

export default function ImageModal({
  isOpen,
  imageUrl,
  onClose,
  title = "Affiche Officielle de l'Événement"
}: ImageModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl w-full max-h-[90vh] bg-[#0A192F] border border-slate-700 rounded-lg shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Barre d'outils du modal */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-[#050C17]">
          <div className="flex items-center gap-2">
            <span className="font-serif text-sm text-slate-200">{title}</span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={imageUrl}
              download="affiche_officielle_pnpe.svg"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Ouvrir en taille réelle</span>
            </a>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Zone d'affichage image */}
        <div className="overflow-auto p-4 flex items-center justify-center bg-[#07111E]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={title}
            className="max-h-[75vh] w-auto object-contain rounded border border-slate-800 shadow-md"
          />
        </div>
      </div>
    </div>
  );
}
