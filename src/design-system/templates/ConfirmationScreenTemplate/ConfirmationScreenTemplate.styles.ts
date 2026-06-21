import { StyleSheet } from 'react-native';
import type { Direction, Theme } from '../../themes';

export const createConfirmationScreenTemplateStyles = (
  theme: Theme,
  direction: Direction,
) =>
  StyleSheet.create({
    content: {
      width: '100%',
      maxWidth: theme.breakpoint.medium,
      alignSelf: 'center',
      gap: theme.spacing.xxl,
    },
    section: {
      gap: theme.spacing.md,
    },
    row: {
      flexDirection: direction === 'rtl' ? 'row-reverse' : 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: theme.spacing.xxl,
      paddingVertical: theme.spacing.md,
    },
    rowContent: {
      flex: 1,
      gap: theme.spacing.xxs,
    },
    rowActions: {
      alignItems: direction === 'rtl' ? 'flex-start' : 'flex-end',
      gap: theme.spacing.xs,
    },
    amount: {
      gap: theme.spacing.md,
    },
    amountRow: {
      flexDirection: direction === 'rtl' ? 'row-reverse' : 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: theme.spacing.lg,
    },
    terms: {
      gap: theme.spacing.md,
    },
  });
