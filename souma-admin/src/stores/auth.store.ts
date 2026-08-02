import { create } from 'zustand';
import type { AuthUser } from '@/types/auth.types';

const STORAGE_KEY = 'souma_admin_session';

interface StoredSession {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  setSession: (user: AuthUser, accessToken: string, refreshToken: string) => void;
  updateAccessToken: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

function loadStoredSession(): StoredSession | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredSession;
  } catch {
    return null;
  }
}

const stored = loadStoredSession();

export const useAuthStore = create<AuthState>((set) => ({
  user: stored?.user ?? null,
  accessToken: stored?.accessToken ?? null,
  refreshToken: stored?.refreshToken ?? null,

  setSession: (user, accessToken, refreshToken) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, accessToken, refreshToken }));
    set({ user, accessToken, refreshToken });
  },

  updateAccessToken: (accessToken, refreshToken) => {
    const current = loadStoredSession();
    if (current) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, accessToken, refreshToken }));
    }
    set({ accessToken, refreshToken });
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({ user: null, accessToken: null, refreshToken: null });
  },
}));