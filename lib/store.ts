import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Invitation, RSVPRegistration, StoreState, TeamMember } from './types';
import { DEFAULT_INVITATION, DEFAULT_RSVPS } from './seedData';

const STORAGE_KEY_INVITATIONS = 'pnpe_invitations_v1';
const STORAGE_KEY_RSVPS = 'pnpe_rsvps_v1';
const STORAGE_KEY_MEMBERS = 'pnpe_team_members_v1';
const STORAGE_KEY_SUPABASE = 'pnpe_supabase_config_v1';
const STORE_EVENT = 'pnpe_store_sync_event';

export const DEFAULT_MEMBERS: TeamMember[] = [
  {
    id: 'member-green',
    name: 'Green MOUNDOUNGA',
    email: 'greenmoundounga@gmail.com',
    role: 'superadmin',
    password: 'phlmlingreen@1992',
    createdAt: '2026-01-01T00:00:00.000Z',
    addedBy: 'Direction'
  },
  {
    id: 'member-admin',
    name: 'Direction PNPE',
    email: 'admin@pnpe.ga',
    role: 'superadmin',
    password: '2026',
    createdAt: '2026-01-01T00:00:00.000Z',
    addedBy: 'Direction'
  }
];

let cachedClient: SupabaseClient | null = null;
let lastUrl: string | null = null;
let lastKey: string | null = null;

function isClient(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

const DEFAULT_SUPABASE_URL = 'https://ovljxjkteqffjmwkiwln.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_oN6LgNmcr8mNBjlaD_wdyQ_tu6EFYjb';

export function getSupabaseClient(): SupabaseClient | null {
  let url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  let key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    DEFAULT_SUPABASE_ANON_KEY;

  if (isClient()) {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SUPABASE);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.url && parsed.key) {
          url = parsed.url;
          key = parsed.key;
        }
      }
    } catch {
      // ignore
    }
  }

  if (!url || !key) return null;

  if (cachedClient && lastUrl === url && lastKey === key) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url.trim(), key.trim());
    lastUrl = url;
    lastKey = key;
    return cachedClient;
  } catch (err) {
    console.warn('Erreur initialisation Supabase client:', err);
    return null;
  }
}

// État mémoire serveur / initial
let memoryState: StoreState = {
  invitations: [DEFAULT_INVITATION],
  rsvps: [...DEFAULT_RSVPS],
  members: [...DEFAULT_MEMBERS],
};

function initLocalStorage() {
  if (!isClient()) return;

  const initialized = localStorage.getItem('pnpe_initialized_v2');
  if (initialized) {
    // S'assurer que la clé des membres existe même pour un client déjà initialisé
    if (localStorage.getItem(STORAGE_KEY_MEMBERS) === null) {
      localStorage.setItem(STORAGE_KEY_MEMBERS, JSON.stringify(DEFAULT_MEMBERS));
    }
    return;
  }

  localStorage.setItem('pnpe_initialized_v2', 'true');
  const storedInv = localStorage.getItem(STORAGE_KEY_INVITATIONS);
  if (storedInv === null) {
    localStorage.setItem(STORAGE_KEY_INVITATIONS, JSON.stringify([DEFAULT_INVITATION]));
  }

  const storedRsvps = localStorage.getItem(STORAGE_KEY_RSVPS);
  if (storedRsvps === null) {
    localStorage.setItem(STORAGE_KEY_RSVPS, JSON.stringify(DEFAULT_RSVPS));
  }

  const storedMembers = localStorage.getItem(STORAGE_KEY_MEMBERS);
  if (storedMembers === null) {
    localStorage.setItem(STORAGE_KEY_MEMBERS, JSON.stringify(DEFAULT_MEMBERS));
  }
}

function notifyUpdate() {
  if (isClient()) {
    window.dispatchEvent(new Event(STORE_EVENT));
  }
}

