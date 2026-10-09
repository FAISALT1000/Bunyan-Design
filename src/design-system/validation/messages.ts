import type { TextValue } from '../i18n/text';

/**
 * Default error messages of Bunyan's Yup methods. Strings may use `${min}`,
 * `${max}`, `${domain}`… placeholders. Replace any of them app-wide with
 * `setValidationMessages`, e.g. with locale keys:
 *
 * ```ts
 * setValidationMessages({
 *   mobileNumber: { localeKey: 'errors.mobile' },
 *   minMax: { localeKey: 'errors.length' },   // receives params { min, max }
 * });
 * ```
 */
export const defaultValidationMessages = {
  mobileNumber: 'Enter a valid mobile number',
  email: 'Enter a valid email address',
  emailDomain: 'Use an email address ending in @${domain}',
  minMax: 'Must be ${min} to ${max} characters',
  minMaxNumber: 'Must be between ${min} and ${max}',
  minMaxArray: 'Select ${min} to ${max} items',
  noEmojis: 'Emojis are not allowed',
  noSpecialChar: 'Special characters are not allowed',
  onlyEnglishAlphabetic: 'Use English letters only',
  onlyArabicAlphabetic: 'Use Arabic letters only',
  onlyENAndARAlphabetic: 'Use Arabic or English letters only',
  onlyNumbers: 'Use numbers only',
  fullName: 'Enter at least ${minWords} names',
  saudiNationalId: 'Enter a valid national ID / Iqama number',
  iban: 'Enter a valid IBAN',
  sameAs: 'Values do not match',
  maxDecimals: 'Use at most ${max} decimal places',
  minAge: 'You must be at least ${years} years old',
  notFuture: 'The date cannot be in the future',
  notPast: 'The date cannot be in the past',
  phone: 'Enter a valid phone number',
  dateRangeFromRequired: 'Select a start date',
  dateRangeToRequired: 'Select an end date',
  dateRangeOrder: 'The start date must be before the end date',
  passwordMin: 'Use at least ${min} characters',
  passwordMax: 'Use at most ${max} characters',
  passwordUppercase: 'Add an uppercase letter (A-Z)',
  passwordLowercase: 'Add a lowercase letter (a-z)',
  passwordNumber: 'Add a number (0-9)',
  passwordSpecial: 'Add a special character (e.g. ! @ # $)',
  passwordSpaces: 'Spaces are not allowed',
  passwordSequence: 'Avoid sequences like 1234 or abcd',
  passwordRepeat: 'Avoid repeating the same character',
  passwordEnglishOnly: 'Use English letters, numbers and symbols only',
};

export type ValidationMessageKey = keyof typeof defaultValidationMessages;
export type ValidationMessageText = string | Exclude<TextValue, string>;

let current: Record<ValidationMessageKey, ValidationMessageText> = { ...defaultValidationMessages };

/** Override default messages app-wide (merge). Call once at start-up, before schemas are created. */
export const setValidationMessages = (messages: Partial<Record<ValidationMessageKey, ValidationMessageText>>) => {
  current = { ...current, ...messages };
};

export const getValidationMessage = (key: ValidationMessageKey): ValidationMessageText => current[key];
