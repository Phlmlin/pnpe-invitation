import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Invitation, RSVPRegistration, StoreState } from './types';
import { DEFAULT_INVITATION, DEFAULT_RSVPS } from './seedData';

const STORAGE_KEY_INVITATIONS = 'pnpe_invitations_v1';
const STORAGE_KEY_RSVPS = 'pnpe_rsvps_v1';
const STORAGE_KEY_SUPABASE = 'pnpe_supabase_config_v1';
const STORE_EVENT = 'pnpe_store_sync_event';

let cachedClient: SupabaseClient | null = null;
let lastUrl: string | null = null;
let lastKey: string | null = null;

function isClient(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

export function getSupabaseClient(): SupabaseClient | null {
  let url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  let key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

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
};

function initLocalStorage() {
  if (!isClient()) return;

  const initialized = localStorage.getItem('pnpe_initialized_v2');
  if (initialized) return;

  localStorage.setItem('pnpe_initialized_v2', 'true');
  const storedInv = localStorage.getItem(STORAGE_KEY_INVITATIONS);
  if (storedInv === null) {
    localStorage.setItem(STORAGE_KEY_INVITATIONS, JSON.stringify([DEFAULT_INVITATION]));
  }

  const storedRsvps = localStorage.getItem(STORAGE_KEY_RSVPS);
  if (storedRsvps === null) {
    localStorage.setItem(STORAGE_KEY_RSVPS, JSON.stringify(DEFAULT_RSVPS));
  }
}

function notifyUpdate() {
  if (isClient()) {
    window.dispatchEvent(new Event(STORE_EVENT));
  }
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
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && envKey) {
      return {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        key: envKey,
      };
    }
    return null;
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
          .order('createdAt', { ascending: false });

        if (!error && data) {
          return data as Invitation[];
        }
      } catch (err) {
        console.warn('Fallback local après erreur Supabase getInvitations:', err);
      }
    }

    if (!isClient()) return memoryState.invitations;
    initLocalStorage();

    try {
      const raw = localStorage.getItem(STORAGE_KEY_INVITATIONS);
      if (raw !== null) return JSON.parse(raw);
    } catch {
      // fallback
    }
    return [];
  },

  async getInvitationBySlug(slug: string): Promise<Invitation | null> {
    const cleanSlug = decodeURIComponent(slug).trim().toLowerCase();
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('invitations')
          .select('*')
          .ilike('slug', cleanSlug)
          .maybeSingle();

        if (!error && data) {
          return data as Invitation;
        }
      } catch (err) {
        console.warn('Erreur Supabase getInvitationBySlug:', err);
      }
    }

    const list = await this.getInvitations();
    const found = list.find((inv) => inv.slug.toLowerCase() === cleanSlug);
    return found || null;
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
          return data as Invitation;
        }
      } catch (err) {
        console.warn('Erreur Supabase getInvitationById:', err);
      }
    }

    const list = await this.getInvitations();
    const found = list.find((inv) => inv.id === id);
    return found || null;
  },

  async saveInvitation(invitation: Invitation): Promise<Invitation> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { error } = await supabase.from('invitations').upsert(invitation, { onConflict: 'id' });
        if (error) {
          console.error('Erreur sauvegarde Supabase saveInvitation:', error);
          if (error.code === '23505' && error.message.includes('slug')) {
            invitation.slug = `${invitation.slug}-${Math.floor(100 + Math.random() * 900)}`;
            const { error: errRetry } = await supabase.from('invitations').upsert(invitation, { onConflict: 'id' });
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
        const index = current.findIndex((i) => i.id === invitation.id);
        if (index >= 0) {
          current[index] = { ...invitation, updatedAt: new Date().toISOString() };
        } else {
          current.unshift({ ...invitation, updatedAt: new Date().toISOString() });
        }
        localStorage.setItem(STORAGE_KEY_INVITATIONS, JSON.stringify(current));
      } catch (e) {
        console.warn('Erreur sauvegarde localStorage saveInvitation:', e);
      }
      notifyUpdate();
    } else {
      const idx = memoryState.invitations.findIndex((i) => i.id === invitation.id);
      if (idx >= 0) memoryState.invitations[idx] = invitation;
      else memoryState.invitations.unshift(invitation);
    }

    return invitation;
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

  resetToDefault(): void {
    if (isClient()) {
      localStorage.setItem(STORAGE_KEY_INVITATIONS, JSON.stringify([DEFAULT_INVITATION]));
      localStorage.setItem(STORAGE_KEY_RSVPS, JSON.stringify(DEFAULT_RSVPS));
      notifyUpdate();
    }
  }
};
