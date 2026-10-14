'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Shield,
  UserPlus,
  Users,
  Trash2,
  KeyRound,
  Mail,
  User,
  Check,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowLeft,
  FileSpreadsheet,
  CheckCircle2,
  X,
  Sparkles,
  Loader2
} from 'lucide-react';
import { auth } from '@/lib/auth';
import { store } from '@/lib/store';
import { TeamMember, MemberRole, AdminUser } from '@/lib/types';
import AdminLayout from '@/components/AdminLayout';

export default function TeamMembersPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal Ajout Membre
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<MemberRole>('viewer');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Visibilité des mots de passe dans la liste
  const [visiblePasswordId, setVisiblePasswordId] = useState<string | null>(null);

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push('/admin/login');
      return;
    }
    const session = auth.getSession();
    setCurrentUser(session);

    async function loadMembers() {
      const list = await store.getTeamMembers();
      setMembers(list);
      setLoading(false);
    }

    loadMembers();
    return store.subscribe(loadMembers);
  }, [router]);

  const generateRandomPassword = () => {
    const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
    let pass = 'pnpe-';
    for (let i = 0; i < 5; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(pass);
  };

  const handleOpenAddModal = () => {
    setNewName('');
    setNewEmail('');
    setNewRole('viewer');
    generateRandomPassword();
    setFormError(null);
    setIsAddModalOpen(true);
  };

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanEmail = newEmail.trim().toLowerCase();
    const cleanName = newName.trim();
    const cleanPass = newPassword.trim();

    if (!cleanName) {
      setFormError('Veuillez renseigner le nom complet du collaborateur.');
      return;
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setFormError('Veuillez renseigner une adresse e-mail valide.');
      return;
    }
    if (!cleanPass || cleanPass.length < 4) {
      setFormError('Le mot de passe doit comporter au moins 4 caractères.');
      return;
    }

    // Vérifier si l'email existe déjà
    const exists = members.some((m) => m.email.toLowerCase() === cleanEmail);
    if (exists) {
      setFormError('Un membre avec cette adresse e-mail existe déjà.');
      return;
    }

    const newMember: TeamMember = {
      id: `member-${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      role: newRole,
      password: cleanPass,
      createdAt: new Date().toISOString(),
      addedBy: currentUser?.name || 'Direction PNPE',
    };

    try {
      await store.saveTeamMember(newMember);
      const updated = await store.getTeamMembers();
      setMembers(updated);
      setIsAddModalOpen(false);
      setToastMessage(`Collaborateur "${cleanName}" ajouté avec succès !`);
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.error(err);
      setFormError("Erreur lors de l'enregistrement du collaborateur.");
    }
  };

  const handleDeleteMember = async (member: TeamMember) => {
    if (member.role === 'superadmin') {
      alert('Impossible de supprimer un compte Super-Administrateur racine.');
      return;
    }
    if (currentUser?.email.toLowerCase() === member.email.toLowerCase()) {
      alert('Vous ne pouvez pas supprimer votre propre compte actuellement connecté.');
      return;
    }

    if (
      window.confirm(
        `Êtes-vous sûr de vouloir révoquer l'accès de "${member.name}" (${member.email}) ?\nCette personne ne pourra plus se connecter au tableau de bord ni exporter les données.`
      )
    ) {
      try {
        await store.deleteTeamMember(member.id);
        const updated = await store.getTeamMembers();
        setMembers(updated);
        setToastMessage(`Accès révoqué pour ${member.name}.`);
        setTimeout(() => setToastMessage(null), 3500);
      } catch (err) {
        console.error(err);
        alert('Erreur lors de la suppression du membre.');
      }
    }
  };

  const countViewers = members.filter((m) => m.role === 'viewer').length;
  const countAdmins = members.filter((m) => m.role === 'admin' || m.role === 'superadmin').length;

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center p-16">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        
        {/* FIL D'ARIANE & ENTÊTE */}
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
                <Shield className="w-3.5 h-3.5 text-indigo-600" />
                <span>Gouvernance &amp; Équipe PNPE</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1.5">
                Collaborateurs &amp; Droits d&apos;Accès
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                Ajoutez des membres de l&apos;équipe PNPE pour suivre en direct les inscriptions ou extraire les données en Excel.
              </p>
            </div>

            {currentUser?.role !== 'viewer' && (
              <button
                onClick={handleOpenAddModal}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-indigo-600/25 hover:scale-[1.02] cursor-pointer"
              >
                <UserPlus className="w-4 h-4 stroke-[2.5]" />
                <span>Ajouter un Collaborateur</span>
              </button>
            )}
          </div>
        </div>

        {/* 3 CARTES STATISTIQUES ÉQUIPE */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-slate-200/80 shadow-modern flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                TOTAL COLLABORATEURS
              </p>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 tabular-nums">
                {members.length}
              </p>
              <span className="text-[11px] text-slate-500 font-medium mt-0.5 block">
                Comptes PNPE autorisés
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shadow-xs">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-emerald-200/80 bg-emerald-50/20 shadow-modern flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                LECTEURS / EXPORT DONNÉES
              </p>
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-900 mt-1 tabular-nums">
                {countViewers}
              </p>
              <span className="text-[11px] text-emerald-600 font-medium mt-0.5 block">
                Suivi du nombre &amp; extraction Excel
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-xs">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-blue-200/80 bg-blue-50/20 shadow-modern flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
                ADMINISTRATEURS
              </p>
              <p className="text-2xl sm:text-3xl font-extrabold text-blue-900 mt-1 tabular-nums">
                {countAdmins}
              </p>
              <span className="text-[11px] text-blue-600 font-medium mt-0.5 block">
                Gestion complète &amp; création
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-xs">
              <Shield className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* BANNIÈRE PÉDAGOGIQUE RÔLES */}
        <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 border border-emerald-200/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between shadow-xs">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs mt-0.5">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <h3 className="text-sm font-extrabold text-slate-900">
                Comment fonctionne le rôle « Lecteur / Export Données » ?
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Ce rôle permet à vos agents ou partenaires d&apos;accéder au tableau de bord en direct, de consulter la liste des demandeurs d&apos;emploi et de <strong>télécharger l&apos;export Excel (.CSV)</strong>, tout en empêchant toute modification ou suppression des activités.
              </p>
            </div>
          </div>
        </div>

        {/* TABLEAU DES MEMBRES */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/90 shadow-modern overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              <span>Liste des Membres Autorisés ({members.length})</span>
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="py-4 px-6">Collaborateur</th>
                  <th className="py-4 px-6">Adresse E-mail</th>
                  <th className="py-4 px-6">Rôle &amp; Permissions</th>
                  <th className="py-4 px-6">Mot de passe / Code</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {members.map((m) => {
                  const isCurrent = currentUser?.email.toLowerCase() === m.email.toLowerCase();
                  const isPassVisible = visiblePasswordId === m.id;

                  return (
                    <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Nom & Avatar */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs uppercase shadow-xs ${
                              m.role === 'superadmin'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : m.role === 'admin'
                                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            }`}
                          >
                            {m.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                              <span>{m.name}</span>
                              {isCurrent && (
                                <span className="text-[10px] bg-slate-900 text-white font-bold px-2 py-0.5 rounded-full">
                                  Vous
                                </span>
                              )}
                            </p>
                            <p className="text-[11px] text-slate-400 font-medium">
                              Ajouté le {new Date(m.createdAt).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* E-mail */}
                      <td className="py-4 px-6 font-mono text-slate-700">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span>{m.email}</span>
                        </div>
                      </td>

                      {/* Rôle */}
                      <td className="py-4 px-6">
                        {m.role === 'superadmin' && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            <Shield className="w-3.5 h-3.5 text-amber-600" />
                            <span>Super-Admin (Complet)</span>
                          </span>
                        )}
                        {m.role === 'admin' && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
                            <Shield className="w-3.5 h-3.5 text-blue-600" />
                            <span>Administrateur</span>
                          </span>
                        )}
                        {m.role === 'viewer' && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Lecteur &amp; Export Données</span>
                          </span>
                        )}
                      </td>

                      {/* Mot de passe (pour que l'admin puisse le transmettre) */}
                      <td className="py-4 px-6 font-mono text-xs">
                        {m.password ? (
                          <div className="flex items-center gap-2">
                            <span className="bg-slate-100 px-2.5 py-1 rounded-lg text-slate-800 font-semibold border border-slate-200">
                              {isPassVisible ? m.password : '••••••••'}
                            </span>
                            <button
                              type="button"
                              onClick={() => setVisiblePasswordId(isPassVisible ? null : m.id)}
                              className="text-slate-400 hover:text-slate-600 p-1"
                              title={isPassVisible ? 'Masquer' : 'Afficher'}
                            >
                              {isPassVisible ? (
                                <EyeOff className="w-3.5 h-3.5" />
                              ) : (
                                <Eye className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Non renseigné</span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        {m.role !== 'superadmin' && !isCurrent && currentUser?.role !== 'viewer' ? (
                          <button
                            onClick={() => handleDeleteMember(m)}
                            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Révoquer cet accès"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-medium italic">
                            Protégé
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODAL AJOUT COLLABORATEUR */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">
                      Ajouter un Collaborateur
                    </h3>
                    <p className="text-xs text-slate-500">
                      Configurez l&apos;accès et les droits de consultation ou d&apos;export
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {formError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleCreateMember} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5 uppercase tracking-wider text-[10px]">
                    Nom Complet du Collaborateur *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="Ex: Mireille Mboumba"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-600 text-slate-900 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1.5 uppercase tracking-wider text-[10px]">
                    Adresse E-mail Professionnelle *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="Ex: mireille.mboumba@pnpe.ga"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-600 text-slate-900 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1.5 uppercase tracking-wider text-[10px]">
                    Rôle &amp; Droits d&apos;Accès *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setNewRole('viewer')}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        newRole === 'viewer'
                          ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 bg-slate-50 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className={`w-4 h-4 ${newRole === 'viewer' ? 'text-emerald-700' : 'text-slate-500'}`} />
                        <span className="font-extrabold text-slate-900 text-xs">
                          Lecteur &amp; Export
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                        Suivi du nombre d&apos;inscrits et téléchargement Excel/CSV.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setNewRole('admin')}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        newRole === 'admin'
                          ? 'border-blue-500 bg-blue-50/60 ring-2 ring-blue-500/20'
                          : 'border-slate-200 bg-slate-50 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Shield className={`w-4 h-4 ${newRole === 'admin' ? 'text-blue-700' : 'text-slate-500'}`} />
                        <span className="font-extrabold text-slate-900 text-xs">
                          Administrateur
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                        Gestion complète, création d&apos;activités et de formulaires.
                      </p>
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                      Mot de Passe / Code d&apos;accès *
                    </label>
                    <button
                      type="button"
                      onClick={generateRandomPassword}
                      className="text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1 font-bold text-[11px]"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Générer un code</span>
                    </button>
                  </div>

                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-600 text-slate-900 font-mono text-xs font-semibold"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Transmettez cet e-mail et ce code au collaborateur pour qu&apos;il se connecte.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition-colors cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
                  >
                    Créer le Compte
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TOAST FLOTTANT */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-500/40 animate-in fade-in slide-in-from-bottom-4 duration-200">
            <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center text-white flex-shrink-0">
              <Check className="w-4 h-4 stroke-[3]" />
            </div>
            <div>
              <p className="font-bold text-xs">{toastMessage}</p>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}
