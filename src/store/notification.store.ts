import { create } from "zustand";

import { fetchNotifications } from "@/lib/api/notifications";

interface NotificationState {
  unreadCount: number;
  setUnreadCount: (unreadCount: number) => void;
  decrementUnreadCount: () => void;
  resetNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  unreadCount: 0,
  setUnreadCount: (unreadCount) =>
    set({ unreadCount: Math.max(0, unreadCount) }),
  decrementUnreadCount: () =>
    set((state) => ({ unreadCount: Math.max(0, state.unreadCount - 1) })),
  resetNotifications: () => set({ unreadCount: 0 }),
}));

export async function refreshNotificationUnreadCount() {
  const result = await fetchNotifications();
  useNotificationStore.getState().setUnreadCount(result.unreadCount);
  return result.unreadCount;
}
