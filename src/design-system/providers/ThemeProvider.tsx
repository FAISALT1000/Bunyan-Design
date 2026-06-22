import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Appearance, I18nManager, type ColorSchemeName } from 'react-native';
import { themes as defaultThemes } from '../themes/themes';
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
  theme: defaultThemes.light,
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
  preference?: ThemePreference;
  onPreferenceChange?: (preference: ThemePreference) => void;
  locale?: string;
  direction?: Direction;
  blackForSystemDark?: boolean;
  themes?: Partial<Record<ThemeMode, Theme>>;
}

const resolveSystemMode = (scheme: ColorSchemeName | null, blackForSystemDark: boolean): ThemeMode =>
  scheme === 'dark' ? (blackForSystemDark ? 'black' : 'dark') : 'light';

export function ThemeProvider({
  children,
  initialPreference = 'system',
  preference: controlledPreference,
  onPreferenceChange,
  locale = 'en',
  direction,
  blackForSystemDark = false,
  themes,
}: ThemeProviderProps) {
  const [internalPreference, setInternalPreference] = useState<ThemePreference>(
    initialPreference,
  );
  const preference = controlledPreference ?? internalPreference;
  const setPreference = useCallback((nextPreference: ThemePreference) => {
    if (controlledPreference === undefined) {
      setInternalPreference(nextPreference);
    }
    onPreferenceChange?.(nextPreference);
  }, [controlledPreference, onPreferenceChange]);
  const [systemScheme, setSystemScheme] = useState<ColorSchemeName | null>(
    Appearance.getColorScheme() ?? null,
  );

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => setSystemScheme(colorScheme));
    return () => subscription.remove();
  }, []);

  const resolvedDirection: Direction =
    direction ?? (/^(ar|fa|he|ur)(-|$)/i.test(locale) || I18nManager.isRTL ? 'rtl' : 'ltr');
  const mode = preference === 'system'
    ? resolveSystemMode(systemScheme, blackForSystemDark)
    : preference;

  const activeTheme = themes?.[mode] ?? defaultThemes[mode];

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme: activeTheme,
      mode,
      preference,
      setPreference,
      direction: resolvedDirection,
      isRTL: resolvedDirection === 'rtl',
      locale,
    }),
    [activeTheme, locale, mode, preference, resolvedDirection, setPreference],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
