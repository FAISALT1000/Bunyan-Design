import { useContext, useMemo } from 'react';
import {
  initialWindowMetrics,
  SafeAreaInsetsContext,
  type EdgeInsets,
} from 'react-native-safe-area-context';
import { useTheme } from './useTheme';

const NO_INSETS: EdgeInsets = { top: 0, right: 0, bottom: 0, left: 0 };

/**
 * Safe-area insets with logical `start`/`end`. Reads the nearest
 * `SafeAreaProvider`; outside one it falls back to the initial window metrics
 * (or zero) instead of throwing, so components can always use it.
 */
export function useSafeArea() {
  const insets = useContext(SafeAreaInsetsContext)
    ?? initialWindowMetrics?.insets
    ?? NO_INSETS;
  const { isRTL } = useTheme();

  return useMemo(
    () => ({
      insets,
      top: insets.top,
      bottom: insets.bottom,
      left: insets.left,
      right: insets.right,
      start: isRTL ? insets.right : insets.left,
      end: isRTL ? insets.left : insets.right,
      horizontal: insets.left + insets.right,
      vertical: insets.top + insets.bottom,
    }),
    [insets, isRTL],
  );
}
