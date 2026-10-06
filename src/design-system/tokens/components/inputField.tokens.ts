import {
  borderWidth,
  componentHeight,
  motion,
  radius,
  spacing,
  typography,
} from '../primitives';

export const inputFieldBaseTokens = {
  minHeight: componentHeight.lg,
  radius: radius.md,
  contentPaddingHorizontal: spacing.lg,
  contentPaddingTop: spacing.xl,
  contentPaddingBottom: spacing.sm,
  iconGap: spacing.sm,
  helperTextSpacing: spacing.xs,
  labelRestingTop: spacing.lg,
  labelFloatingTop: spacing.xs,
  labelScale: 0.82,
  labelFontSize: typography.fontSize.md,
  animationDuration: motion.duration.fast,
  animationEasing: motion.easing.standard,
  variants: {
    outlined: {
      borderWidth: borderWidth.thin,
      focusedBorderWidth: borderWidth.medium,
    },
    filled: {
      borderWidth: borderWidth.none,
      focusedBorderWidth: borderWidth.medium,
    },
    underlined: {
      borderWidth: borderWidth.thin,
      focusedBorderWidth: borderWidth.medium,
    },
  },
} as const;
