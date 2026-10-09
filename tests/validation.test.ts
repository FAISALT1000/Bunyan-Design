import {
  Yup,
  hasEmoji,
  hasNoSpecialChar,
  isEmail,
  isIban,
  isMobileNumber,
  isOnlyArabicAlphabetic,
  isOnlyENAndARAlphabetic,
  isOnlyEnglishAlphabetic,
  isSaudiNationalId,
  passwordIssues,
  passwordStrength,
  setValidationMessages,
  defaultValidationMessages,
  toNationalMobile,
} from '../src';

/** First error message of `schema` for `value`, or `undefined` when valid. */
const errorOf = async (schema: Yup.Schema, value: unknown) => {
  try {
    await schema.validate(value);
    return undefined;
  } catch (error) {
    return (error as Yup.ValidationError).errors[0];
  }
};

afterEach(() => setValidationMessages(defaultValidationMessages));

describe('mobileNumber()', () => {
  const schema = Yup.string().mobileNumber();
  it.each([
    ['512345678', true],        // 9 digits starting with 5
    ['0512345678', true],       // 10 digits starting with 05
    ['+966512345678', true],    // 13 characters with country code
    ['966512345678', true],
    ['00966512345678', true],
    ['٠٥١٢٣٤٥٦٧٨', true],       // Arabic-Indic digits
    ['412345678', false],       // must start with 5
    ['05123456789', false],     // too long
    ['05123 45678', false],     // only numbers
    ['+971512345678', false],   // other country code
    ['05-1234567', false],
  ])('%s → %s', async (value, ok) => {
    expect(isMobileNumber(value)).toBe(ok);
    expect(await errorOf(schema, value)).toBe(ok ? undefined : 'Enter a valid mobile number');
  });

  it('supports another country and passes empty values (use required())', async () => {
    expect(isMobileNumber('+971501234567', { countryCode: '971' })).toBe(true);
    expect(await errorOf(schema, '')).toBeUndefined();
    expect(await errorOf(schema.required('Required'), '')).toBe('Required');
    expect(toNationalMobile('+966512345678')).toBe('512345678');
  });
});

describe('email()', () => {
  it('keeps the normal check and accepts a message as before', async () => {
    expect(await errorOf(Yup.string().email(), 'faisal@bunyan.sa')).toBeUndefined();
    expect(await errorOf(Yup.string().email(), 'faisal@')).toBe('Enter a valid email address');
    expect(await errorOf(Yup.string().email('Bad email'), 'x')).toBe('Bad email');
    expect(await errorOf(Yup.string().email('errors.email'), 'x')).toBe('errors.email');
  });

  it("restricts the domain: email('gmail') → @gmail.com", async () => {
    const schema = Yup.string().email('gmail');
    expect(await errorOf(schema, 'faisal@gmail.com')).toBeUndefined();
    expect(await errorOf(schema, 'faisal@GMAIL.com')).toBeUndefined();
    expect(await errorOf(schema, 'faisal@yahoo.com')).toBe('Use an email address ending in @gmail.com');
    expect(await errorOf(schema, 'faisal@gmail.co')).toBe('Use an email address ending in @gmail.com');
    expect(await errorOf(Yup.string().email(['company.sa', 'company.com']), 'a@company.com')).toBeUndefined();
    expect(await errorOf(Yup.string().email('@company.sa', 'Work email only'), 'a@gmail.com')).toBe('Work email only');
    expect(isEmail('a@outlook.com', 'outlook.com')).toBe(true);
  });
});

describe('password()', () => {
  it('reports the first unmet rule', async () => {
    const schema = Yup.string().password();
    expect(await errorOf(schema, 'Abc!1')).toBe('Use at least 8 characters');
    expect(await errorOf(schema, 'abcdefg!1')).toBe('Add an uppercase letter (A-Z)');
    expect(await errorOf(schema, 'Abcdefgh1')).toBe('Add a special character (e.g. ! @ # $)');
    expect(await errorOf(schema, 'Abcd efg!1')).toBe('Spaces are not allowed');
    expect(await errorOf(schema, 'Str0ng!Pass')).toBeUndefined();
  });

  it('is configurable', async () => {
    expect(await errorOf(Yup.string().password({ min: 6, special: false, uppercase: false }), 'abc123')).toBeUndefined();
    expect(passwordIssues('Abcd1234!', { noSequence: true })).toEqual(['sequence']);
    expect(passwordIssues('Aaaaa1!xyz', { noRepeat: true })).toEqual(['repeat']);
    expect(passwordIssues('Abcdefg1!ب')).toContain('englishOnly');
    expect(passwordStrength('Str0ng!Password')).toBe(4);
    expect(await errorOf(Yup.string().password('Weak password'), 'abc')).toBe('Weak password');
  });
});

describe('minMax()', () => {
  it('works on strings, numbers and arrays with one message', async () => {
    expect(await errorOf(Yup.string().minMax(8, 10), '1234567')).toBe('Must be 8 to 10 characters');
    expect(await errorOf(Yup.string().minMax(8, 10), '12345678901')).toBe('Must be 8 to 10 characters');
    expect(await errorOf(Yup.string().minMax(8, 10), '123456789')).toBeUndefined();
    expect(await errorOf(Yup.number().minMax(100, 500), 50)).toBe('Must be between 100 and 500');
    expect(await errorOf(Yup.array().minMax(1, 2), ['a', 'b', 'c'])).toBe('Select 1 to 2 items');
  });
});

