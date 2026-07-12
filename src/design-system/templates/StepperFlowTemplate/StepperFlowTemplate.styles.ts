import { StyleSheet } from 'react-native';
import type { Direction, Theme } from '../../themes';

export const createStepperFlowTemplateStyles = (theme: Theme, direction: Direction) =>
  StyleSheet.create({
    content: {
      width: '100%',
      maxWidth: theme.breakpoint.medium,
      alignSelf: 'center',
      gap: theme.spacing.xxl,
    },
    progress: {
      flexDirection: direction === 'rtl' ? 'row-reverse' : 'row',
      alignItems: 'flex-start',
      width: '100%',
    },
    step: {
      flex: 1,
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    stepIndicatorRow: {
      flexDirection: direction === 'rtl' ? 'row-reverse' : 'row',
      alignItems: 'center',
      width: '100%',
    },
    connector: {
      flex: 1,
      height: theme.borderWidth.medium,
      backgroundColor: theme.color.border.secondary,
    },
    connectorComplete: {
      backgroundColor: theme.color.primary.default,
    },
    connectorPlaceholder: {
      flex: 1,
      height: theme.borderWidth.medium,
      backgroundColor: theme.color.overlay.transparent,
    },
    circle: {
      width: theme.componentHeight.sm,
      height: theme.componentHeight.sm,
      borderRadius: theme.radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: theme.borderWidth.medium,
      borderColor: theme.color.border.primary,
      backgroundColor: theme.color.surface.primary,
    },
    circleCurrent: {
      borderColor: theme.color.primary.default,
      backgroundColor: theme.color.primary.subtle,
    },
    circleCompleted: {
      borderColor: theme.color.primary.default,
      backgroundColor: theme.color.primary.default,
    },
    stepLabel: {
      alignItems: 'center',
      gap: theme.spacing.xxs,
      paddingHorizontal: theme.spacing.xs,
    },
    body: {
      gap: theme.spacing.lg,
    },
    heading: {
      gap: theme.spacing.xs,
    },
  });
