'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Mail,
  Copy,
  Check,
  ExternalLink,
  MessageCircle,
  Code,
  Eye,
  ArrowLeft,
  Loader2,
  Info,
  Send
} from 'lucide-react';
import { auth } from '@/lib/auth';
import { store } from '@/lib/store';
import { Invitation } from '@/lib/types';
import AdminLayout from '@/components/AdminLayout';
import { generateHtmlEmail, generateWhatsAppMessage } from '@/lib/emailTemplate';

interface AdminEmailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function AdminEmailPage({ params }: AdminEmailPageProps) {
  const resolvedParams = use(params);
  const invitationId = resolvedParams.id;
  const router = useRouter();

  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [baseUrl, setBaseUrl] = useState('');
  const [viewMode, setViewMode] = useState<'preview' | 'html' | 'whatsapp'>('preview');

  // État de copie
  const [copiedType, setCopiedType] = useState<'rich' | 'html' | 'whatsapp' | null>(null);

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push('/admin/login');
      return;
    }

    if (typeof window !== 'undefined') {
      setBaseUrl(window.location.origin);
    }

    async function loadInvitation() {
      let inv = await store.getInvitationById(invitationId);
      if (!inv) {
        inv = await store.getInvitationBySlug(invitationId);
      }
      setInvitation(inv);
      setLoading(false);
    }

    loadInvitation();
  }, [invitationId, router]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      </AdminLayout>
    );
  }

  if (!invitation) {
    return (
      <AdminLayout>
        <div className="p-8 text-center">
          <p className="text-slate-600 font-semibold">Invitation introuvable.</p>
        </div>
      </AdminLayout>
    );
  }

  const htmlContent = generateHtmlEmail(invitation, baseUrl || 'https://pnpe.ga');
  const whatsappContent = generateWhatsAppMessage(invitation, baseUrl || 'https://pnpe.ga');

  // Action 1 : Copie Visuelle Riche (text/html) pour coller dans Gmail / Outlook
  const handleCopyRichEmail = async () => {
    try {
      if (typeof window !== 'undefined' && navigator.clipboard && window.ClipboardItem) {
        const blobHtml = new Blob([htmlContent], { type: 'text/html' });
        const blobText = new Blob([htmlContent.replace(/<[^>]+>/g, ' ')], { type: 'text/plain' });
        await navigator.clipboard.write([
          new ClipboardItem({
            'text/html': blobHtml,
            'text/plain': blobText,
          }),
        ]);
        setCopiedType('rich');
        setTimeout(() => setCopiedType(null), 3000);
      } else {
        // Fallback
        await navigator.clipboard.writeText(htmlContent);
        setCopiedType('rich');
        setTimeout(() => setCopiedType(null), 3000);
      }
    } catch (err) {
      console.warn('Erreur ClipboardItem, fallback texte:', err);
      await navigator.clipboard.writeText(htmlContent);
      setCopiedType('rich');
      setTimeout(() => setCopiedType(null), 3000);
    }
  };

  // Action 2 : Copie Code HTML Brut
  const handleCopyHtmlCode = async () => {
    await navigator.clipboard.writeText(htmlContent);
    setCopiedType('html');
    setTimeout(() => setCopiedType(null), 3000);
  };

  // Action 3 : Copie Texte WhatsApp
  const handleCopyWhatsApp = async () => {
    await navigator.clipboard.writeText(whatsappContent);
    setCopiedType('whatsapp');
    setTimeout(() => setCopiedType(null), 3000);
  };

  return (
    <AdminLayout currentInvitationSlug={invitation.slug} currentInvitationId={invitation.id}>
      <div className="space-y-6">
        
        {/* Fil d'Ariane & Titre */}
        <div className="mb-6">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors mb-2 font-mono"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Retour à Mes Invitations</span>
          </Link>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-[#1E3A8A] border border-blue-200">
                GÉNÉRATEUR DE DIFFUSION OFFICIELLE
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl text-slate-900 mt-1">
                Kit E-mail &amp; Template d'Invitation
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 font-sans mt-0.5">
                {invitation.title}
              </p>
            </div>

            {/* 3 BOUTONS PRATIQUES À L'ADMIN */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Bouton 1 : Copier Mail prêt à coller */}
              <button
                onClick={handleCopyRichEmail}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded bg-[#0A192F] hover:bg-slate-800 text-white text-xs font-semibold uppercase tracking-wider transition-all shadow-subtle"
                title="Copie le rendu graphique complet dans le presse-papier pour faire Ctrl+V directement dans Gmail ou Outlook"
              >
                {copiedType === 'rich' ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4 text-[#FCD116]" />
                )}
                <span>
                  {copiedType === 'rich'
                    ? 'Mail copié ! (Faites Ctrl+V)'
                    : '1. Copier le Mail prêt à coller'}
                </span>
              </button>

              {/* Bouton 2 : Copier Code HTML */}
              <button
                onClick={handleCopyHtmlCode}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold tracking-wider border border-slate-200 transition-colors shadow-2xs"
                title="Copie le code source HTML pour votre logiciel d'e-mailing"
              >
                {copiedType === 'html' ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Code className="w-4 h-4 text-slate-600" />
                )}
                <span>{copiedType === 'html' ? 'Code copié !' : '2. Copier code HTML'}</span>
              </button>

              {/* Bouton 3 : Copier message WhatsApp */}
              <button
                onClick={handleCopyWhatsApp}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded bg-emerald-50 hover:bg-emerald-100 text-[#065F46] text-xs font-semibold tracking-wider border border-emerald-300 transition-colors shadow-2xs"
                title="Copie le texte mis en forme pour WhatsApp"
              >
                {copiedType === 'whatsapp' ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : (
                  <MessageCircle className="w-4 h-4 text-[#065F46]" />
                )}
                <span>
                  {copiedType === 'whatsapp' ? 'Texte copié !' : '3. Copier texte WhatsApp'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Encadré d'instruction pour l'Admin */}
        <div className="bg-blue-50/70 border border-blue-200 rounded-lg p-4 mb-6 text-xs text-blue-900 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-blue-950">
              Comment envoyer ce mail avec bouton intégré à vos contacts ?
            </p>
            <p className="text-blue-800 leading-relaxed font-sans">
              Cliquez sur le bouton noir <strong>"1. Copier le Mail prêt à coller"</strong>. Ouvrez ensuite votre messagerie (Gmail, Outlook ou Apple Mail), créez un nouveau message et faites simplement <kbd className="px-1.5 py-0.5 bg-white border border-blue-300 rounded font-mono font-bold text-slate-800">Ctrl + V</kbd> dans le corps du texte : l'affiche, les deux volets et le bouton RSVP s'insèrent immédiatement avec leur mise en page exacte.
            </p>
          </div>
        </div>

        {/* Onglets de Visualisation */}
        <div className="flex items-center gap-2 mb-4 border-b border-slate-200 pb-2">
          <button
            onClick={() => setViewMode('preview')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono font-semibold transition-colors ${
              viewMode === 'preview'
                ? 'bg-[#0A192F] text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Aperçu Visuel de l'E-mail</span>
          </button>

          <button
            onClick={() => setViewMode('html')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono font-semibold transition-colors ${
              viewMode === 'html'
                ? 'bg-[#0A192F] text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Code Source HTML Brut</span>
          </button>

          <button
            onClick={() => setViewMode('whatsapp')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono font-semibold transition-colors ${
              viewMode === 'whatsapp'
                ? 'bg-[#065F46] text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Message Formaté WhatsApp</span>
          </button>
        </div>

        {/* CONTENU DE L'ONGLET */}
        {viewMode === 'preview' && (
          <div className="bg-slate-100 border border-slate-300 rounded-lg p-4 sm:p-8 flex items-center justify-center overflow-auto shadow-inner">
            <div className="w-full max-w-[640px] bg-white border border-slate-300 rounded shadow-sm overflow-hidden">
              <iframe
                title="Aperçu E-mail"
                srcDoc={htmlContent}
                className="w-full h-[780px] border-none"
              />
            </div>
          </div>
        )}

        {viewMode === 'html' && (
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 overflow-auto max-h-[700px] text-xs font-mono text-emerald-400">
            <pre className="whitespace-pre-wrap">{htmlContent}</pre>
          </div>
        )}

        {viewMode === 'whatsapp' && (
          <div className="bg-white border border-slate-200 rounded-lg p-6 max-w-2xl mx-auto shadow-subtle space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-mono font-bold text-slate-500 uppercase">
                Texte prêt à envoyer par WhatsApp / SMS
              </span>
              <button
                onClick={handleCopyWhatsApp}
                className="px-2.5 py-1 rounded bg-emerald-600 text-white text-xs font-semibold"
              >
                Copier
              </button>
            </div>
            <div className="p-4 rounded bg-emerald-50/50 border border-emerald-100 font-sans text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
              {whatsappContent}
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}
