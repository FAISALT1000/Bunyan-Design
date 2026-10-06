import { StyleSheet } from 'react-native';
import type { Direction, Theme } from '../../themes';

export const createDetailsScreenTemplateStyles = (theme: Theme, direction: Direction) =>
  StyleSheet.create({
    content: {
      width: '100%',
      maxWidth: theme.breakpoint.expanded,
      alignSelf: 'center',
      gap: theme.spacing.xxl,
    },
    header: {
      gap: theme.spacing.md,
    },
    statusRow: {
      flexDirection: direction === 'rtl' ? 'row-reverse' : 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.spacing.md,
      flexWrap: 'wrap',
    },
    utilityActions: {
      flexDirection: direction === 'rtl' ? 'row-reverse' : 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      flexWrap: 'wrap',
    },
    sections: {
      gap: theme.spacing.lg,
    },
    section: {
      gap: theme.spacing.md,
    },
    sectionHeader: {
      gap: theme.spacing.xs,
    },
    row: {
      flexDirection: direction === 'rtl' ? 'row-reverse' : 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: theme.spacing.xxl,
      paddingVertical: theme.spacing.md,
    },
    rowLabel: {
      flex: 1,
      gap: theme.spacing.xxs,
    },
    rowValue: {
      flex: 1,
      alignItems: direction === 'rtl' ? 'flex-start' : 'flex-end',
    },
  });
