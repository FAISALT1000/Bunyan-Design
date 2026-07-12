import React, { memo } from 'react';
import { Box } from '../../base/Box';
import { Inline } from '../../base/Inline';
import { BasePressable } from '../../base/Pressable';
import { Stack } from '../../base/Stack';
import { useTheme } from '../../hooks';
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
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
}

export const Checkbox = memo(function Checkbox({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  indeterminate = false,
  error = false,
  accessibilityLabel,
  accessibilityHint,
  testID,
}: CheckboxProps) {
  const { theme } = useTheme();
  const active = checked || indeterminate;

  return (
    <BasePressable
      accessibilityRole="checkbox"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint ?? description}
      accessibilityState={{
        checked: indeterminate ? 'mixed' : checked,
        disabled,
      }}
      testID={testID}
      disabled={disabled}
      onPress={() => onChange(!checked)}
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
          radius="sm"
          alignItems="center"
          justifyContent="center"
          internalStyle={{
            borderWidth: theme.borderWidth.medium,
            borderColor: error
              ? theme.color.border.error
              : active
                ? theme.color.primary.default
                : theme.color.border.primary,
            backgroundColor: active
              ? theme.color.primary.default
              : theme.color.surface.primary,
          }}
        >
          {checked ? (
            <Icon name="check" size="sm" tone="inverse" />
          ) : indeterminate ? (
            <Box
              width={theme.iconSize.sm}
              height={theme.borderWidth.medium}
              internalStyle={{ backgroundColor: theme.color.text.inverse }}
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
              tone={error ? 'error' : disabled ? 'disabled' : 'secondary'}
            />
          ) : null}
        </Stack>
      </Inline>
    </BasePressable>
  );
});
