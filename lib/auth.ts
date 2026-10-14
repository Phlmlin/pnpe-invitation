import { AdminUser, TeamMember } from './types';
import { store, DEFAULT_MEMBERS } from './store';

const ADMIN_SESSION_KEY = 'pnpe_admin_auth_v1';
const STORAGE_KEY_MEMBERS = 'pnpe_team_members_v1';

export const auth = {
  async login(email: string, code: string): Promise<{ success: boolean; error?: string; user?: AdminUser }> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = code.trim();

    // 1. Récupérer les membres de l'équipe (depuis Supabase en direct)
    let members: TeamMember[] = [];
    try {
      members = await store.getTeamMembers();
    } catch {
      members = DEFAULT_MEMBERS;
    }

    if (!members || members.length === 0) {
      members = DEFAULT_MEMBERS;
    }

    // 2. Chercher le compte correspondant dans la liste des collaborateurs
    const found = members.find(
      (m) => m.email.trim().toLowerCase() === cleanEmail && m.password?.trim() === cleanCode
    );

    if (found) {
      const user: AdminUser = {
        id: found.id,
        email: found.email,
        role: found.role,
        name: found.name,
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(user));
        document.cookie = `pnpe_auth_token=valid_session_2026; path=/; max-age=86400; SameSite=Lax`;
      }
      return { success: true, user };
    }

    // 3. Fallback direct sur les identifiants superviseurs de secours
    if (
      (cleanEmail === 'greenmoundounga@gmail.com' && cleanCode === 'phlmlingreen@1992') ||
      (cleanEmail === 'admin@pnpe.ga' && cleanCode === '2026')
    ) {
      const user: AdminUser = {
        id: cleanEmail.includes('green') ? 'member-green' : 'member-admin',
        email: cleanEmail,
        role: 'superadmin',
        name: cleanEmail.includes('green') ? 'Green MOUNDOUNGA' : 'Direction PNPE',
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(user));
        document.cookie = `pnpe_auth_token=valid_session_2026; path=/; max-age=86400; SameSite=Lax`;
      }
      return { success: true, user };
    }

    return {
      success: false,
      error: 'Identifiants invalides. Veuillez vérifier votre adresse e-mail et votre mot de passe.',
    };
  },

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(ADMIN_SESSION_KEY);
      document.cookie = `pnpe_auth_token=; path=/; max-age=0; SameSite=Lax`;
    }
  },

  getSession(): AdminUser | null {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(ADMIN_SESSION_KEY);
        if (raw) return JSON.parse(raw);
      } catch {
        return null;
      }
    }
    return null;
  },

  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    try {
      const raw = localStorage.getItem(ADMIN_SESSION_KEY);
      return !!raw;
    } catch {
      return false;
    }
  },

  canEdit(user?: AdminUser | null): boolean {
    const u = user || this.getSession();
    if (!u) return false;
    return u.role === 'superadmin' || u.role === 'admin';
  },

  canManageMembers(user?: AdminUser | null): boolean {
    const u = user || this.getSession();
    if (!u) return false;
    return u.role === 'superadmin';
  },

  canExport(user?: AdminUser | null): boolean {
    const u = user || this.getSession();
    return !!u; // Tous les membres authentifiés peuvent extraire les données
  }
};
