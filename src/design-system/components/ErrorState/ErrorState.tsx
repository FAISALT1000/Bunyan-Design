import React, { memo } from 'react';
import { EmptyState, type EmptyStateProps } from '../EmptyState';

export type ErrorStateProps = Omit<EmptyStateProps, 'icon'> & {
  retryLabel?: string;
  onRetry?: () => void;
};

export const ErrorState = memo(function ErrorState({
  title,
  description,
  retryLabel = 'Try again',
  onRetry,
  ...props
}: ErrorStateProps) {
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
