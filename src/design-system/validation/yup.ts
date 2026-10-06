/**
 * Bunyan ships Yup and extends it with ready-made rules. Apps import Yup from
 * the design system — never from 'yup' — so every schema gets these methods:
 *
 * ```ts
 * import { Yup } from '@bunyan/design-system';
 *
 * Yup.object({
 *   mobile: Yup.string().required().mobileNumber(),
 *   email: Yup.string().email('gmail'),
 *   name: Yup.string().onlyENAndARAlphabetic().minMax(2, 50),
 *   password: Yup.string().required().password(),
 * });
 * ```
 */
import * as Yup from 'yup';
import { isValidPhone, type PhoneValue } from '../components/PhoneInput/countries';
import type { TextValue } from '../i18n/text';
import { getValidationMessage, type ValidationMessage, type ValidationMessageKey } from './messages';
import {
  ageOn,
  hasEmoji,
  hasNoSpecialChar,
  isEmail,
  isIban,
  isMobileNumber,
  isOnlyArabicAlphabetic,
  isOnlyENAndARAlphabetic,
  isOnlyEnglishAlphabetic,
  isOnlyNumbers,
  isSaudiNationalId,
  normalizeEmailDomain,
  passwordIssues,
  type CharacterRuleOptions,
  type DateRangeMessages,
  type MobileNumberOptions,
  type PasswordIssue,
  type PasswordOptions,
  type SaudiIdType,
} from './rules';

/** A message argument: plain text (may contain `${min}`…) or `{ localeKey, params? }`. */
export type RuleMessage = string | Exclude<TextValue, string>;
type YupMessage = string | ((params: Record<string, unknown>) => unknown);

const isTextObject = (value: unknown): value is Exclude<TextValue, string> =>
  typeof value === 'object' && value !== null && typeof (value as { localeKey?: unknown }).localeKey === 'string';

/** Locale-key messages receive the rule params (min, max…) for interpolation by the app's translate function. */
const toYupMessage = (message: ValidationMessage | RuleMessage): YupMessage =>
  isTextObject(message)
    ? (params: Record<string, unknown>) => {
        // Keep only the rule's own params (min, max, domain…), not Yup internals.
        const internal = new Set(['path', 'value', 'originalValue', 'label', 'originalPath', 'spec', 'disableStackTrace', 'type']);
        const ruleParams = Object.fromEntries(Object.entries(params).filter(([key]) => !internal.has(key)));
        return { ...message, params: { ...ruleParams, ...message.params } };
      }
    : message;

const messageFor = (key: ValidationMessageKey, override?: RuleMessage) => toYupMessage(override ?? getValidationMessage(key));

const isEmpty = (value: unknown) => value === undefined || value === null || value === '';

/** `(options?, message?)` or `(message?)` → `[options, message]`. */
const optionsAndMessage = <O extends object>(first?: O | RuleMessage, second?: RuleMessage): [O | undefined, RuleMessage | undefined] => {
  if (typeof first === 'string' || isTextObject(first)) return [undefined, first as RuleMessage];
  return [first as O | undefined, second];
};

/** Adds a test whose failure message comes from Bunyan's message table. */
function rule<S extends Yup.Schema>(
  schema: S,
  name: string,
  key: ValidationMessageKey,
  override: RuleMessage | undefined,
  valid: (value: any, parent: any) => boolean,
  params: Record<string, unknown> = {},
): S {
  return schema.test({
    name,
    params,
    message: messageFor(key, override) as never,
    exclusive: true,
    test(value) {
      return isEmpty(value) || valid(value, this.parent);
    },
  }) as S;
}

// ── string ────────────────────────────────────────────────────────────────
const originalEmail = Yup.StringSchema.prototype.email;
const COMMON_TLDS = new Set(['com', 'net', 'org', 'sa', 'ae', 'kw', 'bh', 'qa', 'om', 'eg', 'jo', 'edu', 'gov', 'io', 'co', 'uk', 'me', 'app', 'dev', 'info', 'biz', 'us']);
/** `'gmail'`, `'@company.sa'`, `'outlook.com'` are domains; `'Enter a valid email'` or `'errors.email'` are messages. */
const looksLikeDomain = (text: string) => {
  if (/\s/.test(text) || !/^@?[a-z0-9-]+(\.[a-z0-9-]+)*$/i.test(text)) return false;
  if (text.startsWith('@') || !text.includes('.')) return true;
  return COMMON_TLDS.has(text.split('.').pop()!.toLowerCase());
};

