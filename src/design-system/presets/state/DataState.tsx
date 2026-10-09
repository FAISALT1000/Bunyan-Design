import React from 'react';
import { Box } from '../../base/Box';
import { Stack } from '../../base/Stack';
import { useTheme } from '../../hooks';
import { useText, type TextValue } from '../../i18n';
import { EmptyState, type EmptyStateProps } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { LineCard } from '../cards/LineCard';
import { cardSurface } from '../shared';

/** The parts of a React Query (or SWR-like) result DataState reads. */
export interface QueryLike<T> {
  data?: T | undefined;
  error?: unknown;
  isLoading?: boolean;
  isPending?: boolean;
  isError?: boolean;
  refetch?: () => unknown;
}

export type DataStateSkeleton = 'OneLineCard' | 'TwoLineCard' | 'ThreeLineCard' | React.ReactElement;

export interface DataStateProps<T> {
  /** A React Query result, or pass `loading` / `error` / `data` yourself. */
  query?: QueryLike<T>;
  loading?: boolean;
  error?: unknown;
  data?: T | undefined;
  /** Row shape to repeat while loading. Default `'TwoLineCard'`. */
  skeleton?: DataStateSkeleton;
  skeletonCount?: number;
  /** Shown when the data is empty (empty array, null, undefined). */
  empty?: EmptyStateProps;
  /** Custom emptiness check. */
  isEmpty?: (data: T) => boolean;
  errorTitle?: TextValue;
  /** Error description; receives the error. Default: its message. */
  errorMessage?: (error: unknown) => TextValue | undefined;
  onRetry?: () => void;
  children: (data: T) => React.ReactNode;
  testID?: string;
}

const defaultIsEmpty = (data: unknown) =>
  data === null || data === undefined || (Array.isArray(data) && data.length === 0);

const messageOf = (error: unknown) =>
  error instanceof Error ? error.message : typeof error === 'string' ? error : undefined;

/**
 * Loading, error, empty and data states in one place.
 *
 * ```tsx
 * <DataState query={transfers} skeleton="TwoLineCard" empty={{ title: 'No transfers yet', icon: 'transfer' }}>
 *   {data => <List Component={TwoLineCard} data={data} formatItem={toRow} />}
 * </DataState>
 * ```
 */
export function DataState<T>({
  query,
  loading,
  error,
  data,
  skeleton = 'TwoLineCard',
  skeletonCount = 3,
  empty,
  isEmpty = defaultIsEmpty,
  errorTitle = 'Something went wrong',
  errorMessage = messageOf,
  onRetry,
  children,
  testID,
}: DataStateProps<T>) {
  const { theme } = useTheme();
  const t = useText();
  const isLoading = loading ?? Boolean(query?.isLoading ?? (query?.isPending && query.data === undefined));
  const currentError = error ?? (query?.isError === false ? undefined : query?.error);
  const currentData = data ?? query?.data;
  const retry = onRetry ?? (query?.refetch ? () => void query.refetch?.() : undefined);

  if (isLoading) {
    const lines = skeleton === 'OneLineCard' ? 1 : skeleton === 'ThreeLineCard' ? 3 : 2;
    return (
      <Stack gap="sm" {...(testID ? { testID } : {})} accessible accessibilityLabel="Loading">
        {Array.from({ length: skeletonCount }, (_, index) => (
          typeof skeleton === 'string'
            ? <LineCard key={index} lines={lines} title="" loading />
            : <React.Fragment key={index}>{skeleton}</React.Fragment>
        ))}
      </Stack>
    );
  }

  if (currentError) {
    const description = t(errorMessage(currentError));
    return (
      <Box {...(testID ? { testID } : {})} internalStyle={cardSurface(theme)}>
        <ErrorState
          title={t(errorTitle) ?? ''}
          {...(description ? { description } : {})}
          {...(retry ? { onRetry: retry } : {})}
        />
      </Box>
    );
  }

  if (currentData === undefined || isEmpty(currentData as T)) {
    return empty ? (
      <Box {...(testID ? { testID } : {})} internalStyle={cardSurface(theme)}>
        <EmptyState {...empty} />
      </Box>
    ) : null;
  }

  return <>{children(currentData as T)}</>;
}
