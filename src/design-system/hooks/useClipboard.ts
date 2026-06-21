import { useCallback, useState } from 'react';
import { useApplicationAdapters } from '../application';

export function useClipboard() {
  const { clipboard } = useApplicationAdapters();
  const [value, setValue] = useState<string>();

  const copy = useCallback(
    async (nextValue: string) => {
      if (!clipboard) {
        throw new Error('Clipboard adapter is not configured.');
      }
      await clipboard.setString(nextValue);
      setValue(nextValue);
    },
    [clipboard],
  );

  const paste = useCallback(async () => {
    if (!clipboard) {
      throw new Error('Clipboard adapter is not configured.');
    }
    const nextValue = await clipboard.getString();
    setValue(nextValue);
    return nextValue;
  }, [clipboard]);

  return { value, copy, paste, isSupported: Boolean(clipboard) };
}
