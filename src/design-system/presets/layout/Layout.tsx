import React, { memo } from 'react';
import { Box, type BoxProps, type RadiusToken, type SpacingToken } from '../../base/Box';
import { useTheme } from '../../hooks';
import { useResponsive } from '../../responsive';
import type { Responsive } from '../../responsive/createResponsive';
import type { Theme, ThemeBreakpoint } from '../../themes/types';
import { logicalRow } from '../../utilities/styles';
import type { ViewStyle } from '../../components/RNTheme/native';

/** Theme background names usable as `bg`. */
export type LayoutBackground =
  | 'background'
  | 'backgroundSecondary'
  | 'surface'
  | 'surfaceSecondary'
  | 'elevated'
  | 'primarySubtle'
  | 'transparent';

export interface LayoutProps {
  children?: React.ReactNode;
  gap?: SpacingToken;
  p?: SpacingToken;
  px?: SpacingToken;
  py?: SpacingToken;
  pt?: SpacingToken;
  pb?: SpacingToken;
  ps?: SpacingToken;
  pe?: SpacingToken;
  bg?: LayoutBackground;
  radius?: RadiusToken;
  /** Draw the theme's secondary border. */
  bordered?: boolean;
  align?: ViewStyle['alignItems'];
  justify?: ViewStyle['justifyContent'];
  wrap?: boolean;
  flex?: number;
  width?: ViewStyle['width'];
  testID?: string;
  accessibilityLabel?: string;
}

const backgrounds = (theme: Theme): Record<LayoutBackground, string> => ({
  background: theme.color.background.primary,
  backgroundSecondary: theme.color.background.secondary,
  surface: theme.color.surface.primary,
  surfaceSecondary: theme.color.surface.secondary,
  elevated: theme.color.surface.elevated,
  primarySubtle: theme.color.primary.subtle,
  transparent: theme.color.overlay.transparent,
});

const boxProps = ({ p, px, py, pt, pb, ps, pe, radius, align, justify, wrap, flex, width, testID, accessibilityLabel, gap }: LayoutProps): BoxProps => ({
  ...(p ? { padding: p } : {}),
  ...(px ? { paddingHorizontal: px } : {}),
  ...(py ? { paddingVertical: py } : {}),
  ...(pt ? { paddingTop: pt } : {}),
  ...(pb ? { paddingBottom: pb } : {}),
  ...(ps ? { paddingStart: ps } : {}),
  ...(pe ? { paddingEnd: pe } : {}),
  ...(radius ? { radius } : {}),
  ...(align ? { alignItems: align } : {}),
  ...(justify ? { justifyContent: justify } : {}),
  ...(wrap ? { flexWrap: 'wrap' as const } : {}),
  ...(flex !== undefined ? { flex } : {}),
  ...(width !== undefined ? { width } : {}),
  ...(testID ? { testID } : {}),
  ...(accessibilityLabel ? { accessibilityLabel } : {}),
  ...(gap ? { gap } : {}),
});

function useSurface({ bg, bordered }: LayoutProps) {
  const { theme } = useTheme();
  return {
    ...(bg ? { backgroundColor: backgrounds(theme)[bg] } : {}),
    ...(bordered ? { borderWidth: theme.borderWidth.thin, borderColor: theme.color.border.secondary } : {}),
  };
}

/**
 * Horizontal layout that follows the reading direction (mirrored in Arabic).
 *
 * ```tsx
 * <Row gap="sm" align="center"><Avatar name="Sara" /><Text value="Sara" /></Row>
 * ```
 */
export const Row = memo(function Row(props: LayoutProps) {
  const { direction } = useTheme();
  const surface = useSurface(props);
  return (
    <Box {...boxProps({ gap: 'md', ...props })} internalStyle={[logicalRow(direction), surface]}>
      {props.children}
    </Box>
  );
});

/** Vertical layout with token spacing. */
export const Column = memo(function Column(props: LayoutProps) {
  const surface = useSurface(props);
  return (
    <Box {...boxProps({ gap: 'md', ...props })} internalStyle={[{ flexDirection: 'column' }, surface]}>
      {props.children}
    </Box>
  );
});

/** Centres its children on both axes. */
export const Center = memo(function Center(props: LayoutProps) {
  const surface = useSurface(props);
  return (
    <Box {...boxProps({ align: 'center', justify: 'center', ...props })} internalStyle={surface}>
      {props.children}
    </Box>
  );
});

export interface GridProps extends Omit<LayoutProps, 'align' | 'justify' | 'wrap'> {
  /** Number of columns, or per breakpoint: `{ compact: 2, medium: 4 }`. Default 2. */
  columns?: Responsive<ThemeBreakpoint, number>;
}

/**
 * Equal-width columns; rows wrap automatically.
 *
 * ```tsx
 * <Grid columns={{ compact: 2, medium: 4 }} gap="md">{tiles}</Grid>
 * ```
 */
export const Grid = memo(function Grid({ columns = 2, children, ...props }: GridProps) {
  const { direction } = useTheme();
  const r = useResponsive();
  const count = Math.max(1, Math.floor(r.resolve(columns) ?? 2));
  const items = React.Children.toArray(children).filter(Boolean);
  const rows: React.ReactNode[][] = [];
  for (let index = 0; index < items.length; index += count) rows.push(items.slice(index, index + count));
  const gap = props.gap ?? 'md';
  const surface = useSurface(props);
  return (
    <Box {...boxProps({ ...props, gap })} internalStyle={[{ flexDirection: 'column' }, surface]}>
      {rows.map((row, rowIndex) => (
        <Box key={rowIndex} gap={gap} internalStyle={[logicalRow(direction), { alignItems: 'stretch' }]}>
          {Array.from({ length: count }, (_, column) => (
            <Box key={column} flex={1} internalStyle={{ minWidth: 0 }}>
              {row[column] ?? null}
            </Box>
          ))}
        </Box>
      ))}
    </Box>
  );
});
