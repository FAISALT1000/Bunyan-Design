/** Value of `PhoneInput` / the `PhoneWithCountryInput` form field. */
export interface PhoneValue {
  /** ISO country code, e.g. `'SA'`. */
  country: string;
  /** National number, digits only, without the leading 0. */
  number: string;
}

export interface PhoneCountry {
  /** ISO 3166-1 alpha-2, e.g. `'SA'`. */
  code: string;
  /** Dialing code with `+`, e.g. `'+966'`. */
  dialCode: string;
  name: string;
  /** Arabic name, used when the UI is RTL. */
  nameAr?: string;
  /** Example national number length(s) for basic validation. */
  lengths?: readonly number[];
}

/** Default country list (GCC first). Pass your own `countries` to change it. */
export const DEFAULT_PHONE_COUNTRIES: readonly PhoneCountry[] = [
  { code: 'SA', dialCode: '+966', name: 'Saudi Arabia', nameAr: 'السعودية', lengths: [9] },
  { code: 'AE', dialCode: '+971', name: 'United Arab Emirates', nameAr: 'الإمارات', lengths: [9] },
  { code: 'KW', dialCode: '+965', name: 'Kuwait', nameAr: 'الكويت', lengths: [8] },
  { code: 'BH', dialCode: '+973', name: 'Bahrain', nameAr: 'البحرين', lengths: [8] },
  { code: 'QA', dialCode: '+974', name: 'Qatar', nameAr: 'قطر', lengths: [8] },
  { code: 'OM', dialCode: '+968', name: 'Oman', nameAr: 'عُمان', lengths: [8] },
  { code: 'EG', dialCode: '+20', name: 'Egypt', nameAr: 'مصر', lengths: [10] },
  { code: 'JO', dialCode: '+962', name: 'Jordan', nameAr: 'الأردن', lengths: [9] },
  { code: 'IN', dialCode: '+91', name: 'India', nameAr: 'الهند', lengths: [10] },
  { code: 'PK', dialCode: '+92', name: 'Pakistan', nameAr: 'باكستان', lengths: [10] },
  { code: 'PH', dialCode: '+63', name: 'Philippines', nameAr: 'الفلبين', lengths: [10] },
  { code: 'GB', dialCode: '+44', name: 'United Kingdom', nameAr: 'المملكة المتحدة', lengths: [10] },
  { code: 'US', dialCode: '+1', name: 'United States', nameAr: 'الولايات المتحدة', lengths: [10] },
];

/** `'SA'` → 🇸🇦 */
export const flagEmoji = (code: string) =>
  code.toUpperCase().replace(/[A-Z]/g, letter => String.fromCodePoint(0x1f1e6 + letter.charCodeAt(0) - 65));

/** `{ country: 'SA', number: '512345678' }` → `'+966512345678'` */
export const toE164 = (value: PhoneValue | null | undefined, countries: readonly PhoneCountry[] = DEFAULT_PHONE_COUNTRIES) => {
  if (!value?.number) return '';
  const dial = countries.find(country => country.code === value.country)?.dialCode ?? '';
  return `${dial}${value.number}`;
};

/** Checks the national number length against the country's `lengths`. */
export const isValidPhone = (value: PhoneValue | null | undefined, countries: readonly PhoneCountry[] = DEFAULT_PHONE_COUNTRIES) => {
  if (!value?.number) return false;
  const lengths = countries.find(country => country.code === value.country)?.lengths;
  return lengths ? lengths.includes(value.number.length) : value.number.length >= 6;
};

