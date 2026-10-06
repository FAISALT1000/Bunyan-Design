import React, { createContext, useEffect, useMemo, useState } from 'react';
import { Appearance, I18nManager, type ColorSchemeName } from '../components/RNTheme/native';
import { themes } from '../themes/themes';
import type { Direction, Theme, ThemeMode } from '../themes/types';

export type ThemePreference = ThemeMode | 'system';

export interface ThemeContextValue {
  theme: Theme;
  mode: ThemeMode;
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
  direction: Direction;
  isRTL: boolean;
  locale: string;
}

const defaultContext: ThemeContextValue = {
  theme: themes.light,
  mode: 'light',
  preference: 'system',
  setPreference: () => undefined,
  direction: 'ltr',
  isRTL: false,
  locale: 'en',
};

export const ThemeContext = createContext<ThemeContextValue>(defaultContext);

export interface ThemeProviderProps {
  children: React.ReactNode;
  initialPreference?: ThemePreference;
  locale?: string;
  direction?: Direction;
  blackForSystemDark?: boolean;
  /**
   * Your own themes (e.g. from `createThemes`). Modes you leave out fall back to
   * Bunyan's defaults. Memoise the object (or define it at module level).
   */
  themes?: Partial<Record<ThemeMode, Theme>>;
}

const RTL_LOCALE = /^(ar|arc|ckb|dv|fa|he|iw|ps|sd|ug|ur|yi)(-|_|$)/i;

export const isRTLLocale = (locale: string) => RTL_LOCALE.test(locale);

const resolveSystemMode = (scheme: ColorSchemeName | null, blackForSystemDark: boolean): ThemeMode =>
  scheme === 'dark' ? (blackForSystemDark ? 'black' : 'dark') : 'light';

export function ThemeProvider({
  children,
  initialPreference = 'system',
  locale = 'en',
  direction,
  blackForSystemDark = false,
  themes: customThemes,
}: ThemeProviderProps) {
  const [preference, setPreference] = useState<ThemePreference>(initialPreference);
  const [systemScheme, setSystemScheme] = useState<ColorSchemeName | null>(
    Appearance.getColorScheme() ?? null,
  );

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => setSystemScheme(colorScheme));
    return () => subscription.remove();
  }, []);

  const resolvedDirection: Direction =
    direction ?? (isRTLLocale(locale) || I18nManager.isRTL ? 'rtl' : 'ltr');
  const mode = preference === 'system'
    ? resolveSystemMode(systemScheme, blackForSystemDark)
    : preference;

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme: customThemes?.[mode] ?? themes[mode],
      mode,
      preference,
      setPreference,
      direction: resolvedDirection,
      isRTL: resolvedDirection === 'rtl',
      locale,
    }),
    [customThemes, locale, mode, preference, resolvedDirection],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
