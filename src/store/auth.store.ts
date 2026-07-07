import { create } from "zustand";

import type { UserRole } from "@/types";

interface AuthState {
  isAuthenticated: boolean;
  role: UserRole | null;
  signIn: (role: UserRole) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  role: null,
  signIn: (role) => set({ isAuthenticated: true, role }),
  signOut: () => set({ isAuthenticated: false, role: null }),
}));
