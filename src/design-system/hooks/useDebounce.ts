import { useEffect, useState } from 'react';

export function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedValue(value), Math.max(0, delay));
    return () => clearTimeout(timeout);
  }, [delay, value]);

  return debouncedValue;
}
