import React, { memo } from 'react';
import { EmptyState, type EmptyStateProps } from '../EmptyState';
import { useStrings } from '../../i18n/strings';

export type ErrorStateProps = Omit<EmptyStateProps, 'icon'> & {
  retryLabel?: string;
  onRetry?: () => void;
};

export const ErrorState = memo(function ErrorState({
  title,
  description,
  retryLabel: retryLabelProp,
  onRetry,
  ...props
}: ErrorStateProps) {
  const strings = useStrings();
  const retryLabel = retryLabelProp ?? strings('tryAgain');
  return (
    <EmptyState
      title={title}
      icon="error"
      {...(description ? { description } : {})}
      {...(onRetry ? { actionLabel: retryLabel, onAction: onRetry } : {})}
      {...props}
    />
  );
});
