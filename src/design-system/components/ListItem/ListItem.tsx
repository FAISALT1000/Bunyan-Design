import React, { memo } from 'react';
import { Box } from '../../base/Box';
import { Inline } from '../../base/Inline';
import { BasePressable } from '../../base/Pressable';
import { Stack } from '../../base/Stack';
import { useTheme } from '../../hooks';
import {
  createAccessibilityLabel,
  createAccessibilityState,
} from '../../utilities/accessibility';
import { Icon, type IconName } from '../Icon';
import { Text } from '../Text';

export interface ListItemProps {
  title: string;
  description?: string;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  selected?: boolean;
  showChevron?: boolean;
  chevronIcon?: IconName;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
}

export const ListItem = memo(function ListItem({
  title,
  description,
  leading,
  trailing,
  onPress,
  disabled = false,
  selected = false,
  showChevron = Boolean(onPress),
  chevronIcon = 'chevron-end',
  accessibilityLabel,
  accessibilityHint,
  testID,
}: ListItemProps) {
  const { theme } = useTheme();
  const resolvedLabel = accessibilityLabel
    ?? createAccessibilityLabel([title, description]);
  const content = (
    <Inline gap="md" alignItems="center">
      {leading}
      <Stack flex={1} gap="xxs">
        <Text value={title} variant="labelMedium" weight="medium" />
        {description ? (
          <Text value={description} variant="bodySmall" tone="secondary" />
        ) : null}
      </Stack>
      {trailing}
      {showChevron ? (
        <Icon name={chevronIcon} size="sm" tone="tertiary" mirroredInRTL />
      ) : null}
    </Inline>
  );
  const containerStyle = {
    minHeight: theme.componentHeight.xl,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.md,
    borderWidth: theme.borderWidth.none,
    borderColor: theme.color.border.focus,
    backgroundColor: selected
      ? theme.color.primary.subtle
      : theme.color.overlay.transparent,
  } as const;

  if (!onPress) {
    return (
      <Box
        accessible
        accessibilityLabel={resolvedLabel}
        accessibilityHint={accessibilityHint}
        accessibilityState={createAccessibilityState({ disabled, selected })}
        testID={testID}
        opacity={disabled ? theme.opacity.disabled : theme.opacity.opaque}
        internalStyle={containerStyle}
      >
        {content}
      </Box>
    );
  }

  return (
    <BasePressable
      accessibilityRole="button"
      accessibilityLabel={resolvedLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={createAccessibilityState({ disabled, selected })}
      disabled={disabled}
      onPress={onPress}
      testID={testID}
      baseStyle={containerStyle}
      pressedStyle={{ backgroundColor: theme.color.overlay.subtle }}
      hoveredStyle={{ backgroundColor: theme.color.overlay.subtle }}
      focusedStyle={{
        borderColor: theme.color.border.focus,
        borderWidth: theme.borderWidth.medium,
      }}
      disabledStyle={{ opacity: theme.opacity.disabled }}
    >
      {content}
    </BasePressable>
  );
});