describe('character rules', () => {
  it('noEmojis()', async () => {
    expect(hasEmoji('hello 😀')).toBe(true);
    expect(hasEmoji('🇸🇦')).toBe(true);
    expect(hasEmoji('مرحبا ❤️')).toBe(true);
    expect(hasEmoji('plain text 123')).toBe(false);
    expect(await errorOf(Yup.string().noEmojis(), 'nice 👍')).toBe('Emojis are not allowed');
  });

  it('noSpecialChar()', async () => {
    expect(hasNoSpecialChar('Faisal 123 فيصل')).toBe(true);
    expect(hasNoSpecialChar('faisal@x')).toBe(false);
    expect(hasNoSpecialChar("O'Neil-Smith", { allow: "'-" })).toBe(true);
    expect(await errorOf(Yup.string().noSpecialChar(), 'hi!')).toBe('Special characters are not allowed');
  });

  it('only English / Arabic / both', async () => {
    expect(isOnlyEnglishAlphabetic('Faisal Alhejaili')).toBe(true);
    expect(isOnlyEnglishAlphabetic('Faisal1')).toBe(false);
    expect(isOnlyEnglishAlphabetic('Faisal1', { allowDigits: true })).toBe(true);
    expect(isOnlyArabicAlphabetic('فيصل الحُجيلي')).toBe(true);
    expect(isOnlyArabicAlphabetic('فيصل Faisal')).toBe(false);
    expect(isOnlyENAndARAlphabetic('فيصل Faisal')).toBe(true);
    expect(isOnlyENAndARAlphabetic('فيصل_Faisal')).toBe(false);
    expect(await errorOf(Yup.string().onlyEnglishAlphabetic(), 'فيصل')).toBe('Use English letters only');
    expect(await errorOf(Yup.string().onlyArabicAlphabetic({ allowSpaces: false }), 'فيصل علي')).toBe('Use Arabic letters only');
    expect(await errorOf(Yup.string().onlyENAndARAlphabetic(), 'Faisal فيصل')).toBeUndefined();
    expect(await errorOf(Yup.string().onlyNumbers(), '12a')).toBe('Use numbers only');
  });
});

describe('other rules', () => {
  it('saudiNationalId(), iban(), fullName(), sameAs()', async () => {
    expect(isSaudiNationalId('1000000008')).toBe(true);
    expect(isSaudiNationalId('1000000009')).toBe(false);
    expect(isSaudiNationalId('1000000008', 'resident')).toBe(false);
    expect(await errorOf(Yup.string().saudiNationalId(), '3000000000')).toBe('Enter a valid national ID / Iqama number');

    expect(isIban('SA03 8000 0000 6080 1016 7519')).toBe(true);
    expect(isIban('SA03 8000 0000 6080 1016 7518')).toBe(false);
    expect(await errorOf(Yup.string().iban('SA'), 'GB82WEST12345698765432')).toBe('Enter a valid IBAN');

    expect(await errorOf(Yup.string().fullName(), 'Faisal')).toBe('Enter at least 2 names');
    expect(await errorOf(Yup.string().fullName(3), 'فيصل عبدالله الحجيلي')).toBeUndefined();

    const signup = Yup.object({ password: Yup.string(), confirm: Yup.string().sameAs('password') });
    expect(await errorOf(signup, { password: 'Abc!12345', confirm: 'Abc!1234' })).toBe('Values do not match');
    expect(await errorOf(signup, { password: 'Abc!12345', confirm: 'Abc!12345' })).toBeUndefined();
  });

  it('dates, decimals, phone and date ranges', async () => {
    const eighteenYearsAgo = new Date();
    eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);
    const tomorrow = new Date(Date.now() + 86_400_000);
    expect(await errorOf(Yup.date().minAge(18), eighteenYearsAgo)).toBeUndefined();
    expect(await errorOf(Yup.date().minAge(18), new Date())).toBe('You must be at least 18 years old');
    expect(await errorOf(Yup.date().notFuture(), tomorrow)).toBe('The date cannot be in the future');
    expect(await errorOf(Yup.date().notPast(), new Date(2000, 0, 1))).toBe('The date cannot be in the past');
    expect(await errorOf(Yup.number().maxDecimals(2), 10.123)).toBe('Use at most 2 decimal places');
    expect(await errorOf(Yup.mixed().phone(), { country: 'SA', number: '5123' })).toBe('Enter a valid phone number');
    expect(await errorOf(Yup.mixed().phone(), { country: 'SA', number: '512345678' })).toBeUndefined();
    expect(await errorOf(Yup.mixed().dateRange(true, true), {})).toBe('Select a start date');
  });
});

describe('messages', () => {
  it('can be replaced app-wide, including locale keys with params', async () => {
    setValidationMessages({ minMax: { localeKey: 'errors.length' }, mobileNumber: 'رقم الجوال غير صحيح' });
    expect(await errorOf(Yup.string().mobileNumber(), '123')).toBe('رقم الجوال غير صحيح');
    expect(await errorOf(Yup.string().minMax(2, 4), 'abcdef')).toEqual({ localeKey: 'errors.length', params: { min: 2, max: 4 } });
  });
});

