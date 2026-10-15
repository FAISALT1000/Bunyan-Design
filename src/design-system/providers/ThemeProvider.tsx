import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Appearance, I18nManager, type ColorSchemeName } from '../components/RNTheme/native';
import {
  getDesignSystemPlatform,
  resolvePlatformTokens,
  type DesignSystemPlatform,
  type PlatformTokens,
} from '../platform';
import { isDarkMode, themes as defaultThemes } from '../themes/themes';
import type { Direction, Theme, ThemeMode } from '../themes/types';

export type ThemePreference = ThemeMode | 'system';

/**
 * Where the theme choice is saved between launches. AsyncStorage, MMKV
 * (wrap `getString` / `set`) and `localStorage` all fit.
 */
export interface ThemePreferenceStorage {
  getItem: (key: string) => string | null | undefined | Promise<string | null | undefined>;
  setItem: (key: string, value: string) => void | Promise<void>;
}

export interface ThemeContextValue {
  theme: Theme;
  mode: ThemeMode;
  /** `true` for dark-background modes (`dark`, `black`, `dim`); use it for the status bar and color scheme. */
  isDark: boolean;
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
  direction: Direction;
  isRTL: boolean;
  locale: string;
  platform: DesignSystemPlatform;
  platformTokens: PlatformTokens;
  /** `false` while a saved preference is being read from `storage`. */
  preferenceLoaded: boolean;
}

const defaultContext: ThemeContextValue = {
  theme: defaultThemes.light,
  mode: 'light',
  isDark: false,
  preference: 'system',
  setPreference: () => undefined,
  direction: 'ltr',
  isRTL: false,
  locale: 'en',
  platform: 'default',
  platformTokens: resolvePlatformTokens('default'),
  preferenceLoaded: true,
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
  platform?: DesignSystemPlatform;
  /** Saves the user's choice (`setPreference`) and restores it on launch. Ignored when `preference` is controlled. */
  storage?: ThemePreferenceStorage;
  /** Storage key. Default `'bunyan.themePreference'`. */
  storageKey?: string;
}

const isPreference = (value: unknown): value is ThemePreference =>
  value === 'system' || (typeof value === 'string' && value in defaultThemes);

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
  platform: platformOverride,
  storage,
  storageKey = 'bunyan.themePreference',
}: ThemeProviderProps) {
  const [internalPreference, setInternalPreference] = useState<ThemePreference>(
    initialPreference,
  );
  const persist = Boolean(storage) && controlledPreference === undefined;
  const [preferenceLoaded, setPreferenceLoaded] = useState(!persist);
  const userChanged = useRef(false);
  useEffect(() => {
    if (!persist || !storage) return undefined;
    let active = true;
    Promise.resolve()
      .then(() => storage.getItem(storageKey))
      .then(saved => {
        // A choice made while loading wins over the saved one.
        if (active && !userChanged.current && isPreference(saved)) setInternalPreference(saved);
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setPreferenceLoaded(true);
      });
    return () => {
      active = false;
    };
  }, [persist, storage, storageKey]);
  const preference = controlledPreference ?? internalPreference;
  const setPreference = useCallback((nextPreference: ThemePreference) => {
    if (controlledPreference === undefined) {
      userChanged.current = true;
      setInternalPreference(nextPreference);
      if (storage) {
        Promise.resolve()
          .then(() => storage.setItem(storageKey, nextPreference))
          .catch(() => undefined);
      }
    }
    onPreferenceChange?.(nextPreference);
  }, [controlledPreference, onPreferenceChange, storage, storageKey]);
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
  const platform = platformOverride ?? getDesignSystemPlatform();
  const platformTokens = resolvePlatformTokens(platform);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme: activeTheme,
      mode,
      isDark: isDarkMode(mode),
      preference,
      setPreference,
      direction: resolvedDirection,
      isRTL: resolvedDirection === 'rtl',
      locale,
      platform,
      platformTokens,
      preferenceLoaded,
    }),
    [
      preferenceLoaded,
      activeTheme,
      locale,
      mode,
      platform,
      platformTokens,
      preference,
      resolvedDirection,
      setPreference,
    ],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
