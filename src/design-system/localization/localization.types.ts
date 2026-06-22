import type React from 'react';

export type SupportedLocale = 'en' | 'ar';

export type TranslationValue =
  | string
  | {
      readonly [key: string]: TranslationValue;
    };

export type TranslationDictionary = Readonly<Record<string, TranslationValue>>;

export type TranslationResources<TLocale extends string = SupportedLocale> =
  Readonly<Record<TLocale, TranslationDictionary>>;

export interface TranslationOptions {
  count?: number;
  [key: string]: unknown;
}

export type MissingTranslationBehavior =
  | 'value'
  | 'key'
  | 'empty'
  | 'throw';

export interface LocalizedContent {
  value: string | number;
  localize?: string;
  translationOptions?: TranslationOptions;
}

export interface LocalizationManagerOptions<
  TLocale extends string = SupportedLocale,
> {
  locale: TLocale;
  fallbackLocale?: TLocale;
  translations: TranslationResources<TLocale>;
  enableFallback?: boolean;
  missingTranslationBehavior?: MissingTranslationBehavior;
  onMissingTranslation?: (key: string, locale: TLocale) => void;
}

export interface LocalizationManager<
  TLocale extends string = SupportedLocale,
> {
  getLocale(): TLocale;
  setLocale(locale: TLocale): void;
  translate(key: string, options?: TranslationOptions): string;
  exists(key: string, locale?: TLocale): boolean;
  registerTranslations(translations: TranslationResources<TLocale>): void;
  setFallbackLocale(locale: TLocale): void;
  setEnableFallback(enabled: boolean): void;
  setMissingTranslationBehavior(behavior: MissingTranslationBehavior): void;
  setMissingTranslationHandler(
    handler?: (key: string, locale: TLocale) => void,
  ): void;
  getMissingTranslationBehavior(): MissingTranslationBehavior;
}

export interface DesignSystemLocalizationProviderProps<
  TLocale extends string = SupportedLocale,
> {
  locale: TLocale;
  fallbackLocale?: TLocale;
  translations: TranslationResources<TLocale>;
  enableFallback?: boolean;
  missingTranslationBehavior?: MissingTranslationBehavior;
  onMissingTranslation?: (key: string, locale: TLocale) => void;
  rtlLocales?: readonly TLocale[];
  children: React.ReactNode;
}

export interface LocalizationContextValue<
  TLocale extends string = SupportedLocale,
> {
  locale: TLocale;
  isRTL: boolean;
  translate: (key: string, options?: TranslationOptions) => string;
  exists: (key: string, locale?: TLocale) => boolean;
  setLocale: (locale: TLocale) => void;
  manager: LocalizationManager<TLocale>;
}

export interface ResolveLocalizedTextOptions<
  TLocale extends string = SupportedLocale,
> {
  localize?: string;
  value?: string | number;
  translationOptions?: TranslationOptions;
  localization?: LocalizationContextValue<TLocale>;
}

export interface InvalidTranslationValue {
  locale: string;
  key: string;
  value: unknown;
}

export interface TranslationValidationResult {
  valid: boolean;
  missingByLocale: Record<string, string[]>;
  invalidValues: InvalidTranslationValue[];
  emptyValues: Array<{ locale: string; key: string }>;
}
