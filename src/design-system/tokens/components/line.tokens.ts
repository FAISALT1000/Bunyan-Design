import { componentHeight, opacity, spacing } from '../primitives';

export const lineBaseTokens = {
  minHeight: componentHeight.md,
  paddingHorizontal: spacing.lg,
  paddingVertical: spacing.md,
  sectionGap: spacing.lg,
  iconGap: spacing.md,
  textGap: spacing.xs,
  disabledOpacity: opacity.disabled,
  titleTextVariant: 'bodyMedium',
  subtitleTextVariant: 'bodySmall',
  tertiaryTextVariant: 'caption',
} as const;
