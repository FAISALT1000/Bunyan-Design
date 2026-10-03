import { I18nManager, type TextStyle, type ViewStyle } from '../components/RNTheme/native';
import type { Direction, Theme } from '../themes/types';

export type ComponentSize = 'small' | 'medium' | 'large';
export type FeedbackStatus = 'default' | 'error' | 'success';
export type LogicalAlign = 'start' | 'center' | 'end';

/** Direction the native layout engine is already using (set via I18nManager). */
export const nativeDirection = (): Direction => (I18nManager.isRTL ? 'rtl' : 'ltr');

/**
 * React Native already mirrors `row` and swaps `left`/`right` text alignment
 * when the app runs natively in RTL. Bunyan's direction is provider-scoped, so
 * we only mirror when the requested direction differs from the native one —
 * otherwise RTL apps would be flipped twice and render left-to-right.
 */
export const needsMirroring = (direction: Direction) => direction !== nativeDirection();

export const logicalRow = (direction: Direction): ViewStyle => ({
  flexDirection: needsMirroring(direction) ? 'row-reverse' : 'row',
});

export const logicalTextAlign = (direction: Direction, align: LogicalAlign = 'start'): TextStyle['textAlign'] => {
  if (align === 'center') return 'center';
  // Value handed to the native engine, which itself swaps left/right in native RTL.
  const physicalStart = needsMirroring(direction) ? 'right' : 'left';
  const physicalEnd = physicalStart === 'left' ? 'right' : 'left';
  return align === 'start' ? physicalStart : physicalEnd;
};

export const logicalText = (direction: Direction, align: LogicalAlign = 'start'): TextStyle => ({
  textAlign: logicalTextAlign(direction, align),
  writingDirection: direction,
});

/** `alignItems` value that places children at the logical start or end. */
export const logicalAlignItems = (direction: Direction, align: Exclude<LogicalAlign, 'center'>): ViewStyle['alignItems'] => {
  const atStart = align === 'start';
  return needsMirroring(direction) === atStart ? 'flex-end' : 'flex-start';
};

export const heightForSize = (theme: Theme, size: ComponentSize) => ({
  small: theme.componentHeight.sm,
  medium: theme.componentHeight.md,
  large: theme.componentHeight.lg,
})[size];

export const horizontalPaddingForSize = (theme: Theme, size: ComponentSize) => ({
  small: theme.spacing.md,
  medium: theme.spacing.lg,
  large: theme.spacing.xl,
})[size];

export const iconSizeForComponent = (theme: Theme, size: ComponentSize) => ({
  small: theme.iconSize.sm,
  medium: theme.iconSize.md,
  large: theme.iconSize.lg,
})[size];

/** Icon size token name matching a component size. */
export const iconTokenForSize = (size: ComponentSize) => (
  size === 'small' ? 'sm' : size === 'large' ? 'lg' : 'md'
) as 'sm' | 'md' | 'lg';

export const statusBorderColor = (theme: Theme, status: FeedbackStatus) => {
  if (status === 'error') return theme.color.border.error;
  if (status === 'success') return theme.color.border.success;
  return theme.color.border.primary;
};

export const fontFamilyFor = (theme: Theme, direction: Direction) =>
  direction === 'rtl' ? theme.typography.fontFamily.arabic : theme.typography.fontFamily.sans;

export const mergeIds = (...ids: Array<string | undefined>) => ids.filter(Boolean).join(' ') || undefined;
