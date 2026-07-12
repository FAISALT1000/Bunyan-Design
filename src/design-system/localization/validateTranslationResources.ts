import type {
  TranslationDictionary,
  TranslationValidationResult,
} from './localization.types';
import {
  flattenTranslationKeys,
  isPluralizationObject,
} from './localization.utils';

const isDictionary = (value: unknown): value is TranslationDictionary => (
  value !== null && typeof value === 'object' && !Array.isArray(value)
);

export const validateTranslationResources = (
  resources: Readonly<Record<string, unknown>>,
): TranslationValidationResult => {
  const invalidValues: TranslationValidationResult['invalidValues'] = [];
  const emptyValues: TranslationValidationResult['emptyValues'] = [];
  const validResources: Record<string, TranslationDictionary> = {};

  const inspect = (locale: string, value: unknown, key = ''): void => {
    if (typeof value === 'string') {
      if (!value.trim()) emptyValues.push({ locale, key });
      return;
    }
    if (isPluralizationObject(value)) {
      Object.entries(value).forEach(([pluralKey, pluralValue]) => {
        if (!pluralValue.trim()) {
          emptyValues.push({ locale, key: `${key}.${pluralKey}` });
        }
      });
      return;
    }
    if (!isDictionary(value)) {
      invalidValues.push({ locale, key, value });
      return;
    }
    Object.entries(value).forEach(([childKey, childValue]) => {
      inspect(locale, childValue, key ? `${key}.${childKey}` : childKey);
    });
  };

  Object.entries(resources).forEach(([locale, resource]) => {
    if (!isDictionary(resource)) {
      invalidValues.push({ locale, key: '', value: resource });
      return;
    }
    validResources[locale] = resource;
    inspect(locale, resource);
  });

  const allKeys = new Set(
    Object.values(validResources).flatMap(resource => (
      flattenTranslationKeys(resource)
    )),
  );
  const missingByLocale = Object.fromEntries(
    Object.entries(validResources).map(([locale, resource]) => {
      const localeKeys = new Set(flattenTranslationKeys(resource));
      return [
        locale,
        [...allKeys].filter(key => !localeKeys.has(key)).sort(),
      ];
    }),
  );

  return {
    valid: invalidValues.length === 0
      && emptyValues.length === 0
      && Object.values(missingByLocale).every(keys => keys.length === 0),
    missingByLocale,
    invalidValues,
    emptyValues,
  };
};
