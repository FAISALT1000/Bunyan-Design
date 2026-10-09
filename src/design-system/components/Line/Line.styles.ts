import type { Direction, Theme } from '../../themes';
import type {
  LineGap,
  LinePadding,
} from './Line.types';

export function createLineStyles(
  theme: Theme,
  direction: Direction,
  padding: LinePadding,
  gap: LineGap,
  verticalAlign: 'top' | 'center' | 'bottom',
) {
  const paddingMap = {
    none: theme.spacing.none,
    small: theme.spacing.sm,
    medium: theme.components.line.paddingHorizontal,
    large: theme.spacing.xxl,
  };
  const gapMap = {
    none: theme.spacing.none,
    small: theme.spacing.sm,
    medium: theme.components.line.sectionGap,
    large: theme.spacing.xxl,
  };
  const alignItems: 'flex-start' | 'center' | 'flex-end' =
    verticalAlign === 'top'
      ? 'flex-start'
      : verticalAlign === 'bottom'
        ? 'flex-end'
        : 'center';

  return {
    container: {
      minHeight: theme.components.line.minHeight,
      paddingHorizontal: paddingMap[padding],
      paddingVertical: padding === 'none'
        ? theme.spacing.none
        : theme.components.line.paddingVertical,
    },
    row: {
      flexDirection: direction === 'rtl' ? 'row-reverse' as const : 'row' as const,
      alignItems,
      justifyContent: 'space-between' as const,
      gap: gapMap[gap],
    },
    section: {
      flexDirection: direction === 'rtl' ? 'row-reverse' as const : 'row' as const,
      alignItems,
      gap: theme.components.line.iconGap,
      minWidth: theme.spacing.none,
    },
    textGroup: {
      gap: theme.components.line.textGap,
      minWidth: theme.spacing.none,
    },
    pressed: {
      backgroundColor: theme.components.line.pressedBackground,
    },
    focused: {
      borderColor: theme.components.line.focusedBorderColor,
      borderWidth: theme.borderWidth.medium,
      borderRadius: theme.radius.md,
    },
    disabled: {
      opacity: theme.components.line.disabledOpacity,
    },
  };
}
