import React, { memo } from 'react';
import { Pressable, View } from '../RNTheme';
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
  removeLabel?: (label: string) => string;
  testID?: string;
}

export const Chip = memo(function Chip({
  label,
  selected = false,
  disabled = false,
  onPress,
  onRemove,
  accessibilityLabel,
  removeLabel = value => `Remove ${value}`,
  testID,
}: ChipProps) {
  const { theme, direction } = useTheme();
  const containerStyle = {
    ...logicalRow(direction),
    alignItems: 'center' as const,
    alignSelf: 'flex-start' as const,
    minHeight: theme.componentHeight.sm,
    borderRadius: theme.radius.pill,
    borderWidth: theme.borderWidth.thin,
    borderColor: selected ? theme.color.primary.default : theme.color.border.primary,
    backgroundColor: selected ? theme.color.primary.subtle : theme.color.surface.primary,
    opacity: disabled ? theme.opacity.disabled : theme.opacity.opaque,
    overflow: 'hidden' as const,
  };

  // The chip and its remove control are siblings, not nested pressables: nested
  // buttons are not reachable by screen readers and swallow each other's presses.
  return (
    <View testID={testID} style={containerStyle}>
      <Pressable
        accessibilityRole={onPress ? 'button' : 'text'}
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityState={{ selected, disabled }}
        disabled={disabled || !onPress}
        onPress={onPress}
        style={({ pressed }) => ({
          justifyContent: 'center',
          minHeight: theme.componentHeight.sm,
          paddingHorizontal: theme.spacing.md,
          backgroundColor: pressed ? theme.color.overlay.subtle : theme.color.overlay.transparent,
        })}
      >
        <Text variant="label" weight="medium" tone={selected ? 'link' : 'primary'}>{label}</Text>
      </Pressable>
      {onRemove ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={removeLabel(label)}
          accessibilityState={{ disabled }}
          disabled={disabled}
          hitSlop={theme.spacing.sm}
          onPress={onRemove}
          style={({ pressed }) => ({
            justifyContent: 'center',
            minHeight: theme.componentHeight.sm,
            paddingHorizontal: theme.spacing.sm,
            backgroundColor: pressed ? theme.color.overlay.subtle : theme.color.overlay.transparent,
          })}
        >
          <Icon name="close" size="sm" tone="secondary" />
        </Pressable>
      ) : null}
    </View>
  );
});
