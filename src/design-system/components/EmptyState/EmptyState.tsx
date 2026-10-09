import React, { memo } from 'react';
import { Box } from '../../base/Box';
import { Stack } from '../../base/Stack';
import { useTheme } from '../../hooks';
import { Button } from '../Button';
import { Heading } from '../Heading';
import { Icon, type IconName } from '../Icon';
import { Text } from '../Text';

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: IconName;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  accessibilityLabel?: string;
  testID?: string;
}

export const EmptyState = memo(function EmptyState({
  title,
  description,
  icon = 'info',
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  accessibilityLabel,
  testID,
}: EmptyStateProps) {
  const { theme } = useTheme();

  return (
    <Stack
      gap="md"
      padding="xxxl"
      alignItems="center"
      accessible
      accessibilityLabel={accessibilityLabel}
      testID={testID}
    >
      <Box
        width={theme.componentHeight.xl}
        height={theme.componentHeight.xl}
        radius="pill"
        alignItems="center"
        justifyContent="center"
        internalStyle={{ backgroundColor: theme.color.neutral.subtle }}
      >
        <Icon name={icon} size="xl" tone="secondary" />
      </Box>
      <Heading title={title} level={4} align="center" />
      {description ? (
        <Text value={description} tone="secondary" align="center" />
      ) : null}
      <Stack gap="sm" paddingTop="sm" alignItems="center">
        {actionLabel && onAction ? (
          <Button title={actionLabel} onPress={onAction} />
        ) : null}
        {secondaryActionLabel && onSecondaryAction ? (
          <Button
            title={secondaryActionLabel}
            variant="ghost"
            onPress={onSecondaryAction}
          />
        ) : null}
      </Stack>
    </Stack>
  );
});
