import {
  blackTheme,
  darkTheme,
  dimTheme,
  lightTheme,
  sepiaTheme,
  type ThemeMode,
  type ThemeProviderProps,
} from '@bunyan/design-system';

export const designSystemThemes = {
  light: lightTheme,
  dark: darkTheme,
  black: blackTheme,
  dim: dimTheme,
  sepia: sepiaTheme,
} satisfies Partial<Record<ThemeMode, typeof lightTheme>>;

export const designSystemTheme = {
  initialPreference: 'system',
  blackForSystemDark: false,
  themes: designSystemThemes,
} satisfies Omit<ThemeProviderProps, 'children' | 'locale' | 'direction'>;
