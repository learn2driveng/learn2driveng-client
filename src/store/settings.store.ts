import * as SecureStore from "expo-secure-store";
import { useSyncExternalStore } from "react";
import { Platform } from "react-native";
import { create } from "zustand";
import {
  createJSONStorage,
  persist,
  type StateStorage,
} from "zustand/middleware";

import type { PreferredAreaId } from "@/constants/preferred-areas";

/** `system` follows the device light/dark setting. */
export type ThemePreference = "system" | "light" | "dark";
export type DiscoveryLocationMode = "current" | "area";

function getWebStorage() {
  return typeof localStorage === "undefined" ? null : localStorage;
}

const settingsStorage: StateStorage = {
  getItem: async (name) => {
    try {
      return Platform.OS === "web"
        ? (getWebStorage()?.getItem(name) ?? null)
        : await SecureStore.getItemAsync(name);
    } catch {
      // A storage failure must not leave the native splash visible indefinitely.
      return null;
    }
  },
  setItem: async (name, value) => {
    if (Platform.OS === "web") {
      getWebStorage()?.setItem(name, value);
      return;
    }

    await SecureStore.setItemAsync(name, value, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
  },
  removeItem: async (name) => {
    if (Platform.OS === "web") {
      getWebStorage()?.removeItem(name);
      return;
    }

    await SecureStore.deleteItemAsync(name);
  },
};

interface SettingsState {
  theme: ThemePreference;
  hasCompletedOnboarding: boolean;
  discoveryLocationMode: DiscoveryLocationMode;
  preferredAreaId: PreferredAreaId;
  instructorLocationSharingEnabled: boolean;
  setTheme: (theme: ThemePreference) => void;
  completeOnboarding: () => void;
  setDiscoveryLocationMode: (mode: DiscoveryLocationMode) => void;
  setPreferredAreaId: (areaId: PreferredAreaId) => void;
  setInstructorLocationSharingEnabled: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: "system",
      hasCompletedOnboarding: false,
      discoveryLocationMode: "current",
      preferredAreaId: "lagos",
      instructorLocationSharingEnabled: false,
      setTheme: (theme) => set({ theme }),
      completeOnboarding: () => set({ hasCompletedOnboarding: true }),
      setDiscoveryLocationMode: (discoveryLocationMode) =>
        set({ discoveryLocationMode }),
      setPreferredAreaId: (preferredAreaId) => set({ preferredAreaId }),
      setInstructorLocationSharingEnabled: (instructorLocationSharingEnabled) =>
        set({ instructorLocationSharingEnabled }),
    }),
    {
      name: "learn2drive-settings",
      version: 1,
      storage: createJSONStorage(() => settingsStorage),
      migrate: (persistedState) => ({
        ...(persistedState && typeof persistedState === "object"
          ? persistedState
          : {}),
        // A saved v0 settings record means this installation already used the app.
        hasCompletedOnboarding: true,
      }),
      partialize: (state) => ({
        theme: state.theme,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        discoveryLocationMode: state.discoveryLocationMode,
        preferredAreaId: state.preferredAreaId,
        instructorLocationSharingEnabled:
          state.instructorLocationSharingEnabled,
      }),
    },
  ),
);

function subscribeToSettingsHydration(onStoreChange: () => void) {
  const unsubscribeStarted = useSettingsStore.persist.onHydrate(onStoreChange);
  const unsubscribeFinished =
    useSettingsStore.persist.onFinishHydration(onStoreChange);
  return () => {
    unsubscribeStarted();
    unsubscribeFinished();
  };
}

export function useSettingsHydrated() {
  return useSyncExternalStore(
    subscribeToSettingsHydration,
    useSettingsStore.persist.hasHydrated,
    () => false,
  );
}
