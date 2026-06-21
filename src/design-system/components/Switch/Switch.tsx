import React, { memo } from 'react';
import { Switch as RNSwitch, View } from 'react-native';
import { useTheme } from '../../hooks';
import { logicalRow } from '../../utilities/styles';
import { Text } from '../Text';

export interface SwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
}

export const Switch = memo(function Switch({
  value,
  onValueChange,
  label,
  description,
  disabled = false,
}: SwitchProps) {
  const { theme, direction } = useTheme();
  return (
    <View style={[logicalRow(direction), { alignItems: 'center', justifyContent: 'space-between', gap: theme.spacing.lg }]}>
      <View style={{ flex: 1 }}>
        <Text variant="label" weight="medium">{label}</Text>
        {description ? <Text variant="caption" tone="secondary">{description}</Text> : null}
      </View>
      <RNSwitch
        accessibilityLabel={label}
        accessibilityHint={description}
        accessibilityRole="switch"
        accessibilityState={{ checked: value, disabled }}
        value={value}
        disabled={disabled}
        onValueChange={onValueChange}
        trackColor={{ false: theme.color.disabled.background, true: theme.color.primary.default }}
        thumbColor={value ? theme.color.primary.contrast : theme.color.neutral.default}
        ios_backgroundColor={theme.color.disabled.background}
      />
    </View>
  );
});
