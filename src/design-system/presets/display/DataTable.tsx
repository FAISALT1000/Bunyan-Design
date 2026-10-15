import React, { useMemo, useState } from 'react';
import { Box } from '../../base/Box';
import { BasePressable } from '../../base/Pressable';
import { ScrollView, View } from '../../components/RNTheme';
import { useTheme } from '../../hooks';
import { useText, type TextValue } from '../../i18n';
import { useStrings } from '../../i18n/strings';
import { logicalRow, logicalTextAlign } from '../../utilities/styles';
import { Icon } from '../../components/Icon';
import { Skeleton } from '../../components/Skeleton';
import { Text } from '../../components/Text';

export type SortDirection = 'asc' | 'desc';
export interface DataTableSort {
  key: string;
  direction: SortDirection;
}

export interface DataTableColumn<T> {
  key: string;
  title: TextValue;
  /** Fixed width in points. Tables with fixed widths scroll sideways. */
  width?: number;
  /** Share of the free width (default 1 when no `width`). */
  flex?: number;
  align?: 'start' | 'center' | 'end';
  /** Numbers: end-aligned, tabular, left-to-right digits. */
  numeric?: boolean;
  /** Cell text. Default `row[key]`. */
  value?: (row: T, index: number) => string | number | null | undefined;
  /** Custom cell content (a Badge, Money…). */
  render?: (row: T, index: number) => React.ReactNode;
  /** Header becomes a sort button. Sorting uses `sortValue ?? value`. */
  sortable?: boolean;
  sortValue?: (row: T) => string | number | Date | null | undefined;
}

export interface DataTableProps<T> {
  columns: readonly DataTableColumn<T>[];
  rows: readonly T[];
  keyExtractor?: (row: T, index: number) => string;
  onRowPress?: (row: T, index: number) => void;
  /** Controlled sort; omit to sort inside the table. */
  sort?: DataTableSort | null;
  defaultSort?: DataTableSort;
  onSortChange?: (sort: DataTableSort) => void;
  /** Sort on the server: the table does not reorder `rows`, it only reports `onSortChange`. */
  manualSort?: boolean;
  striped?: boolean;
  dense?: boolean;
  /** Shows skeleton rows. */
  loading?: boolean;
  loadingRows?: number;
  emptyMessage?: TextValue;
  /** Table caption for screen readers. */
  accessibilityLabel?: string;
  testID?: string;
}

const compare = (a: unknown, b: unknown) => {
  if (a === b) return 0;
  if (a === null || a === undefined) return 1;
  if (b === null || b === undefined) return -1;
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a).localeCompare(String(b), undefined, { numeric: true });
};

/**
 * A simple data grid: header row, sortable columns, striped rows, row press,
 * loading skeleton and empty text. Columns follow the reading direction.
 *
 * ```tsx
 * <DataTable
 *   columns={[
 *     { key: 'name', title: 'Name', sortable: true },
 *     { key: 'calls', title: 'Calls', numeric: true, sortable: true },
 *     { key: 'status', title: 'Status', render: row => <Badge label={row.status} /> },
 *   ]}
 *   rows={usage}
 *   onRowPress={openRow}
 * />
 * ```
 */
