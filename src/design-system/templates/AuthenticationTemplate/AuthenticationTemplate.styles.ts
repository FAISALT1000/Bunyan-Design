import { StyleSheet } from 'react-native';
import type { Theme } from '../../themes';

export const createAuthenticationTemplateStyles = (theme: Theme) =>
  StyleSheet.create({
    content: {
      width: '100%',
      maxWidth: theme.breakpoint.medium,
      alignSelf: 'center',
      gap: theme.spacing.xxl,
      paddingVertical: theme.spacing.xxl,
    },
    logo: {
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    heading: {
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    form: {
      gap: theme.spacing.lg,
    },
    actions: {
      gap: theme.spacing.md,
    },
    secondaryActions: {
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    footer: {
      alignItems: 'center',
      paddingTop: theme.spacing.lg,
    },
  });
