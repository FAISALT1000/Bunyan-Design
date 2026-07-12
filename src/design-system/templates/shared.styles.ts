import { StyleSheet } from 'react-native';
import type { Direction, Theme } from '../themes';

export const createSharedTemplateStyles = (theme: Theme, direction: Direction) =>
  StyleSheet.create({
    flex: {
      flex: 1,
    },
    centered: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    row: {
      flexDirection: direction === 'rtl' ? 'row-reverse' : 'row',
      alignItems: 'center',
    },
    rowStart: {
      flexDirection: direction === 'rtl' ? 'row-reverse' : 'row',
      alignItems: 'flex-start',
    },
    spread: {
      justifyContent: 'space-between',
    },
    wrap: {
      flexWrap: 'wrap',
    },
    gapXs: {
      gap: theme.spacing.xs,
    },
    gapSm: {
      gap: theme.spacing.sm,
    },
    gapMd: {
      gap: theme.spacing.md,
    },
    gapLg: {
      gap: theme.spacing.lg,
    },
    gapXl: {
      gap: theme.spacing.xxl,
    },
    fullWidth: {
      width: '100%',
    },
    contentWidth: {
      width: '100%',
      maxWidth: theme.breakpoint.expanded,
      alignSelf: 'center',
    },
    formWidth: {
      width: '100%',
      maxWidth: theme.breakpoint.medium,
      alignSelf: 'center',
    },
    section: {
      gap: theme.spacing.md,
    },
    absoluteFill: {
      position: 'absolute',
      top: theme.spacing.none,
      right: theme.spacing.none,
      bottom: theme.spacing.none,
      left: theme.spacing.none,
    },
  });
