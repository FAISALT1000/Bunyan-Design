import { themes as defaultThemes } from './themes';
import type { Theme, ThemeMode, ThemeOverrides } from './types';

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const deepMerge = <T>(base: T, overrides: unknown): T => {
  if (!isPlainObject(overrides) || !isPlainObject(base)) return (overrides === undefined ? base : overrides) as T;
  const result: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(overrides)) {
    if (value === undefined) continue;
    result[key] = isPlainObject(value) && isPlainObject(result[key]) ? deepMerge(result[key], value) : value;
  }
  return result as T;
};

/**
 * Builds a theme from your own tokens on top of a Bunyan base theme.
 * Only the values you pass change; everything else keeps the base value.
 *
 * ```ts
 * const brandLight = createTheme({
 *   color: { primary: { default: '#6D28D9', pressed: '#5B21B6' } },
 *   spacing: { md: 14 },
 *   breakpoint: { medium: 640 },
 * });
 * ```
 */
export function createTheme(overrides: ThemeOverrides, base: Theme = defaultThemes.light): Theme {
  return deepMerge(base, overrides);
}

/**
 * Builds the full light/dark/black set in one call. `shared` applies to every
 * mode (spacing, typography, breakpoints…); per-mode objects apply on top
 * (usually colours).
 *
 * ```tsx
 * const brand = createThemes({
 *   shared: { typography: { fontFamily: { sans: 'Inter', arabic: 'IBMPlexSansArabic' } } },
 *   light: { color: { primary: { default: '#6D28D9' } } },
 *   dark: { color: { primary: { default: '#A78BFA' } } },
 * });
 * <ThemeProvider themes={brand}>…</ThemeProvider>
 * ```
 */
export function createThemes(
  overrides: { shared?: ThemeOverrides } & Partial<Record<ThemeMode, ThemeOverrides>> = {},
  base: Record<ThemeMode, Theme> = defaultThemes,
): Record<ThemeMode, Theme> {
  const build = (mode: ThemeMode) =>
    createTheme(deepMerge(overrides.shared ?? {}, overrides[mode] ?? {}) as ThemeOverrides, base[mode]);
  return { light: build('light'), dark: build('dark'), black: build('black') };
}
