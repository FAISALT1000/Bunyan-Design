import type { TextVariant } from '../tokens/typography.types';
import { typography } from '../tokens/primitives';
import type { Theme } from '../themes/types';
import type { DesignSystemPlatform, PlatformTokens } from './platform.types';

export interface TextMetrics { fontSize: number; lineHeight: number }
export type PlatformTypography = Partial<Record<TextVariant, TextMetrics>>;

/** Bunyan roles mapped to iOS text styles and Material 3 type roles. */
export const iosTypography: PlatformTypography = {
  displayLarge: { fontSize: 34, lineHeight: 41 },
  displayMedium: { fontSize: 28, lineHeight: 34 },
  headingLarge: { fontSize: 22, lineHeight: 28 },
  headingMedium: { fontSize: 20, lineHeight: 25 },
  headingSmall: { fontSize: 17, lineHeight: 22 },
  bodyLarge: { fontSize: 17, lineHeight: 22 },
  bodyMedium: { fontSize: 17, lineHeight: 22 },
  bodySmall: { fontSize: 15, lineHeight: 20 },
  labelLarge: { fontSize: 17, lineHeight: 22 },
  labelMedium: { fontSize: 15, lineHeight: 20 },
  labelSmall: { fontSize: 13, lineHeight: 18 },
  caption: { fontSize: 12, lineHeight: 16 },
};

export const androidTypography: PlatformTypography = {
  displayLarge: { fontSize: 57, lineHeight: 64 },
  displayMedium: { fontSize: 45, lineHeight: 52 },
  headingLarge: { fontSize: 32, lineHeight: 40 },
  headingMedium: { fontSize: 28, lineHeight: 36 },
  headingSmall: { fontSize: 24, lineHeight: 32 },
  bodyLarge: { fontSize: 16, lineHeight: 24 },
  bodyMedium: { fontSize: 14, lineHeight: 20 },
  bodySmall: { fontSize: 12, lineHeight: 16 },
  labelLarge: { fontSize: 14, lineHeight: 20 },
  labelMedium: { fontSize: 12, lineHeight: 16 },
  labelSmall: { fontSize: 11, lineHeight: 16 },
  caption: { fontSize: 12, lineHeight: 16 },
};

const metricKeys: Record<TextVariant, keyof typeof typography.fontSize> = {
  displayLarge: 'displayMd', displayMedium: 'displaySm', headingLarge: 'xxl',
  headingMedium: 'xl', headingSmall: 'lg', bodyLarge: 'lg', bodyMedium: 'md',
  bodySmall: 'sm', labelLarge: 'md', labelMedium: 'sm', labelSmall: 'xs',
  caption: 'xs', micro: 'xxs',
};

/** Keep primitive theme adjustments proportional; explicit role overrides win. */
export function resolveTextMetrics(
  theme: Theme,
  platform: DesignSystemPlatform,
  platformTokens: PlatformTokens,
  variant: TextVariant,
): TextMetrics {
  const key = metricKeys[variant];
  const defaults = platformTokens.typography[variant];
  const overrides = theme.typography.platformStyles?.[platform]?.[variant];
  return {
    fontSize: overrides?.fontSize ?? (defaults
      ? defaults.fontSize * theme.typography.fontSize[key] / typography.fontSize[key]
      : theme.typography.fontSize[key]),
    lineHeight: overrides?.lineHeight ?? (defaults
      ? defaults.lineHeight * theme.typography.lineHeight[key] / typography.lineHeight[key]
      : theme.typography.lineHeight[key]),
  };
}
