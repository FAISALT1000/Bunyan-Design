import React, { useCallback, useMemo, useRef } from 'react';
import type { SpacingToken } from '../../base/Box';
import { Box } from '../../base/Box';
import { FlatList, RefreshControl, type ViewStyle } from '../../components/RNTheme/native';
import { useTheme } from '../../hooks';
import { useText, type TextValue } from '../../i18n';
import { useStrings } from '../../i18n/strings';
import { Button } from '../../components/Button';
import { Spinner } from '../../components/Spinner';
import { Text } from '../../components/Text';
import type { EmptyStateProps } from '../../components/EmptyState';
import { ActionCard, ProductCard, StatCard } from '../cards/ValueCards';
import { OneLineCard, ThreeLineCard, TwoLineCard } from '../cards/LineCards';
import { DataState, type DataStateSkeleton } from '../state/DataState';

/** The parts of a React Query `useInfiniteQuery` result PagedList reads. */
export interface InfiniteQueryLike<P> {
  data?: { pages: readonly P[] } | undefined;
  error?: unknown;
  isLoading?: boolean;
  isPending?: boolean;
  isError?: boolean;
  isRefetching?: boolean;
  isFetchingNextPage?: boolean;
  isFetchNextPageError?: boolean;
  hasNextPage?: boolean;
  fetchNextPage?: () => unknown;
  refetch?: () => unknown;
}

export type PagedListRenderAs = 'OneLineCard' | 'TwoLineCard' | 'ThreeLineCard' | 'ProductCard' | 'ActionCard' | 'StatCard';

const ITEM_COMPONENTS: Record<PagedListRenderAs, React.ComponentType<any>> = {
  OneLineCard, TwoLineCard, ThreeLineCard, ProductCard, ActionCard, StatCard,
};

export interface PagedListProps<T, P = unknown> {
  /** A React Query `useInfiniteQuery` result. */
  query?: InfiniteQueryLike<P>;
  /** Items of one page. Default: the page itself when it is an array, else `page.items ?? page.data ?? page.results`. */
  getItems?: (page: P) => readonly T[];

  // Without React Query:
  data?: readonly T[];
  loading?: boolean;
  error?: unknown;
  hasMore?: boolean;
  loadingMore?: boolean;
  /** Error of the last "load more"; shows a retry row at the bottom. */
  loadMoreError?: unknown;
  onLoadMore?: () => unknown;
  onRefresh?: () => unknown;
  refreshing?: boolean;

  /** Render each item yourself… */
  renderItem?: (item: T, index: number) => React.ReactElement | null;
  /** …or repeat a preset with `formatItem`. */
  renderAs?: PagedListRenderAs;
  formatItem?: (item: T, index: number) => Record<string, unknown>;
  keyExtractor?: (item: T, index: number) => string;

  gap?: SpacingToken;
  padding?: SpacingToken;
  skeleton?: DataStateSkeleton;
  skeletonCount?: number;
  empty?: EmptyStateProps;
  errorTitle?: TextValue;
  renderError?: (error: unknown, retry: (() => void) | undefined) => React.ReactNode;
  /** Caption after the last page, e.g. "You're all caught up". */
  endMessage?: TextValue;
  header?: React.ReactElement | null;
  footer?: React.ReactElement | null;
  /** Pull to refresh. Default true when a refresh function exists. */
  pullToRefresh?: boolean;
  /** Distance from the end (in visible lengths) that triggers loading the next page. Default 0.5. */
  onEndReachedThreshold?: number;
  inverted?: boolean;
  /** Extra FlatList props (`onScroll`, `stickyHeaderIndices`…). */
  listProps?: Record<string, unknown>;
  contentContainerStyle?: ViewStyle;
  accessibilityLabel?: string;
  testID?: string;
}

const defaultGetItems = (page: unknown): readonly unknown[] => {
  if (Array.isArray(page)) return page;
  if (page && typeof page === 'object') {
    const record = page as { items?: unknown; data?: unknown; results?: unknown };
    const list = record.items ?? record.data ?? record.results;
    if (Array.isArray(list)) return list;
  }
  return [];
};

const defaultKey = (item: unknown, index: number) => {
  if (item && typeof item === 'object') {
    const record = item as { id?: unknown; key?: unknown };
    if (typeof record.id === 'string' || typeof record.id === 'number') return String(record.id);
    if (typeof record.key === 'string' || typeof record.key === 'number') return String(record.key);
  }
  return String(index);
};

/**
 * Infinite list: first-load skeletons, empty and error states, pull to
 * refresh, next page on scroll, a spinner or retry row at the bottom.
 * Works with `useInfiniteQuery` or with your own `data` / `onLoadMore`.
 *
 * ```tsx
 * const tickets = useInfiniteQuery({ queryKey: ['tickets'], queryFn, getNextPageParam, initialPageParam: 1 });
 *
 * <PagedList query={tickets} renderAs="ThreeLineCard" formatItem={toTicketRow}
 *   empty={{ title: 'No tickets yet', icon: 'inbox' }} />
 * ```
 */
