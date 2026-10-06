import React, { memo } from 'react';
import { View } from '../RNTheme';
import { useTheme } from '../../hooks';
import { logicalRow } from '../../utilities/styles';
import { Divider } from '../Divider';
import type { ListRowCellProps, ListRowProps } from './List.types';

/** One row: a single item, or `columns` equal-width cells. Draws a divider after itself when requested. */
export const ListRow = memo(function ListRow({
  index,
  dataLength,
  columns,
  spacing,
  withDivider = false,
  dividerOrientation,
  dividerStyle,
  style,
  children,
}: ListRowProps) {
  const { direction } = useTheme();
  const isLast = index >= dataLength - 1;
  const row = columns > 1 ? (
    <View style={[logicalRow(direction), { gap: spacing, alignItems: 'stretch' }, style]}>{children}</View>
  ) : (
    <View style={style}>{children}</View>
  );
  if (!withDivider || isLast) return row;
  return (
    <>
      {row}
      <View style={[dividerOrientation === 'vertical' ? { alignSelf: 'stretch', flexDirection: 'row' } : null, dividerStyle]}>
        <Divider orientation={dividerOrientation} />
      </View>
    </>
  );
});

/** A cell inside a row. In a grid every cell takes an equal share of the row width. */
export const ListRowCell = memo(function ListRowCell({ columns, style, children }: ListRowCellProps) {
  return (
    <View role="listitem" style={[columns > 1 ? { flex: 1, flexBasis: 0, minWidth: 0 } : null, style]}>
      {children}
    </View>
  );
});
