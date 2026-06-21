import React, { memo } from 'react';
import { Pressable } from 'react-native';
import { useTheme } from '../../hooks';
import { logicalRow } from '../../utilities/styles';
import { Icon } from '../Icon';
import { Text } from '../Text';

export interface ChipProps {
  label: string;
  selected?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  onRemove?: () => void;
  accessibilityLabel?: string;
}

export const Chip = memo(function Chip({
  label,
  selected = false,
  disabled = false,
  onPress,
  onRemove,
  accessibilityLabel,
}: ChipProps) {
  const { theme, direction } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        logicalRow(direction),
        {
          alignItems: 'center',
          alignSelf: 'flex-start',
          gap: theme.spacing.sm,
          minHeight: theme.componentHeight.sm,
          paddingHorizontal: theme.spacing.md,
          borderRadius: theme.radius.pill,
          borderWidth: theme.borderWidth.thin,
          borderColor: selected ? theme.color.primary.default : theme.color.border.primary,
          backgroundColor: selected ? theme.color.primary.subtle : pressed ? theme.color.overlay.subtle : theme.color.surface.primary,
          opacity: disabled ? theme.opacity.disabled : theme.opacity.opaque,
        },
      ]}
    >
      <Text variant="label" weight="medium" tone={selected ? 'link' : 'primary'}>{label}</Text>
      {onRemove ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Remove ${label}`}
          hitSlop={theme.spacing.sm}
          onPress={event => {
            event.stopPropagation();
            onRemove();
          }}
        >
          <Icon name="close" size="sm" tone="secondary" />
        </Pressable>
      ) : null}
    </Pressable>
  );
});
