import { useColorScheme } from 'react-native';

import { themePalettes } from '@/constants/theme';
import { useSettingsStore, type ThemePreference } from '@/store/settings.store';

function resolveScheme(preference: ThemePreference, systemScheme: ReturnType<typeof useColorScheme>) {
  if (preference === 'system') {
    return systemScheme === 'dark' ? 'dark' : 'light';
  }
  return preference;
}

export function useAppTheme() {
  const preference = useSettingsStore((s) => s.theme);
  const systemScheme = useColorScheme();
  const scheme = resolveScheme(preference, systemScheme);
  const isDark = scheme === 'dark';
  const colors = themePalettes[scheme];

  return { theme: preference, scheme, isDark, colors };
}
