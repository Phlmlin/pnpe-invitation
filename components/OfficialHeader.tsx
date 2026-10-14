import React from 'react';

interface OfficialHeaderProps {
  organization?: string;
  subtitle?: string;
}

export default function OfficialHeader({
  organization = "PÔLE NATIONAL DE PROMOTION DE L'EMPLOI (PNPE)",
}: OfficialHeaderProps) {
  return (
    <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 py-3.5 sm:py-4 flex items-center justify-between gap-3 text-left">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200/90 flex items-center justify-center p-1 shadow-sm flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-pnpe.png"
              alt="Logo Officiel PNPE"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-2 justify-start">
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 font-mono">
                RÉPUBLIQUE GABONAISE
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            </div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              {organization}
            </h1>
          </div>
        </div>
      </div>
    </header>
  );
}
