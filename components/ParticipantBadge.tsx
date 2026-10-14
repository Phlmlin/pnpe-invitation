'use client';

import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import {
  Download,
  Printer,
  CheckCircle2,
  Building,
  User,
  Calendar,
  MapPin,
  Loader2,
  ShieldCheck,
  Image as ImageIcon,
  Sparkles
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
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [logoBase64, setLogoBase64] = useState<string>('');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isGeneratingPng, setIsGeneratingPng] = useState(false);

  // Générer le QR Code officiel scannable
  useEffect(() => {
    async function generateQR() {
      try {
        const qrData = JSON.stringify({
          app: 'PNPE-INVITATION',
          code: rsvp.confirmationCode,
          nom: rsvp.participantName,
          entreprise: rsvp.company,
          evenement: invitation.title,
          statut: 'VALIDE'
        });

        const url = await QRCode.toDataURL(qrData, {
          width: 320,
          margin: 1,
          color: {
            dark: '#0f172a',
            light: '#ffffff'
          },
          errorCorrectionLevel: 'M'
        });
        setQrCodeUrl(url);
      } catch (err) {
        console.error('Erreur génération QR Code:', err);
      }
    }

    generateQR();
  }, [rsvp, invitation]);

  // Pré-charger le logo en base64 pour garantir un rendu 100% net sans problème CORS dans html2canvas
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
        // Fallback sur le chemin direct
      }
    }

    loadLogo();
  }, []);

  // Téléchargement du Badge en PDF haute résolution
  const handleDownloadPDF = async () => {
    if (!badgeRef.current || isGeneratingPdf) return;

    try {
      setIsGeneratingPdf(true);

      // Import dynamique côté client
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const canvas = await html2canvas(badgeRef.current, {
        scale: 3, // 300+ DPI pour une netteté d'impression parfaite
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false
      });

      const imgData = canvas.toDataURL('image/png');

      // Dimensions standard de badge tour de cou : 100mm de large x 150mm de haut
      const pdfWidth = 100;
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
      alert('Une erreur est survenue lors du téléchargement du PDF. Vous pouvez utiliser le bouton Imprimer.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Téléchargement direct en Image PNG (Idéal smartphone / WhatsApp)
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
        logging: false
      });

      const imgData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `badge-pnpe-${rsvp.confirmationCode.toLowerCase()}.png`;
      link.href = imgData;
      link.click();
    } catch (err) {
      console.error('Erreur lors du téléchargement de image:', err);
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
          className="w-full max-w-[390px] bg-white rounded-3xl border-2 border-slate-200/90 shadow-2xl overflow-hidden relative text-slate-900 select-none transition-all"
          style={{ minHeight: '560px' }}
        >
          {/* Fente d'accroche pour cordon de badge / Lanyard */}
          <div className="pt-3 pb-1 bg-slate-50 border-b border-slate-100 flex flex-col items-center">
            <div className="w-14 h-2 rounded-full bg-slate-300 border border-slate-400/40 shadow-inner" />
          </div>

          {/* Liseré Drapeau Gabon */}
          <div className="h-2 w-full flex">
            <div className="w-1/3 h-full bg-[#009E60]" />
            <div className="w-1/3 h-full bg-[#FCD116]" />
            <div className="w-1/3 h-full bg-[#3A75C4]" />
          </div>

          {/* En-tête Institutionnelle */}
          <div className="px-5 pt-4 pb-3 bg-gradient-to-b from-slate-50 via-white to-white text-center border-b border-slate-100">
            <div className="flex items-center justify-center gap-1 text-[9px] font-extrabold tracking-widest text-slate-500 uppercase">
              <span>RÉPUBLIQUE GABONAISE</span>
              <span className="text-slate-300">•</span>
              <span>UNION - TRAVAIL - JUSTICE</span>
            </div>

            <div className="flex items-center justify-center gap-3 my-2.5">
              <div className="w-12 h-12 rounded-xl bg-white p-1 border border-slate-200/80 shadow-sm flex items-center justify-center flex-shrink-0">
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
                  Direction Générale • Gabon
                </p>
              </div>
            </div>

            {/* Ruban Rôle & Validation */}
            <div className="mt-1 flex items-center justify-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
                <CheckCircle2 className="w-3 h-3 text-emerald-200" />
                <span>BADGE D&apos;ACCÈS OFFICIEL</span>
              </div>
              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-800 text-[10px] font-extrabold tracking-wider">
                <ShieldCheck className="w-3 h-3 text-indigo-600" />
                <span>INVITÉ</span>
              </div>
            </div>
          </div>

          {/* Corps du Badge : Identité du Participant */}
          <div className="p-5 text-center space-y-4">
            {/* Nom & Prénom */}
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                PARTICIPANT DÉSIGNÉ
              </p>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase leading-snug break-words">
                {rsvp.participantName}
              </h3>
              {rsvp.jobTitle ? (
                <p className="text-xs font-semibold text-slate-600 flex items-center justify-center gap-1">
                  <User className="w-3 h-3 text-slate-400" />
                  {rsvp.jobTitle}
                </p>
              ) : null}
            </div>

            {/* Entreprise / Entité */}
            <div className="inline-block w-full max-w-[320px] bg-slate-50 border border-slate-200/80 rounded-2xl p-2.5 shadow-sm">
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                ENTREPRISE / ORGANISME
              </p>
              <p className="text-sm font-black text-indigo-950 flex items-center justify-center gap-1.5 break-words">
                <Building className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                <span>{rsvp.company}</span>
              </p>
            </div>

            {/* Titre de l'événement & Localisation */}
            <div className="pt-1 pb-1 border-y border-dashed border-slate-200 text-left px-2">
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                ÉVÉNEMENT
              </p>
              <p className="text-xs font-extrabold text-slate-900 line-clamp-2 mt-0.5">
                {invitation.title}
              </p>
              <div className="flex items-center justify-between mt-1 text-[10px] text-slate-500 font-medium">
                <span className="flex items-center gap-1 truncate max-w-[200px]">
                  <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                  <span className="truncate">{selectedVolets[0]?.location || 'Lieu Officiel'}</span>
                </span>
                {selectedVolets.length > 0 && (
                  <span className="font-bold text-slate-700 flex-shrink-0">
                    {selectedVolets.length} volet(s)
                  </span>
                )}
              </div>
            </div>

            {/* Badges des Volets autorisés */}
            {selectedVolets.length > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-1.5 pt-0.5">
                {selectedVolets.map((v) => (
                  <span
                    key={v.id}
                    className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-slate-900 text-white"
                  >
                    {v.badge}
                  </span>
                ))}
              </div>
            )}

            {/* QR Code de Sécurité & Validation */}
            <div className="pt-2 flex flex-col items-center justify-center">
              <div className="p-2 bg-white rounded-2xl border-2 border-slate-900 shadow-sm inline-block">
                {qrCodeUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={qrCodeUrl}
                    alt="QR Code de Validation"
                    className="w-28 h-28 object-contain"
                  />
                ) : (
                  <div className="w-28 h-28 bg-slate-100 animate-pulse rounded-lg" />
                )}
              </div>

              {/* Code Unique de Validation */}
              <div className="mt-2">
                <p className="text-[9px] font-mono font-bold tracking-widest text-slate-400 uppercase">
                  CODE UNIQUE D&apos;ÉMARGEMENT
                </p>
                <p className="text-base font-mono font-black tracking-wider text-slate-900 bg-slate-100 px-3 py-0.5 rounded-lg border border-slate-200 inline-block mt-0.5">
                  {rsvp.confirmationCode}
                </p>
              </div>
            </div>
          </div>

          {/* Pied du Badge sécurisé */}
          <div className="bg-slate-900 text-white px-4 py-2.5 text-center border-t border-slate-800">
            <p className="text-[9px] font-medium text-slate-300 leading-tight">
              Présentation obligatoire de ce badge à l&apos;accueil pour l&apos;émargement officiel.
            </p>
          </div>

          {/* Liseré Gabon en bas */}
          <div className="h-1.5 w-full flex">
            <div className="w-1/3 h-full bg-[#009E60]" />
            <div className="w-1/3 h-full bg-[#FCD116]" />
            <div className="w-1/3 h-full bg-[#3A75C4]" />
          </div>
        </div>
      </div>

      {/* Barre d'actions pour le téléchargement & l'impression */}
      {showActions && (
        <div className="w-full max-w-[390px] mt-4 flex flex-col gap-2.5">
          {/* Bouton Principal Télécharger PDF */}
          <button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPdf}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-slate-900 text-white font-extrabold text-sm uppercase tracking-wider shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50"
          >
            {isGeneratingPdf ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Génération du PDF officiel...</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                <span>Télécharger le Badge (PDF)</span>
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
            Conseil : Enregistrez le PDF ou l&apos;image sur votre smartphone pour le présenter à l&apos;accueil.
          </p>
        </div>
      )}
    </div>
  );
}
