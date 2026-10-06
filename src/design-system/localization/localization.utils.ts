import type {
  TranslationDictionary,
  TranslationValue,
} from './localization.types';

export const DEFAULT_RTL_LOCALES = ['ar'] as const;
const PLURAL_KEYS = new Set(['zero', 'one', 'two', 'few', 'many', 'other']);

export const localeIsRTL = (
  locale: string,
  rtlLocales: readonly string[] = DEFAULT_RTL_LOCALES,
) => {
  const language = locale.toLocaleLowerCase().split(/[-_]/)[0] ?? locale;
  return rtlLocales.some(candidate => (
    candidate.toLocaleLowerCase().split(/[-_]/)[0] === language
  ));
};

export const cloneTranslationResources = <T>(value: T): T => {
  if (Array.isArray(value)) {
    return value.map(item => cloneTranslationResources(item)) as T;
  }
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        cloneTranslationResources(item),
      ]),
    ) as T;
  }
  return value;
};

export const getTranslationValue = (
  dictionary: TranslationDictionary | undefined,
  key: string,
): TranslationValue | undefined => {
  let current: TranslationValue | undefined = dictionary;
  for (const segment of key.split('.')) {
    if (
      current === undefined
      || typeof current === 'string'
      || !(segment in current)
    ) {
      return undefined;
    }
    current = current[segment];
  }
  return current;
};

export const isPluralizationObject = (
  value: unknown,
): value is Readonly<Record<string, string>> => (
  value !== null
  && typeof value === 'object'
  && !Array.isArray(value)
  && Object.keys(value).length > 0
  && Object.entries(value).every(([key, item]) => (
    PLURAL_KEYS.has(key) && typeof item === 'string'
  ))
);

export const flattenTranslationKeys = (
  dictionary: TranslationDictionary,
  prefix = '',
): string[] => Object.entries(dictionary).flatMap(([key, value]) => {
  const path = prefix ? `${prefix}.${key}` : key;
  if (typeof value === 'string' || isPluralizationObject(value)) {
    return [path];
  }
  return flattenTranslationKeys(value, path);
});
