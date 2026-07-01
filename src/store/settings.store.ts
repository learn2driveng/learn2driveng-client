import { create } from 'zustand';

/** `system` follows the device light/dark setting. */
export type ThemePreference = 'system' | 'light' | 'dark';

interface SettingsState {
  theme: ThemePreference;
  locationPromptDismissed: boolean;
  setTheme: (theme: ThemePreference) => void;
  setLocationPromptDismissed: (dismissed: boolean) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  theme: 'system',
  locationPromptDismissed: false,
  setTheme: (theme) => set({ theme }),
  setLocationPromptDismissed: (locationPromptDismissed) => set({ locationPromptDismissed }),
}));
