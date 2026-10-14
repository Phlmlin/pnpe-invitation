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

  // Téléchargement du Badge en PDF haute résolution (format fidèle sans écrasement)
  const handleDownloadPDF = async () => {
    if (!badgeRef.current || isGeneratingPdf) return;

    try {
      setIsGeneratingPdf(true);

      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const canvas = await html2canvas(badgeRef.current, {
        scale: 3, // 300+ DPI
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: 1200 // évite le rétrécissement mobile
      });

      const imgData = canvas.toDataURL('image/png');

      // Calcul dynamique des proportions exactes pour préserver le ratio sans déformation
      const pdfWidth = 105; // 105 mm de largeur (format badge standard)
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

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

  // Téléchargement direct en Image PNG nette (300 DPI)
  const handleDownloadPNG = async () => {
    if (!badgeRef.current || isGeneratingPng) return;

    try {
      setIsGeneratingPng(true);
      const html2canvas = (await import('html2canvas')).default;

      const canvas = await html2canvas(badgeRef.current, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: 1200
      });

      const imgData = canvas.toDataURL('image/png');
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
      {/* Conteneur Badge Physique (Format Pass Événementiel Officiel) */}
      <div className="w-full flex justify-center py-2 px-1">
        <div
          ref={badgeRef}
          id="participant-badge-printable"
          className="w-full max-w-[420px] bg-white rounded-3xl border-2 border-slate-200/90 shadow-2xl overflow-hidden relative text-slate-900 select-none"
          style={{ width: '420px' }}
        >
          {/* Fente d'accroche pour cordon de badge / Lanyard */}
          <div className="pt-3 pb-1 bg-slate-50 border-b border-slate-100 flex flex-col items-center">
            <div className="w-16 h-2 rounded-full bg-slate-300 border border-slate-400/40 shadow-inner" />
          </div>

          {/* Liseré Drapeau Gabon */}
          <div className="h-2 w-full flex">
            <div className="w-1/3 h-full bg-[#009E60]" />
            <div className="w-1/3 h-full bg-[#FCD116]" />
            <div className="w-1/3 h-full bg-[#3A75C4]" />
          </div>

          {/* En-tête Institutionnelle */}
          <div className="px-6 pt-5 pb-4 bg-gradient-to-b from-slate-50 via-white to-white text-center border-b border-slate-100">
            <div className="text-[10px] font-extrabold tracking-widest text-slate-500 uppercase">
              RÉPUBLIQUE GABONAISE • UNION - TRAVAIL - JUSTICE
            </div>

            <div className="flex items-center justify-center gap-3 my-3">
              <div className="w-14 h-14 rounded-2xl bg-white p-1 border border-slate-200/80 shadow-xs flex items-center justify-center flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logoBase64 || '/logo-pnpe.png'}
                  alt="Logo PNPE"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="text-left">
                <p className="text-xs font-black tracking-tight text-slate-900 leading-snug">
                  PÔLE NATIONAL DE PROMOTION DE L&apos;EMPLOI
                </p>
                <p className="text-[10px] font-bold text-indigo-700 tracking-wide uppercase mt-0.5">
                  DIRECTION GÉNÉRALE • GABON
                </p>
              </div>
            </div>

            {/* Ruban Rôle & Validation */}
            <div className="flex items-center justify-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />
                <span>BADGE D&apos;ACCÈS OFFICIEL</span>
              </div>
              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-800 text-[10px] font-extrabold tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                <span>INVITÉ</span>
              </div>
            </div>
          </div>

          {/* Corps du Badge : Identité & Informations Aérées */}
          <div className="p-6 text-center space-y-4">
            {/* Nom & Fonction du Participant */}
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                PARTICIPANT DÉSIGNÉ
              </p>
              <h3
                className="text-2xl font-black text-slate-900 tracking-tight uppercase break-words"
                style={{ lineHeight: 1.25 }}
              >
                {rsvp.participantName}
              </h3>
              {rsvp.jobTitle ? (
                <p className="text-xs font-bold text-slate-600 flex items-center justify-center gap-1 mt-1">
                  <User className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span>{rsvp.jobTitle}</span>
                </p>
              ) : null}
            </div>

            {/* Entreprise / Organisme (Bloc bien visible et contrasté) */}
            <div className="w-full bg-slate-50 border border-slate-200/90 rounded-2xl p-3.5 text-center shadow-xs">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                ENTREPRISE / ORGANISME
              </p>
              <p className="text-base font-black text-indigo-950 flex items-center justify-center gap-2 break-words">
                <Building className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                <span>{rsvp.company}</span>
              </p>
            </div>

            {/* Événement & Lieu (Sans troncature ni coupure de texte) */}
            <div className="w-full bg-slate-50 border border-slate-200/90 rounded-2xl p-3.5 text-left space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                ÉVÉNEMENT
              </p>
              <h4 className="text-xs font-black text-slate-900 leading-snug break-words">
                {invitation.title}
              </h4>
              {selectedVolets[0]?.location && (
                <p className="text-[11px] text-slate-600 font-medium flex items-center gap-1.5 pt-1.5 border-t border-slate-200/70">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span>{selectedVolets[0].location}</span>
                </p>
              )}
            </div>

            {/* Séquences / Volets Autorisés (Grand et Lisible) */}
            <div className="w-full space-y-2 text-left">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <span>SÉQUENCES RETENUES</span>
                <span className="text-slate-600 font-extrabold">
                  {selectedVolets.length} volet(s) validé(s)
                </span>
              </div>

              <div className="space-y-2">
                {selectedVolets.map((v) => {
                  const isBlue = v.theme === 'blue';
                  return (
                    <div
                      key={v.id}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-2 ${
                        isBlue
                          ? 'bg-blue-50/90 border-blue-200'
                          : 'bg-emerald-50/90 border-emerald-200'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider text-white ${
                            isBlue ? 'bg-blue-700' : 'bg-emerald-700'
                          }`}
                        >
                          {v.badge}
                        </span>
                        <p className="text-xs font-bold text-slate-900 leading-tight mt-1 truncate">
                          {v.title}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0 font-mono text-[10px] font-bold text-slate-700">
                        <div>{v.date}</div>
                        <div className="text-slate-500 font-medium">{v.time}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Code Unique de Validation (En grand et sécurisé) */}
            <div className="w-full bg-slate-950 text-white rounded-2xl p-4 text-center border border-slate-800 shadow-md">
              <p className="text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase">
                CODE UNIQUE D&apos;ÉMARGEMENT
              </p>
              <p className="text-2xl font-mono font-black tracking-widest text-amber-300 mt-1">
                {rsvp.confirmationCode}
              </p>
              <p className="text-[9px] text-slate-400 mt-1">
                À présenter à l&apos;accueil le jour de l&apos;événement
              </p>
            </div>
          </div>

          {/* Liseré Gabon en bas */}
          <div className="h-2 w-full flex">
            <div className="w-1/3 h-full bg-[#009E60]" />
            <div className="w-1/3 h-full bg-[#FCD116]" />
            <div className="w-1/3 h-full bg-[#3A75C4]" />
          </div>
        </div>
      </div>

      {/* Barre d'actions pour le téléchargement & l'impression */}
      {showActions && (
        <div className="w-full max-w-[420px] mt-4 flex flex-col gap-2.5">
          {/* Bouton Principal Télécharger PDF */}
          <button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPdf}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-slate-900 text-white font-extrabold text-sm uppercase tracking-wider shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50"
          >
            {isGeneratingPdf ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Génération du Badge PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                <span>Télécharger mon Badge (PDF)</span>
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
              <span>Image (PNG)</span>
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
            Conseil : Enregistrez le PDF ou l&apos;image sur votre smartphone pour le présenter à l&apos;entrée.
          </p>
        </div>
      )}
    </div>
  );
}
