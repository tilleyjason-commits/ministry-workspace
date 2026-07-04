export const colors = {
  background: '#070C16',
  navy: '#121F36',
  navyDeep: '#0C1626',
  surface: '#15233E',
  surfaceAlt: '#1C2C4A',
  primary: '#B3F5A0',
  primaryDark: '#0C1626',
  onPrimary: '#0C1626',
  white: '#FFFFFF',
  mint: '#B3F5A0',
  sky: '#B6EEF8',
  peri: '#6D94FF',
  accent: '#E7B24B',
  accentLight: '#1C2C4A',
  red: '#E8202A',
  text: '#ECEFF5',
  textSecondary: '#9AA6BC',
  border: 'rgba(255,255,255,0.12)',
  error: '#FF6B6B',
  success: '#7FD16A',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 12,
  md: 16,
  lg: 22,
  pill: 999,
} as const;

export const typography = {
  hero: 34,
  title: 28,
  section: 20,
  cardTitle: 18,
  body: 16,
  meta: 14,
} as const;

export const fonts = {
  display: 'Montserrat_800ExtraBold',
  black: 'Montserrat_900Black',
  bold: 'Montserrat_700Bold',
  semibold: 'Montserrat_600SemiBold',
} as const;

export const shadows = {
  card: {
    shadowColor: '#000000',
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
} as const;