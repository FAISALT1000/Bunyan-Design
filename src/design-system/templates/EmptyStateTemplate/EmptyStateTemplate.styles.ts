import { StyleSheet } from 'react-native';
import type { Theme } from '../../themes';

export const createEmptyStateTemplateStyles = (
  theme: Theme,
  variant: 'compact' | 'fullScreen',
) =>
  StyleSheet.create({
    container: {
      flex: variant === 'fullScreen' ? 1 : undefined,
      width: '100%',
      maxWidth: theme.breakpoint.medium,
      alignSelf: 'center',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.md,
      padding: variant === 'fullScreen' ? theme.spacing.xxxl : theme.spacing.lg,
    },
    illustration: {
      marginBottom: theme.spacing.sm,
    },
    icon: {
      width: theme.componentHeight.xl,
      height: theme.componentHeight.xl,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.color.neutral.subtle,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.sm,
    },
    actions: {
      alignItems: 'center',
      gap: theme.spacing.sm,
      marginTop: theme.spacing.sm,
    },
  });
