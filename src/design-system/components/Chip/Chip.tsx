import React, { memo } from 'react';
import { Inline } from '../../base/Inline';
import { BasePressable } from '../../base/Pressable';
import { useTheme } from '../../hooks';
import { Icon } from '../Icon';
import { Text } from '../Text';

export interface ChipProps {
  label: string;
  selected?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  onRemove?: () => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
}

export const Chip = memo(function Chip({
  label,
  selected = false,
  disabled = false,
  onPress,
  onRemove,
  accessibilityLabel,
  accessibilityHint,
  testID,
}: ChipProps) {
  const { theme } = useTheme();

  return (
    <BasePressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ selected, disabled }}
      testID={testID}
      disabled={disabled}
      onPress={onPress}
      baseStyle={{
        alignSelf: 'flex-start',
        minHeight: theme.componentHeight.sm,
        // The minimum touch target can make the chip taller than its content:
        // keep the label and remove icon centred on both axes.
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.md,
        borderRadius: theme.radius.pill,
        borderWidth: theme.borderWidth.thin,
        borderColor: selected
          ? theme.color.primary.default
          : theme.color.border.primary,
        backgroundColor: selected
          ? theme.color.primary.subtle
          : theme.color.surface.primary,
      }}
      pressedStyle={{ backgroundColor: theme.color.overlay.subtle }}
      focusedStyle={{
        borderColor: theme.color.border.focus,
        borderWidth: theme.borderWidth.medium,
      }}
      disabledStyle={{ opacity: theme.opacity.disabled }}
    >
      <Inline gap="sm" alignItems="center">
        <Text
          value={label}
          variant="labelMedium"
          weight="medium"
          tone={selected ? 'info' : disabled ? 'disabled' : 'primary'}
        />
        {onRemove ? (
          <BasePressable
            accessibilityRole="button"
            accessibilityLabel={`Remove ${label}`}
            onPress={onRemove}
            stopPropagation
            minTouchTarget={false}
            baseStyle={{ padding: theme.spacing.sm }}
          >
            <Icon name="close" size="sm" tone="secondary" />
          </BasePressable>
        ) : null}
      </Inline>
    </BasePressable>
  );
});