export function PagedList<T, P = unknown>({
  query,
  getItems,
  data,
  loading,
  error,
  hasMore,
  loadingMore,
  loadMoreError,
  onLoadMore,
  onRefresh,
  refreshing,
  renderItem,
  renderAs,
  formatItem,
  keyExtractor,
  gap = 'sm',
  padding = 'lg',
  skeleton,
  skeletonCount,
  empty,
  errorTitle,
  renderError,
  endMessage,
  header,
  footer,
  pullToRefresh,
  onEndReachedThreshold = 0.5,
  inverted = false,
  listProps,
  contentContainerStyle,
  accessibilityLabel,
  testID,
}: PagedListProps<T, P>) {
  const { theme } = useTheme();
  const t = useText();
  const strings = useStrings();

  const items = useMemo<readonly T[]>(() => {
    if (data) return data;
    const pages = query?.data?.pages;
    if (!pages) return [];
    const read = getItems ?? (defaultGetItems as unknown as (page: P) => readonly T[]);
    return pages.flatMap(page => read(page));
  }, [data, getItems, query?.data?.pages]);

  const isLoading = loading ?? Boolean(query?.isLoading ?? (query?.isPending && query.data === undefined));
  const firstError = error ?? (query?.isError && !query.data ? query.error : undefined);
  const more = hasMore ?? Boolean(query?.hasNextPage);
  const fetchingMore = loadingMore ?? Boolean(query?.isFetchingNextPage);
  const moreError = loadMoreError ?? (query?.isFetchNextPageError ? query.error ?? true : undefined);
  const loadMore = onLoadMore ?? query?.fetchNextPage;
  const refresh = onRefresh ?? query?.refetch;
  const isRefreshing = refreshing ?? Boolean(query?.isRefetching && !query.isFetchingNextPage);

  // onEndReached can fire several times for one scroll; ignore it while a page is loading.
  const requested = useRef(false);
  if (!fetchingMore) requested.current = false;
  const handleEndReached = useCallback(() => {
    if (!more || fetchingMore || moreError || !loadMore || requested.current || items.length === 0) return;
    requested.current = true;
    void loadMore();
  }, [fetchingMore, items.length, loadMore, more, moreError]);

  const Item = renderAs ? ITEM_COMPONENTS[renderAs] : undefined;
  const render = ({ item, index }: { item: T; index: number }) => {
    if (renderItem) return renderItem(item, index);
    if (Item && formatItem) return <Item {...formatItem(item, index)} />;
    return null;
  };

  const footerView = (
    <>
      {fetchingMore ? (
        <Box paddingVertical="lg" alignItems="center">
          <Spinner label={strings('loadingMore')} />
        </Box>
      ) : moreError ? (
        <Box paddingVertical="md" alignItems="center">
          <Button
            title={strings('tryAgain')}
            variant="ghost"
            size="small"
            leftIcon="refresh"
            {...(loadMore ? { onPress: () => void loadMore() } : {})}
          />
        </Box>
      ) : !more && items.length > 0 && endMessage ? (
        <Box paddingVertical="lg" alignItems="center">
          <Text value={t(endMessage) ?? ''} variant="caption" tone="tertiary" align="center" />
        </Box>
      ) : null}
      {footer ?? null}
    </>
  );

  const emptyView = (
    <DataState<readonly T[]>
      loading={isLoading}
      error={firstError}
      data={items}
      {...(skeleton ? { skeleton } : {})}
      {...(skeletonCount ? { skeletonCount } : {})}
      {...(empty ? { empty } : {})}
      {...(errorTitle ? { errorTitle } : {})}
      {...(renderError ? { renderError } : {})}
      {...(refresh ? { onRetry: () => void refresh() } : {})}
    >
      {() => null}
    </DataState>
  );

  const canRefresh = (pullToRefresh ?? Boolean(refresh)) && Boolean(refresh);

  return (
    <FlatList<T>
      {...listProps}
      data={isLoading || firstError ? [] : items}
      renderItem={render}
      keyExtractor={keyExtractor ?? defaultKey}
      onEndReached={handleEndReached}
      onEndReachedThreshold={onEndReachedThreshold}
      inverted={inverted}
      ListHeaderComponent={header ?? null}
      ListFooterComponent={footerView}
      ListEmptyComponent={emptyView}
      ItemSeparatorComponent={() => <Box height={theme.spacing[gap]} />}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={[{ padding: theme.spacing[padding], flexGrow: 1 }, contentContainerStyle]}
      {...(canRefresh
        ? {
            refreshControl: (
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={() => void refresh?.()}
                tintColor={theme.color.primary.default}
                colors={[theme.color.primary.default]}
                progressBackgroundColor={theme.color.surface.elevated}
              />
            ),
          }
        : {})}
      {...(accessibilityLabel ? { accessibilityLabel } : {})}
      {...(testID ? { testID } : {})}
    />
  );
}
