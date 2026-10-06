import { useCallback } from 'react';
import { useTheme } from '../hooks/useTheme';
import { resolveText, type TextValue } from './text';

/**
 * Returns `t(value)` that turns a `TextValue` into a string using the translate
 * function given to `ThemeProvider`.
 *
 * ```ts
 * const t = useText();
 * t({ localeKey: 'common.save' }); // → 'Save' / 'حفظ'
 * ```
 */
export function useText() {
  const { translate } = useTheme();
  return useCallback((value: TextValue | null | undefined) => resolveText(value, translate), [translate]);
}
