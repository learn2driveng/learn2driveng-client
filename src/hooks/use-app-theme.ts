import { useMemo } from 'react';
import { Platform, PlatformColor, useColorScheme } from 'react-native';

import { splashPalette } from '@/constants/theme';
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

  const colors = useMemo(() => {
    if (Platform.OS === 'ios') {
      return {
        primary: splashPalette.primary,
        background: PlatformColor('systemBackground'),
        text: PlatformColor('label'),
        textMuted: PlatformColor('secondaryLabel'),
        textSubtle: PlatformColor('tertiaryLabel'),
        textFaint: PlatformColor('quaternaryLabel'),
        border: PlatformColor('separator'),
        surface: PlatformColor('secondarySystemBackground'),
        surfaceStrong: PlatformColor('tertiarySystemBackground'),
        gridDot: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
        logoBackground: PlatformColor('systemBackground'),
      };
    }

    return {
      primary: splashPalette.primary,
      background: isDark ? '#121212' : '#FFFFFF',
      text: isDark ? '#FFFFFF' : '#1C1B1F',
      textMuted: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(28,27,31,0.7)',
      textSubtle: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(28,27,31,0.5)',
      textFaint: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(28,27,31,0.35)',
      border: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(28,27,31,0.12)',
      surface: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(28,27,31,0.05)',
      surfaceStrong: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(28,27,31,0.08)',
      gridDot: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
      logoBackground: isDark ? '#121212' : '#FFFFFF',
    };
  }, [isDark]);

  return { theme: preference, scheme, isDark, colors };
}
