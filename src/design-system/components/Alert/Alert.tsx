import React, { memo } from 'react';
import { View } from 'react-native';
import { useTheme } from '../../hooks';
import { logicalRow } from '../../utilities/styles';
import { Button } from '../Button';
import { Icon, type IconName } from '../Icon';
import { IconButton } from '../IconButton';
import { Text } from '../Text';

export type AlertTone = 'information' | 'success' | 'warning' | 'error';

export interface AlertProps {
  title: string;
  description?: string;
  tone?: AlertTone;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss?: () => void;
}

export const Alert = memo(function Alert({
  title,
  description,
  tone = 'information',
  actionLabel,
  onAction,
  onDismiss,
}: AlertProps) {
  const { theme, direction } = useTheme();
  const toneMap: Record<AlertTone, { background: string; border: string; text: string; icon: IconName }> = {
    information: { background: theme.color.information.subtle, border: theme.color.information.border, text: theme.color.information.text, icon: 'info' },
    success: { background: theme.color.success.subtle, border: theme.color.success.border, text: theme.color.success.text, icon: 'success' },
    warning: { background: theme.color.warning.subtle, border: theme.color.warning.border, text: theme.color.warning.text, icon: 'warning' },
    error: { background: theme.color.error.subtle, border: theme.color.error.border, text: theme.color.error.text, icon: 'error' },
  };
  const current = toneMap[tone];
  return (
    <View
      accessibilityRole={tone === 'error' || tone === 'warning' ? 'alert' : 'summary'}
      style={[
        logicalRow(direction),
        {
          alignItems: 'flex-start',
          gap: theme.spacing.md,
          padding: theme.spacing.lg,
          borderRadius: theme.radius.lg,
          borderWidth: theme.borderWidth.thin,
          borderColor: current.border,
          backgroundColor: current.background,
        },
      ]}
    >
      <Icon name={current.icon} size="lg" tone={tone} />
      <View style={{ flex: 1, gap: theme.spacing.xs }}>
        <Text weight="semibold" style={{ color: current.text }}>{title}</Text>
        {description ? <Text variant="bodySmall" style={{ color: current.text }}>{description}</Text> : null}
        {actionLabel && onAction ? <Button variant="ghost" size="small" onPress={onAction}>{actionLabel}</Button> : null}
      </View>
      {onDismiss ? <IconButton icon="close" size="small" accessibilityLabel="Dismiss alert" onPress={onDismiss} /> : null}
    </View>
  );
});
