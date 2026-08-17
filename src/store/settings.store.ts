import * as SecureStore from "expo-secure-store";
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
  getItem: async (name) =>
    Platform.OS === "web"
      ? (getWebStorage()?.getItem(name) ?? null)
      : SecureStore.getItemAsync(name),
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
  locationPromptDismissed: boolean;
  discoveryLocationMode: DiscoveryLocationMode;
  preferredAreaId: PreferredAreaId;
  setTheme: (theme: ThemePreference) => void;
  setLocationPromptDismissed: (dismissed: boolean) => void;
  setDiscoveryLocationMode: (mode: DiscoveryLocationMode) => void;
  setPreferredAreaId: (areaId: PreferredAreaId) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: "system",
      locationPromptDismissed: false,
      discoveryLocationMode: "area",
      preferredAreaId: "lagos",
      setTheme: (theme) => set({ theme }),
      setLocationPromptDismissed: (locationPromptDismissed) =>
        set({ locationPromptDismissed }),
      setDiscoveryLocationMode: (discoveryLocationMode) =>
        set({ discoveryLocationMode }),
      setPreferredAreaId: (preferredAreaId) => set({ preferredAreaId }),
    }),
    {
      name: "learn2drive-settings",
      storage: createJSONStorage(() => settingsStorage),
      partialize: (state) => ({
        theme: state.theme,
        locationPromptDismissed: state.locationPromptDismissed,
        discoveryLocationMode: state.discoveryLocationMode,
        preferredAreaId: state.preferredAreaId,
      }),
    },
  ),
);
