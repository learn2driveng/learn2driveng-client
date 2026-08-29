import { create } from "zustand";

type LiveLocationUiState = {
  pendingShareUrl: string | null;
  setPendingShareUrl: (shareUrl: string | null) => void;
};

export const useLiveLocationStore = create<LiveLocationUiState>((set) => ({
  pendingShareUrl: null,
  setPendingShareUrl: (shareUrl) => set({ pendingShareUrl: shareUrl }),
}));
