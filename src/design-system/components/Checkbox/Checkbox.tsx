import React, { memo } from 'react';
import { Pressable, View } from 'react-native';
import { useTheme } from '../../hooks';
import { logicalRow } from '../../utilities/styles';
import { Icon } from '../Icon';
import { Text } from '../Text';

export interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
  indeterminate?: boolean;
  error?: boolean;
}

export const Checkbox = memo(function Checkbox({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  indeterminate = false,
  error = false,
}: CheckboxProps) {
  const { theme, direction } = useTheme();
  const active = checked || indeterminate;
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      accessibilityHint={description}
      accessibilityState={{ checked: indeterminate ? 'mixed' : checked, disabled }}
      disabled={disabled}
      onPress={() => onChange(!checked)}
      style={({ pressed }) => [
        logicalRow(direction),
        { alignItems: 'flex-start', gap: theme.spacing.md, opacity: disabled ? theme.opacity.disabled : pressed ? theme.opacity.strong : theme.opacity.opaque },
      ]}
    >
      <View
        style={{
          width: theme.iconSize.lg,
          height: theme.iconSize.lg,
          borderRadius: theme.radius.sm,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: theme.borderWidth.medium,
          borderColor: error ? theme.color.border.error : active ? theme.color.primary.default : theme.color.border.primary,
          backgroundColor: active ? theme.color.primary.default : theme.color.surface.primary,
        }}
      >
        {checked ? <Icon name="check" size="sm" tone="inverse" /> : indeterminate ? (
          <View style={{ width: theme.iconSize.sm, height: theme.borderWidth.medium, backgroundColor: theme.color.text.inverse }} />
        ) : null}
      </View>
      <View style={{ flex: 1 }}>
        <Text variant="label" weight="medium">{label}</Text>
        {description ? <Text variant="caption" tone="secondary">{description}</Text> : null}
      </View>
    </Pressable>
  );
});
