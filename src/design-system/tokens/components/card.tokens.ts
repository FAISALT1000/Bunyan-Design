import { radius, spacing } from '../primitives';

export const cardBaseTokens = {
  radius: radius.lg,
  size: {
    small: { padding: spacing.md, gap: spacing.sm },
    medium: { padding: spacing.lg, gap: spacing.md },
    large: { padding: spacing.xxl, gap: spacing.lg },
  },
} as const;
