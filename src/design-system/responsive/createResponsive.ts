import { useMemo } from 'react';
import {
  Dimensions,
  PixelRatio,
  StyleSheet,
  useWindowDimensions,
  type ImageStyle,
  type TextStyle,
  type ViewStyle,
} from '../components/RNTheme/native';
import { useTheme } from '../hooks/useTheme';
// Used by the static helpers (no theme available outside components).
import { breakpoint as DEFAULT_BREAKPOINTS } from '../tokens/primitives';
import type { Theme } from '../themes/types';

/** Breakpoint name → minimum window width (points). */
export type Breakpoints = Readonly<Record<string, number>>;

export interface ResponsiveConfig<B extends Breakpoints = Theme['breakpoint']> {
  /**
   * Your breakpoints, e.g. `{ phone: 0, tablet: 768, desktop: 1200 }`.
   * Omit to use the active theme's `breakpoint` tokens (so `createTheme`
   * overrides flow through automatically).
   */
  breakpoints?: B;
  /** Width of the design canvas the sizes were drawn on (e.g. the Figma frame). Default `375`. */
  guidelineWidth?: number;
  /** Height of the design canvas. Default `812`. */
  guidelineHeight?: number;
  /** Lower clamp of the scale ratio, so small phones never shrink below it. Default `0.85`. */
  minScale?: number;
  /** Upper clamp of the scale ratio, so tablets do not look like zoomed phones. Default `1.35`. */
  maxScale?: number;
  /** How much of the scale `ms` / `mvs` apply by default (0 = none, 1 = full). Default `0.5`. */
  moderateFactor?: number;
  /** Round results to the nearest physical pixel. Default `true`. */
  roundToPixel?: boolean;
}

export interface WindowSize {
  width: number;
  height: number;
}

/** `{ [breakpoint]: value }`, mobile-first: each value applies from its breakpoint upwards. */
export type ResponsiveValues<K extends string, V> = Partial<Record<K, V>> & { default?: V };

/** A plain value, or one value per breakpoint. */
export type Responsive<K extends string, V> = V | ResponsiveValues<K, V>;

export interface ResponsiveTools<K extends string> {
  width: number;
  height: number;
  /** Current breakpoint name. */
  breakpoint: K;
  isPortrait: boolean;
  isLandscape: boolean;
  /** Current breakpoint is exactly `bp`. */
  is: (bp: K) => boolean;
  /** Window is at least `bp` wide (`up('medium')` → tablets and larger). */
  up: (bp: K) => boolean;
  /** Window is narrower than `bp` (`down('medium')` → phones). */
  down: (bp: K) => boolean;
  /** `min` ≤ width < `max`. */
  between: (min: K, max: K) => boolean;
  /**
   * Pick a value for the current breakpoint, mobile-first:
   * `select({ compact: 1, medium: 2, expanded: 3 })`. Falls back to the nearest
   * smaller breakpoint, then `default`.
   */
  select: {
    <V>(values: ResponsiveValues<K, V> & { default: V }): V;
    <V>(values: ResponsiveValues<K, V>): V | undefined;
  };
  /** Resolve a `Responsive` prop: plain values pass through, breakpoint maps go through `select`. */
  resolve: <V>(value: Responsive<K, V>) => V | undefined;
  /** Scale with the window's short side (widths, paddings, icons). */
  s: (size: number) => number;
  /** Scale with the window's long side (heights, vertical spacing). */
  vs: (size: number) => number;
  /** Moderate scale: only `factor` (default 0.5) of `s`. Best for fonts and radii. */
  ms: (size: number, factor?: number) => number;
  /** Moderate vertical scale. */
  mvs: (size: number, factor?: number) => number;
  /** Long names of the same functions. */
  scale: (size: number) => number;
  verticalScale: (size: number) => number;
  moderateScale: (size: number, factor?: number) => number;
  moderateVerticalScale: (size: number, factor?: number) => number;
}

type NamedStyles<T> = { [P in keyof T]: ViewStyle | TextStyle | ImageStyle };

const DEFAULTS = {
  guidelineWidth: 375,
  guidelineHeight: 812,
  minScale: 0.85,
  maxScale: 1.35,
  moderateFactor: 0.5,
  roundToPixel: true,
};

const isBreakpointMap = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/**
 * Pure responsive calculator: give it breakpoints, a config and a window size,
 * get the tools back. Usable anywhere (tests, StyleSheet factories, web SSR).
 */
