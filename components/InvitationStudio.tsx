'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Upload,
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Eye,
  Layers,
  Link as LinkIcon
} from 'lucide-react';
import { store } from '@/lib/store';
import { Invitation, VoletConfig, VoletTheme, LocationStatus } from '@/lib/types';
import VoletCard from '@/components/VoletCard';

interface InvitationStudioProps {
  initialInvitation?: Invitation;
  isEditing?: boolean;
}

export default function InvitationStudio({
  initialInvitation,
  isEditing = false
}: InvitationStudioProps) {
  const router = useRouter();

  const [title, setTitle] = useState(
    initialInvitation?.title || "Action auprès des opérateurs économiques de l'Ogooué-Maritime"
  );
  const [slug, setSlug] = useState(
    initialInvitation?.slug || 'ogooue-maritime-2026'
  );
  const [organization, setOrganization] = useState(
    initialInvitation?.organization || "Pôle National de Promotion de l'Emploi - PNPE"
  );
  const [introMessage, setIntroMessage] = useState(
    initialInvitation?.introMessage ||
      "La Direction Générale du PNPE invite les chefs d'entreprises et directeurs des ressources humaines de la province de l'Ogooué-Maritime à participer à deux séquences de concertation et d'action stratégique."
  );
  const [imageUrl, setImageUrl] = useState(initialInvitation?.imageUrl || '');
  const [displayLargeImage, setDisplayLargeImage] = useState(
    initialInvitation?.displayLargeImage ?? true
  );
  const [status, setStatus] = useState<'active' | 'closed'>(
    initialInvitation?.status || 'active'
  );

  const [volets, setVolets] = useState<VoletConfig[]>(
    initialInvitation?.volets || [
      {
        id: 'volet-1',
        badge: 'Volet 1',
        theme: 'blue',
        title: 'Présentation des Journées Économiques et du Forum International de l\'Emploi (27 et 28 novembre 2026 à Paris)',
        date: 'Vendredi 16 octobre 2026',
        time: 'À 10h00',
        location: 'Centre Culturel Total',
        locationStatus: 'confirmed',
        description: 'Présentation exclusive des opportunités d\'investissement, de sponsoring et de visibilité internationale pour les entreprises gabonaises lors des Journées Économiques à Paris.'
      },
      {
        id: 'volet-2',
        badge: 'Volet 2',
        theme: 'emerald',
        title: 'Mini-salon de l\'emploi',
        date: 'Samedi 17 octobre 2026',
        time: 'De 9h à 17h',
        location: 'Centre Culturel Total',
        locationStatus: 'negotiation',
        description: 'Plateforme opérationnelle de recrutement direct, mise en relation qualifiée entre entreprises locales et demandeurs d\'emploi certifiés.'
      }
    ]
  );

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (!isEditing) {
      const generatedSlug = newTitle
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      setSlug(generatedSlug || 'nouvelle-invitation');
    }
  };

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Veuillez déposer un fichier image valide.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setImageUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAddVolet = () => {
    const nextNumber = volets.length + 1;
    const isEven = nextNumber % 2 === 0;
    const newVolet: VoletConfig = {
      id: `volet-${Date.now()}`,
      badge: `Volet ${nextNumber}`,
      theme: isEven ? 'emerald' : 'blue',
      title: `Rendez-vous Volet ${nextNumber}`,
      date: 'Date à définir',
      time: 'À 10h00',
      location: 'Centre Culturel Total',
      locationStatus: 'confirmed',
      description: 'Description des objectifs de cette séquence.'
    };
    setVolets([...volets, newVolet]);
  };

  const handleUpdateVolet = (index: number, field: keyof VoletConfig, value: any) => {
    setVolets((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleDeleteVolet = (index: number) => {
    if (volets.length <= 1) {
      alert('Une invitation doit comporter au moins un volet.');
      return;
    }
    setVolets((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    try {
      const inv: Invitation = {
        id: initialInvitation?.id || `inv-${Date.now()}`,
        slug: slug.trim().toLowerCase(),
        title: title.trim(),
        organization: organization.trim(),
        introMessage: introMessage.trim(),
        imageUrl: imageUrl || undefined,
        displayLargeImage,
        status,
        volets,
        createdAt: initialInvitation?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await store.saveInvitation(inv);
      setSuccess(true);
      setTimeout(() => {
        router.push('/admin');
      }, 1000);
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la sauvegarde.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!initialInvitation) return;
    if (
      window.confirm(
        `Êtes-vous sûr de vouloir supprimer définitivement cette invitation "${initialInvitation.title}" ?\n\nToutes les inscriptions associées seront également supprimées.`
      )
    ) {
      setSaving(true);
      try {
        await store.deleteInvitation(initialInvitation.id);
        router.push('/admin');
      } catch (err) {
        console.error(err);
        alert('Erreur lors de la suppression de l\'invitation.');
        setSaving(false);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full flex-1">
      {/* Barre d'action */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors mb-1 font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Retour au Tableau de Bord</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {isEditing ? "Modifier l'Invitation" : "Créer une Nouvelle Invitation"}
          </h1>
          <p className="text-xs text-slate-500">
            Configurez votre affiche, vos volets de rendez-vous et partagez le lien généré.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {success && (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Invitation enregistrée !
            </span>
          )}

          {isEditing && initialInvitation && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-4 py-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold uppercase tracking-wider transition-colors border border-rose-200 cursor-pointer"
              title="Supprimer définitivement cette invitation"
            >
              <Trash2 className="w-4 h-4 text-rose-600" />
              <span>Supprimer</span>
            </button>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-indigo-600/25 cursor-pointer"
          >
            <Save className="w-4 h-4 text-amber-300" />
            <span>{saving ? 'Enregistrement...' : 'Enregistrer et Partager'}</span>
          </button>
        </div>
      </div>

      {/* Disposition Bicolonne */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Formulaire */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Section 1 : Titre & Lien */}
          <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-3xl p-6 shadow-modern space-y-4">
            <h2 className="text-xs font-bold tracking-wider text-indigo-700 uppercase flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-600" />
              1. Titre &amp; Lien de Partage
            </h2>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Titre de l'Invitation *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Ex: Action auprès des opérateurs économiques..."
                className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-600 text-slate-900 font-bold"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Lien Public (/invite/...) *
                </label>
                <div className="relative">
                  <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="ogooue-maritime-2026"
                    className="w-full pl-9 pr-3 py-2 text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded-xl text-indigo-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Statut
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full p-2 text-xs font-bold bg-white border border-slate-200 rounded-xl text-slate-800"
                >
                  <option value="active">Active (Inscriptions ouvertes)</option>
                  <option value="closed">Fermée (Inscriptions closes)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Message d'Introduction
              </label>
              <textarea
                rows={3}
                value={introMessage}
                onChange={(e) => setIntroMessage(e.target.value)}
                className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 leading-relaxed focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Section 2 : Flyer */}
          <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-3xl p-6 shadow-modern space-y-4">
            <h2 className="text-xs font-bold tracking-wider text-emerald-700 uppercase flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              2. Visuel / Affiche Officielle
            </h2>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleFileUpload(e.dataTransfer.files[0]);
                }
              }}
              className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                dragOver
                  ? 'border-indigo-600 bg-indigo-50/50 scale-[1.01]'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
              }`}
            >
              <Upload className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-800">
                Glissez votre affiche ici
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                PNG, JPG ou SVG
              </p>

              <label className="mt-3 inline-block">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUpload(e.target.files[0]);
                    }
                  }}
                />
                <span className="px-4 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-xs">
                  Choisir un fichier
                </span>
              </label>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">
                Ou URL d'image :
              </label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://.../affiche.jpg"
                className="w-full p-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
              />
            </div>
          </div>

          {/* Section 3 : Volets */}
          <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-3xl p-6 shadow-modern space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold tracking-wider text-amber-700 uppercase flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                3. Configuration des Volets ({volets.length})
              </h2>

              <button
                type="button"
                onClick={handleAddVolet}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ajouter un Volet</span>
              </button>
            </div>

            <div className="space-y-4">
              {volets.map((v, idx) => (
                <div
                  key={v.id}
                  className={`p-5 rounded-2xl border text-xs space-y-3 ${
                    v.theme === 'blue'
                      ? 'bg-blue-50/50 border-blue-200'
                      : 'bg-emerald-50/50 border-emerald-200'
                  }`}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/70">
                    <span className="font-bold text-slate-800 text-sm">
                      #{idx + 1} • {v.badge}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteVolet(idx)}
                      className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Nom du Badge (ex: Volet 1)
                      </label>
                      <input
                        type="text"
                        value={v.badge}
                        onChange={(e) => handleUpdateVolet(idx, 'badge', e.target.value)}
                        className="w-full p-2 bg-white border border-slate-200 rounded-xl font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Thème Couleur
                      </label>
                      <select
                        value={v.theme}
                        onChange={(e) => handleUpdateVolet(idx, 'theme', e.target.value as VoletTheme)}
                        className="w-full p-2 bg-white border border-slate-200 rounded-xl font-bold"
                      >
                        <option value="blue">Bleu Institutionnel</option>
                        <option value="emerald">Vert Émeraude</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Objet / Titre du Rendez-vous *
                    </label>
                    <input
                      type="text"
                      value={v.title}
                      onChange={(e) => handleUpdateVolet(idx, 'title', e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-900"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Date
                      </label>
                      <input
                        type="text"
                        value={v.date}
                        onChange={(e) => handleUpdateVolet(idx, 'date', e.target.value)}
                        className="w-full p-2 bg-white border border-slate-200 rounded-xl font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Heure
                      </label>
                      <input
                        type="text"
                        value={v.time}
                        onChange={(e) => handleUpdateVolet(idx, 'time', e.target.value)}
                        className="w-full p-2 bg-white border border-slate-200 rounded-xl font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Lieu
                      </label>
                      <input
                        type="text"
                        value={v.location}
                        onChange={(e) => handleUpdateVolet(idx, 'location', e.target.value)}
                        className="w-full p-2 bg-white border border-slate-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Statut du Lieu
                      </label>
                      <select
                        value={v.locationStatus}
                        onChange={(e) => handleUpdateVolet(idx, 'locationStatus', e.target.value as LocationStatus)}
                        className="w-full p-2 bg-white border border-slate-200 rounded-xl font-bold"
                      >
                        <option value="confirmed">Confirmé</option>
                        <option value="negotiation">Négociation en cours</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Aperçu en direct */}
        <div className="lg:col-span-5 sticky top-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-indigo-600" />
              <span>Aperçu Invité en Direct</span>
            </span>
          </div>

          <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-3xl p-6 shadow-modern-lg space-y-4">
            {imageUrl && (
              <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 max-h-48 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt="Aperçu"
                  className="w-full h-auto object-cover max-h-48"
                />
              </div>
            )}

            <h3 className="text-lg font-extrabold text-slate-900 leading-snug">
              {title}
            </h3>

            <div className="space-y-3">
              {volets.map((v) => (
                <VoletCard
                  key={v.id}
                  volet={v}
                  isSelected={true}
                  onToggle={() => {}}
                  disabled={true}
                />
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