Yup.addMethod(Yup.string, 'email', function email(this: Yup.StringSchema, domainOrMessage?: string | readonly string[] | RuleMessage, message?: RuleMessage) {
  let domains: readonly string[] | undefined;
  let text = message;
  if (Array.isArray(domainOrMessage)) domains = domainOrMessage;
  else if (typeof domainOrMessage === 'string' && looksLikeDomain(domainOrMessage)) domains = [domainOrMessage];
  else if (domainOrMessage !== undefined) text = domainOrMessage as RuleMessage;

  const base = originalEmail.call(this, messageFor('email', text) as never);
  if (!domains?.length) return base;
  const list = domains.map(normalizeEmailDomain);
  return rule(base, 'emailDomain', 'emailDomain', text, value => isEmail(String(value), list), { domain: list.join(', @') });
});

Yup.addMethod(Yup.string, 'mobileNumber', function mobileNumber(this: Yup.StringSchema, first?: MobileNumberOptions | RuleMessage, second?: RuleMessage) {
  const [options, message] = optionsAndMessage<MobileNumberOptions>(first, second);
  return rule(this, 'mobileNumber', 'mobileNumber', message, value => isMobileNumber(String(value), options));
});

const PASSWORD_KEYS: Record<PasswordIssue, ValidationMessageKey> = {
  min: 'passwordMin', max: 'passwordMax', uppercase: 'passwordUppercase', lowercase: 'passwordLowercase',
  number: 'passwordNumber', special: 'passwordSpecial', spaces: 'passwordSpaces', sequence: 'passwordSequence',
  repeat: 'passwordRepeat', englishOnly: 'passwordEnglishOnly',
};

Yup.addMethod(Yup.string, 'password', function password(this: Yup.StringSchema, first?: PasswordOptions | RuleMessage, second?: RuleMessage) {
  const [options = {}, message] = optionsAndMessage<PasswordOptions>(first, second);
  const params = { min: options.min ?? 8, max: options.max ?? 64 };
  return this.test({
    name: 'password',
    exclusive: true,
    params,
    test(value) {
      if (isEmpty(value)) return true;
      const [issue] = passwordIssues(String(value), options);
      if (!issue) return true;
      // One message at a time: the first rule the user still has to meet.
      return this.createError({ message: messageFor(PASSWORD_KEYS[issue], message) as never, params: { ...params, issue } });
    },
  });
});

const stringMinMax = function minMax(this: Yup.StringSchema, min: number, max: number, message?: RuleMessage) {
  return rule(this, 'minMax', 'minMax', message, value => String(value).length >= min && String(value).length <= max, { min, max });
};
Yup.addMethod(Yup.string, 'minMax', stringMinMax);

Yup.addMethod(Yup.string, 'noEmojis', function noEmojis(this: Yup.StringSchema, message?: RuleMessage) {
  return rule(this, 'noEmojis', 'noEmojis', message, value => !hasEmoji(String(value)));
});

const characterRule = (name: ValidationMessageKey, check: (value: string, options?: CharacterRuleOptions) => boolean) =>
  function characterRuleMethod(this: Yup.StringSchema, first?: CharacterRuleOptions | RuleMessage, second?: RuleMessage) {
    const [options, message] = optionsAndMessage<CharacterRuleOptions>(first, second);
    return rule(this, name, name, message, value => check(String(value), options));
  };

Yup.addMethod(Yup.string, 'noSpecialChar', characterRule('noSpecialChar', hasNoSpecialChar));
Yup.addMethod(Yup.string, 'onlyEnglishAlphabetic', characterRule('onlyEnglishAlphabetic', isOnlyEnglishAlphabetic));
Yup.addMethod(Yup.string, 'onlyArabicAlphabetic', characterRule('onlyArabicAlphabetic', isOnlyArabicAlphabetic));
Yup.addMethod(Yup.string, 'onlyENAndARAlphabetic', characterRule('onlyENAndARAlphabetic', isOnlyENAndARAlphabetic));

Yup.addMethod(Yup.string, 'onlyNumbers', function onlyNumbers(this: Yup.StringSchema, message?: RuleMessage) {
  return rule(this, 'onlyNumbers', 'onlyNumbers', message, value => isOnlyNumbers(String(value)));
});

