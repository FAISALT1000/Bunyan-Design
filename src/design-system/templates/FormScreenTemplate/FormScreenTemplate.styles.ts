import { StyleSheet } from 'react-native';
import type { Theme } from '../../themes';

export const createFormScreenTemplateStyles = (theme: Theme) =>
  StyleSheet.create({
    sections: {
      width: '100%',
      maxWidth: theme.breakpoint.medium,
      alignSelf: 'center',
      gap: theme.spacing.xxl,
    },
    section: {
      gap: theme.spacing.lg,
    },
    sectionHeader: {
      gap: theme.spacing.xs,
    },
    sectionTitle: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: theme.spacing.xs,
    },
    validationList: {
      gap: theme.spacing.xs,
    },
  });
