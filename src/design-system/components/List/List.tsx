import React, { memo, useMemo } from 'react';
import { View } from '../RNTheme';
import { useTheme } from '../../hooks';
import { useResponsive } from '../../responsive';
import type { Theme } from '../../themes/types';
import { EmptyState } from '../EmptyState';
import { Skeleton } from '../Skeleton';
import { ListRoot } from './ListRoot';
import { ListRow, ListRowCell } from './ListRow';
import type { ListItemComponent, ListProps, ListSpacing } from './List.types';

const resolveSpacing = (theme: Theme, value: ListSpacing | undefined, fallback: number) => {
  if (value === undefined) return fallback;
  return typeof value === 'number' ? value : theme.spacing[value];
};

const keyOf = (value: unknown): React.Key | undefined => {
  if (value && typeof value === 'object') {
    const record = value as { id?: unknown; key?: unknown };
    if (typeof record.id === 'string' || typeof record.id === 'number') return record.id;
    if (typeof record.key === 'string' || typeof record.key === 'number') return record.key;
  }
  return undefined;
};

const chunk = <V,>(values: readonly V[], size: number): V[][] => {
  const rows: V[][] = [];
  for (let i = 0; i < values.length; i += size) rows.push(values.slice(i, i + size));
  return rows;
};

interface PreparedItem<T> {
  key: React.Key;
  props: T;
}

function ListInner<T extends object, D = T>(props: ListProps<T, D>) {
  const {
    Component,
    data,
    formatItem,
    shareProps,
    keyExtractor,
    style,
    paddingStyle,
    rowStyle,
    cellStyle,
    scrollViewContentContainerStyle,
    flexDirection = 'column',
    flexWrap = 'nowrap',
    columns: columnsProp = 1,
    spacing: spacingProp,
    withDivider = false,
    dividerSpacing: dividerSpacingProp,
    dividerStyle,
    cardVariant,
    isScrolling = false,
    loading = false,
    loadingConfig,
    emptyForm,
    filterNull = true,
    ListHeaderComponent,
    ListFooterComponent,
    accessibilityLabel,
    testID,
  } = props;
  const { theme } = useTheme();
  const responsive = useResponsive();
  const columns = Math.max(1, Math.floor(responsive.resolve(columnsProp) ?? 1));
  const spacing = resolveSpacing(theme, responsive.resolve(spacingProp), theme.spacing.md);
  const dividerSpacing = resolveSpacing(theme, responsive.resolve(dividerSpacingProp), spacing);
  const horizontal = flexDirection === 'row' || flexDirection === 'row-reverse';
  // With dividers, the gap sits on both sides of each divider.
  const gap = withDivider ? dividerSpacing : spacing;
  const ItemComponent = Component as ListItemComponent<T> as React.ComponentType<T>;

  const items = useMemo<PreparedItem<T>[]>(() => {
    const prepared: PreparedItem<T>[] = [];
    (data ?? []).forEach((raw, index) => {
      if (raw === null || raw === undefined) {
        if (filterNull) return;
      }
      const formatted = formatItem ? formatItem(raw as D, index) : (raw as unknown as Partial<T> | null | undefined);
      if ((formatted === null || formatted === undefined) && filterNull) return;
      const itemProps = { ...shareProps, ...(formatted ?? {}) } as T;
      const key = keyExtractor?.(raw as D, index) ?? keyOf(raw) ?? keyOf(formatted) ?? index;
      prepared.push({ key, props: itemProps });
    });
    return prepared;
  }, [data, filterNull, formatItem, keyExtractor, shareProps]);

  const rootProps = {
    style,
    paddingStyle,
    isScrolling,
    flexDirection,
    flexWrap,
    gap,
    cardVariant,
    ListHeaderComponent,
    ListFooterComponent,
    scrollViewContentContainerStyle,
    accessibilityLabel,
    testID,
  };

  const renderRows = (cells: React.ReactNode[], keys: React.Key[]) => {
    const rows = chunk(cells.map((cell, i) => ({ cell, key: keys[i]! })), columns);
    return rows.map((row, rowIndex) => {
      // Pad the last grid row so its cells keep the same width as the others.
      const padding = columns > 1 ? columns - row.length : 0;
      return (
        <ListRow
          key={row[0]!.key}
          index={rowIndex}
          dataLength={rows.length}
          columns={columns}
          spacing={spacing}
          withDivider={withDivider}
          dividerOrientation={horizontal && columns === 1 ? 'vertical' : 'horizontal'}
          dividerStyle={dividerStyle}
          style={rowStyle}
        >
          {row.map(({ cell, key }, cellIndex) => (
            <ListRowCell key={key} index={rowIndex * columns + cellIndex} dataLength={cells.length} columns={columns} style={cellStyle}>
              {cell}
            </ListRowCell>
          ))}
          {Array.from({ length: padding }, (_, i) => (
            <ListRowCell key={`pad-${i}`} index={-1} dataLength={cells.length} columns={columns} style={cellStyle} />
          ))}
        </ListRow>
      );
    });
  };

  if (loading) {
    const { count = 3, renderItem, accessibilityLabel: loadingLabel = 'Loading content', ...skeletonProps } = loadingConfig ?? {};
    const placeholders = Array.from({ length: Math.max(1, count) }, (_, i) =>
      renderItem ? renderItem(i) : <Skeleton {...skeletonProps} />);
    return (
      <ListRoot {...rootProps} busy>
        {/* One announcement for the whole region instead of one per placeholder. */}
        <View accessible accessibilityRole="progressbar" accessibilityLabel={loadingLabel} style={{ gap }}>
          {renderRows(placeholders, placeholders.map((_, i) => `loading-${i}`))}
        </View>
      </ListRoot>
    );
  }

  if (items.length === 0) {
    return (
      <ListRoot {...rootProps}>
        {emptyForm ? <EmptyState {...emptyForm} /> : null}
      </ListRoot>
    );
  }

  return (
    <ListRoot {...rootProps}>
      {renderRows(
        items.map(item => <ItemComponent {...item.props} />),
        items.map(item => item.key),
      )}
    </ListRoot>
  );
}

/**
 * Generic list: renders `Component` once per entry of `data`.
 *
 * ```tsx
 * <List
 *   Component={ListItem}
 *   data={users}
 *   formatItem={user => ({ title: user.name, description: user.email, onPress: () => open(user.id) })}
 *   shareProps={{ showChevron: true }}
 *   withDivider
 *   cardVariant="outline"
 * />
 * ```
 */
export const List = memo(ListInner) as typeof ListInner;