export function DataTable<T>({
  columns,
  rows,
  keyExtractor,
  onRowPress,
  sort: controlledSort,
  defaultSort,
  onSortChange,
  manualSort = false,
  striped = true,
  dense = false,
  loading = false,
  loadingRows = 4,
  emptyMessage,
  accessibilityLabel,
  testID,
}: DataTableProps<T>) {
  const { theme, direction } = useTheme();
  const t = useText();
  const strings = useStrings();
  const [innerSort, setInnerSort] = useState<DataTableSort | null>(defaultSort ?? null);
  const sort = controlledSort === undefined ? innerSort : controlledSort;
  const scrolls = columns.some(column => column.width !== undefined);
  const cellPadding = dense ? theme.spacing.sm : theme.spacing.md;

  const cellText = (column: DataTableColumn<T>, row: T, index: number) => {
    const raw = column.value ? column.value(row, index) : (row as Record<string, unknown>)[column.key];
    return raw === null || raw === undefined ? '' : String(raw);
  };

  const sortedRows = useMemo(() => {
    if (!sort || manualSort) return rows;
    const column = columns.find(item => item.key === sort.key);
    if (!column) return rows;
    const read = column.sortValue
      ?? ((row: T) => (column.value ? column.value(row, 0) : (row as Record<string, unknown>)[column.key]));
    const factor = sort.direction === 'asc' ? 1 : -1;
    return [...rows].sort((a, b) => factor * compare(read(a), read(b)));
  }, [columns, manualSort, rows, sort]);

  const toggleSort = (key: string) => {
    const next: DataTableSort = sort?.key === key && sort.direction === 'asc' ? { key, direction: 'desc' } : { key, direction: 'asc' };
    if (controlledSort === undefined) setInnerSort(next);
    onSortChange?.(next);
  };

  const cellBox = (column: DataTableColumn<T>) => ({
    paddingHorizontal: cellPadding,
    paddingVertical: cellPadding,
    justifyContent: 'center' as const,
    ...(column.width !== undefined ? { width: column.width } : { flex: column.flex ?? 1, minWidth: 0 }),
  });
  const alignOf = (column: DataTableColumn<T>) => column.align ?? (column.numeric ? 'end' : 'start');
  const textAlign = (column: DataTableColumn<T>) => logicalTextAlign(direction, alignOf(column));

  const header = (
    <View
      accessibilityRole="header"
      style={[logicalRow(direction), {
        backgroundColor: theme.color.surface.secondary,
        borderBottomWidth: theme.borderWidth.thin,
        borderBottomColor: theme.color.border.primary,
      }]}
    >
      {columns.map(column => {
        const title = t(column.title) ?? column.key;
        const active = sort?.key === column.key;
        const label = (
          <View style={[logicalRow(direction), {
            alignItems: 'center',
            gap: theme.spacing.xxs,
            justifyContent: alignOf(column) === 'center' ? 'center' : alignOf(column) === 'end' ? 'flex-end' : 'flex-start',
          }]}
          >
            <Text value={title} variant="labelSmall" weight="semibold" tone={active ? 'primary' : 'secondary'} numberOfLines={1} />
            {column.sortable ? (
              <Icon
                name={active ? (sort.direction === 'asc' ? 'chevron-up' : 'chevron-down') : 'sort'}
                size="xs"
                tone={active ? 'primary' : 'tertiary'}
              />
            ) : null}
          </View>
        );
        if (!column.sortable) return <View key={column.key} style={cellBox(column)}>{label}</View>;
        return (
          <BasePressable
            key={column.key}
            accessibilityRole="button"
            accessibilityLabel={[
              title,
              active ? strings(sort.direction === 'asc' ? 'sortAscending' : 'sortDescending') : undefined,
            ].filter(Boolean).join(', ')}
            accessibilityHint={strings('sortBy', { column: title })}
            onPress={() => toggleSort(column.key)}
            minTouchTarget={false}
            baseStyle={cellBox(column)}
            pressedStyle={{ backgroundColor: theme.color.overlay.subtle }}
          >
            {label}
          </BasePressable>
        );
      })}
    </View>
  );

  const body = loading
    ? Array.from({ length: loadingRows }, (_, index) => (
        <View key={index} style={[logicalRow(direction), { borderBottomWidth: theme.borderWidth.thin, borderBottomColor: theme.color.border.secondary }]}>
          {columns.map(column => (
            <View key={column.key} style={cellBox(column)}><Skeleton height={12} width="70%" /></View>
          ))}
        </View>
      ))
    : sortedRows.map((row, index) => {
        const key = keyExtractor ? keyExtractor(row, index) : String((row as { id?: unknown }).id ?? index);
        const rowStyle = [
          logicalRow(direction),
          {
            backgroundColor: striped && index % 2 === 1 ? theme.color.surface.secondary : theme.color.surface.primary,
            borderBottomWidth: index === sortedRows.length - 1 ? 0 : theme.borderWidth.thin,
            borderBottomColor: theme.color.border.secondary,
          },
        ];
        const cells = columns.map(column => (
          <View key={column.key} style={cellBox(column)}>
            {column.render ? column.render(row, index) : (
              <Text
                value={cellText(column, row, index)}
                variant="bodySmall"
                numberOfLines={2}
                internalStyle={{
                  textAlign: textAlign(column),
                  ...(column.numeric ? { fontVariant: ['tabular-nums'], writingDirection: 'ltr' as const } : {}),
                }}
              />
            )}
          </View>
        ));
        const rowLabel = columns
          .map(column => `${t(column.title) ?? column.key}: ${cellText(column, row, index)}`)
          .join(', ');
        return onRowPress ? (
          <BasePressable
            key={key}
            accessibilityRole="button"
            accessibilityLabel={rowLabel}
            onPress={() => onRowPress(row, index)}
            minTouchTarget={false}
            baseStyle={rowStyle}
            pressedStyle={{ backgroundColor: theme.color.overlay.subtle }}
          >
            {cells}
          </BasePressable>
        ) : (
          <View key={key} style={rowStyle} accessible accessibilityLabel={rowLabel}>{cells}</View>
        );
      });

  const empty = !loading && rows.length === 0 ? (
    <Box padding="lg" alignItems="center">
      <Text value={t(emptyMessage) ?? strings('noResults')} tone="tertiary" variant="bodySmall" />
    </Box>
  ) : null;

  const table = (
    <View style={scrolls ? { minWidth: '100%' } : undefined}>
      {header}
      {body}
      {empty}
    </View>
  );

  return (
    <View
      {...(testID ? { testID } : {})}
      {...(accessibilityLabel ? { accessibilityLabel } : {})}
      style={{
        borderRadius: theme.radius.lg,
        borderWidth: theme.borderWidth.thin,
        borderColor: theme.color.border.primary,
        backgroundColor: theme.color.surface.primary,
        overflow: 'hidden',
      }}
    >
      {scrolls ? <ScrollView horizontal showsHorizontalScrollIndicator={false}>{table}</ScrollView> : table}
    </View>
  );
}
