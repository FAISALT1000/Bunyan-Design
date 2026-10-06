import { useEffect, useState } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';

export interface AccessibilityState {
  screenReaderEnabled: boolean;
  reduceMotionEnabled: boolean;
  boldTextEnabled: boolean;
}

const initialState: AccessibilityState = {
  screenReaderEnabled: false,
  reduceMotionEnabled: false,
  boldTextEnabled: false,
};

async function readAccessibilityPreference(
  reader: (() => Promise<boolean>) | undefined,
): Promise<boolean> {
  if (!reader) return false;

  try {
    return await reader();
  } catch {
    return false;
  }
}

export function useAccessibility(): AccessibilityState {
  const [state, setState] = useState(initialState);

  useEffect(() => {
    let active = true;
    const runtimeAccessibilityInfo = AccessibilityInfo as Partial<typeof AccessibilityInfo>;
    const boldTextReader = Platform.OS === 'web'
      ? undefined
      : runtimeAccessibilityInfo.isBoldTextEnabled?.bind(AccessibilityInfo);

    void Promise.all([
      readAccessibilityPreference(
        runtimeAccessibilityInfo.isScreenReaderEnabled?.bind(AccessibilityInfo),
      ),
      readAccessibilityPreference(
        runtimeAccessibilityInfo.isReduceMotionEnabled?.bind(AccessibilityInfo),
      ),
      readAccessibilityPreference(boldTextReader),
    ]).then(([screenReaderEnabled, reduceMotionEnabled, boldTextEnabled]) => {
      if (active) {
        setState(current => {
          if (
            current.screenReaderEnabled === screenReaderEnabled
            && current.reduceMotionEnabled === reduceMotionEnabled
            && current.boldTextEnabled === boldTextEnabled
          ) {
            return current;
          }

          return { screenReaderEnabled, reduceMotionEnabled, boldTextEnabled };
        });
      }
    });

    const screenReader = runtimeAccessibilityInfo.addEventListener?.(
      'screenReaderChanged',
      screenReaderEnabled => setState(current => ({ ...current, screenReaderEnabled })),
    );
    const reduceMotion = runtimeAccessibilityInfo.addEventListener?.(
      'reduceMotionChanged',
      reduceMotionEnabled => setState(current => ({ ...current, reduceMotionEnabled })),
    );
    const boldText = Platform.OS === 'web'
      ? undefined
      : runtimeAccessibilityInfo.addEventListener?.(
        'boldTextChanged',
        boldTextEnabled => setState(current => ({ ...current, boldTextEnabled })),
      );

    return () => {
      active = false;
      screenReader?.remove();
      reduceMotion?.remove();
      boldText?.remove();
    };
  }, []);

  return state;
}
