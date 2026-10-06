import {
  createLocalizationManager,
  validateTranslationResources,
} from '../src';

const translations = {
  en: {
    common: { confirm: 'Confirm' },
    welcome: { message: 'Welcome, %{name}' },
    items: { count: { one: '%{count} item', other: '%{count} items' } },
  },
  ar: {
    common: { confirm: 'تأكيد' },
    welcome: { message: 'مرحباً، %{name}' },
    items: {
      count: {
        zero: 'لا توجد عناصر',
        one: 'عنصر واحد',
        two: 'عنصران',
        few: '%{count} عناصر',
        many: '%{count} عنصراً',
        other: '%{count} عنصر',
      },
    },
  },
} as const;

describe('LocalizationManager', () => {
  it('registers resources, changes locale, and translates both languages', () => {
    const manager = createLocalizationManager<'en' | 'ar'>({
      locale: 'en',
      fallbackLocale: 'en',
      translations,
    });

    expect(manager.translate('common.confirm')).toBe('Confirm');
    manager.setLocale('ar');
    expect(manager.getLocale()).toBe('ar');
    expect(manager.translate('common.confirm')).toBe('تأكيد');
    expect(manager.exists('common.confirm')).toBe(true);
  });

  it('supports fallback, interpolation, and pluralization', () => {
    const manager = createLocalizationManager<'en' | 'ar'>({
      locale: 'ar',
      fallbackLocale: 'en',
      translations: {
        en: translations.en,
        ar: {
          common: {},
          welcome: translations.ar.welcome,
          items: translations.ar.items,
        },
      },
    });

    expect(manager.translate('common.confirm')).toBe('Confirm');
    expect(manager.translate('welcome.message', { name: 'فيصل' }))
      .toBe('مرحباً، فيصل');
    expect(manager.translate('items.count', { count: 2 })).toBe('عنصران');
  });

  it('reports each missing locale/key once and applies configured behavior', () => {
    const onMissingTranslation = jest.fn();
    const manager = createLocalizationManager<'en' | 'ar'>({
      locale: 'en',
      translations,
      missingTranslationBehavior: 'key',
      onMissingTranslation,
    });

    expect(manager.translate('missing.key')).toBe('missing.key');
    expect(manager.translate('missing.key')).toBe('missing.key');
    expect(onMissingTranslation).toHaveBeenCalledTimes(1);

    manager.setMissingTranslationBehavior('empty');
    expect(manager.translate('missing.empty')).toBe('');
    manager.setMissingTranslationBehavior('throw');
    expect(() => manager.translate('missing.throw')).toThrow(
      'Missing translation: en.missing.throw',
    );
  });

  it('does not mutate supplied resources when new translations are registered', () => {
    const supplied = {
      en: { common: { confirm: 'Confirm' } },
      ar: { common: { confirm: 'تأكيد' } },
    } as const;
    const snapshot = JSON.stringify(supplied);
    const manager = createLocalizationManager<'en' | 'ar'>({
      locale: 'en',
      translations: supplied,
    });

    manager.registerTranslations({
      en: { common: { confirm: 'Continue' } },
      ar: { common: { confirm: 'متابعة' } },
    });

    expect(JSON.stringify(supplied)).toBe(snapshot);
    expect(manager.translate('common.confirm')).toBe('Continue');
  });
});

describe('validateTranslationResources', () => {
  it('accepts compatible translation structures', () => {
    expect(validateTranslationResources(translations).valid).toBe(true);
  });

  it('reports missing, invalid, and empty values', () => {
    const result = validateTranslationResources({
      en: {
        common: { confirm: 'Confirm', cancel: '' },
        invalid: 42,
      },
      ar: {
        common: { confirm: 'تأكيد' },
      },
    });

    expect(result.valid).toBe(false);
    expect(result.missingByLocale.ar).toContain('common.cancel');
    expect(result.invalidValues).toEqual([
      expect.objectContaining({ locale: 'en', key: 'invalid', value: 42 }),
    ]);
    expect(result.emptyValues).toEqual([
      { locale: 'en', key: 'common.cancel' },
    ]);
  });
});
