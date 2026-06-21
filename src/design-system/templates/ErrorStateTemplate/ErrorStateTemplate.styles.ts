import { StyleSheet } from 'react-native';
import type { Theme } from '../../themes';

export const createErrorStateTemplateStyles = (theme: Theme) =>
  StyleSheet.create({
    reference: {
      marginTop: theme.spacing.sm,
    },
  });
