import { create } from "zustand";

import {
  clearSessionTokens,
  readSessionTokens,
  writeSessionTokens,
} from "@/lib/auth/session-storage";
import type {
  AuthSessionResponse,
  AuthTokens,
  AuthUser,
  UserRole,
} from "@/types";

export type AuthStatus = "checking" | "authenticated" | "unauthenticated";

interface AuthState {
  status: AuthStatus;
  isAuthenticated: boolean;
  role: UserRole | null;
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  hydrateTokens: () => Promise<AuthTokens | null>;
  completeHydration: (user: AuthUser) => void;
  authenticate: (session: AuthSessionResponse) => Promise<void>;
  updateTokens: (tokens: AuthTokens) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  status: "checking",
  isAuthenticated: false,
  role: null,
  user: null,
  accessToken: null,
  refreshToken: null,
  hydrateTokens: async () => {
    const tokens = await readSessionTokens();

    if (!tokens) {
      set({ status: "unauthenticated" });
      return null;
    }

    set({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
    return tokens;
  },
  completeHydration: (user) =>
    set({
      status: "authenticated",
      isAuthenticated: true,
      role: user.role,
      user,
    }),
  authenticate: async ({ user, accessToken, refreshToken }) => {
    await writeSessionTokens({ accessToken, refreshToken });
    set({
      status: "authenticated",
      isAuthenticated: true,
      role: user.role,
      user,
      accessToken,
      refreshToken,
    });
  },
  updateTokens: async ({ accessToken, refreshToken }) => {
    await writeSessionTokens({ accessToken, refreshToken });
    set({ accessToken, refreshToken });
  },
  signOut: async () => {
    try {
      await clearSessionTokens();
    } finally {
      set({
        status: "unauthenticated",
        isAuthenticated: false,
        role: null,
        user: null,
        accessToken: null,
        refreshToken: null,
      });
    }
  },
}));
