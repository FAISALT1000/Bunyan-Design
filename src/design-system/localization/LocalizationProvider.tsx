import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createLocalizationManager } from './LocalizationManager';
import { LocalizationContext } from './LocalizationContext';
import type {
  DesignSystemLocalizationProviderProps,
  LocalizationContextValue,
  SupportedLocale,
} from './localization.types';
import { localeIsRTL } from './localization.utils';

export function DesignSystemLocalizationProvider<
  TLocale extends string = SupportedLocale,
>({
  locale,
  fallbackLocale,
  translations,
  enableFallback = true,
  missingTranslationBehavior = 'value',
  onMissingTranslation,
  rtlLocales,
  children,
}: DesignSystemLocalizationProviderProps<TLocale>) {
  const managerRef = useRef(
    createLocalizationManager({
      locale,
      translations,
      enableFallback,
      missingTranslationBehavior,
      ...(fallbackLocale ? { fallbackLocale } : {}),
      ...(onMissingTranslation ? { onMissingTranslation } : {}),
    }),
  );
  const manager = managerRef.current;
  const [currentLocale, setCurrentLocale] = useState(locale);

  useEffect(() => {
    manager.registerTranslations(translations);
  }, [manager, translations]);

  useLayoutEffect(() => {
    manager.setLocale(locale);
    setCurrentLocale(locale);
  }, [locale, manager]);

  useEffect(() => {
    manager.setFallbackLocale(fallbackLocale ?? locale);
  }, [fallbackLocale, locale, manager]);

  useEffect(() => {
    manager.setEnableFallback(enableFallback);
  }, [enableFallback, manager]);

  useEffect(() => {
    manager.setMissingTranslationBehavior(missingTranslationBehavior);
    manager.setMissingTranslationHandler(onMissingTranslation);
  }, [manager, missingTranslationBehavior, onMissingTranslation]);

  const setLocale = useCallback((nextLocale: TLocale) => {
    manager.setLocale(nextLocale);
    setCurrentLocale(nextLocale);
  }, [manager]);

  const value = useMemo<LocalizationContextValue<TLocale>>(
    () => ({
      locale: currentLocale,
      isRTL: localeIsRTL(currentLocale, rtlLocales),
      translate: (key, options) => manager.translate(key, options),
      exists: (key, targetLocale) => manager.exists(key, targetLocale),
      setLocale,
      manager,
    }),
    [currentLocale, manager, rtlLocales, setLocale],
  );

  return (
    <LocalizationContext.Provider
      value={value as unknown as LocalizationContextValue<SupportedLocale>}
    >
      {children}
    </LocalizationContext.Provider>
  );
}
