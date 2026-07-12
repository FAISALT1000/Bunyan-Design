import React, { memo } from 'react';
import { Inline } from '../../base/Inline';
import { Stack } from '../../base/Stack';
import { BaseSwitch } from '../../base/Switch';
import { useTheme } from '../../hooks';
import { createAccessibilityState } from '../../utilities/accessibility';
import { Text } from '../Text';

export interface SwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
}

export const Switch = memo(function Switch({
  value,
  onValueChange,
  label,
  description,
  disabled = false,
  accessibilityLabel,
  accessibilityHint,
  testID,
}: SwitchProps) {
  const { theme } = useTheme();

  return (
    <Inline gap="lg" alignItems="center" justifyContent="space-between">
      <Stack flex={1} gap="xxs">
        <Text value={label} variant="labelMedium" weight="medium" />
        {description ? (
          <Text value={description} variant="caption" tone="secondary" />
        ) : null}
      </Stack>
      <BaseSwitch
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityHint={accessibilityHint ?? description}
        accessibilityRole="switch"
        accessibilityState={createAccessibilityState({
          checked: value,
          disabled,
        })}
        testID={testID}
        value={value}
        disabled={disabled}
        onValueChange={onValueChange}
        trackColor={{
          false: theme.color.disabled.background,
          true: theme.color.primary.default,
        }}
        thumbColor={
          value ? theme.color.primary.contrast : theme.color.neutral.default
        }
        ios_backgroundColor={theme.color.disabled.background}
      />
    </Inline>
  );
});
