import { StyleSheet } from 'react-native';
import type { Direction, Theme } from '../../themes';

export const createListScreenTemplateStyles = (theme: Theme, direction: Direction) =>
  StyleSheet.create({
    screenContent: {
      flex: 1,
    },
    controls: {
      gap: theme.spacing.md,
      paddingHorizontal: theme.spacing.xxl,
      paddingTop: theme.spacing.lg,
      backgroundColor: theme.color.background.primary,
    },
    filterRow: {
      flexDirection: direction === 'rtl' ? 'row-reverse' : 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
      flexWrap: 'wrap',
    },
    listContent: {
      flexGrow: 1,
      paddingHorizontal: theme.spacing.xxl,
      paddingVertical: theme.spacing.lg,
    },
    sectionHeader: {
      gap: theme.spacing.xs,
      paddingTop: theme.spacing.xxl,
      paddingBottom: theme.spacing.sm,
      backgroundColor: theme.color.background.primary,
    },
    skeletons: {
      gap: theme.spacing.lg,
    },
    pagination: {
      alignItems: 'center',
      paddingVertical: theme.spacing.xxl,
    },
    floating: {
      position: 'absolute',
      end: theme.spacing.xxl,
      bottom: theme.spacing.xxl,
      zIndex: theme.zIndex.raised,
    },
  });
