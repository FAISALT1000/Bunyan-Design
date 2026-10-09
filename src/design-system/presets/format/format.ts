/**
 * Locale-aware formatting helpers used by Money, DateText, PhoneText and
 * MaskedText. Pure functions, usable outside React too.
 */

export type DigitStyle = 'latin' | 'arabic' | 'auto';

const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩';

const withDigits = (locale: string, digits: DigitStyle) => {
  if (digits === 'auto') return locale;
  const base = locale.split('-u-')[0];
  return `${base}-u-nu-${digits === 'arabic' ? 'arab' : 'latn'}`;
};

/** Converts Latin digits to Arabic-Indic digits (for strings Intl did not format). */
export const toArabicDigits = (text: string) => text.replace(/\d/g, digit => ARABIC_DIGITS[Number(digit)] ?? digit);

const applyDigits = (text: string, locale: string, digits: DigitStyle) =>
  digits === 'arabic' || (digits === 'auto' && /^ar\b/i.test(locale)) ? toArabicDigits(text) : text;

export interface MoneyFormatOptions {
  currency?: string;
  locale?: string;
  /** Fraction digits. Default 2 (0 when `compact`). */
  decimals?: number;
  /** Always show the sign: `+400.00` / `−1,250.00`. */
  signed?: boolean;
  /** `2.4M`, `12K`. */
  compact?: boolean;
  digits?: DigitStyle;
  /** Currency label placement. Default `'after'` (`1,250.00 SAR`). */
  currencyPosition?: 'before' | 'after' | 'none';
}

const MINUS = '−';

export function formatMoney(amount: number, options: MoneyFormatOptions = {}): string {
  const {
    currency,
    locale = 'en',
    compact = false,
    decimals = compact ? 0 : 2,
    signed = false,
    digits = 'latin',
    currencyPosition = 'after',
  } = options;
  if (!Number.isFinite(amount)) return '';
  const formatter = new Intl.NumberFormat(withDigits(locale, digits), {
    minimumFractionDigits: compact ? 0 : decimals,
    maximumFractionDigits: compact ? Math.max(decimals, 1) : decimals,
    ...(compact ? { notation: 'compact' as const } : {}),
  });
  let number = formatter.format(Math.abs(amount));
  number = applyDigits(number, locale, digits);
  const sign = amount < 0 ? MINUS : signed && amount > 0 ? '+' : '';
  const body = `${sign}${number}`;
  if (!currency || currencyPosition === 'none') return body;
  return currencyPosition === 'before' ? `${currency} ${body}` : `${body} ${currency}`;
}

export type DateFormat = 'date' | 'time' | 'datetime' | 'relative' | 'hijri' | 'month';

export interface DateFormatOptions {
  format?: DateFormat;
  locale?: string;
  digits?: DigitStyle;
  /** Reference time for `relative` (tests). Default now. */
  now?: Date;
  /** Extra Intl options for date / time / datetime. */
  intl?: Intl.DateTimeFormatOptions;
}

const RELATIVE_UNITS: Array<[Intl.RelativeTimeFormatUnit, number]> = [
  ['year', 365 * 24 * 3600],
  ['month', 30 * 24 * 3600],
  ['week', 7 * 24 * 3600],
  ['day', 24 * 3600],
  ['hour', 3600],
  ['minute', 60],
];

const FALLBACK_RELATIVE: Record<'en' | 'ar', { now: string; unit: Record<string, [string, string]>; ago: (v: string) => string; in: (v: string) => string }> = {
  en: {
    now: 'just now',
    unit: { year: ['year', 'years'], month: ['month', 'months'], week: ['week', 'weeks'], day: ['day', 'days'], hour: ['hour', 'hours'], minute: ['minute', 'minutes'] },
    ago: v => `${v} ago`,
    in: v => `in ${v}`,
  },
  ar: {
    now: 'الآن',
    unit: { year: ['سنة', 'سنوات'], month: ['شهر', 'أشهر'], week: ['أسبوع', 'أسابيع'], day: ['يوم', 'أيام'], hour: ['ساعة', 'ساعات'], minute: ['دقيقة', 'دقائق'] },
    ago: v => `منذ ${v}`,
    in: v => `خلال ${v}`,
  },
};