export function computeResponsive<K extends string>(
  breakpoints: Readonly<Record<K, number>>,
  size: WindowSize,
  config: Omit<ResponsiveConfig, 'breakpoints'> = {},
): ResponsiveTools<K> {
  const options = { ...DEFAULTS, ...config };
  const { width, height } = size;
  const shortSide = Math.min(width, height);
  const longSide = Math.max(width, height);
  const clamp = (ratio: number) => Math.min(options.maxScale, Math.max(options.minScale, ratio));
  const ratioX = clamp(shortSide / options.guidelineWidth);
  const ratioY = clamp(longSide / options.guidelineHeight);
  const round = (value: number) => (options.roundToPixel ? PixelRatio.roundToNearestPixel(value) : value);

  const ordered = (Object.entries(breakpoints) as [K, number][]).sort((a, b) => a[1] - b[1]);
  if (ordered.length === 0) throw new Error('Responsive: at least one breakpoint is required');
  const current = ordered.reduce<K>((found, [name, min]) => (width >= min ? name : found), ordered[0]![0]);
  const minOf = (bp: K) => breakpoints[bp] ?? 0;

  const select = (<V,>(values: ResponsiveValues<K, V>) => {
    const index = ordered.findIndex(([name]) => name === current);
    for (let i = index; i >= 0; i -= 1) {
      const name = ordered[i]![0];
      if (values[name] !== undefined) return values[name];
    }
    return values.default;
  }) as ResponsiveTools<K>['select'];

  const s = (value: number) => round(value * ratioX);
  const vs = (value: number) => round(value * ratioY);
  const ms = (value: number, factor = options.moderateFactor) => round(value + (value * ratioX - value) * factor);
  const mvs = (value: number, factor = options.moderateFactor) => round(value + (value * ratioY - value) * factor);

  return {
    width,
    height,
    breakpoint: current,
    isPortrait: height >= width,
    isLandscape: width > height,
    is: bp => bp === current,
    up: bp => width >= minOf(bp),
    down: bp => width < minOf(bp),
    between: (min, max) => width >= minOf(min) && width < minOf(max),
    select,
    resolve: <V,>(value: Responsive<K, V>) => {
      const keys = ordered.map(([name]) => name as string);
      if (isBreakpointMap(value) && Object.keys(value).every(key => key === 'default' || keys.includes(key))) {
        return select(value as ResponsiveValues<K, V>);
      }
      return value as V;
    },
    s,
    vs,
    ms,
    mvs,
    scale: s,
    verticalScale: vs,
    moderateScale: ms,
    moderateVerticalScale: mvs,
  };
}

/**
 * Creates a responsive toolkit bound to your breakpoints and design canvas.
 *
 * ```ts
 * // responsive.ts in your app — your own tokens, your own names
 * export const { useResponsive, makeStyles, s, vs, ms } = createResponsive({
 *   breakpoints: { phone: 0, tablet: 768, desktop: 1200 },
 *   guidelineWidth: 390,
 * });
 * ```
 */
export function createResponsive<B extends Breakpoints = Theme['breakpoint']>(config: ResponsiveConfig<B> = {}) {
  type K = Extract<keyof B, string>;
  const { breakpoints: ownBreakpoints, ...options } = config;

  /** Tools for an explicit size, or the current window (read at call time). */
  const get = (size: WindowSize = Dimensions.get('window'), breakpoints?: Readonly<Record<K, number>>) =>
    computeResponsive<K>(breakpoints ?? (ownBreakpoints as unknown as Record<K, number>) ?? (DEFAULT_BREAKPOINTS as Record<K, number>), size, options);

  /** Re-renders on rotation, split-screen and window resize. */
  function useResponsive(): ResponsiveTools<K> {
    const { width, height } = useWindowDimensions();
    const { theme } = useTheme();
    const breakpoints = (ownBreakpoints ?? theme.breakpoint) as unknown as Record<K, number>;
    return useMemo(() => computeResponsive<K>(breakpoints, { width, height }, options), [breakpoints, height, width]);
  }

  /** Current breakpoint name. */
  function useBreakpoint(): K {
    return useResponsive().breakpoint;
  }

  /** `useResponsiveValue({ compact: 1, medium: 2 })` → value for the current breakpoint. */
  function useResponsiveValue<V>(values: Responsive<K, V>): V | undefined {
    return useResponsive().resolve(values);
  }

  /**
   * Theme- and size-aware styles, memoised per theme and window size.
   *
   * ```ts
   * const useStyles = makeStyles((theme, r) => ({
   *   card: { padding: r.ms(theme.spacing.lg), width: r.select({ compact: '100%', medium: '48%' }) },
   *   title: { fontSize: r.ms(theme.typography.fontSize.xl) },
   * }));
   * const styles = useStyles();
   * ```
   */
  function makeStyles<T extends NamedStyles<T>>(factory: (theme: Theme, r: ResponsiveTools<K>) => T & NamedStyles<T>) {
    return function useStyles(): T {
      const { theme } = useTheme();
      const r = useResponsive();
      return useMemo(() => StyleSheet.create(factory(theme, r)) as T, [theme, r]);
    };
  }

  // Static helpers read the window when called. They do not re-render on resize:
  // use them for module-level StyleSheets; use the hook inside components.
  const s = (size: number) => get().s(size);
  const vs = (size: number) => get().vs(size);
  const ms = (size: number, factor?: number) => get().ms(size, factor);
  const mvs = (size: number, factor?: number) => get().mvs(size, factor);

  return {
    useResponsive,
    useBreakpoint,
    useResponsiveValue,
    makeStyles,
    get,
    s,
    vs,
    ms,
    mvs,
    scale: s,
    verticalScale: vs,
    moderateScale: ms,
    moderateVerticalScale: mvs,
  };
}
