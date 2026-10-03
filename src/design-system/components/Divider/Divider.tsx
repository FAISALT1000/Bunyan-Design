import React, { memo } from 'react';
import { View } from '../RNTheme';
import { useTheme } from '../../hooks';

export interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  inset?: 'none' | 'small' | 'medium' | 'large';
  decorative?: boolean;
}

export const Divider = memo(function Divider({
  orientation = 'horizontal',
  inset = 'none',
  decorative = true,
}: DividerProps) {
  const { theme } = useTheme();
  const insetValue = {
    none: theme.spacing.none,
    small: theme.spacing.sm,
    medium: theme.spacing.lg,
    large: theme.spacing.xxl,
  }[inset];
  return (
    <View
      // Decorative dividers are hidden from assistive tech; semantic ones are separators.
      {...(decorative
        ? { accessible: false, accessibilityElementsHidden: true, importantForAccessibility: 'no-hide-descendants' as const }
        : { role: 'separator' as const, 'aria-orientation': orientation })}
      style={orientation === 'horizontal'
        ? { height: theme.borderWidth.thin, alignSelf: 'stretch', backgroundColor: theme.color.border.secondary, marginHorizontal: insetValue }
        : { width: theme.borderWidth.thin, alignSelf: 'stretch', backgroundColor: theme.color.border.secondary, marginVertical: insetValue }}
    />
  );
});
