'use client';

import React, { useEffect, useState } from 'react';
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
  Send,
  Plus,
  Layers
} from 'lucide-react';
import { auth } from '@/lib/auth';
import { store } from '@/lib/store';
import { Invitation } from '@/lib/types';
import AdminLayout from '@/components/AdminLayout';
import { generateHtmlEmail, generateWhatsAppMessage } from '@/lib/emailTemplate';

export default function GlobalAdminEmailPage() {
  const router = useRouter();

  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [selectedInvId, setSelectedInvId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [baseUrl, setBaseUrl] = useState('');
  const [viewMode, setViewMode] = useState<'preview' | 'html' | 'whatsapp'>('preview');
  const [copiedType, setCopiedType] = useState<'rich' | 'html' | 'whatsapp' | null>(null);

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push('/admin/login');
      return;
    }

    if (typeof window !== 'undefined') {
      setBaseUrl(window.location.origin);
    }

    async function loadInvitations() {
      const list = await store.getInvitations();
      setInvitations(list);
      if (list.length > 0) {
        setSelectedInvId((prev) => (prev && list.some((i) => i.id === prev) ? prev : list[0].id));
      }
      setLoading(false);
    }

    loadInvitations();
    return store.subscribe(loadInvitations);
  }, [router]);

  const selectedInvitation = invitations.find((i) => i.id === selectedInvId);

  const htmlContent = selectedInvitation
    ? generateHtmlEmail(selectedInvitation, baseUrl || 'https://pnpe.ga')
    : '';
  const whatsappContent = selectedInvitation
    ? generateWhatsAppMessage(selectedInvitation, baseUrl || 'https://pnpe.ga')
    : '';

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
        await navigator.clipboard.writeText(htmlContent);
        setCopiedType('rich');
        setTimeout(() => setCopiedType(null), 3000);
      }
    } catch {
      await navigator.clipboard.writeText(htmlContent);
      setCopiedType('rich');
      setTimeout(() => setCopiedType(null), 3000);
    }
  };

  const handleCopyHtmlCode = () => {
    navigator.clipboard.writeText(htmlContent);
    setCopiedType('html');
    setTimeout(() => setCopiedType(null), 3000);
  };

  const handleCopyWhatsApp = () => {
    navigator.clipboard.writeText(whatsappContent);
    setCopiedType('whatsapp');
    setTimeout(() => setCopiedType(null), 3000);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center p-16">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      </AdminLayout>
    );
  }

  if (invitations.length === 0) {
    return (
      <AdminLayout>
        <div className="bg-white/80 backdrop-blur-md border border-dashed border-slate-300 rounded-3xl p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Mail className="w-8 h-8 text-indigo-500" />
          </div>
          <div className="max-w-md">
            <h3 className="text-lg font-bold text-slate-800">Aucune invitation active</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Créez d'abord une invitation pour générer votre kit d'invitation e-mail et WhatsApp.
            </p>
          </div>
          <Link
            href="/admin/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-indigo-600/25"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Créer une invitation</span>
          </Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      currentInvitationSlug={selectedInvitation?.slug}
      currentInvitationId={selectedInvitation?.id}
    >
      <div className="space-y-6">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors mb-2 font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Retour au Tableau de Bord</span>
          </Link>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/60 text-indigo-700 text-xs font-bold uppercase tracking-wider">
                <Mail className="w-3 h-3 text-indigo-600" />
                <span>Kit de Diffusion Officiel</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                Générateur E-mail &amp; WhatsApp
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleCopyRichEmail}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold tracking-wider transition-all shadow-sm shadow-indigo-500/20"
                title="Copier le design visuel pour coller dans Outlook ou Gmail"
              >
                {copiedType === 'rich' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedType === 'rich' ? 'Copié pour Outlook/Gmail !' : 'Copier pour Outlook/Gmail'}</span>
              </button>

              <button
                onClick={handleCopyWhatsApp}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-200 text-xs font-bold tracking-wider transition-colors"
                title="Copier le message textuel formaté pour WhatsApp"
              >
                {copiedType === 'whatsapp' ? <Check className="w-4 h-4" /> : <MessageCircle className="w-4 h-4" />}
                <span>{copiedType === 'whatsapp' ? 'Copié pour WhatsApp !' : 'Copier texte WhatsApp'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* SÉLECTEUR D'INVITATION (SI MULTIPLES) */}
        {invitations.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs font-bold uppercase text-slate-400 whitespace-nowrap mr-1">
              Invitation :
            </span>
            {invitations.map((inv) => (
              <button
                key={inv.id}
                onClick={() => setSelectedInvId(inv.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                  inv.id === selectedInvId
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-500/20'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {inv.title}
              </button>
            ))}
          </div>
        )}

        {/* ONGLETS DE FORMAT */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
          <button
            onClick={() => setViewMode('preview')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'preview'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Aperçu Visuel de l'E-mail</span>
          </button>

          <button
            onClick={() => setViewMode('whatsapp')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'whatsapp'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Message WhatsApp</span>
          </button>

          <button
            onClick={() => setViewMode('html')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'html'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-indigo-700 hover:bg-indigo-50'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Code HTML Brut</span>
          </button>
        </div>

        {/* CONTENU SELON LE MODE */}
        {viewMode === 'preview' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-modern p-6 sm:p-10 max-w-3xl mx-auto">
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          </div>
        )}

        {viewMode === 'whatsapp' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-modern p-6 max-w-2xl mx-auto space-y-4">
            <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200/70 font-mono text-xs whitespace-pre-wrap text-slate-800">
              {whatsappContent}
            </div>
            <button
              onClick={handleCopyWhatsApp}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2"
            >
              <Copy className="w-4 h-4" />
              <span>Copier le texte WhatsApp</span>
            </button>
          </div>
        )}

        {viewMode === 'html' && (
          <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 max-w-4xl mx-auto space-y-4">
            <div className="flex justify-between items-center text-xs text-slate-400 pb-2 border-b border-slate-800">
              <span className="font-mono">template-email.html</span>
              <button
                onClick={handleCopyHtmlCode}
                className="text-indigo-400 hover:text-white font-bold flex items-center gap-1"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copier le HTML</span>
              </button>
            </div>
            <pre className="text-xs font-mono text-slate-300 max-h-96 overflow-y-auto p-4 bg-slate-950 rounded-2xl">
              {htmlContent}
            </pre>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
