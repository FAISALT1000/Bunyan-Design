/**
 * Plain validation functions (no Yup needed). Bunyan's Yup methods are built on
 * these, so the same rules can be reused in Formik `validate`, in handlers or on a server.
 */
import { normalizeDigits } from '../utilities/numbers';

// ── Character classes (explicit ranges: no Unicode property escapes, safe on Hermes) ──
const ENGLISH_LETTERS = 'A-Za-z';
/** Arabic letters incl. extended letters, tatweel and diacritics (harakat). */
const ARABIC_LETTERS = '\\u0621-\\u064A\\u064B-\\u065F\\u0670-\\u06D3\\u06FA-\\u06FF\\uFB50-\\uFDFF\\uFE70-\\uFEFF';
const DIGITS = '0-9\\u0660-\\u0669\\u06F0-\\u06F9';
const escapeForClass = (chars: string) => chars.replace(/[\\\]^-]/g, '\\$&');

/** Emoji: pictographs, symbols, dingbats, flags, keycaps, variation selector, ZWJ. */
const EMOJI = /(?:\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|\uD83E[\uDC00-\uDEFF]|[⌀-⏿]|[☀-➿]|[⬀-⯿]|[〰〽㊗㊙]|️|‍|⃣)/;

export const hasEmoji = (value: string) => EMOJI.test(value);

export interface CharacterRuleOptions {
  /** Allow spaces. Default `true`. */
  allowSpaces?: boolean;
  /** Allow digits (0-9 and Arabic-Indic). Default `false` for alphabetic rules, `true` for `noSpecialChar`. */
  allowDigits?: boolean;
  /** Extra characters to allow, e.g. `"-'."`. */
  allow?: string;
}

const onlyChars = (value: string, letters: string, { allowSpaces = true, allowDigits = false, allow = '' }: CharacterRuleOptions) => {
  const set = `${letters}${allowDigits ? DIGITS : ''}${allowSpaces ? ' ' : ''}${escapeForClass(allow)}`;
  return new RegExp(`^[${set}]*$`).test(value);
};

export const isOnlyEnglishAlphabetic = (value: string, options: CharacterRuleOptions = {}) => onlyChars(value, ENGLISH_LETTERS, options);
export const isOnlyArabicAlphabetic = (value: string, options: CharacterRuleOptions = {}) => onlyChars(value, ARABIC_LETTERS, options);
export const isOnlyENAndARAlphabetic = (value: string, options: CharacterRuleOptions = {}) =>
  onlyChars(value, `${ENGLISH_LETTERS}${ARABIC_LETTERS}`, options);
/** Letters (English/Arabic), digits and spaces only — no symbols, punctuation or emojis. */
export const hasNoSpecialChar = (value: string, options: CharacterRuleOptions = {}) =>
  onlyChars(value, `${ENGLISH_LETTERS}${ARABIC_LETTERS}`, { allowDigits: true, ...options });
/** Digits only (Arabic-Indic digits allowed). */
export const isOnlyNumbers = (value: string) => /^[0-9٠-٩۰-۹]*$/.test(value);

// ── Mobile number ───────────────────────────────────────────────────────────
export interface MobileNumberOptions {
  /** Country calling code without `+`. Default `'966'` (Saudi Arabia). */
  countryCode?: string;
  /** First digit of the national mobile number. Default `'5'`. */
  startsWith?: string;
  /** Digits after the country code / leading zero. Default `9`. */
  nationalLength?: number;
}

/**
 * Saudi-style mobile number (digits only, Arabic-Indic digits accepted):
 * - `5XXXXXXXX` (9 digits)
 * - `05XXXXXXXX` (10 digits)
 * - country code + number: `9665XXXXXXXX`, `+9665XXXXXXXX` (13 characters) or `009665XXXXXXXX`
 */
