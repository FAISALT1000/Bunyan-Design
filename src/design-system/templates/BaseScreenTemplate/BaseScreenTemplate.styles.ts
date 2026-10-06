import { StyleSheet } from 'react-native';
import type { Direction, Theme } from '../../themes';
import type { TemplateBackground, TemplatePadding } from '../types';
import { backgroundFor, paddingFor } from '../utilities';

export const createBaseScreenTemplateStyles = (
  theme: Theme,
  direction: Direction,
  background: TemplateBackground,
  padding: TemplatePadding,
) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: backgroundFor(theme, background),
    },
    screen: {
      flex: 1,
      backgroundColor: backgroundFor(theme, background),
    },
    keyboard: {
      flex: 1,
    },
    header: {
      minHeight: theme.componentHeight.xl,
      flexDirection: direction === 'rtl' ? 'row-reverse' : 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: theme.borderWidth.thin,
      borderBottomColor: theme.color.border.secondary,
      backgroundColor: theme.color.surface.primary,
      zIndex: theme.zIndex.sticky,
    },
    headerTitles: {
      flex: 1,
      gap: theme.spacing.xxs,
    },
    headerActions: {
      flexDirection: direction === 'rtl' ? 'row-reverse' : 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
    },
    content: {
      flex: 1,
      width: '100%',
      maxWidth: theme.breakpoint.expanded,
      alignSelf: 'center',
      padding: paddingFor(theme, padding),
      gap: theme.spacing.lg,
    },
    fixedContent: {
      flex: 1,
    },
    bottomContent: {
      width: '100%',
      maxWidth: theme.breakpoint.expanded,
      alignSelf: 'center',
      paddingHorizontal: paddingFor(theme, padding),
      paddingBottom: theme.spacing.lg,
    },
    footer: {
      borderTopWidth: theme.borderWidth.thin,
      borderTopColor: theme.color.border.secondary,
      backgroundColor: theme.color.surface.primary,
    },
    loadingOverlay: {
      position: 'absolute',
      top: theme.spacing.none,
      right: theme.spacing.none,
      bottom: theme.spacing.none,
      left: theme.spacing.none,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.color.overlay.scrim,
      zIndex: theme.zIndex.overlay,
    },
    state: {
      flex: 1,
      width: '100%',
      maxWidth: theme.breakpoint.expanded,
      alignSelf: 'center',
    },
  });