function formatRelative(date: Date, now: Date, locale: string, digits: DigitStyle) {
  const diff = Math.round((date.getTime() - now.getTime()) / 1000);
  const abs = Math.abs(diff);
  const lang: 'en' | 'ar' = /^ar\b/i.test(locale) ? 'ar' : 'en';
  if (abs < 45) return FALLBACK_RELATIVE[lang].now;
  const [unit, seconds] = RELATIVE_UNITS.find(([, size]) => abs >= size) ?? ['minute', 60];
  const value = Math.max(1, Math.round(abs / seconds)) * Math.sign(diff);
  const RTF = (Intl as { RelativeTimeFormat?: typeof Intl.RelativeTimeFormat }).RelativeTimeFormat;
  if (RTF) {
    try {
      return applyDigits(new RTF(withDigits(locale, digits), { numeric: 'auto' }).format(value, unit), locale, digits);
    } catch {
      // fall through to the built-in strings
    }
  }
  const words = FALLBACK_RELATIVE[lang];
  const count = Math.abs(value);
  const [one, many] = words.unit[unit] ?? [unit, unit];
  const text = `${count} ${count === 1 ? one : many}`;
  return applyDigits(diff < 0 ? words.ago(text) : words.in(text), locale, digits);
}

export function formatDate(value: Date | string | number, options: DateFormatOptions = {}): string {
  const { format = 'date', locale = 'en', digits = 'latin', now = new Date(), intl } = options;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  if (format === 'relative') return formatRelative(date, now, locale, digits);
  const presets: Record<Exclude<DateFormat, 'relative'>, Intl.DateTimeFormatOptions> = {
    date: { year: 'numeric', month: 'short', day: 'numeric' },
    time: { hour: 'numeric', minute: '2-digit' },
    datetime: { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' },
    month: { year: 'numeric', month: 'long' },
    hijri: { year: 'numeric', month: 'long', day: 'numeric', calendar: 'islamic-umalqura' },
  };
  const formatted = new Intl.DateTimeFormat(withDigits(locale, digits), { ...presets[format], ...intl }).format(date);
  return applyDigits(formatted, locale, digits);
}

/**
 * Groups an international phone number: `+966512345678` → `+966 51 234 5678`.
 * Saudi and Gulf numbers use their usual grouping; others are grouped by 3.
 */
export function formatPhone(value: string, digits: DigitStyle = 'latin', locale = 'en'): string {
  const raw = value.replace(/[^\d+]/g, '');
  const match = /^\+?(966|971|965|973|974|968|20|1|44)(\d+)$/.exec(raw.startsWith('+') ? raw : `+${raw}`);
  let out: string;
  if (match) {
    const [, code, rest = ''] = match;
    const groups = code === '966' || code === '971'
      ? [rest.slice(0, 2), rest.slice(2, 5), rest.slice(5)]
      : code === '1'
        ? [rest.slice(0, 3), rest.slice(3, 6), rest.slice(6)]
        : [rest.slice(0, 4), rest.slice(4)];
    out = `+${code} ${groups.filter(Boolean).join(' ')}`;
  } else {
    out = raw.replace(/(\d{3})(?=\d)/g, '$1 ');
  }
  return applyDigits(out, locale, digits);
}

export type MaskType = 'card' | 'iban' | 'phone' | 'account';

/** Masks a sensitive value, keeping the last 4 characters (and the IBAN country/check digits). */
export function maskText(value: string, type: MaskType, reveal = false): string {
  const compact = value.replace(/\s+/g, '');
  if (reveal) {
    if (type === 'card' || type === 'iban') return compact.replace(/(.{4})(?=.)/g, '$1 ');
    return value;
  }
  const last4 = compact.slice(-4);
  switch (type) {
    case 'card':
      return `•••• •••• •••• ${last4}`;
    case 'iban':
      return `${compact.slice(0, 4)} •••• •••• ${last4}`;
    case 'phone':
      return `•••• ${last4}`;
    default:
      return `•••• ${last4}`;
  }
}