export const isMobileNumber = (value: string, { countryCode = '966', startsWith = '5', nationalLength = 9 }: MobileNumberOptions = {}) => {
  const v = normalizeDigits(value.trim());
  const rest = nationalLength - startsWith.length;
  const national = `${startsWith}\\d{${rest}}`;
  return new RegExp(`^(?:${national}|0${national}|(?:\\+|00)?${countryCode}${national})$`).test(v);
};

/** `0512345678` / `+966512345678` → `512345678` (national number), or `undefined` when invalid. */
export const toNationalMobile = (value: string, options: MobileNumberOptions = {}) => {
  if (!isMobileNumber(value, options)) return undefined;
  const digits = normalizeDigits(value).replace(/\D/g, '');
  return digits.slice(-(options.nationalLength ?? 9));
};

// ── Email ───────────────────────────────────────────────────────────────────
/** Same pattern as Yup's `string().email()`. */
const EMAIL = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

/** `'gmail'` → `'gmail.com'`, `'@company.sa'` → `'company.sa'`. */
export const normalizeEmailDomain = (domain: string) => {
  const d = domain.trim().toLowerCase().replace(/^@/, '');
  return d.includes('.') ? d : `${d}.com`;
};

export const isEmail = (value: string, domains?: string | readonly string[]) => {
  if (!EMAIL.test(value)) return false;
  if (!domains || (Array.isArray(domains) && domains.length === 0)) return true;
  const host = value.split('@').pop()!.toLowerCase();
  return (typeof domains === 'string' ? [domains] : domains).some(domain => host === normalizeEmailDomain(domain));
};

// ── Password ────────────────────────────────────────────────────────────────
export interface PasswordOptions {
  /** Default `8`. */
  min?: number;
  /** Default `64`. */
  max?: number;
  /** Default `true`. */
  uppercase?: boolean;
  /** Default `true`. */
  lowercase?: boolean;
  /** Default `true`. */
  number?: boolean;
  /** Default `true`. */
  special?: boolean;
  /** Reject spaces. Default `true`. */
  noSpaces?: boolean;
  /** Reject 4+ sequential characters (`1234`, `abcd`, `4321`). Default `false`. */
  noSequence?: boolean;
  /** Reject the same character 4+ times in a row (`aaaa`). Default `false`. */
  noRepeat?: boolean;
  /** Reject Arabic letters (some back-ends only accept ASCII). Default `true`. */
  englishOnly?: boolean;
}

export type PasswordIssue =
  | 'min' | 'max' | 'uppercase' | 'lowercase' | 'number' | 'special' | 'spaces' | 'sequence' | 'repeat' | 'englishOnly';

const hasSequence = (value: string, length = 4) => {
  for (let i = 0; i + length <= value.length; i += 1) {
    let up = true;
    let down = true;
    for (let j = 1; j < length; j += 1) {
      const diff = value.charCodeAt(i + j) - value.charCodeAt(i + j - 1);
      if (diff !== 1) up = false;
      if (diff !== -1) down = false;
    }
    if (up || down) return true;
  }
  return false;
};

/** Every rule the password breaks, in display order (empty array = valid). */
export const passwordIssues = (value: string, options: PasswordOptions = {}): PasswordIssue[] => {
  const {
    min = 8, max = 64, uppercase = true, lowercase = true, number = true, special = true,
    noSpaces = true, noSequence = false, noRepeat = false, englishOnly = true,
  } = options;
  const issues: PasswordIssue[] = [];
  if (value.length < min) issues.push('min');
  if (value.length > max) issues.push('max');
  if (uppercase && !/[A-Z]/.test(value)) issues.push('uppercase');
  if (lowercase && !/[a-z]/.test(value)) issues.push('lowercase');
  if (number && !/[0-9]/.test(value)) issues.push('number');
  if (special && !/[^A-Za-z0-9\s؀-ۿ]/.test(value)) issues.push('special');
  if (noSpaces && /\s/.test(value)) issues.push('spaces');
  if (noSequence && hasSequence(value.toLowerCase())) issues.push('sequence');
  if (noRepeat && /(.)\1{3,}/.test(value)) issues.push('repeat');
  if (englishOnly && /[؀-ۿ]/.test(value)) issues.push('englishOnly');
  return issues;
};

