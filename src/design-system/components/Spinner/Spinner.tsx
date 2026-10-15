import React, { memo } from 'react';
import { View } from '../RNTheme';
import { ActivityIndicator } from '../RNTheme/native';
import { useTheme } from '../../hooks';
import { Text } from '../Text';
import { useStrings } from '../../i18n/strings';

export interface SpinnerProps {
  size?: 'small' | 'large';
  label?: string;
  tone?: 'primary' | 'inverse';
  showLabel?: boolean;
  accessible?: boolean;
}

export const Spinner = memo(function Spinner({
  size = 'small',
  label: labelProp,
  tone = 'primary',
  showLabel = true,
  accessible = true,
}: SpinnerProps) {
  const strings = useStrings();
  const label = labelProp ?? strings('loading');
  const { theme } = useTheme();
  const color = tone === 'inverse' ? theme.color.text.inverse : theme.color.primary.default;
  return (
    <View
      accessible={accessible}
      accessibilityElementsHidden={!accessible}
      importantForAccessibility={accessible ? 'auto' : 'no-hide-descendants'}
      accessibilityRole={accessible ? 'progressbar' : undefined}
      accessibilityLabel={accessible ? label : undefined}
      style={{ alignItems: 'center', gap: theme.spacing.sm }}
    >
      <ActivityIndicator size={size} color={color} />
      {label && showLabel ? (
        <Text
          value={label}
          variant="caption"
          tone={tone === 'inverse' ? 'inverse' : 'secondary'}
        />
      ) : null}
    </View>
  );
});
