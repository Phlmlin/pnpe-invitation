'use client';

import React from 'react';
import { RSVPRegistration } from '@/lib/types';
import { PieChart, TrendingUp, Award, Users } from 'lucide-react';

interface AnalyticsChartsProps {
  rsvps: RSVPRegistration[];
}

/**
 * Regroupe un profil brut en grandes familles professionnelles
 */
export function groupProfile(rawProfile?: string | null): string {
  // 1. Si le profil est vide ou null, retourne "Non renseigné"
  if (!rawProfile || !String(rawProfile).trim()) {
    return 'Non renseigné';
  }

  const trimmed = String(rawProfile).trim();
  // 2. Convertis la chaîne en minuscules pour la vérification
  const lower = trimmed.toLowerCase();

  // 3. Mots-clés (matching) pour regrouper par grandes familles
  if (lower.includes('comptable') || lower.includes('comptabilité') || lower.includes('comptabilite')) {
    return 'Comptable';
  }
  if (
    lower.includes('informati') ||
    lower.includes('développeur') ||
    lower.includes('developpeur') ||
    lower.includes('devellop') ||
    lower.includes('réseau') ||
    lower.includes('reseau')
  ) {
    return 'Informatique & IT';
  }
  if (lower.includes('assistant')) {
    return 'Assistant(e)';
  }
  if (
    lower.includes('logistique') ||
    lower.includes('magasinier') ||
    lower.includes('réceptionniste') ||
    lower.includes('receptionniste')
  ) {
    return 'Logistique';
  }
  if (lower.includes('mécanicien') || lower.includes('mecanicien')) {
    return 'Mécanicien';
  }
  if (lower.includes('commercial') || lower.includes('vente') || lower.includes('vendeuse')) {
    return 'Commercial / Vente';
  }

  // 4. (Règle par défaut) Coupe au premier caractère spécial (virgule, slash, tiret du bas)
  const mainPart = trimmed.split(/[,/_]/)[0].trim();
  if (!mainPart) {
    return 'Non renseigné';
  }
  return mainPart.charAt(0).toUpperCase() + mainPart.slice(1);
}

