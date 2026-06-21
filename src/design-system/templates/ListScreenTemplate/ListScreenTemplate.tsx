import React, { useMemo } from 'react';
import { FlatList, RefreshControl, View } from 'react-native';
import { Button } from '../../components/Button';
import { Divider } from '../../components/Divider';
import { EmptyState } from '../../components/EmptyState';
import { Heading } from '../../components/Heading';
import { SearchInput } from '../../components/SearchInput';
import { Skeleton } from '../../components/Skeleton';
import { Tabs } from '../../components/Tabs';
import { Text } from '../../components/Text';
import { useTheme } from '../../hooks';
import { BaseScreenTemplate } from '../BaseScreenTemplate';
import type { ListScreenTemplateProps } from './ListScreenTemplate.types';
import { createListScreenTemplateStyles } from './ListScreenTemplate.styles';

type FlattenedRow<T> =
  | { type: 'section'; id: string; title?: string; description?: string }
  | { type: 'item'; item: T; index: number; key: string };

export function ListScreenTemplate<T>({
  title,
  subtitle,
  data,
  keyExtractor,
  renderItem,
  search,
  filter,
  sort,
  tabs,
  headerSummary,
  state = { type: 'content' },
  refreshing = false,
  onRefresh,
  pagination,
  floatingAction,
  emptyTitle = 'No items found',
  emptyDescription,
  emptyAction,
  skeletonCount = 5,
  onBack,
  headerRight,
  testID,
}: ListScreenTemplateProps<T>) {
  const { theme, direction } = useTheme();
  const styles = useMemo(
    () => createListScreenTemplateStyles(theme, direction),
    [direction, theme],
  );
  const rows = useMemo<FlattenedRow<T>[]>(() => {
    if (data.mode === 'flat') {
      return data.data.map((item, index) => ({
        type: 'item',
        item,
        index,
        key: keyExtractor(item, index),
      }));
    }
    return data.sections.flatMap(section => [
      {
        type: 'section' as const,
        id: section.id,
        ...(section.title ? { title: section.title } : {}),
        ...(section.description ? { description: section.description } : {}),
      },
      ...section.data.map((item, index) => ({
        type: 'item' as const,
        item,
        index,
        key: `${section.id}-${keyExtractor(item, index)}`,
      })),
    ]);
  }, [data, keyExtractor]);
  const loading = state.type === 'loading';

  return (
    <BaseScreenTemplate
      testID={testID}
      title={title}
      subtitle={subtitle}
      showBackButton={Boolean(onBack)}
      onBack={onBack}
      headerRight={headerRight}
      scrollable={false}
      padding="none"
      state={state.type === 'error' ? state : { type: 'content' }}
    >
      <View style={styles.screenContent}>
        <View style={styles.controls}>
          {headerSummary}
          {tabs ? (
            <Tabs
              items={tabs.items}
              value={tabs.value}
              onValueChange={tabs.onValueChange}
            />
          ) : null}
          {search ? (
            <SearchInput
              value={search.value}
              onChangeText={search.onChangeText}
              placeholder={search.placeholder ?? 'Search'}
              accessibilityLabel={search.accessibilityLabel ?? 'Search list'}
              {...(search.onClear ? { onClear: search.onClear } : {})}
            />
          ) : null}
          {filter || sort ? (
            <View style={styles.filterRow}>
              {filter}
              {sort}
            </View>
          ) : null}
        </View>
        {loading ? (
          <View style={[styles.listContent, styles.skeletons]}>
            {Array.from({ length: skeletonCount }, (_, index) => (
              <Skeleton key={index} height={theme.componentHeight.xl} radius="large" />
            ))}
          </View>
        ) : (
          <FlatList
            data={rows}
            keyExtractor={row => row.type === 'section' ? `section-${row.id}` : row.key}
            renderItem={({ item }) => {
              if (item.type === 'section') {
                return (
                  <View style={styles.sectionHeader}>
                    {item.title ? <Heading level={5}>{item.title}</Heading> : null}
                    {item.description ? (
                      <Text variant="bodySmall" tone="secondary">{item.description}</Text>
                    ) : null}
                  </View>
                );
              }
              return renderItem(item.item, item.index);
            }}
            ItemSeparatorComponent={Divider}
            contentContainerStyle={styles.listContent}
            refreshControl={
              onRefresh ? (
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor={theme.color.primary.default}
                  colors={[theme.color.primary.default]}
                />
              ) : undefined
            }
            ListEmptyComponent={
              <EmptyState
                title={emptyTitle}
                {...(emptyDescription ? { description: emptyDescription } : {})}
                {...(emptyAction
                  ? {
                      actionLabel: emptyAction.label,
                      onAction: emptyAction.onPress,
                    }
                  : {})}
              />
            }
            ListFooterComponent={
              pagination ? (
                <View style={styles.pagination}>
                  {pagination.hasMore ? (
                    <Button
                      variant="outline"
                      loading={Boolean(pagination.loading)}
                      onPress={pagination.onLoadMore}
                    >
                      {pagination.label ?? 'Load more'}
                    </Button>
                  ) : null}
                </View>
              ) : null
            }
          />
        )}
        {floatingAction ? (
          <View style={styles.floating}>
            <Button
              variant={floatingAction.variant ?? 'primary'}
              disabled={floatingAction.disabled}
              onPress={floatingAction.onPress}
            >
              {floatingAction.label}
            </Button>
          </View>
        ) : null}
      </View>
    </BaseScreenTemplate>
  );
}
