import type { TextStyle, ViewStyle } from 'react-native';
import type { Direction, Theme } from '../themes/types';

export type ComponentSize = 'small' | 'medium' | 'large';
export type FeedbackStatus = 'default' | 'error' | 'success';

export const logicalRow = (direction: Direction): ViewStyle => ({
  flexDirection: direction === 'rtl' ? 'row-reverse' : 'row',
});

export const logicalText = (direction: Direction): TextStyle => ({
  textAlign: direction === 'rtl' ? 'right' : 'left',
  writingDirection: direction,
});

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

export const statusBorderColor = (theme: Theme, status: FeedbackStatus) => {
  if (status === 'error') return theme.color.border.error;
  if (status === 'success') return theme.color.border.success;
  return theme.color.border.primary;
};

export const mergeIds = (...ids: Array<string | undefined>) => ids.filter(Boolean).join(' ') || undefined;
