import React, { memo } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useTheme } from '../../hooks';
import { Text } from '../Text';

export interface SpinnerProps {
  size?: 'small' | 'large';
  label?: string;
  tone?: 'primary' | 'inverse';
}

export const Spinner = memo(function Spinner({ size = 'small', label = 'Loading', tone = 'primary' }: SpinnerProps) {
  const { theme } = useTheme();
  const color = tone === 'inverse' ? theme.color.text.inverse : theme.color.primary.default;
  return (
    <View accessibilityRole="progressbar" accessibilityLabel={label} style={{ alignItems: 'center', gap: theme.spacing.sm }}>
      <ActivityIndicator size={size} color={color} />
      {label ? <Text variant="caption" tone={tone === 'inverse' ? 'inverse' : 'secondary'}>{label}</Text> : null}
    </View>
  );
});
