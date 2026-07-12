import { useTheme } from './useTheme';

export function useRTL() {
  const { direction, isRTL, locale } = useTheme();

  return {
    direction,
    isRTL,
    locale,
    start: isRTL ? 'right' as const : 'left' as const,
    end: isRTL ? 'left' as const : 'right' as const,
    rowDirection: isRTL ? 'row-reverse' as const : 'row' as const,
  };
}
