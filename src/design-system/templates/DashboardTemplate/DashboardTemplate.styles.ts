import { StyleSheet } from 'react-native';
import type { Direction, Theme } from '../../themes';

export const createDashboardTemplateStyles = (theme: Theme, direction: Direction) =>
  StyleSheet.create({
    content: {
      width: '100%',
      maxWidth: theme.breakpoint.expanded,
      alignSelf: 'center',
      gap: theme.spacing.xxl,
    },
    greeting: {
      flexDirection: direction === 'rtl' ? 'row-reverse' : 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.spacing.lg,
    },
    greetingText: {
      flex: 1,
      gap: theme.spacing.xs,
    },
    quickActions: {
      flexDirection: direction === 'rtl' ? 'row-reverse' : 'row',
      alignItems: 'stretch',
      gap: theme.spacing.md,
      flexWrap: 'wrap',
    },
    quickAction: {
      minWidth: theme.componentHeight.xl * 2,
      flexGrow: 1,
    },
    quickActionContent: {
      gap: theme.spacing.md,
    },
    section: {
      gap: theme.spacing.md,
    },
    sectionHeader: {
      flexDirection: direction === 'rtl' ? 'row-reverse' : 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.spacing.md,
    },
    skeletons: {
      gap: theme.spacing.lg,
    },
  });
