import React, { memo } from 'react';
import { View } from 'react-native';
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
}

export const EmptyState = memo(function EmptyState({
  title,
  description,
  icon = 'info',
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
}: EmptyStateProps) {
  const { theme } = useTheme();
  return (
    <View style={{ alignItems: 'center', padding: theme.spacing.xxxl, gap: theme.spacing.md }}>
      <View style={{ width: theme.componentHeight.xl, height: theme.componentHeight.xl, borderRadius: theme.radius.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.color.neutral.subtle }}>
        <Icon name={icon} size="xl" tone="secondary" />
      </View>
      <Heading level={4} align="center">{title}</Heading>
      {description ? <Text tone="secondary" align="center">{description}</Text> : null}
      <View style={{ alignItems: 'center', gap: theme.spacing.sm, marginTop: theme.spacing.sm }}>
        {actionLabel && onAction ? <Button onPress={onAction}>{actionLabel}</Button> : null}
        {secondaryActionLabel && onSecondaryAction ? <Button variant="ghost" onPress={onSecondaryAction}>{secondaryActionLabel}</Button> : null}
      </View>
    </View>
  );
});
