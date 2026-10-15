import { useCallback } from 'react';
import { useOptionalLocalization } from '../localization/useLocalization';
import { useTheme } from '../hooks/useTheme';

/**
 * Built-in labels used when a component prop is not given (accessibility
 * labels, default button texts…). English and Arabic ship with Bunyan; apps
 * override any of them with translation keys under `bunyan.` (for example
 * `bunyan.loading`) in `DesignSystemLocalizationProvider`, or merge
 * `bunyanTranslations` into their own resources.
 */
const en = {
  loading: 'Loading',
  loadingContent: 'Loading content',
  tryAgain: 'Try again',
  somethingWentWrong: 'Something went wrong',
  optional: 'Optional',
  showPassword: 'Show password',
  hidePassword: 'Hide password',
  clearSearch: 'Clear search',
  search: 'Search',
  close: 'Close',
  closeSheet: 'Close bottom sheet',
  closeModal: 'Close modal',
  dismiss: 'Dismiss',
  dismissAlert: 'Dismiss alert',
  dismissNotification: 'Dismiss notification',
  confirm: 'Confirm',
  cancel: 'Cancel',
  ok: 'OK',
  submit: 'Submit',
  reset: 'Reset',
  add: 'Add',
  remove: 'Remove',
  copy: 'Copy %{label}',
  copied: 'Copied',
  unread: 'Unread',
  showAmount: 'Show amount',
  hideAmount: 'Hide amount',
  addFavourite: 'Add to favourites',
  removeFavourite: 'Remove from favourites',
  increaseQuantity: 'Increase quantity',
  decreaseQuantity: 'Decrease quantity',
  selectDate: 'Select date',
  clearDate: 'Clear date',
  codeSlots: 'Verification code, %{entered} of %{total} digits entered',
  codeInput: 'Verification code input',
  resend: 'Resend code',
  resendIn: 'Resend in %{seconds}s',
  rating: 'Rating, %{value} of %{max}',
  stepOf: 'Step %{step} of %{total}',
  back: 'Back',
  typeToConfirm: 'Type %{phrase} to confirm',
  noResults: 'No results',
  moveUp: 'Move up',
  moveDown: 'Move down',
  more: 'More',
  addFile: 'Add file',
  removeFile: 'Remove %{name}',
  uploading: 'Uploading',
  selectOption: 'Select an option',
  searchOptions: 'Search options',
  noOptions: 'No options found',
  tabs: 'Tabs',
  leadingAction: 'Input leading action',
  trailingAction: 'Input trailing action',
} as const;

export type BunyanStringKey = keyof typeof en;

const ar: Record<BunyanStringKey, string> = {
  loading: 'جارٍ التحميل',
  loadingContent: 'جارٍ تحميل المحتوى',
  tryAgain: 'حاول مرة أخرى',
  somethingWentWrong: 'حدث خطأ ما',
  optional: 'اختياري',
  showPassword: 'إظهار كلمة المرور',
  hidePassword: 'إخفاء كلمة المرور',
  clearSearch: 'مسح البحث',
  search: 'بحث',
  close: 'إغلاق',
  closeSheet: 'إغلاق النافذة',
  closeModal: 'إغلاق النافذة',
  dismiss: 'إغلاق',
  dismissAlert: 'إغلاق التنبيه',
  dismissNotification: 'إغلاق الإشعار',
  confirm: 'تأكيد',
  cancel: 'إلغاء',
  ok: 'موافق',
  submit: 'إرسال',
  reset: 'إعادة تعيين',
  add: 'إضافة',
  remove: 'حذف',
  copy: 'نسخ %{label}',
  copied: 'تم النسخ',
  unread: 'غير مقروء',
  showAmount: 'إظهار المبلغ',
  hideAmount: 'إخفاء المبلغ',
  addFavourite: 'إضافة إلى المفضلة',
  removeFavourite: 'إزالة من المفضلة',
  increaseQuantity: 'زيادة الكمية',
  decreaseQuantity: 'تقليل الكمية',
  selectDate: 'اختر التاريخ',
  clearDate: 'مسح التاريخ',
  codeSlots: 'رمز التحقق، تم إدخال %{entered} من %{total} أرقام',
  codeInput: 'حقل رمز التحقق',
  resend: 'إعادة إرسال الرمز',
  resendIn: 'إعادة الإرسال بعد %{seconds} ث',
  rating: 'التقييم %{value} من %{max}',
  stepOf: 'الخطوة %{step} من %{total}',
  back: 'رجوع',
  typeToConfirm: 'اكتب %{phrase} للتأكيد',
  noResults: 'لا توجد نتائج',
  moveUp: 'نقل لأعلى',
  moveDown: 'نقل لأسفل',
  more: 'المزيد',
  addFile: 'إضافة ملف',
  removeFile: 'حذف %{name}',
  uploading: 'جارٍ الرفع',
  selectOption: 'اختر خيارًا',
  searchOptions: 'ابحث في الخيارات',
  noOptions: 'لا توجد خيارات',
  tabs: 'علامات التبويب',
  leadingAction: 'إجراء في بداية الحقل',
  trailingAction: 'إجراء في نهاية الحقل',
};

export const bunyanDefaultStrings = { en, ar } as const;

/** Merge into your i18n-js resources to translate / override Bunyan's labels. */
export const bunyanTranslations = { en: { bunyan: en }, ar: { bunyan: ar } } as const;

const interpolate = (text: string, params?: Record<string, unknown>) =>
  params ? text.replace(/%\{(\w+)\}/g, (match, name: string) => (name in params ? String(params[name]) : match)) : text;

/**
 * Returns `s(key, params?)` → the app translation of `bunyan.<key>` when it
 * exists, else Bunyan's built-in label in the current language (Arabic for
 * `ar*` locales, English otherwise).
 */
export function useStrings() {
  const localization = useOptionalLocalization();
  const { locale } = useTheme();
  const language = /^ar\b/i.test(localization?.locale ?? locale) ? 'ar' : 'en';
  return useCallback((key: BunyanStringKey, params?: Record<string, unknown>) => {
    const appKey = `bunyan.${key}`;
    if (localization?.exists(appKey)) return localization.translate(appKey, params);
    return interpolate((language === 'ar' ? ar : en)[key], params);
  }, [language, localization]);
}