export default function AnalyticsCharts({ rsvps }: AnalyticsChartsProps) {
  const total = rsvps.length;

  // Extraction robuste du numéro PNPE
  const getPnpeNumber = (r: RSVPRegistration): string => {
    if (r.comments?.includes('Numéro PNPE :')) {
      return r.comments.replace('Numéro PNPE :', '').trim();
    }
    if (r.company?.includes('N° PNPE:')) {
      return r.company.split('N° PNPE:')[1]?.replace(')', '').trim();
    }
    return '';
  };

  const countWithPnpe = rsvps.filter((r) => {
    const num = getPnpeNumber(r);
    return !!num && num !== '-';
  }).length;
  const countWithoutPnpe = total - countWithPnpe;

  const pctWith = total > 0 ? Math.round((countWithPnpe / total) * 100) : 0;
  const pctWithout = total > 0 ? 100 - pctWith : 0;

  // Calcul pour le Donut SVG
  const radius = 42;
  const circumference = 2 * Math.PI * radius; // ~ 263.89
  const strokeWith = (pctWith / 100) * circumference;
  const strokeWithout = (pctWithout / 100) * circumference;

  // Regroupement par grandes familles et comptage via reduce
  const profileCounts = rsvps.reduce<Record<string, number>>((acc, r) => {
    const raw = r.jobTitle || '';
    const family = groupProfile(raw);
    acc[family] = (acc[family] || 0) + 1;
    return acc;
  }, {});

  const topProfiles = Object.entries(profileCounts)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const distinctProfilesCount = Object.keys(profileCounts).length;
  const maxProfileCount = topProfiles[0]?.count || 1;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 my-2">
      {/* GRAPHIQUE 1 : TAUX D'IMMATRICULATION PNPE (DONUT SVG) */}
      <div className="bg-white/95 backdrop-blur-md p-6 rounded-3xl border border-slate-200/90 shadow-modern flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                <PieChart className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  Taux d'immatriculation PNPE
                </h3>
                <p className="text-[11px] text-slate-400 font-medium">
                  Répartition des demandeurs selon leur N° PNPE
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-mono font-bold text-[10px]">
              {total} inscrits
            </span>
          </div>

          {total === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              Aucune donnée d'immatriculation disponible.
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-2">
              {/* SVG Donut */}
              <div className="relative w-36 h-36 flex items-center justify-center flex-shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  {/* Cercle de fond */}
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="transparent"
                    stroke="#f1f5f9"
                    strokeWidth="11"
                  />
                  {/* Segment Avec N° PNPE (Émeraude) */}
                  {pctWith > 0 && (
                    <circle
                      cx="50"
                      cy="50"
                      r={radius}
                      fill="transparent"
                      stroke="#10b981"
                      strokeWidth="11"
                      strokeDasharray={`${strokeWith} ${circumference}`}
                      strokeDashoffset={0}
                      strokeLinecap="round"
                    />
                  )}
                  {/* Segment Sans N° PNPE (Ambre) */}
                  {pctWithout > 0 && (
                    <circle
                      cx="50"
                      cy="50"
                      r={radius}
                      fill="transparent"
                      stroke="#f59e0b"
                      strokeWidth="11"
                      strokeDasharray={`${strokeWithout} ${circumference}`}
                      strokeDashoffset={-strokeWith}
                      strokeLinecap="round"
                    />
                  )}
                </svg>

                {/* Valeur centrale */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                  <span className="text-2xl font-black text-slate-900 tracking-tight leading-none">
                    {pctWith}%
                  </span>
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold mt-0.5">
                    Immatriculés
                  </span>
                </div>
              </div>

              {/* Légende détaillée */}
              <div className="w-full sm:w-auto space-y-3">
                <div className="flex items-center justify-between sm:justify-start gap-4 p-2.5 rounded-2xl bg-emerald-50/70 border border-emerald-100">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-xs flex-shrink-0" />
                    <div>
                      <p className="text-xs font-extrabold text-emerald-950">Avec N° PNPE</p>
                      <p className="text-[10px] text-emerald-700">Demandeurs identifiés</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-emerald-900">{countWithPnpe}</span>
                    <span className="text-[11px] font-bold text-emerald-700 ml-1">({pctWith}%)</span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-start gap-4 p-2.5 rounded-2xl bg-amber-50/70 border border-amber-100">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-500 shadow-xs flex-shrink-0" />
                    <div>
                      <p className="text-xs font-extrabold text-amber-950">Sans N° PNPE</p>
                      <p className="text-[10px] text-amber-700">À immatriculer / guider</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-amber-900">{countWithoutPnpe}</span>
                    <span className="text-[11px] font-bold text-amber-700 ml-1">({pctWithout}%)</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* GRAPHIQUE 2 : TOP 5 DES PROFILS INSCRITS */}
      <div className="bg-white/95 backdrop-blur-md p-6 rounded-3xl border border-slate-200/90 shadow-modern flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  Top 5 des Profils inscrits
                </h3>
                <p className="text-[11px] text-slate-400 font-medium">
                  Métiers les plus représentés parmi les participants
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 font-mono font-bold text-[10px]">
              {distinctProfilesCount} profils distincts
            </span>
          </div>

          {topProfiles.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              Aucun profil enregistré pour le moment.
            </div>
          ) : (
            <div className="space-y-3.5 py-1">
              {topProfiles.map((p, index) => {
                const percentage = total > 0 ? Math.round((p.count / total) * 100) : 0;
                const barWidth = Math.max(8, Math.round((p.count / maxProfileCount) * 100));

                return (
                  <div key={p.label} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 truncate max-w-[70%]">
                        <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-black flex items-center justify-center flex-shrink-0">
                          #{index + 1}
                        </span>
                        <span className="font-bold text-slate-800 truncate" title={p.label}>
                          {p.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className="font-extrabold text-slate-900 tabular-nums">{p.count}</span>
                        <span className="text-[10px] text-slate-400">({percentage}%)</span>
                      </div>
                    </div>

                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-500 transition-all duration-500"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
