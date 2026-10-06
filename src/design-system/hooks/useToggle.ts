import { useCallback, useState } from 'react';

export interface ToggleControls {
  value: boolean;
  toggle: () => void;
  setTrue: () => void;
  setFalse: () => void;
  setValue: (value: boolean) => void;
}

export function useToggle(initialValue = false): ToggleControls {
  const [value, setValue] = useState(initialValue);
  const toggle = useCallback(() => setValue(current => !current), []);
  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);

  return { value, toggle, setTrue, setFalse, setValue };
}
