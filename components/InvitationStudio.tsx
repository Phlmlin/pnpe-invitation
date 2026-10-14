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
  Link as LinkIcon,
  X
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

  const [title, setTitle] = useState(initialInvitation?.title || '');
  const [slug, setSlug] = useState(initialInvitation?.slug || '');
  const [organization, setOrganization] = useState(
    initialInvitation?.organization || "Pôle National de Promotion de l'Emploi - PNPE"
  );
  const [introMessage, setIntroMessage] = useState(
    initialInvitation?.introMessage || ''
  );
  const [status, setStatus] = useState<'active' | 'closed'>(
    initialInvitation?.status || 'active'
  );

  const [volets, setVolets] = useState<VoletConfig[]>(
    initialInvitation?.volets && initialInvitation.volets.length > 0
      ? initialInvitation.volets
      : [
          {
            id: 'volet-1',
            badge: 'Activité 1',
            theme: 'blue',
            title: '',
            date: '',
            time: '',
            location: '',
            locationStatus: 'confirmed',
            description: '',
            imageUrl: ''
          }
        ]
  );

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (!isEditing) {
      const generatedSlug = newTitle
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setSlug(generatedSlug);
    }
  };

  const handleActivityFileUpload = (index: number, file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Veuillez déposer un fichier image valide (PNG, JPG, SVG).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_DIM = 1200;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > MAX_DIM) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.82);
        handleUpdateVolet(index, 'imageUrl', compressedBase64);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleAddVolet = () => {
    const nextNumber = volets.length + 1;
    const isEven = nextNumber % 2 === 0;
    const newVolet: VoletConfig = {
      id: `volet-${Date.now()}`,
      badge: `Activité ${nextNumber}`,
      theme: isEven ? 'emerald' : 'blue',
      title: '',
      date: '',
      time: '',
      location: '',
      locationStatus: 'confirmed',
      description: '',
      imageUrl: ''
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
      alert('Vous devez configurer au moins une activité.');
      return;
    }
    setVolets((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Veuillez renseigner un titre pour l'activité.");
      return;
    }

    const finalSlug = (slug.trim() || title)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    if (!finalSlug) {
      alert("Veuillez définir un lien public (slug).");
      return;
    }

    setSaving(true);
    setSuccess(false);

    try {
      // Trouver la première image d'activité pour l'aperçu général si nécessaire
      const fallbackImage = volets.find((v) => Boolean(v.imageUrl))?.imageUrl;

      const inv: Invitation = {
        id: initialInvitation?.id || `inv-${Date.now()}`,
        slug: finalSlug,
        title: title.trim(),
        organization: organization.trim(),
        introMessage: introMessage.trim(),
        imageUrl: fallbackImage || initialInvitation?.imageUrl || undefined,
        displayLargeImage: false,
        status,
        volets,
        createdAt: initialInvitation?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await store.saveInvitation(inv);
      setSuccess(true);
      setTimeout(() => {
        router.push('/admin');
      }, 700);
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la sauvegarde : ' + (err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!initialInvitation) return;
    if (
      window.confirm(
        `Êtes-vous sûr de vouloir supprimer définitivement l'activité "${initialInvitation.title}" ?`
      )
    ) {
      setSaving(true);
      try {
        await store.deleteInvitation(initialInvitation.id);
        router.push('/admin');
      } catch (err) {
        alert('Erreur lors de la suppression : ' + (err as Error).message);
        setSaving(false);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Barre d'action supérieure */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="p-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors shadow-xs"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              {isEditing ? "Modifier l'Activité" : "Créer une Nouvelle Activité"}
            </h1>
            <p className="text-xs text-slate-500">
              Configurez le titre, les activités avec leurs images respectives et le lien d'accès.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {success && (
            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-bold bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Enregistré avec succès !
            </span>
          )}

          {isEditing && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-4 py-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold uppercase tracking-wider transition-colors border border-rose-200 cursor-pointer"
              title="Supprimer définitivement cette activité"
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
                Titre de l'Activité *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Ex: Présentation des Journées Économiques et Forum de l'Emploi"
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
                    placeholder="invitation"
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
                placeholder="Ex: La Direction Générale du PNPE invite l'ensemble des dirigeants, acteurs économiques et chercheurs d'emploi..."
                className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 leading-relaxed focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Section 2 : Configuration des Activités (PNPE Ogooué-Maritime) */}
          <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-3xl p-6 shadow-modern space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xs font-bold tracking-wider text-amber-700 uppercase flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  2. Configuration des Activités (PNPE Ogooué-Maritime) ({volets.length})
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Chaque activité dispose de son propre visuel / image dédiée.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddVolet}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ajouter une Activité</span>
              </button>
            </div>

            <div className="space-y-5">
              {volets.map((v, idx) => (
                <div
                  key={v.id}
                  className={`p-5 rounded-2xl border text-xs space-y-3.5 transition-all ${
                    v.theme === 'blue'
                      ? 'bg-blue-50/40 border-blue-200'
                      : 'bg-emerald-50/40 border-emerald-200'
                  }`}
                >
                  {/* En-tête de l'activité */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/70">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900 text-sm">
                        #{idx + 1} • {v.badge}
                      </span>
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full text-white ${
                          v.theme === 'blue' ? 'bg-blue-600' : 'bg-emerald-600'
                        }`}
                      >
                        {v.theme === 'blue' ? 'Bleu Souverain' : 'Vert Émeraude'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteVolet(idx)}
                      className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                      title="Supprimer cette activité"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Ligne 1 : Nom du Badge & Thème */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Nom du Badge (ex: Activité 1)
                      </label>
                      <input
                        type="text"
                        value={v.badge}
                        onChange={(e) => handleUpdateVolet(idx, 'badge', e.target.value)}
                        placeholder={`Activité ${idx + 1}`}
                        className="w-full p-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-900"
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

                  {/* Ligne 2 : Titre de l'Activité */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Titre de l'Activité *
                    </label>
                    <input
                      type="text"
                      value={v.title}
                      onChange={(e) => handleUpdateVolet(idx, 'title', e.target.value)}
                      placeholder="Ex: Présentation des Journées Économiques Gabon 2026"
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-900"
                    />
                  </div>

                  {/* Ligne 3 : Visuel / Image dédiée à cette activité (AJOUT DEMANDÉ) */}
                  <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-2.5">
                    <label className="block text-[11px] font-bold text-indigo-900 uppercase tracking-wide">
                      Visuel / Image de l'activité (Upload PNG, JPG, SVG ou URL)
                    </label>

                    {v.imageUrl ? (
                      <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-900 border border-slate-200 flex-shrink-0 flex items-center justify-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={v.imageUrl}
                            alt={`Image ${v.badge}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <p className="text-[11px] font-bold text-slate-800 truncate">
                            Image de l'activité enregistrée
                          </p>
                          <p className="text-[10px] text-emerald-600 font-semibold">
                            ● Prête pour affichage invité
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleUpdateVolet(idx, 'imageUrl', '')}
                          className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                          title="Supprimer cette image"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          setDragOverIdx(idx);
                        }}
                        onDragLeave={() => setDragOverIdx(null)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setDragOverIdx(null);
                          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                            handleActivityFileUpload(idx, e.dataTransfer.files[0]);
                          }
                        }}
                        className={`border-2 border-dashed rounded-xl p-4 text-center transition-all ${
                          dragOverIdx === idx
                            ? 'border-indigo-600 bg-indigo-50/60'
                            : 'border-slate-300 hover:border-slate-400 bg-slate-50/60'
                        }`}
                      >
                        <Upload className="w-6 h-6 text-indigo-500 mx-auto mb-1" />
                        <p className="text-[11px] font-bold text-slate-700">
                          Glissez l'image de cette activité ici
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          PNG, JPG ou SVG
                        </p>

                        <label className="mt-2 inline-block">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                handleActivityFileUpload(idx, e.target.files[0]);
                              }
                            }}
                          />
                          <span className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-[11px] font-bold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-2xs">
                            Choisir un fichier
                          </span>
                        </label>
                      </div>
                    )}

                    {/* Alternative URL */}
                    <div>
                      <input
                        type="text"
                        value={v.imageUrl || ''}
                        onChange={(e) => handleUpdateVolet(idx, 'imageUrl', e.target.value)}
                        placeholder="Ou collez une URL d'image : https://.../image.jpg"
                        className="w-full p-2 text-[11px] font-mono bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                      />
                    </div>
                  </div>

                  {/* Ligne 4 : Description / Objectifs */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Description / Objectifs de l'activité
                    </label>
                    <textarea
                      rows={2}
                      value={v.description}
                      onChange={(e) => handleUpdateVolet(idx, 'description', e.target.value)}
                      placeholder="Ex: Détails des objectifs, opportunités et modalités de participation..."
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-800 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  {/* Ligne 5 : Date & Heure */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Date
                      </label>
                      <input
                        type="text"
                        value={v.date}
                        onChange={(e) => handleUpdateVolet(idx, 'date', e.target.value)}
                        placeholder="Ex: Vendredi 16 octobre 2026"
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
                        placeholder="Ex: À 10h00 ou De 9h à 17h"
                        className="w-full p-2 bg-white border border-slate-200 rounded-xl font-medium"
                      />
                    </div>
                  </div>

                  {/* Ligne 6 : Lieu & Statut */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Lieu
                      </label>
                      <input
                        type="text"
                        value={v.location}
                        onChange={(e) => handleUpdateVolet(idx, 'location', e.target.value)}
                        placeholder="Ex: Centre Culturel Total"
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

        {/* Aperçu en direct (Colonne droite) */}
        <div className="lg:col-span-5 sticky top-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-indigo-600" />
              <span>Aperçu Invité en Direct</span>
            </span>
          </div>

          <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-3xl p-6 shadow-modern-lg space-y-4">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-black uppercase tracking-wider">
              <span>ACTIVITÉ</span>
            </div>

            <h3 className="text-lg font-extrabold text-slate-900 leading-snug">
              {title || "Titre de votre activité..."}
            </h3>

            <div className="text-xs text-slate-500 font-mono pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>Réf : {slug || 'lien-public'}</span>
              <span className="text-emerald-700 font-bold">● Inscriptions ouvertes</span>
            </div>

            {introMessage && (
              <p className="text-xs text-slate-600 leading-relaxed">
                {introMessage}
              </p>
            )}

            <div className="space-y-3 pt-2">
              <p className="text-xs font-bold text-slate-800">
                Activités configurées ({volets.length}) :
              </p>
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
