import { create } from "zustand";

import type { GoogleRegistrationProfile, UserRole } from "@/types";

type GoogleSignupRole = Extract<UserRole, "learner">;

interface PendingGoogleSignup {
  registrationToken: string;
  profile: GoogleRegistrationProfile;
  role: GoogleSignupRole;
  returnTo?: string;
}

interface PendingGoogleLink {
  linkToken: string;
  profile: GoogleRegistrationProfile;
  returnTo?: string;
}

interface GoogleAuthState {
  pendingSignup: PendingGoogleSignup | null;
  pendingLink: PendingGoogleLink | null;
  beginSignup: (signup: PendingGoogleSignup) => void;
  beginLink: (link: PendingGoogleLink) => void;
  clearSignup: () => void;
  clearLink: () => void;
}

export const useGoogleAuthStore = create<GoogleAuthState>((set) => ({
  pendingSignup: null,
  pendingLink: null,
  beginSignup: (pendingSignup) =>
    set({
      pendingSignup,
      pendingLink: null,
    }),
  beginLink: (pendingLink) =>
    set({
      pendingLink,
      pendingSignup: null,
    }),
  clearSignup: () => set({ pendingSignup: null }),
  clearLink: () => set({ pendingLink: null }),
}));