Yup.addMethod(Yup.string, 'fullName', function fullName(this: Yup.StringSchema, minWords = 2, message?: RuleMessage) {
  return rule(this, 'fullName', 'fullName', message, value => {
    const words = String(value).trim().split(/\s+/).filter(Boolean);
    return words.length >= minWords && isOnlyENAndARAlphabetic(words.join(' '), { allow: "-'" });
  }, { minWords });
});

Yup.addMethod(Yup.string, 'saudiNationalId', function saudiNationalId(this: Yup.StringSchema, first?: SaudiIdType | RuleMessage, second?: RuleMessage) {
  const type = first === 'citizen' || first === 'resident' || first === 'any' ? first : undefined;
  const message = type ? second : (first as RuleMessage | undefined);
  return rule(this, 'saudiNationalId', 'saudiNationalId', message, value => isSaudiNationalId(String(value), type));
});

Yup.addMethod(Yup.string, 'iban', function iban(this: Yup.StringSchema, country?: string, message?: RuleMessage) {
  return rule(this, 'iban', 'iban', message, value => isIban(String(value), country), { country });
});

Yup.addMethod(Yup.string, 'sameAs', function sameAs(this: Yup.StringSchema, field: string, message?: RuleMessage) {
  return this.test({
    name: 'sameAs',
    exclusive: true,
    params: { field },
    message: messageFor('sameAs', message) as never,
    test(value) {
      return isEmpty(value) || value === (this.parent as Record<string, unknown> | undefined)?.[field];
    },
  });
});

// ── number ────────────────────────────────────────────────────────────────
Yup.addMethod(Yup.number, 'minMax', function minMax(this: Yup.NumberSchema, min: number, max: number, message?: RuleMessage) {
  return rule(this, 'minMax', 'minMaxNumber', message, value => Number(value) >= min && Number(value) <= max, { min, max });
});

Yup.addMethod(Yup.number, 'maxDecimals', function maxDecimals(this: Yup.NumberSchema, max = 2, message?: RuleMessage) {
  return rule(this, 'maxDecimals', 'maxDecimals', message, value => {
    const [, fraction = ''] = String(value).split('.');
    return fraction.length <= max;
  }, { max });
});

// ── array ─────────────────────────────────────────────────────────────────
Yup.addMethod(Yup.array, 'minMax', function minMax(this: Yup.ArraySchema<any, any>, min: number, max: number, message?: RuleMessage) {
  return rule(this, 'minMax', 'minMaxArray', message, value => Array.isArray(value) && value.length >= min && value.length <= max, { min, max });
});

// ── date ──────────────────────────────────────────────────────────────────
const startOfToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

Yup.addMethod(Yup.date, 'minAge', function minAge(this: Yup.DateSchema, years: number, message?: RuleMessage) {
  return rule(this, 'minAge', 'minAge', message, value => ageOn(new Date(value as Date)) >= years, { years });
});

Yup.addMethod(Yup.date, 'notFuture', function notFuture(this: Yup.DateSchema, message?: RuleMessage) {
  return rule(this, 'notFuture', 'notFuture', message, value => new Date(value as Date).getTime() <= Date.now());
});

Yup.addMethod(Yup.date, 'notPast', function notPast(this: Yup.DateSchema, message?: RuleMessage) {
  return rule(this, 'notPast', 'notPast', message, value => new Date(value as Date).getTime() >= startOfToday().getTime());
});

// ── mixed (Bunyan field values) ───────────────────────────────────────────
Yup.addMethod(Yup.mixed, 'dateRange', function dateRange(this: Yup.MixedSchema, requireFrom = false, requireTo = false, messages: DateRangeMessages = {}) {
  return this.test({
    name: 'dateRange',
    test(value) {
      const text = {
        fromRequired: messages.fromRequired ?? getValidationMessage('dateRangeFromRequired'),
        toRequired: messages.toRequired ?? getValidationMessage('dateRangeToRequired'),
        order: messages.order ?? getValidationMessage('dateRangeOrder'),
      };
      const range = value as { from?: Date; to?: Date } | undefined;
      const from = range?.from;
      const to = range?.to;
      const key = requireFrom && !from ? 'fromRequired' : requireTo && !to ? 'toRequired' : from && to && from > to ? 'order' : undefined;
      if (!key) return true;
      return this.createError({ message: toYupMessage(text[key] as ValidationMessage) as never, path: this.path });
    },
  });
});

