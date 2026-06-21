import React, { memo } from 'react';
import { Pressable, View } from 'react-native';
import { useTheme } from '../../hooks';
import { logicalRow } from '../../utilities/styles';
import { Text } from '../Text';

export interface RadioProps {
  selected: boolean;
  onSelect: () => void;
  label: string;
  description?: string;
  disabled?: boolean;
  value?: string;
}

export const Radio = memo(function Radio({
  selected,
  onSelect,
  label,
  description,
  disabled = false,
  value,
}: RadioProps) {
  const { theme, direction } = useTheme();
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={label}
      accessibilityHint={description}
      accessibilityValue={value ? { text: value } : undefined}
      accessibilityState={{ selected, disabled, checked: selected }}
      disabled={disabled}
      onPress={onSelect}
      style={({ pressed }) => [
        logicalRow(direction),
        { alignItems: 'flex-start', gap: theme.spacing.md, opacity: disabled ? theme.opacity.disabled : pressed ? theme.opacity.strong : theme.opacity.opaque },
      ]}
    >
      <View
        style={{
          width: theme.iconSize.lg,
          height: theme.iconSize.lg,
          borderRadius: theme.radius.pill,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: theme.borderWidth.medium,
          borderColor: selected ? theme.color.primary.default : theme.color.border.primary,
          backgroundColor: theme.color.surface.primary,
        }}
      >
        {selected ? (
          <View style={{ width: theme.iconSize.xs, height: theme.iconSize.xs, borderRadius: theme.radius.pill, backgroundColor: theme.color.primary.default }} />
        ) : null}
      </View>
      <View style={{ flex: 1 }}>
        <Text variant="label" weight="medium">{label}</Text>
        {description ? <Text variant="caption" tone="secondary">{description}</Text> : null}
      </View>
    </Pressable>
  );
});
