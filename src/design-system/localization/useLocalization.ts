import { useContext } from 'react';
import { LocalizationContext } from './LocalizationContext';
import type {
  LocalizationContextValue,
  SupportedLocale,
} from './localization.types';

export function useLocalization<
  TLocale extends string = SupportedLocale,
>(): LocalizationContextValue<TLocale> {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error(
      'useLocalization must be used inside DesignSystemLocalizationProvider.',
    );
  }
  return context as unknown as LocalizationContextValue<TLocale>;
}

export const useOptionalLocalization = () => useContext(LocalizationContext);
