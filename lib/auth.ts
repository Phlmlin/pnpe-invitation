import { AdminUser } from './types';

const ADMIN_SESSION_KEY = 'pnpe_admin_auth_v1';

export const auth = {
  login(email: string, code: string): { success: boolean; error?: string } {
    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = code.trim();

    if (cleanEmail === 'admin@pnpe.ga' && cleanCode === '2026') {
      const user: AdminUser = {
        email: cleanEmail,
        role: 'superadmin',
        name: 'Administrateur PNPE',
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(user));
        document.cookie = `pnpe_auth_token=valid_session_2026; path=/; max-age=86400; SameSite=Lax`;
      }
      return { success: true };
    }

    return {
      success: false,
      error: 'Identifiants invalides. Utilisez admin@pnpe.ga et le code 2026.',
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
};