/** Validates the `{ country, number }` value of `PhoneInput` / the `PhoneWithCountryInput` field. */
Yup.addMethod(Yup.mixed, 'phone', function phone(this: Yup.MixedSchema, message?: RuleMessage) {
  return this.test({
    name: 'phone',
    exclusive: true,
    message: messageFor('phone', message) as never,
    test(value) {
      const phoneValue = value as PhoneValue | null | undefined;
      return !phoneValue?.number || isValidPhone(phoneValue);
    },
  });
});

export { Yup };

type Msg = RuleMessage;

declare module 'yup' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface StringSchema<TType, TContext, TDefault, TFlags> {
    /**
     * Valid email. Pass a domain to also require it: `email('gmail')` → `@gmail.com`,
     * `email(['company.sa', 'company.com'])`. A plain sentence or locale key is treated as the message.
     */
    email(domain?: string | readonly string[], message?: Msg): this;
    email(message?: Msg): this;
    /** Mobile: `5XXXXXXXX`, `05XXXXXXXX`, `9665XXXXXXXX`, `+9665XXXXXXXX` or `009665XXXXXXXX`; digits only. */
    mobileNumber(options?: MobileNumberOptions, message?: Msg): this;
    mobileNumber(message?: Msg): this;
    /** Strong password (default: 8–64 chars, upper, lower, number, special, no spaces). Reports the first unmet rule. */
    password(options?: PasswordOptions, message?: Msg): this;
    password(message?: Msg): this;
    /** Length between `min` and `max` (one error message). */
    minMax(min: number, max: number, message?: Msg): this;
    noEmojis(message?: Msg): this;
    /** Letters (EN/AR), digits and spaces only. `{ allow: "-'" }` adds characters. */
    noSpecialChar(options?: CharacterRuleOptions, message?: Msg): this;
    noSpecialChar(message?: Msg): this;
    onlyEnglishAlphabetic(options?: CharacterRuleOptions, message?: Msg): this;
    onlyEnglishAlphabetic(message?: Msg): this;
    onlyArabicAlphabetic(options?: CharacterRuleOptions, message?: Msg): this;
    onlyArabicAlphabetic(message?: Msg): this;
    onlyENAndARAlphabetic(options?: CharacterRuleOptions, message?: Msg): this;
    onlyENAndARAlphabetic(message?: Msg): this;
    /** Digits only (Arabic-Indic digits accepted). */
    onlyNumbers(message?: Msg): this;
    /** At least `minWords` names (default 2), Arabic/English letters, `-` and `'`. */
    fullName(minWords?: number, message?: Msg): this;
    /** Saudi national ID (1…) / Iqama (2…) with check digit. */
    saudiNationalId(type?: SaudiIdType, message?: Msg): this;
    saudiNationalId(message?: Msg): this;
    /** IBAN with mod-97 check; `iban('SA')` also requires the country. */
    iban(country?: string, message?: Msg): this;
    /** Equal to a sibling field, e.g. `confirmPassword: Yup.string().sameAs('password')`. */
    sameAs(field: string, message?: Msg): this;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface NumberSchema<TType, TContext, TDefault, TFlags> {
    /** Between `min` and `max` inclusive (one error message). */
    minMax(min: number, max: number, message?: Msg): this;
    /** At most `max` decimal places (default 2) — amounts. */
    maxDecimals(max?: number, message?: Msg): this;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ArraySchema<TIn, TContext, TDefault, TFlags> {
    /** Between `min` and `max` items (one error message). */
    minMax(min: number, max: number, message?: Msg): this;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface DateSchema<TType, TContext, TDefault, TFlags> {
    /** At least `years` old on today's date. */
    minAge(years: number, message?: Msg): this;
    notFuture(message?: Msg): this;
    /** Today or later. */
    notPast(message?: Msg): this;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface MixedSchema<TType, TContext, TDefault, TFlags> {
    /** `{ from, to }` (DateRangePicker): optional required sides and from ≤ to. */
    dateRange(requireFrom?: boolean, requireTo?: boolean, messages?: DateRangeMessages): this;
    /** `{ country, number }` (PhoneInput / PhoneWithCountryInput) with the country's number length. */
    phone(message?: Msg): this;
  }
}