function normalizeInvitationVolets(inv: Invitation): Invitation {
  if (!inv || !Array.isArray(inv.volets)) return inv;
  return {
    ...inv,
    volets: inv.volets.map((v, idx) => ({
      ...v,
      badge: v.badge
        ? v.badge.replace(/^volet\s*(\d+)/i, 'Activité $1').replace(/volet/gi, 'Activité')
        : `Activité ${idx + 1}`,
    })),
  };
}

export const store = {
  isSupabaseConfigured(): boolean {
    return !!getSupabaseClient();
  },

  setSupabaseConfig(url: string, key: string): { success: boolean; error?: string } {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return { success: false, error: "L'URL Supabase doit débuter par https://" };
    }
    if (key.length < 20) {
      return { success: false, error: "La clé Anon Supabase semble invalide." };
    }

    if (isClient()) {
      try {
        localStorage.setItem(
          STORAGE_KEY_SUPABASE,
          JSON.stringify({ url: url.trim(), key: key.trim() })
        );
        cachedClient = createClient(url.trim(), key.trim());
        lastUrl = url.trim();
        lastKey = key.trim();
        notifyUpdate();
        return { success: true };
      } catch (err) {
        return { success: false, error: (err as Error).message };
      }
    }
    return { success: false, error: 'Environnement non disponible' };
  },

  getSupabaseConfig(): { url: string; key: string } | null {
    if (isClient()) {
      try {
        const saved = localStorage.getItem(STORAGE_KEY_SUPABASE);
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    const envKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      DEFAULT_SUPABASE_ANON_KEY;
    const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
    return {
      url: envUrl,
      key: envKey,
    };
  },

  clearSupabaseConfig(): void {
    if (isClient()) {
      localStorage.removeItem(STORAGE_KEY_SUPABASE);
      cachedClient = null;
      lastUrl = null;
      lastKey = null;
      notifyUpdate();
    }
  },

  async getInvitations(): Promise<Invitation[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('invitations')
          .select('*')
          .neq('id', '__pnpe_team_members_store__')
          .neq('slug', '__pnpe_team_members_store__')
          .order('createdAt', { ascending: false });

        if (!error && data) {
          return (data as Invitation[])
            .filter((i) => i.id !== '__pnpe_team_members_store__' && i.slug !== '__pnpe_team_members_store__')
            .map(normalizeInvitationVolets);
        }
      } catch (err) {
        console.warn('Fallback local après erreur Supabase getInvitations:', err);
      }
    }

    if (!isClient()) {
      return memoryState.invitations
        .filter((i) => i.id !== '__pnpe_team_members_store__' && i.slug !== '__pnpe_team_members_store__')
        .map(normalizeInvitationVolets);
    }
    initLocalStorage();

    try {
      const raw = localStorage.getItem(STORAGE_KEY_INVITATIONS);
      if (raw !== null) {
        const parsed: Invitation[] = JSON.parse(raw);
        return parsed
          .filter((i) => i.id !== '__pnpe_team_members_store__' && i.slug !== '__pnpe_team_members_store__')
          .map(normalizeInvitationVolets);
      }
    } catch {
      // fallback
    }
    return [];
  },

  async getInvitationBySlug(slug: string): Promise<Invitation | null> {
    const cleanSlug = decodeURIComponent(slug).trim().toLowerCase();
    if (cleanSlug === '__pnpe_team_members_store__') return null;

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('invitations')
          .select('*')
          .ilike('slug', cleanSlug)
          .maybeSingle();

        if (!error && data && data.id !== '__pnpe_team_members_store__') {
          return normalizeInvitationVolets(data as Invitation);
        }
      } catch (err) {
        console.warn('Erreur Supabase getInvitationBySlug:', err);
      }
    }

    const list = await this.getInvitations();
    const found = list.find((inv) => inv.slug.toLowerCase() === cleanSlug);
    return found ? normalizeInvitationVolets(found) : null;
  },

  async getInvitationById(id: string): Promise<Invitation | null> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('invitations')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (!error && data) {
          return normalizeInvitationVolets(data as Invitation);
        }
      } catch (err) {
        console.warn('Erreur Supabase getInvitationById:', err);
      }
    }

    const list = await this.getInvitations();
    const found = list.find((inv) => inv.id === id);
    return found ? normalizeInvitationVolets(found) : null;
  },

  async saveInvitation(invitation: Invitation): Promise<Invitation> {
    const normalizedInvitation = normalizeInvitationVolets(invitation);
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { error } = await supabase.from('invitations').upsert(normalizedInvitation, { onConflict: 'id' });
        if (error) {
          console.error('Erreur sauvegarde Supabase saveInvitation:', error);
          if (error.code === '23505' && error.message.includes('slug')) {
            normalizedInvitation.slug = `${normalizedInvitation.slug}-${Math.floor(100 + Math.random() * 900)}`;
            const { error: errRetry } = await supabase.from('invitations').upsert(normalizedInvitation, { onConflict: 'id' });
            if (errRetry) console.error('Erreur retry saveInvitation:', errRetry);
          }
        }
      } catch (err) {
        console.warn('Erreur sauvegarde Supabase saveInvitation:', err);
      }
    }

    if (isClient()) {
      try {
        const raw = localStorage.getItem(STORAGE_KEY_INVITATIONS);
        const current: Invitation[] = raw ? JSON.parse(raw) : [];
        const index = current.findIndex((i) => i.id === normalizedInvitation.id);
        if (index >= 0) {
          current[index] = { ...normalizedInvitation, updatedAt: new Date().toISOString() };
        } else {
          current.unshift({ ...normalizedInvitation, updatedAt: new Date().toISOString() });
        }
        localStorage.setItem(STORAGE_KEY_INVITATIONS, JSON.stringify(current));
      } catch (e) {
        console.warn('Erreur sauvegarde localStorage saveInvitation:', e);
      }
      notifyUpdate();
    } else {
      const idx = memoryState.invitations.findIndex((i) => i.id === normalizedInvitation.id);
      if (idx >= 0) memoryState.invitations[idx] = normalizedInvitation;
      else memoryState.invitations.unshift(normalizedInvitation);
    }

    return normalizedInvitation;
  },

  async deleteInvitation(id: string): Promise<void> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('rsvps').delete().eq('invitationId', id);
        await supabase.from('invitations').delete().eq('id', id);
      } catch (err) {
        console.warn('Erreur suppression Supabase deleteInvitation:', err);
      }
    }

    if (isClient()) {
      try {
        const rawInv = localStorage.getItem(STORAGE_KEY_INVITATIONS);
        const currentInv: Invitation[] = rawInv ? JSON.parse(rawInv) : [];
        const filteredInv = currentInv.filter((i) => i.id !== id);
        localStorage.setItem(STORAGE_KEY_INVITATIONS, JSON.stringify(filteredInv));

        const rawRsvps = localStorage.getItem(STORAGE_KEY_RSVPS);
        const currentRsvps: RSVPRegistration[] = rawRsvps ? JSON.parse(rawRsvps) : [];
        const filteredRsvps = currentRsvps.filter((r) => r.invitationId !== id);
        localStorage.setItem(STORAGE_KEY_RSVPS, JSON.stringify(filteredRsvps));
      } catch (e) {
        console.warn('Erreur suppression localStorage deleteInvitation:', e);
      }
      notifyUpdate();
    }

    memoryState.invitations = memoryState.invitations.filter((i) => i.id !== id);
    memoryState.rsvps = memoryState.rsvps.filter((r) => r.invitationId !== id);
  },

  async getRSVPs(invitationId?: string): Promise<RSVPRegistration[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        let query = supabase.from('rsvps').select('*').order('createdAt', { ascending: false });
        if (invitationId) query = query.eq('invitationId', invitationId);
        const { data, error } = await query;
        if (!error && data) {
          return data as RSVPRegistration[];
        }
      } catch (err) {
        console.warn('Fallback local après erreur Supabase getRSVPs:', err);
      }
    }

    if (!isClient()) {
      return invitationId
        ? memoryState.rsvps.filter((r) => r.invitationId === invitationId)
        : memoryState.rsvps;
    }
    initLocalStorage();

    try {
      const raw = localStorage.getItem(STORAGE_KEY_RSVPS);
      if (raw !== null) {
        const parsed: RSVPRegistration[] = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return invitationId ? parsed.filter((r) => r.invitationId === invitationId) : parsed;
        }
      }
    } catch {
      // fallback
    }
    return [];
  },

  async saveRSVP(rsvp: RSVPRegistration): Promise<RSVPRegistration> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { error } = await supabase.from('rsvps').upsert(rsvp);
        if (error) {
          console.warn('Erreur insertion Supabase rsvps:', error);
        }
      } catch (err) {
        console.warn('Erreur sauvegarde RSVP Supabase:', err);
      }
    }

    if (isClient()) {
      initLocalStorage();
      const current = await this.getRSVPs();
      const index = current.findIndex((r) => r.id === rsvp.id);
      if (index >= 0) {
        current[index] = rsvp;
      } else {
        current.unshift(rsvp);
      }
      localStorage.setItem(STORAGE_KEY_RSVPS, JSON.stringify(current));
      notifyUpdate();
    } else {
      const idx = memoryState.rsvps.findIndex((r) => r.id === rsvp.id);
      if (idx >= 0) memoryState.rsvps[idx] = rsvp;
      else memoryState.rsvps.unshift(rsvp);
    }

    return rsvp;
  },

  async deleteRSVP(id: string): Promise<void> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('rsvps').delete().eq('id', id);
      } catch (err) {
        console.warn('Erreur suppression RSVP Supabase:', err);
      }
    }

    if (isClient()) {
      try {
        const rawRsvps = localStorage.getItem(STORAGE_KEY_RSVPS);
        const currentRsvps: RSVPRegistration[] = rawRsvps ? JSON.parse(rawRsvps) : [];
        const filtered = currentRsvps.filter((r) => r.id !== id);
        localStorage.setItem(STORAGE_KEY_RSVPS, JSON.stringify(filtered));
      } catch (e) {
        console.warn('Erreur suppression localStorage deleteRSVP:', e);
      }
      notifyUpdate();
    }

    memoryState.rsvps = memoryState.rsvps.filter((r) => r.id !== id);
  },

  async getStats(invitationId: string) {
    const rsvps = await this.getRSVPs(invitationId);
    const totalCompanies = rsvps.length;
    let volet1Count = 0;
    let volet2Count = 0;
    let bothVoletsCount = 0;
    let totalAttendees = 0;

    for (const r of rsvps) {
      const hasV1 = r.volets && r.volets.includes('volet-1');
      const hasV2 = r.volets && r.volets.includes('volet-2');
      if (hasV1) volet1Count++;
      if (hasV2) volet2Count++;
      if (hasV1 && hasV2) bothVoletsCount++;
      totalAttendees += r.attendeesCount || 1;
    }

    return {
      totalCompanies,
      volet1Count,
      volet2Count,
      bothVoletsCount,
      totalAttendees,
    };
  },

  subscribe(callback: () => void): () => void {
    if (!isClient()) return () => {};

    const handleSync = () => callback();
    window.addEventListener(STORE_EVENT, handleSync);
    window.addEventListener('storage', handleSync);

    return () => {
      window.removeEventListener(STORE_EVENT, handleSync);
      window.removeEventListener('storage', handleSync);
    };
  },

  async getTeamMembers(): Promise<TeamMember[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      // 1. Essayer d'abord la table dédiée team_members
      try {
        const { data, error } = await supabase
          .from('team_members')
          .select('*')
          .order('createdAt', { ascending: true });
        if (!error && data && data.length > 0) {
          if (isClient()) {
            localStorage.setItem(STORAGE_KEY_MEMBERS, JSON.stringify(data));
          }
          return data as TeamMember[];
        }
      } catch {}

      // 2. Fallback sur le document persistant __pnpe_team_members_store__ dans invitations
      try {
        const { data: doc, error: docErr } = await supabase
          .from('invitations')
          .select('introMessage')
          .eq('id', '__pnpe_team_members_store__')
          .maybeSingle();

        if (!docErr && doc && doc.introMessage) {
          const parsed: TeamMember[] = JSON.parse(doc.introMessage);
          if (Array.isArray(parsed) && parsed.length > 0) {
            if (isClient()) {
              localStorage.setItem(STORAGE_KEY_MEMBERS, JSON.stringify(parsed));
            }
            return parsed;
          }
        }
      } catch (err) {
        console.warn('Erreur lecture Supabase fallback team members:', err);
      }
    }

    if (!isClient()) {
      return memoryState.members || DEFAULT_MEMBERS;
    }
    initLocalStorage();

    try {
      const raw = localStorage.getItem(STORAGE_KEY_MEMBERS);
      if (raw !== null) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed as TeamMember[];
        }
      }
    } catch {
      // fallback
    }
    return DEFAULT_MEMBERS;
  },

  async saveTeamMember(member: TeamMember): Promise<TeamMember> {
    const current = await this.getTeamMembers();
    const index = current.findIndex(
      (m) => m.id === member.id || m.email.toLowerCase() === member.email.toLowerCase()
    );
    if (index >= 0) {
      current[index] = member;
    } else {
      current.push(member);
    }

    const supabase = getSupabaseClient();
    if (supabase) {
      // Sauvegarder dans team_members si la table existe
      try {
        await supabase.from('team_members').upsert(member);
      } catch {}

      // Toujours persister dans __pnpe_team_members_store__ dans Supabase
      try {
        const doc = {
          id: '__pnpe_team_members_store__',
          slug: '__pnpe_team_members_store__',
          title: 'PNPE Team Members Storage',
          organization: 'PNPE System',
          introMessage: JSON.stringify(current),
          displayLargeImage: false,
          status: 'closed',
          volets: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await supabase.from('invitations').upsert(doc, { onConflict: 'id' });
      } catch (e) {
        console.warn('Erreur sauvegarde Supabase fallback team members:', e);
      }
    }

    if (isClient()) {
      localStorage.setItem(STORAGE_KEY_MEMBERS, JSON.stringify(current));
      notifyUpdate();
    } else {
      memoryState.members = current;
    }

    return member;
  },

  async deleteTeamMember(id: string): Promise<void> {
    const current = await this.getTeamMembers();
    const filtered = current.filter((m) => m.id !== id);

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('team_members').delete().eq('id', id);
      } catch {}

      try {
        const doc = {
          id: '__pnpe_team_members_store__',
          slug: '__pnpe_team_members_store__',
          title: 'PNPE Team Members Storage',
          organization: 'PNPE System',
          introMessage: JSON.stringify(filtered),
          displayLargeImage: false,
          status: 'closed',
          volets: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await supabase.from('invitations').upsert(doc, { onConflict: 'id' });
      } catch (e) {
        console.warn('Erreur suppression Supabase fallback team members:', e);
      }
    }

    if (isClient()) {
      localStorage.setItem(STORAGE_KEY_MEMBERS, JSON.stringify(filtered));
      notifyUpdate();
    } else {
      memoryState.members = filtered;
    }
  },

  resetToDefault(): void {
    if (isClient()) {
      localStorage.setItem(STORAGE_KEY_INVITATIONS, JSON.stringify([DEFAULT_INVITATION]));
      localStorage.setItem(STORAGE_KEY_RSVPS, JSON.stringify(DEFAULT_RSVPS));
      localStorage.setItem(STORAGE_KEY_MEMBERS, JSON.stringify(DEFAULT_MEMBERS));
      notifyUpdate();
    }
  }
};
