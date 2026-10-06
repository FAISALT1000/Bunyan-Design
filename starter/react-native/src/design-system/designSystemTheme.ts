import {
  blackTheme,
  darkTheme,
  lightTheme,
  type ThemeMode,
  type ThemeProviderProps,
} from '@bunyan/design-system';

export const designSystemThemes = {
  light: lightTheme,
  dark: darkTheme,
  black: blackTheme,
} satisfies Partial<Record<ThemeMode, typeof lightTheme>>;

export const designSystemTheme = {
  initialPreference: 'system',
  blackForSystemDark: false,
  themes: designSystemThemes,
} satisfies Omit<ThemeProviderProps, 'children' | 'locale' | 'direction'>;
