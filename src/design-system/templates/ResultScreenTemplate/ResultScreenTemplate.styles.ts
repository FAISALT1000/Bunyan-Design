import { StyleSheet } from 'react-native';
import type { Direction, Theme } from '../../themes';

export const createResultScreenTemplateStyles = (
  theme: Theme,
  direction: Direction,
  statusBackground: string,
) =>
  StyleSheet.create({
    content: {
      width: '100%',
      maxWidth: theme.breakpoint.medium,
      alignSelf: 'center',
      alignItems: 'center',
      gap: theme.spacing.xxl,
      paddingVertical: theme.spacing.xxxl,
    },
    iconContainer: {
      width: theme.componentHeight.xl,
      height: theme.componentHeight.xl,
      borderRadius: theme.radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: statusBackground,
    },
    heading: {
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    meta: {
      width: '100%',
      gap: theme.spacing.md,
    },
    metaRow: {
      flexDirection: direction === 'rtl' ? 'row-reverse' : 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: theme.spacing.xxl,
    },
    details: {
      width: '100%',
      gap: theme.spacing.md,
    },
    utilityActions: {
      flexDirection: direction === 'rtl' ? 'row-reverse' : 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: theme.spacing.md,
      flexWrap: 'wrap',
    },
  });
