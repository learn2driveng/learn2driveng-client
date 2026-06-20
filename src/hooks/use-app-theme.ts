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
    const background = isDark ? splashPalette.backgroundDark : splashPalette.backgroundLight;

    if (Platform.OS === 'ios') {
      return {
        primary: splashPalette.primary,
        background,
        text: isDark ? '#FFFFFF' : splashPalette.backgroundDark,
        textMuted: isDark ? PlatformColor('secondaryLabel') : 'rgba(4,19,32,0.72)',
        textSubtle: isDark ? PlatformColor('tertiaryLabel') : 'rgba(4,19,32,0.56)',
        textFaint: isDark ? PlatformColor('quaternaryLabel') : 'rgba(4,19,32,0.4)',
        border: PlatformColor('separator'),
        surface: PlatformColor('secondarySystemBackground'),
        surfaceStrong: PlatformColor('tertiarySystemBackground'),
        gridDot: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
        logoBackground: background,
      };
    }

    return {
      primary: splashPalette.primary,
      background,
      text: isDark ? '#FFFFFF' : splashPalette.backgroundDark,
      textMuted: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(10,25,47,0.7)',
      textSubtle: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(10,25,47,0.5)',
      textFaint: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(10,25,47,0.35)',
      border: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(10,25,47,0.12)',
      surface: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(10,25,47,0.05)',
      surfaceStrong: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(10,25,47,0.08)',
      gridDot: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
      logoBackground: background,
    };
  }, [isDark]);

  return { theme: preference, scheme, isDark, colors };
}
