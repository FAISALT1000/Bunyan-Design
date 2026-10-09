import { needsMirroring } from '../utilities/styles';
import { useTheme } from './useTheme';

export function useRTL() {
  const { direction, isRTL, locale } = useTheme();

  return {
    direction,
    isRTL,
    locale,
    start: isRTL ? 'right' as const : 'left' as const,
    end: isRTL ? 'left' as const : 'right' as const,
    // Mirrors only when the provider direction differs from the native layout.
    rowDirection: needsMirroring(direction) ? 'row-reverse' as const : 'row' as const,
  };
}
