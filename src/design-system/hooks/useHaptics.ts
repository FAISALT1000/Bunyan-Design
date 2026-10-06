import { useCallback } from 'react';
import { useApplicationAdapters } from '../application';
import type {
  HapticImpactStyle,
  HapticNotificationType,
} from '../application/types';

export function useHaptics() {
  const { haptics } = useApplicationAdapters();

  const impact = useCallback(
    async (style: HapticImpactStyle = 'medium') => {
      await haptics?.impact(style);
    },
    [haptics],
  );
  const notification = useCallback(
    async (type: HapticNotificationType) => {
      await haptics?.notification(type);
    },
    [haptics],
  );
  const selection = useCallback(async () => {
    await haptics?.selection();
  }, [haptics]);

  return { impact, notification, selection, isSupported: Boolean(haptics) };
}
