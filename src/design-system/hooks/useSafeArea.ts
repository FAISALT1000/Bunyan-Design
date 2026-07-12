import { useMemo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from './useTheme';

export function useSafeArea() {
  const insets = useSafeAreaInsets();
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
