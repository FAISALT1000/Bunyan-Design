import React, { memo } from 'react';
import { Box } from '../../base/Box';
import { Inline } from '../../base/Inline';
import { BasePressable } from '../../base/Pressable';
import { Stack } from '../../base/Stack';
import { useTheme } from '../../hooks';
import { Text } from '../Text';

export interface RadioProps {
  selected: boolean;
  onSelect: () => void;
  label: string;
  description?: string;
  disabled?: boolean;
  value?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
}

export const Radio = memo(function Radio({
  selected,
  onSelect,
  label,
  description,
  disabled = false,
  value,
  accessibilityLabel,
  accessibilityHint,
  testID,
}: RadioProps) {
  const { theme } = useTheme();

  return (
    <BasePressable
      accessibilityRole="radio"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint ?? description}
      accessibilityValue={value ? { text: value } : undefined}
      accessibilityState={{ selected, disabled, checked: selected }}
      testID={testID}
      disabled={disabled}
      onPress={onSelect}
      baseStyle={{ alignSelf: 'stretch' }}
      pressedStyle={{ opacity: theme.opacity.strong }}
      focusedStyle={{
        borderColor: theme.color.border.focus,
        borderWidth: theme.borderWidth.medium,
        borderRadius: theme.radius.md,
      }}
      disabledStyle={{ opacity: theme.opacity.disabled }}
    >
      <Inline gap="md" alignItems="flex-start">
        <Box
          width={theme.iconSize.lg}
          height={theme.iconSize.lg}
          radius="pill"
          alignItems="center"
          justifyContent="center"
          internalStyle={{
            borderWidth: theme.borderWidth.medium,
            borderColor: selected
              ? theme.color.primary.default
              : theme.color.border.primary,
            backgroundColor: theme.color.surface.primary,
          }}
        >
          {selected ? (
            <Box
              width={theme.iconSize.xs}
              height={theme.iconSize.xs}
              radius="pill"
              internalStyle={{ backgroundColor: theme.color.primary.default }}
            />
          ) : null}
        </Box>
        <Stack flex={1} gap="xxs">
          <Text
            value={label}
            variant="labelMedium"
            weight="medium"
            tone={disabled ? 'disabled' : 'primary'}
          />
          {description ? (
            <Text
              value={description}
              variant="caption"
              tone={disabled ? 'disabled' : 'secondary'}
            />
          ) : null}
        </Stack>
      </Inline>
    </BasePressable>
  );
});
