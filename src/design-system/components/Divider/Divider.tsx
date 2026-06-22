import React, { memo } from 'react';
import { View } from 'react-native';
import { useTheme } from '../../hooks';

export interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  inset?: 'none' | 'small' | 'medium' | 'large';
  decorative?: boolean;
  testID?: string;
}

export const Divider = memo(function Divider({
  orientation = 'horizontal',
  inset = 'none',
  decorative = true,
  testID,
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
      testID={testID}
      accessibilityRole={decorative ? undefined : 'none'}
      style={orientation === 'horizontal'
        ? { height: theme.borderWidth.thin, backgroundColor: theme.color.border.secondary, marginHorizontal: insetValue }
        : { width: theme.borderWidth.thin, backgroundColor: theme.color.border.secondary, marginVertical: insetValue }}
    />
  );
});
