import type {
  ResolveLocalizedTextOptions,
  SupportedLocale,
} from './localization.types';

export const resolveLocalizedText = <
  TLocale extends string = SupportedLocale,
>({
  localize,
  value,
  translationOptions,
  localization,
}: ResolveLocalizedTextOptions<TLocale>): string | number => {
  if (!localize) {
    if (value === undefined) {
      throw new Error('Text requires either a value or a localization key.');
    }
    return value;
  }

  if (!localization) {
    throw new Error(
      'Localized content must be rendered inside DesignSystemLocalizationProvider.',
    );
  }

  if (localization.exists(localize)) {
    return localization.translate(localize, translationOptions);
  }

  const behavior = localization.manager.getMissingTranslationBehavior();
  if (behavior === 'throw') {
    return localization.translate(localize, translationOptions);
  }

  // Report once through the manager even when the visible fallback is supplied.
  const missingResult = localization.translate(localize, translationOptions);
  if (behavior === 'empty') return '';
  if (behavior === 'key') return localize;
  return value ?? missingResult ?? localize;
};
