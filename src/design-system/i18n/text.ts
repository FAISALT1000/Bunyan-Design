/**
 * Text that is either shown as-is or looked up through the app's translate function.
 *
 * ```ts
 * label: 'From'                                   // plain text
 * label: { localeKey: 'common.from' }             // translated
 * label: { localeKey: 'transfer.limit', params: { amount: 500 }, fallback: 'Limit reached' }
 * ```
 */
export type TextValue =
  | string
  | {
      localeKey: string;
      params?: Record<string, unknown>;
      /** Shown when no translate function is configured or the key is missing. */
      fallback?: string;
    };

/** App translate function, e.g. i18next's `t` or `react-intl`'s `formatMessage` adapter. */
export type TranslateFn = (key: string, params?: Record<string, unknown>) => string;

/** Without a translate function a key shows its `fallback`, else the key itself. */
export const defaultTranslate: TranslateFn = key => key;

export const resolveText = (value: TextValue | null | undefined, translate: TranslateFn = defaultTranslate): string | undefined => {
  if (value === null || value === undefined) return undefined;
  if (typeof value === 'string') return value;
  const result = translate(value.localeKey, value.params);
  // Missing keys usually come back unchanged: prefer the explicit fallback then.
  return result === value.localeKey && value.fallback !== undefined ? value.fallback : result;
};

export const isTextValue = (value: unknown): value is TextValue =>
  typeof value === 'string'
  || (typeof value === 'object' && value !== null && typeof (value as { localeKey?: unknown }).localeKey === 'string');
