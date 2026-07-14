/**
 * Learn2Drive design tokens.
 * Mirror these in tailwind.config.js for NativeWind className usage.
 */
export const splashPalette = {
  primary: '#FFB800',
  backgroundLight: '#F8F9FA',
  backgroundDark: '#041320',
  navyAccent: '#1C274B',
  surfaceDark: '#1E2129',
} as const;

export const themePalettes = {
  light: {
    primary: splashPalette.primary,
    background: splashPalette.backgroundLight,
    surface: '#FFFFFF',
    surfaceStrong: '#F1F5F9',
    surfaceMuted: '#F8FAFC',
    text: '#0A192F',
    textMuted: '#64748B',
    textSubtle: '#94A3B8',
    textFaint: '#CBD5E1',
    border: '#E2E8F0',
    success: '#059669',
    successSoft: '#ECFDF5',
    verified: '#2563EB',
    verifiedSoft: '#EAF2FF',
    error: '#EF4444',
    onPrimary: '#0A192F',
    onDark: '#FFFFFF',
    contrastSurface: '#0A192F',
    contrastSurfaceStrong: '#18375E',
    contrastText: '#FFFFFF',
    contrastMuted: '#A8B2C4',
    contrastBorder: 'rgba(255,255,255,0.12)',
    gridDot: 'rgba(0,0,0,0.06)',
    logoBackground: splashPalette.backgroundLight,
    shadow: '#000000',
  },
  dark: {
    primary: splashPalette.primary,
    background: splashPalette.backgroundDark,
    surface: '#132542',
    surfaceStrong: '#1B2D49',
    surfaceMuted: '#0A192F',
    text: '#FFFFFF',
    textMuted: '#A8B2C4',
    textSubtle: '#94A3B8',
    textFaint: '#64748B',
    border: '#29415F',
    success: '#34D399',
    successSoft: 'rgba(52,211,153,0.12)',
    verified: '#60A5FA',
    verifiedSoft: 'rgba(96,165,250,0.12)',
    error: '#F87171',
    onPrimary: '#0A192F',
    onDark: '#FFFFFF',
    contrastSurface: '#0A192F',
    contrastSurfaceStrong: '#1B365D',
    contrastText: '#FFFFFF',
    contrastMuted: '#A8B2C4',
    contrastBorder: 'rgba(255,255,255,0.12)',
    gridDot: 'rgba(255,255,255,0.06)',
    logoBackground: splashPalette.backgroundDark,
    shadow: '#000000',
  },
} as const;

export type AppThemeColors = (typeof themePalettes)[keyof typeof themePalettes];

export const colors = {
  primary: splashPalette.primary,
  secondary: '#6366F1',
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  background: splashPalette.backgroundLight,
  backgroundDark: splashPalette.backgroundDark,
  text: splashPalette.backgroundDark,
  textMuted: '#64748B',
  border: '#E2E8F0',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

/** Pill-shaped buttons — use explicit `borderRadius.button` in style on Android */
export const borderRadius = {
  button: 50,
} as const;

/** Default map region: Nigeria */
export const DEFAULT_MAP_REGION = {
  latitude: 9.082,
  longitude: 8.6753,
  latitudeDelta: 8,
  longitudeDelta: 8,
} as const;

export const CURRENCY = {
  code: 'NGN',
  symbol: '₦',
} as const;
