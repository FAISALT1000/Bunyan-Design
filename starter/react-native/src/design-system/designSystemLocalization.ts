import arabicTranslations from '../localization/ar.json';
import englishTranslations from '../localization/en.json';

export const designSystemTranslations = {
  en: englishTranslations,
  ar: arabicTranslations,
} as const;

export type AppLocale = keyof typeof designSystemTranslations;

export const designSystemLocalization = {
  fallbackLocale: 'en',
  translations: designSystemTranslations,
  rtlLocales: ['ar'],
} as const;
