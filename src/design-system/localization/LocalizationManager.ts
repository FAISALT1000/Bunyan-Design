import { I18n, type TranslateOptions as I18nTranslateOptions } from 'i18n-js';
import type {
  LocalizationManager,
  LocalizationManagerOptions,
  MissingTranslationBehavior,
  TranslationOptions,
  TranslationResources,
} from './localization.types';
import {
  cloneTranslationResources,
  getTranslationValue,
} from './localization.utils';

class I18nLocalizationManager<
  TLocale extends string,
> implements LocalizationManager<TLocale> {
  private readonly i18n: I18n;
  private resources: TranslationResources<TLocale>;
  private missingBehavior: MissingTranslationBehavior;
  private onMissingTranslation?: ((key: string, locale: TLocale) => void) | undefined;
  private readonly reportedMissingKeys = new Set<string>();

  constructor(options: LocalizationManagerOptions<TLocale>) {
    this.resources = cloneTranslationResources(options.translations);
    this.missingBehavior = options.missingTranslationBehavior ?? 'value';
    this.onMissingTranslation = options.onMissingTranslation;
    this.i18n = new I18n(cloneTranslationResources(options.translations), {
      locale: options.locale,
      defaultLocale: options.fallbackLocale ?? options.locale,
      enableFallback: options.enableFallback ?? true,
      missingBehavior: 'error',
    });
    this.registerPluralizationRules(Object.keys(options.translations));
  }

  getLocale() {
    return this.i18n.locale as TLocale;
  }

  setLocale(locale: TLocale) {
    this.i18n.locale = locale;
  }

  setFallbackLocale(locale: TLocale) {
    this.i18n.defaultLocale = locale;
  }

  setEnableFallback(enabled: boolean) {
    this.i18n.enableFallback = enabled;
  }

  setMissingTranslationBehavior(behavior: MissingTranslationBehavior) {
    this.missingBehavior = behavior;
  }

  setMissingTranslationHandler(
    handler?: (key: string, locale: TLocale) => void,
  ) {
    this.onMissingTranslation = handler;
  }

  getMissingTranslationBehavior() {
    return this.missingBehavior;
  }

  registerTranslations(translations: TranslationResources<TLocale>) {
    const cloned = cloneTranslationResources(translations);
    this.resources = cloned;
    this.i18n.translations = {};
    this.i18n.store(cloned);
    this.registerPluralizationRules(Object.keys(translations));
  }

  exists(key: string, locale: TLocale = this.getLocale()) {
    return this.i18n.locales.get(locale).some(candidate => (
      getTranslationValue(this.resources[candidate as TLocale], key) !== undefined
    ));
  }

  translate(key: string, options: TranslationOptions = {}) {
    if (!this.exists(key)) {
      this.reportMissing(key);
      if (this.missingBehavior === 'throw') {
        throw new Error(`Missing translation: ${this.getLocale()}.${key}`);
      }
      return this.missingBehavior === 'empty' ? '' : key;
    }

    return String(this.i18n.t(key, options as I18nTranslateOptions));
  }

  private reportMissing(key: string) {
    const locale = this.getLocale();
    const reportKey = `${locale}:${key}`;
    if (this.reportedMissingKeys.has(reportKey)) return;
    this.reportedMissingKeys.add(reportKey);
    this.onMissingTranslation?.(key, locale);
  }

  private registerPluralizationRules(locales: readonly string[]) {
    const arabicPluralizer = (_i18n: I18n, count: number) => {
      const absolute = Math.abs(count);
      const modulo100 = absolute % 100;
      if (absolute === 0) return ['zero', 'other'];
      if (absolute === 1) return ['one', 'other'];
      if (absolute === 2) return ['two', 'other'];
      if (modulo100 >= 3 && modulo100 <= 10) return ['few', 'other'];
      if (modulo100 >= 11 && modulo100 <= 99) return ['many', 'other'];
      return ['other'];
    };

    locales
      .filter(locale => locale.toLocaleLowerCase().split(/[-_]/)[0] === 'ar')
      .forEach(locale => this.i18n.pluralization.register(locale, arabicPluralizer));
    this.i18n.pluralization.register('ar', arabicPluralizer);
  }
}

export const createLocalizationManager = <
  TLocale extends string,
>(
  options: LocalizationManagerOptions<TLocale>,
): LocalizationManager<TLocale> => new I18nLocalizationManager(options);
