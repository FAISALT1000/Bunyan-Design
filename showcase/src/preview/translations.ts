import type { TranslationResources } from '@bunyan/design-system';

export type PreviewLocale = 'en' | 'ar';

export const previewTranslations: TranslationResources<PreviewLocale> = {
  en: {
    preview: {
      title: 'Bunyan Design System Preview',
      subtitle: 'Custom catalog for components, hooks, themes, RTL, and accessibility.',
      components: 'Components',
      inputs: 'Inputs',
      overlays: 'Overlays',
      hooks: 'Hooks',
      states: 'States',
      continue: 'Continue',
      confirm: 'Confirm',
      search: 'Search components',
      email: 'Email address',
      password: 'Password',
      amount: 'Amount',
      notes: 'Notes',
    },
  },
  ar: {
    preview: {
      title: 'معاينة نظام تصميم بنيان',
      subtitle: 'كتالوج مخصص للمكونات والخطافات والسمات واتجاه RTL وإمكانية الوصول.',
      components: 'المكونات',
      inputs: 'الحقول',
      overlays: 'النوافذ',
      hooks: 'الخطافات',
      states: 'الحالات',
      continue: 'متابعة',
      confirm: 'تأكيد',
      search: 'ابحث في المكونات',
      email: 'البريد الإلكتروني',
      password: 'كلمة المرور',
      amount: 'المبلغ',
      notes: 'ملاحظات',
    },
  },
};
