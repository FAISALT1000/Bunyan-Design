import React, { memo } from 'react';
import { Box } from '../../base/Box';
import { Inline } from '../../base/Inline';
import { Stack } from '../../base/Stack';
import { useTheme } from '../../hooks';
import { createAccessibilityLabel } from '../../utilities/accessibility';
import { Button } from '../Button';
import { Icon, type IconName } from '../Icon';
import { IconButton } from '../IconButton';
import { Text, type TextTone } from '../Text';

export type AlertTone = 'information' | 'success' | 'warning' | 'error';

export interface AlertProps {
  title: string;
  description?: string;
  tone?: AlertTone;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss?: () => void;
  accessibilityLabel?: string;
  dismissAccessibilityLabel?: string;
  testID?: string;
}

export const Alert = memo(function Alert({
  title,
  description,
  tone = 'information',
  actionLabel,
  onAction,
  onDismiss,
  accessibilityLabel,
  dismissAccessibilityLabel = 'Dismiss alert',
  testID,
}: AlertProps) {
  const { theme } = useTheme();
  const toneMap: Record<
    AlertTone,
    { background: string; border: string; icon: IconName; textTone: TextTone }
  > = {
    information: {
      background: theme.color.information.subtle,
      border: theme.color.information.border,
      icon: 'info',
      textTone: 'info',
    },
    success: {
      background: theme.color.success.subtle,
      border: theme.color.success.border,
      icon: 'success',
      textTone: 'success',
    },
    warning: {
      background: theme.color.warning.subtle,
      border: theme.color.warning.border,
      icon: 'warning',
      textTone: 'warning',
    },
    error: {
      background: theme.color.error.subtle,
      border: theme.color.error.border,
      icon: 'error',
      textTone: 'error',
    },
  };
  const current = toneMap[tone];

  return (
    <Box
      accessible
      accessibilityRole={tone === 'error' || tone === 'warning' ? 'alert' : 'summary'}
      accessibilityLabel={
        accessibilityLabel ?? createAccessibilityLabel([title, description])
      }
      accessibilityLiveRegion={tone === 'error' ? 'assertive' : 'polite'}
      testID={testID}
      padding="lg"
      radius="lg"
      internalStyle={{
        borderWidth: theme.borderWidth.thin,
        borderColor: current.border,
        backgroundColor: current.background,
      }}
    >
      <Inline gap="md" alignItems="flex-start">
        <Icon name={current.icon} size="lg" tone={tone} />
        <Stack flex={1} gap="xs">
          <Text value={title} weight="semibold" tone={current.textTone} />
          {description ? (
            <Text
              value={description}
              variant="bodySmall"
              tone={current.textTone}
            />
          ) : null}
          {actionLabel && onAction ? (
            <Button
              title={actionLabel}
              variant="ghost"
              size="small"
              onPress={onAction}
            />
          ) : null}
        </Stack>
        {onDismiss ? (
          <IconButton
            icon="close"
            size="small"
            accessibilityLabel={dismissAccessibilityLabel}
            onPress={onDismiss}
          />
        ) : null}
      </Inline>
    </Box>
  );
});
