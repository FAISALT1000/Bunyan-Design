import { createResponsive } from './createResponsive';

export * from './createResponsive';

/**
 * Bunyan's default toolkit: theme breakpoints (`compact` 0, `medium` 600,
 * `expanded` 1024, `wide` 1440) and a 375×812 design canvas.
 * Projects with their own tokens call `createResponsive({...})` instead.
 */
export const {
  useResponsive,
  useBreakpoint,
  useResponsiveValue,
  makeStyles,
  s,
  vs,
  ms,
  mvs,
  scale,
  verticalScale,
  moderateScale,
  moderateVerticalScale,
} = createResponsive();

/** Pure tools for an explicit window size with the default config (tests, SSR, previews). */
export const getResponsive = createResponsive().get;
