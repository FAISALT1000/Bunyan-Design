export const palette = {
  blue: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },
  teal: {
    50: '#F0FDFA',
    200: '#99F6E4',
    500: '#14B8A6',
    700: '#0F766E',
    900: '#134E4A',
  },
  gray: {
    0: '#FFFFFF',
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
    950: '#020617',
    1000: '#000000',
  },
  green: {
    50: '#F0FDF4',
    200: '#BBF7D0',
    500: '#22C55E',
    600: '#16A34A',
    700: '#15803D',
    900: '#14532D',
  },
  amber: {
    50: '#FFFBEB',
    200: '#FDE68A',
    500: '#F59E0B',
    600: '#D97706',
    900: '#78350F',
  },
  red: {
    50: '#FEF2F2',
    200: '#FECACA',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
    900: '#7F1D1D',
  },
  cyan: {
    50: '#ECFEFF',
    200: '#A5F3FC',
    500: '#06B6D4',
    700: '#0E7490',
    900: '#164E63',
  },
} as const;

export const typography = {
  fontFamily: {
    sans: 'System',
    arabic: 'System',
    mono: 'Courier',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    displaySm: 30,
    displayMd: 36,
  },
  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  lineHeight: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 28,
    xl: 30,
    xxl: 34,
    displaySm: 38,
    displayMd: 44,
  },
  letterSpacing: {
    tight: -0.4,
    normal: 0,
    wide: 0.4,
  },
} as const;

export const spacing = {
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  giant: 40,
  huge: 48,
} as const;

export const radius = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  pill: 999,
} as const;

export const borderWidth = {
  none: 0,
  thin: 1,
  medium: 2,
  thick: 3,
} as const;

export const iconSize = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  xxl: 40,
} as const;

export const componentHeight = {
  xs: 28,
  sm: 36,
  md: 44,
  lg: 52,
  xl: 60,
} as const;

export const breakpoint = {
  compact: 0,
  medium: 600,
  expanded: 1024,
  wide: 1440,
} as const;

export const motion = {
  duration: {
    instant: 0,
    fast: 120,
    normal: 200,
    slow: 320,
  },
  easing: {
    standard: [0.2, 0, 0, 1],
    emphasized: [0.2, 0, 0, 1],
    entrance: [0, 0, 0, 1],
    exit: [0.3, 0, 1, 1],
  },
} as const;

export const opacity = {
  invisible: 0,
  subtle: 0.08,
  muted: 0.4,
  disabled: 0.5,
  strong: 0.72,
  opaque: 1,
} as const;

export const zIndex = {
  base: 0,
  raised: 10,
  dropdown: 100,
  sticky: 200,
  overlay: 300,
  modal: 400,
  toast: 500,
  tooltip: 600,
} as const;

export const shadow = {
  none: {
    shadowColor: palette.gray[1000],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: palette.gray[1000],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: palette.gray[1000],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: palette.gray[1000],
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 20,
    elevation: 8,
  },
} as const;

export const tokens = {
  palette,
  typography,
  spacing,
  radius,
  borderWidth,
  shadow,
  iconSize,
  componentHeight,
  breakpoint,
  motion,
  opacity,
  zIndex,
} as const;

export type Tokens = typeof tokens;