/** 0 – 4 strength score for a meter (length, character variety). */
export const passwordStrength = (value: string): 0 | 1 | 2 | 3 | 4 => {
  if (!value) return 0;
  const variety = [/[a-z]/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].filter(r => r.test(value)).length;
  const score = (value.length >= 8 ? 1 : 0) + (value.length >= 12 ? 1 : 0) + Math.max(0, variety - 1);
  return Math.min(4, score) as 0 | 1 | 2 | 3 | 4;
};

// ── Saudi identifiers & banking ─────────────────────────────────────────────
export type SaudiIdType = 'citizen' | 'resident' | 'any';

/** Saudi national ID (starts with 1) or Iqama (starts with 2): 10 digits with check digit. */
export const isSaudiNationalId = (value: string, type: SaudiIdType = 'any') => {
  const v = normalizeDigits(value.trim());
  if (!/^[12]\d{9}$/.test(v)) return false;
  if (type === 'citizen' && v[0] !== '1') return false;
  if (type === 'resident' && v[0] !== '2') return false;
  let sum = 0;
  for (let i = 0; i < 10; i += 1) {
    const digit = Number(v[i]);
    if (i % 2 === 0) {
      const doubled = digit * 2;
      sum += Math.floor(doubled / 10) + (doubled % 10);
    } else {
      sum += digit;
    }
  }
  return sum % 10 === 0;
};

const IBAN_LENGTHS: Record<string, number> = { SA: 24, AE: 23, KW: 30, BH: 22, QA: 29, JO: 30, EG: 29, GB: 22, DE: 22, FR: 27 };

/** IBAN with ISO 13616 mod-97 check. Pass `country` (e.g. `'SA'`) to also require that country. */
export const isIban = (value: string, country?: string) => {
  const iban = value.replace(/\s/g, '').toUpperCase();
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/.test(iban)) return false;
  const code = iban.slice(0, 2);
  if (country && code !== country.toUpperCase()) return false;
  const expected = IBAN_LENGTHS[code];
  if (expected !== undefined && iban.length !== expected) return false;
  const rearranged = iban.slice(4) + iban.slice(0, 4);
  let remainder = 0;
  for (const char of rearranged) {
    const n = /[A-Z]/.test(char) ? String(char.charCodeAt(0) - 55) : char;
    for (const digit of n) remainder = (remainder * 10 + Number(digit)) % 97;
  }
  return remainder === 1;
};

// ── Dates ───────────────────────────────────────────────────────────────────
/** Whole years between `birthDate` and `today`. */
export const ageOn = (birthDate: Date, today: Date = new Date()) => {
  let age = today.getFullYear() - birthDate.getFullYear();
  const beforeBirthday = today.getMonth() < birthDate.getMonth()
    || (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate());
  if (beforeBirthday) age -= 1;
  return age;
};

export interface DateRangeMessages {
  /** Shown when `from` is required and missing. Can be a locale key (Form translates errors). */
  fromRequired?: string;
  toRequired?: string;
  /** Shown when `from` is after `to`. */
  order?: string;
}

/** Validates a `{ from, to }` range. Returns an error message or `undefined`. */
export function validateDateRange(
  value: { from?: Date | undefined; to?: Date | undefined } | null | undefined,
  requireFrom = false,
  requireTo = false,
  messages: DateRangeMessages = {},
): string | undefined {
  const text = {
    fromRequired: 'Select a start date',
    toRequired: 'Select an end date',
    order: 'The start date must be before the end date',
    ...messages,
  };
  const from = value?.from;
  const to = value?.to;
  if (requireFrom && !from) return text.fromRequired;
  if (requireTo && !to) return text.toRequired;
  if (from && to && from.getTime() > to.getTime()) return text.order;
  return undefined;
}
