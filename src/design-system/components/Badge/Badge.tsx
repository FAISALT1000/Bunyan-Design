import React, { memo } from 'react';
import { View } from 'react-native';
import { useTheme } from '../../hooks';
import { logicalRow } from '../../utilities/styles';
import { Text } from '../Text';

export type BadgeTone = 'neutral' | 'primary' | 'success' | 'warning' | 'error' | 'information';
export interface BadgeProps {
  children: React.ReactNode;
  tone?: BadgeTone;
  size?: 'small' | 'medium';
}

export const Badge = memo(function Badge({ children, tone = 'neutral', size = 'medium' }: BadgeProps) {
  const { theme, direction } = useTheme();
  const toneMap = {
    neutral: { background: theme.color.neutral.subtle, text: theme.color.text.secondary },
    primary: { background: theme.color.primary.subtle, text: theme.color.text.link },
    success: { background: theme.color.success.subtle, text: theme.color.success.text },
    warning: { background: theme.color.warning.subtle, text: theme.color.warning.text },
    error: { background: theme.color.error.subtle, text: theme.color.error.text },
    information: { background: theme.color.information.subtle, text: theme.color.information.text },
  }[tone];
  return (
    <View style={[
      logicalRow(direction),
      {
        alignSelf: 'flex-start',
        alignItems: 'center',
        paddingHorizontal: size === 'small' ? theme.spacing.sm : theme.spacing.md,
        paddingVertical: size === 'small' ? theme.spacing.xxs : theme.spacing.xs,
        borderRadius: theme.radius.pill,
        backgroundColor: toneMap.background,
      },
    ]}>
      <Text variant="caption" weight="semibold" style={{ color: toneMap.text }}>{children}</Text>
    </View>
  );
});
