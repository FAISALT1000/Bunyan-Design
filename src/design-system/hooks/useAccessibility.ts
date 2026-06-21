import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

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

export function useAccessibility(): AccessibilityState {
  const [state, setState] = useState(initialState);

  useEffect(() => {
    let active = true;

    void Promise.all([
      AccessibilityInfo.isScreenReaderEnabled(),
      AccessibilityInfo.isReduceMotionEnabled(),
      AccessibilityInfo.isBoldTextEnabled(),
    ]).then(([screenReaderEnabled, reduceMotionEnabled, boldTextEnabled]) => {
      if (active) {
        setState({ screenReaderEnabled, reduceMotionEnabled, boldTextEnabled });
      }
    });

    const screenReader = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      screenReaderEnabled => setState(current => ({ ...current, screenReaderEnabled })),
    );
    const reduceMotion = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      reduceMotionEnabled => setState(current => ({ ...current, reduceMotionEnabled })),
    );
    const boldText = AccessibilityInfo.addEventListener(
      'boldTextChanged',
      boldTextEnabled => setState(current => ({ ...current, boldTextEnabled })),
    );

    return () => {
      active = false;
      screenReader.remove();
      reduceMotion.remove();
      boldText.remove();
    };
  }, []);

  return state;
}
