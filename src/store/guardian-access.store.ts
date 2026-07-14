import { create } from "zustand";

import { guardianLinks as initialGuardianLinks } from "@/sample_data/guardian";
import { studentProfile } from "@/sample_data/student";
import type { GuardianLink, GuardianRelationship } from "@/types";

type GuardianInviteInput = {
  guardianName: string;
  guardianContact: string;
  relationship: GuardianRelationship;
  expiresAt: string | null;
};

type GuardianAccessState = {
  guardianLinks: GuardianLink[];
  createGuardianInvite: (input: GuardianInviteInput) => GuardianLink;
  resendGuardianInvite: (guardianLinkId: string) => void;
  revokeGuardianLink: (guardianLinkId: string) => void;
};

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function createId() {
  return `guardian-link-${Date.now().toString(36)}`;
}

export const useGuardianAccessStore = create<GuardianAccessState>((set) => ({
  guardianLinks: initialGuardianLinks,
  createGuardianInvite: (input) => {
    const now = new Date().toISOString();
    const guardianName = input.guardianName.trim();
    const guardianLink: GuardianLink = {
      id: createId(),
      guardianId: `guardian-${Date.now().toString(36)}`,
      guardianName,
      guardianInitials: getInitials(guardianName) || "SC",
      guardianContact: input.guardianContact.trim(),
      learnerId: studentProfile.id,
      learnerName: studentProfile.name,
      learnerInitials: studentProfile.initials,
      relationship: input.relationship,
      status: "pending",
      inviteStatus: "sent",
      linkedAt: null,
      expiresAt: input.expiresAt,
      revokedAt: null,
      lastAccessedAt: null,
    };

    set((state) => ({
      guardianLinks: [guardianLink, ...state.guardianLinks],
    }));

    return guardianLink;
  },
  resendGuardianInvite: (guardianLinkId) =>
    set((state) => ({
      guardianLinks: state.guardianLinks.map((link) =>
        link.id === guardianLinkId && link.status === "pending"
          ? {
              ...link,
              inviteStatus: "sent",
              revokedAt: null,
            }
          : link,
      ),
    })),
  revokeGuardianLink: (guardianLinkId) =>
    set((state) => ({
      guardianLinks: state.guardianLinks.map((link) =>
        link.id === guardianLinkId
          ? {
              ...link,
              status: "revoked",
              revokedAt: new Date().toISOString(),
            }
          : link,
      ),
    })),
}));
