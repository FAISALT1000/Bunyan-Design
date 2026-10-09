import type React from 'react';
import type { StyleProp, ViewStyle } from '../RNTheme';
import type { CardVariant } from '../Card';
import type { EmptyStateProps } from '../EmptyState';
import type { SkeletonProps } from '../Skeleton';
import type { Theme, ThemeBreakpoint } from '../../themes/types';
import type { Responsive } from '../../responsive/createResponsive';

export type ListFlexDirection = 'row' | 'column' | 'row-reverse' | 'column-reverse';
export type ListFlexWrap = 'wrap' | 'nowrap' | 'wrap-reverse';

/** Spacing in points, or a spacing token name such as `'md'`. */
export type ListSpacing = number | keyof Theme['spacing'];

/** Header/footer: an element, or a component rendered with no props. */
export type ListSlot = React.ReactNode | React.ComponentType;

/** Anything that renders `T` as props — every Bunyan component qualifies. */
export type ListItemComponent<T> = React.ComponentType<T> | ((props: T) => React.ReactNode);

/** Placeholder configuration shown while `loading` is true. */
export interface ListLoadingConfig extends Omit<SkeletonProps, 'accessibilityLabel'> {
  /** Number of placeholder items. Default `3`. */
  count?: number;
  /** Custom placeholder for one item (replaces the Skeleton). */
  renderItem?: (index: number) => React.ReactNode;
  /** Announced once for the whole loading region. Default `'Loading content'`. */
  accessibilityLabel?: string;
}

interface ListBaseProps<T> {
  /** Component rendered once per item, e.g. `Button`, `Card`, `ListItem`, `Chip`, or your own. */
  Component: ListItemComponent<T>;
  /** Props shared by every item. Item props win on conflicts. */
  shareProps?: Partial<NoInfer<T>>;

  /** Root container style (outside the card / scroll view). */
  style?: StyleProp<ViewStyle>;
  /** Padding applied inside the root (inside the card when `cardVariant` is set). */
  paddingStyle?: StyleProp<ViewStyle>;
  /** Style of every row (one row per item, or per `columns` items in a grid). */
  rowStyle?: StyleProp<ViewStyle>;
  /** Style of every cell wrapping a rendered item. */
  cellStyle?: StyleProp<ViewStyle>;
  /** Content container style when `isScrolling`. */
  scrollViewContentContainerStyle?: StyleProp<ViewStyle>;

  /** Main axis of the list. `row` + `isScrolling` gives a horizontal carousel. Default `'column'`. RTL-aware. */
  flexDirection?: ListFlexDirection;
  /** Wrapping of items along the main axis (e.g. a cloud of Chips). Default `'nowrap'`. */
  flexWrap?: ListFlexWrap;
  /**
   * Grid columns. Items are placed in equal-width cells, `columns` per row. Default `1`.
   * Responsive: `columns={{ compact: 1, medium: 2, expanded: 3 }}`.
   */
  columns?: Responsive<ThemeBreakpoint, number>;
  /** Gap between items/rows: points, a spacing token (`'md'`), or per breakpoint. Default `'md'`. */
  spacing?: Responsive<ThemeBreakpoint, ListSpacing>;

  /** Draw a Divider between rows. */
  withDivider?: boolean;
  /** Gap on each side of a divider. Default: same as `spacing`. */
  dividerSpacing?: Responsive<ThemeBreakpoint, ListSpacing>;
  dividerStyle?: StyleProp<ViewStyle>;

  /** Wrap the whole list in a Card of this variant. */
  cardVariant?: CardVariant;
  /** Render inside a ScrollView (horizontal when `flexDirection` is a row). */
  isScrolling?: boolean;

  /** Show Skeleton placeholders instead of data. */
  loading?: boolean;
  loadingConfig?: ListLoadingConfig;
  /** EmptyState shown when there is nothing to render (after filtering) and not loading. */
  emptyForm?: EmptyStateProps;
  /** Drop `null`/`undefined` entries in `data` and `null`/`undefined` results of `formatItem`. Default `true`. */
  filterNull?: boolean;

  ListHeaderComponent?: ListSlot;
  ListFooterComponent?: ListSlot;

  accessibilityLabel?: string;
  testID?: string;
}

/**
 * Props of the generic `List`.
 *
 * - `T` — props of `Component`.
 * - `D` — shape of the raw `data` items (defaults to `T`).
 *
 * When `D` already fits `Component` (`D` is a `Partial<T>`, completed by
 * `shareProps`) `formatItem` is optional; otherwise TypeScript requires it.
 */
export type ListProps<T, D = T> = ListBaseProps<T> & {
  /** Items to render; one `Component` per item. */
  data: readonly (D | null | undefined)[] | null | undefined;
  /** Stable React key per raw item. Defaults to `id`, then `key` (of the raw item, then of the formatted props), then the index. */
  keyExtractor?: (item: D, index: number) => React.Key;
} & ([D] extends [Partial<NoInfer<T>>]
  ? {
      /** Map a raw item to `Component` props. Return `null` to skip it (with `filterNull`). */
      formatItem?: (item: D, index: number) => NoInfer<T> | Partial<NoInfer<T>> | null | undefined;
    }
  : {
      /** Map a raw item to `Component` props. Required because `data` does not match `Component`'s props. */
      formatItem: (item: D, index: number) => NoInfer<T> | Partial<NoInfer<T>> | null | undefined;
    });

/** Spacing inputs for one item/row (kept for parity with the previous List API). */
export interface ListSpacingProps {
  spacing: number;
  index: number;
  length: number;
  columns?: number | undefined;
}

export interface ListRootProps {
  style?: StyleProp<ViewStyle> | undefined;
  paddingStyle?: StyleProp<ViewStyle> | undefined;
  isScrolling?: boolean | undefined;
  flexDirection: ListFlexDirection;
  flexWrap: ListFlexWrap;
  gap: number;
  cardVariant?: CardVariant | undefined;
  children: React.ReactNode;
  ListHeaderComponent?: ListSlot | undefined;
  ListFooterComponent?: ListSlot | undefined;
  scrollViewContentContainerStyle?: StyleProp<ViewStyle> | undefined;
  accessibilityLabel?: string | undefined;
  busy?: boolean | undefined;
  testID?: string | undefined;
}

export interface ListRowProps {
  index: number;
  dataLength: number;
  columns: number;
  /** Gap between cells inside a grid row. */
  spacing: number;
  withDivider?: boolean | undefined;
  /** Orientation of the divider placed after this row. */
  dividerOrientation: 'horizontal' | 'vertical';
  dividerStyle?: StyleProp<ViewStyle> | undefined;
  style?: StyleProp<ViewStyle> | undefined;
  children: React.ReactNode;
}

export interface ListRowCellProps {
  index: number;
  dataLength: number;
  columns: number;
  style?: StyleProp<ViewStyle> | undefined;
  children?: React.ReactNode | undefined;
}
