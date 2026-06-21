import { useCallback, useEffect, useState } from 'react';
import {
  Keyboard,
  Platform,
  type KeyboardEvent,
} from 'react-native';

export interface KeyboardState {
  isVisible: boolean;
  height: number;
  dismiss: () => void;
}

export function useKeyboard(): KeyboardState {
  const [isVisible, setVisible] = useState(false);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const onShow = (event: KeyboardEvent) => {
      setVisible(true);
      setHeight(event.endCoordinates.height);
    };
    const onHide = () => {
      setVisible(false);
      setHeight(0);
    };
    const showSubscription = Keyboard.addListener(showEvent, onShow);
    const hideSubscription = Keyboard.addListener(hideEvent, onHide);

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const dismiss = useCallback(() => Keyboard.dismiss(), []);

  return { isVisible, height, dismiss };
}
