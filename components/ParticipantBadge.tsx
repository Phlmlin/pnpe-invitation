'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Download,
  Printer,
  CheckCircle2,
  Building,
  User,
  MapPin,
  Loader2,
  ShieldCheck,
  Image as ImageIcon
} from 'lucide-react';
import { RSVPRegistration, Invitation } from '@/lib/types';

interface ParticipantBadgeProps {
  rsvp: RSVPRegistration;
  invitation: Invitation;
  showActions?: boolean;
}

export default function ParticipantBadge({
  rsvp,
  invitation,
  showActions = true
}: ParticipantBadgeProps) {
  const badgeRef = useRef<HTMLDivElement>(null);
  const [logoBase64, setLogoBase64] = useState<string>('');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isGeneratingPng, setIsGeneratingPng] = useState(false);

  // Pré-charger le logo officiel en base64 pour un rendu 100% net et sans problème CORS dans html2canvas
  useEffect(() => {
    async function loadLogo() {
      try {
        const res = await fetch('/logo-pnpe.png');
        if (!res.ok) return;
        const blob = await res.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            setLogoBase64(reader.result);
          }
        };
        reader.readAsDataURL(blob);
      } catch {
        // Fallback
      }
    }

    loadLogo();
  }, []);

  // Téléchargement du Badge en PDF haute résolution au format carte exact 5.5 x 9.5 cm
  const handleDownloadPDF = async () => {
    if (!badgeRef.current || isGeneratingPdf) return;

    try {
      setIsGeneratingPdf(true);

      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const canvas = await html2canvas(badgeRef.current, {
        scale: 3, // 300+ DPI haute résolution
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        onclone: (clonedDoc) => {
          const badge = clonedDoc.getElementById('participant-badge-printable');
          if (badge) {
            badge.style.boxShadow = 'none';
            badge.style.transform = 'none';
          }
        }
      });

      const imgData = canvas.toDataURL('image/png', 1.0);

      // Format carte d'accès officiel : 5.5 cm x 9.5 cm (55 mm x 95 mm)
      const pdfWidth = 55; // 55 mm
      const pdfHeight = 95; // 95 mm

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [pdfWidth, pdfHeight]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
      pdf.save(`badge-pnpe-${rsvp.confirmationCode.toLowerCase()}.pdf`);
    } catch (err) {
      console.error('Erreur lors de la création du PDF:', err);
      alert('Une erreur est survenue lors de la création du PDF. Vous pouvez utiliser le bouton Imprimer.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Téléchargement direct en Image PNG nette (format 5.5 x 9.5 cm, ratio 11:19 à 300+ DPI)
  const handleDownloadPNG = async () => {
    if (!badgeRef.current || isGeneratingPng) return;

    try {
      setIsGeneratingPng(true);
      const html2canvas = (await import('html2canvas')).default;

      const canvas = await html2canvas(badgeRef.current, {
        scale: 3, // 385px * 3 = 1155px, 665px * 3 = 1995px (ratio exact 5.5 : 9.5)
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        onclone: (clonedDoc) => {
          const badge = clonedDoc.getElementById('participant-badge-printable');
          if (badge) {
            badge.style.boxShadow = 'none';
            badge.style.transform = 'none';
          }
        }
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.download = `badge-pnpe-${rsvp.confirmationCode.toLowerCase()}.png`;
      link.href = imgData;
      link.click();
    } catch (err) {
      console.error('Erreur lors du téléchargement image:', err);
    } finally {
      setIsGeneratingPng(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const selectedVolets = invitation.volets.filter((v) => rsvp.volets.includes(v.id));

  return (
    <div className="flex flex-col items-center w-full">
      {/* Mention du format officiel standard */}
      <div className="mb-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-bold text-slate-600">
        <span>Format badge officiel : 5,5 × 9,5 cm</span>
      </div>

      {/* Conteneur Badge Physique (Format Pass Événementiel Officiel 5.5 x 9.5 cm) */}
      <div className="w-full flex justify-center py-2 px-1">
        <div
          ref={badgeRef}
          id="participant-badge-printable"
          className="bg-white rounded-3xl border-2 border-slate-200/90 shadow-2xl overflow-hidden relative text-slate-900 select-none flex flex-col justify-between"
          style={{
            width: '385px',
            height: '665px',
            minHeight: '665px',
            maxHeight: '665px',
            boxSizing: 'border-box'
          }}
        >
          {/* Fente d'accroche pour cordon de badge / Lanyard */}
          <div className="pt-2 pb-1 bg-slate-50 border-b border-slate-100 flex flex-col items-center flex-shrink-0">
            <div className="w-12 h-1.5 rounded-full bg-slate-300 border border-slate-400/40 shadow-inner" />
          </div>

          {/* Liseré Drapeau Gabon Supérieur */}
          <div className="h-1.5 w-full flex flex-shrink-0">
            <div className="w-1/3 h-full bg-[#009E60]" />
            <div className="w-1/3 h-full bg-[#FCD116]" />
            <div className="w-1/3 h-full bg-[#3A75C4]" />
          </div>

          {/* En-tête Institutionnelle Compacte & Équilibrée */}
          <div className="px-4 pt-3 pb-2 bg-gradient-to-b from-slate-50 via-white to-white text-center border-b border-slate-100 flex-shrink-0">
            <div className="text-[9px] font-extrabold tracking-widest text-slate-500 uppercase">
              RÉPUBLIQUE GABONAISE • UNION - TRAVAIL - JUSTICE
            </div>

            <div className="flex items-center justify-center gap-2.5 my-2">
              <div className="w-11 h-11 rounded-xl bg-white p-1 border border-slate-200/80 shadow-xs flex items-center justify-center flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logoBase64 || '/logo-pnpe.png'}
                  alt="Logo PNPE"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="text-left">
                <p className="text-[11px] font-black tracking-tight text-slate-900 leading-tight">
                  PÔLE NATIONAL DE PROMOTION DE L&apos;EMPLOI
                </p>
                <p className="text-[9px] font-bold text-indigo-700 tracking-wide uppercase mt-0.5">
                  DIRECTION GÉNÉRALE • GABON
                </p>
              </div>
            </div>

            {/* Ruban Rôle & Validation */}
            <div className="flex items-center justify-center gap-2 mt-0.5">
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[9px] font-black uppercase tracking-wider shadow-xs">
                <CheckCircle2 className="w-3 h-3 text-emerald-200" />
                <span>BADGE D&apos;ACCÈS OFFICIEL</span>
              </div>
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-800 text-[9px] font-extrabold tracking-wider">
                <ShieldCheck className="w-3 h-3 text-indigo-600" />
                <span>{rsvp.company?.toLowerCase().includes('demandeur') ? "CANDIDAT" : "INVITÉ"}</span>
              </div>
            </div>
          </div>

          {/* Corps du Badge : Identité, Événement, Séquences & Code */}
          <div className="px-4 py-2 text-center flex-1 flex flex-col justify-between overflow-visible">
            {/* Nom & Fonction du Participant */}
            <div className="space-y-0.5">
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                PARTICIPANT DÉSIGNÉ
              </p>
              <h3
                className="text-lg font-black text-slate-900 tracking-tight uppercase break-words leading-tight"
                style={{ overflow: 'visible' }}
              >
                {rsvp.participantName}
              </h3>
              {rsvp.jobTitle ? (
                <p className="text-[11px] font-bold text-slate-600 flex items-center justify-center gap-1 mt-0.5">
                  <User className="w-3 h-3 text-slate-400 flex-shrink-0" />
                  <span>{rsvp.jobTitle}</span>
                </p>
              ) : null}
            </div>

            {/* Entreprise / Organisme / Statut */}
            <div className="w-full bg-slate-50 border border-slate-200/90 rounded-xl px-3 py-1.5 text-center shadow-xs">
              <p className="text-[8px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                {rsvp.company?.toLowerCase().includes('demandeur') ? 'PROFIL & STATUT' : 'ENTREPRISE / ORGANISME'}
              </p>
              <p className="text-xs font-black text-indigo-950 flex items-center justify-center gap-1.5 break-words">
                {rsvp.company?.toLowerCase().includes('demandeur') ? (
                  <User className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                ) : (
                  <Building className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                )}
                <span>{rsvp.company}</span>
              </p>
            </div>

            {/* Événement & Lieu */}
            <div className="w-full bg-slate-50 border border-slate-200/90 rounded-xl px-3 py-1.5 text-left space-y-0.5">
              <p className="text-[8px] font-bold uppercase tracking-wider text-slate-400">
                ÉVÉNEMENT
              </p>
              <h4 className="text-[10px] font-black text-slate-900 leading-snug break-words">
                {invitation.title}
              </h4>
              {selectedVolets[0]?.location && (
                <p className="text-[9px] text-slate-600 font-medium flex items-center gap-1 pt-0.5 border-t border-slate-200/70">
                  <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                  <span>{selectedVolets[0].location}</span>
                </p>
              )}
            </div>

            {/* Séquences / Volets Retenus (Ultra lisibles, sans troncature, bordures d'accent) */}
            <div className="w-full space-y-1 text-left">
              <div className="flex items-center justify-between text-[8px] font-bold uppercase tracking-wider text-slate-400">
                <span>SÉQUENCES RETENUES</span>
                <span className="text-slate-600 font-extrabold">
                  {selectedVolets.length} volet(s) validé(s)
                </span>
              </div>

              <div className="space-y-1">
                {selectedVolets.map((v) => {
                  const isBlue = v.theme === 'blue';
                  return (
                    <div
                      key={v.id}
                      className={`px-2.5 py-1.5 rounded-xl border border-l-4 text-left transition-all ${
                        isBlue
                          ? 'bg-blue-50/90 border-blue-200 border-l-blue-600'
                          : 'bg-emerald-50/90 border-emerald-200 border-l-emerald-600'
                      }`}
                      style={{ overflow: 'visible' }}
                    >
                      {/* Ligne En-tête : Badge à gauche, Date et Heure à droite */}
                      <div className="flex items-center justify-between gap-2 pb-0.5 border-b border-slate-200/60">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider text-white shadow-xs ${
                            isBlue ? 'bg-blue-700' : 'bg-emerald-700'
                          }`}
                        >
                          {v.badge}
                        </span>
                        <span className="text-[9px] font-bold text-slate-700 text-right">
                          {v.date} • {v.time}
                        </span>
                      </div>

                      {/* Intitulé COMPLET du volet : sans truncate, hauteur de ligne confortable */}
                      <p
                        className="text-[10px] font-bold text-slate-900 leading-snug pt-1 pb-0.5 break-words"
                        style={{ overflow: 'visible', whiteSpace: 'normal', lineHeight: '1.3' }}
                      >
                        {v.title}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Code Unique de Validation */}
            <div className="w-full bg-slate-950 text-white rounded-xl px-3 py-1.5 text-center border border-slate-800 shadow-sm flex-shrink-0">
              <p className="text-[8px] font-mono font-bold tracking-widest text-slate-400 uppercase">
                CODE UNIQUE D&apos;ÉMARGEMENT
              </p>
              <p className="text-xl font-mono font-black tracking-widest text-amber-300 my-0.5">
                {rsvp.confirmationCode}
              </p>
              <p className="text-[8px] text-slate-400">
                À présenter à l&apos;accueil le jour de l&apos;événement
              </p>
            </div>
          </div>

          {/* Liseré Gabon Inférieur */}
          <div className="h-1.5 w-full flex flex-shrink-0">
            <div className="w-1/3 h-full bg-[#009E60]" />
            <div className="w-1/3 h-full bg-[#FCD116]" />
            <div className="w-1/3 h-full bg-[#3A75C4]" />
          </div>
        </div>
      </div>

      {/* Barre d'actions pour le téléchargement & l'impression */}
      {showActions && (
        <div className="w-full max-w-[385px] mt-4 flex flex-col gap-2.5">
          {/* Bouton Principal Télécharger PDF */}
          <button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPdf}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-slate-900 text-white font-extrabold text-sm uppercase tracking-wider shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50"
          >
            {isGeneratingPdf ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Génération du Badge PDF (5.5 × 9.5 cm)...</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                <span>Télécharger mon Badge (PDF 5.5 × 9.5 cm)</span>
              </>
            )}
          </button>

          {/* Boutons secondaires : Image PNG & Imprimer */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleDownloadPNG}
              disabled={isGeneratingPng}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all shadow-sm disabled:opacity-50"
              title="Télécharger l'image pour mobile ou WhatsApp"
            >
              {isGeneratingPng ? (
                <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
              ) : (
                <ImageIcon className="w-4 h-4 text-slate-600" />
              )}
              <span>Image PNG (5.5 × 9.5 cm)</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all shadow-sm"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>Imprimer</span>
            </button>
          </div>

          <p className="text-[11px] text-center text-slate-500 font-medium">
            Format carte officiel : 5,5 × 9,5 cm (compatible avec tous les porte-badges standards).
          </p>
        </div>
      )}

      {/* Style d'impression dédié pour impression exacte au format carte 5.5 x 9.5 cm */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #participant-badge-printable,
          #participant-badge-printable * {
            visibility: visible;
          }
          #participant-badge-printable {
            position: fixed;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            width: 55mm !important;
            height: 95mm !important;
            min-height: 95mm !important;
            max-height: 95mm !important;
            box-shadow: none !important;
            border: 1px solid #cbd5e1 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
    </div>
  );
}
