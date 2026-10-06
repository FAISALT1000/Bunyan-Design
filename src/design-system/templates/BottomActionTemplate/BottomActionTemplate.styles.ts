import { StyleSheet } from 'react-native';
import type { Direction, Theme } from '../../themes';

export const createBottomActionTemplateStyles = (
  theme: Theme,
  direction: Direction,
  layout: 'stacked' | 'inline',
) =>
  StyleSheet.create({
    safeArea: {
      backgroundColor: theme.color.surface.primary,
    },
    keyboard: {
      backgroundColor: theme.color.surface.primary,
    },
    container: {
      width: '100%',
      maxWidth: theme.breakpoint.expanded,
      alignSelf: 'center',
      flexDirection:
        layout === 'inline'
          ? direction === 'rtl'
            ? 'row-reverse'
            : 'row'
          : 'column',
      alignItems: 'stretch',
      gap: theme.spacing.md,
      paddingHorizontal: theme.spacing.xxl,
      paddingVertical: theme.spacing.lg,
      borderTopWidth: theme.borderWidth.thin,
      borderTopColor: theme.color.border.secondary,
      backgroundColor: theme.color.surface.primary,
    },
    action: {
      flex: layout === 'inline' ? 1 : undefined,
    },
    content: {
      marginBottom: theme.spacing.sm,
    },
  });
