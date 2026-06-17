/**
 * Learn2Drive design tokens.
 * Mirror these in tailwind.config.js for NativeWind className usage.
 */
export const splashPalette = {
  primary: '#ffb700',
  backgroundLight: '#f2f2f3',
  backgroundDark: '#041320',
  navyAccent: '#1C274B',
  surfaceDark: '#1E2129',
} as const;

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
