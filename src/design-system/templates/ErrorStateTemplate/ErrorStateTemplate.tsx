import React, { memo, useMemo } from 'react';
import { View } from 'react-native';
import { Text } from '../../components/Text';
import { useTheme } from '../../hooks';
import { EmptyStateTemplate } from '../EmptyStateTemplate';
import type {
  ErrorStateTemplateProps,
  ErrorStateType,
} from './ErrorStateTemplate.types';
import { createErrorStateTemplateStyles } from './ErrorStateTemplate.styles';

const defaults: Record<ErrorStateType, { title: string; message: string }> = {
  general: {
    title: 'Something went wrong',
    message: 'We could not complete your request. Please try again.',
  },
  network: {
    title: 'No internet connection',
    message: 'Check your connection and try again.',
  },
  server: {
    title: 'Service unavailable',
    message: 'The service is temporarily unavailable. Please try again later.',
  },
  sessionExpired: {
    title: 'Session expired',
    message: 'Sign in again to continue securely.',
  },
  permission: {
    title: 'Permission required',
    message: 'You do not have permission to access this content.',
  },
  maintenance: {
    title: 'Scheduled maintenance',
    message: 'This service is temporarily unavailable while we make improvements.',
  },
};

export const ErrorStateTemplate = memo(function ErrorStateTemplate({
  type = 'general',
  title,
  message,
  illustration,
  retryAction,
  secondaryAction,
  referenceCode,
  variant = 'fullScreen',
  testID,
}: ErrorStateTemplateProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createErrorStateTemplateStyles(theme), [theme]);
  const resolved = defaults[type];
  return (
    <EmptyStateTemplate
      title={title ?? resolved.title}
      description={message ?? resolved.message}
      icon={type === 'network' ? 'warning' : 'error'}
      variant={variant}
      {...(testID ? { testID } : {})}
      {...(illustration ? { illustration } : {})}
      {...(retryAction ? { primaryAction: retryAction } : {})}
      {...(secondaryAction ? { secondaryAction } : {})}
      {...(referenceCode
        ? {
            supportingContent: (
              <View style={styles.reference}>
                <Text
                  value={`Reference: ${referenceCode}`}
                  variant="caption"
                  tone="tertiary"
                />
              </View>
            ),
          }
        : {})}
    />
  );
});
