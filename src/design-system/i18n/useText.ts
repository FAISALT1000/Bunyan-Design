import { useCallback } from 'react';
import { useOptionalLocalization } from '../localization/useLocalization';
import { resolveText, type TextValue, type TranslateFn } from './text';

/**
 * Returns `t(value)` that turns a `TextValue` into a string using the
 * `DesignSystemLocalizationProvider` translations (i18n-js). Outside the
 * provider, or for a missing key, `fallback` (or the key) is shown.
 *
 * ```ts
 * const t = useText();
 * t({ localeKey: 'common.save' }); // → 'Save' / 'حفظ'
 * ```
 */
export function useText() {
  const localization = useOptionalLocalization();
  const translate = useCallback<TranslateFn>(
    (key, params) => (localization && localization.exists(key) ? localization.translate(key, params) : key),
    [localization],
  );
  return useCallback((value: TextValue | null | undefined) => resolveText(value, translate), [translate]);
}
