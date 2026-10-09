# Forms

`<Form>` builds a whole form from a `fields` array. [Formik](https://formik.org) keeps the state, [Yup](https://github.com/jquense/yup) validates, and every field is a Bunyan control with label, description, error, theme, RTL and accessibility handled for you.

```bash
npm i formik   # Yup ships inside Bunyan — don't install it separately
```

## Quick start

```tsx
import { Form, Yup } from '@bunyan/design-system'; // Yup comes from Bunyan, dateRange() included

<Form
  formProps={{ enableReinitialize: true }}
  onSubmit={values => applyFilter(values)}
  validationSchema={Yup.object().shape({
    transactionDate: Yup.mixed().dateRange(true, true),
  })}
  initialValues={{ ...savedFilterData }}
  submitButton={{ text: { localeKey: 'common.apply' } }}
  resetButton={{ text: { localeKey: 'common.reset' } }}
  fields={[
    beneficiaryType === BeneficiaryType.rajhi && {
      type: 'ChipsGroup',
      name: 'transactionInOrOut',
      data: [
        { text: { localeKey: 'AccountDetailsSearch.transactionAll' }, value: '0' },
        { text: { localeKey: 'AccountDetailsSearch.transactionIn' }, value: '1', leftIcon: 'arrow-down-left' },
        { text: { localeKey: 'AccountDetailsSearch.transactionOut' }, value: '2', leftIcon: 'arrow-up-right' },
      ],
    },
    {
      type: 'DateRangePicker',
      name: 'transactionDate',
      fromLabel: { localeKey: 'common.from' },
      toLabel: { localeKey: 'common.to' },
      maximumDate: new Date(),
      showHijriToggle: true,
    },
  ]}
/>
```

Differences from the other project: icons are Bunyan icon names (`leftIcon: 'arrow-down-left'`) instead of `{ source: Icons... }`.

## Translations

Any text prop accepts a plain string **or** `{ localeKey, params?, fallback? }`. Keys are looked up in the translations of `DesignSystemLocalizationProvider` (i18n-js, see [LOCALIZATION.md](./LOCALIZATION.md)); params use i18n-js interpolation (`'Between %{min} and %{max}'`):

```tsx
<ThemeProvider>
  <DesignSystemLocalizationProvider locale="ar" translations={{ en, ar }}>…</DesignSystemLocalizationProvider>
</ThemeProvider>
```

Outside the provider, or for a missing key, the `fallback` (else the key) is shown.

Error messages are translated too, so Yup messages can be keys: `Yup.string().required('errors.required')`. A missing key falls back to the text itself, so plain messages keep working. In your own components use `const t = useText(); t({ localeKey: 'common.save' })`.

## `<Form>` props

| Prop | Description |
| --- | --- |
| `initialValues` | Initial values. Their keys type-check every field `name`. |
| `onSubmit(values, helpers)` | Runs when valid. While the promise is pending the submit button shows `loading` and fields are disabled. |
| `validationSchema` | Yup schema (anything Formik accepts). |
| `fields` | Field configs (below). Falsy entries are skipped → `condition && { … }`. |
| `formProps` | Extra Formik config: `enableReinitialize`, `validateOnMount`, `validateOnChange`, `innerRef`… |
| `submitButton` | Button props + `text` (default `'Submit'`), or `false` to hide. |
| `resetButton` | Button props + `text` (default `'Reset'`); resets to `initialValues`. Hidden by default. |
| `spacing` | Gap between fields: points, token (`'lg'` default) or per breakpoint. |
| `showOptional` | Show “(Optional)” after labels of non-required fields. Default `false`. |
| `fieldTypes` | Extra field types for this form only. |
| `children` | Node or `(form) => node`, rendered between fields and buttons. |
| `renderFooter(form)` | Replace the buttons row. |

## Field config

Every field: `{ type, name, label?, description?, required?, disabled?, visibleWhen?, onValueChange?, testID? }` plus the props of its control.

- `required` only adds `*` to the label — validation rules live in `validationSchema`.
- `visibleWhen: values => values.kind === 'company'` shows a field depending on other values.
- `onValueChange: (value, form) => form.setFieldValue('city', undefined)` reacts to a change.
- Errors appear after the field is touched or after the first submit.

| `type` | Value | Control props (besides the common ones) |
| --- | --- | --- |
| `InputField` (recommended) | `string` | Floating-label `InputField`: `inputType` (`text`·`email`·`password`·`phone`·`number`·`decimal`·`url`), `helperText`, `leftIcon`, `rightIcon`, `variant`, `maxLength`…; shows its own label and error |
| `Input` · `PasswordInput` · `SearchInput` · `TextArea` | `string` | All Input/TextArea props (`keyboardType`, `maxLength`, `leftIcon`…); `placeholder` may be a `TextValue`. `Input`/`PasswordInput`/`SearchInput` are deprecated in favour of `InputField` |
| `Select` | `string` | `options: { label: TextValue, value, description?, disabled? }[]`, `searchable`, `placeholder`, `title`, `size` |
| `DatePicker` | `Date` | `minimumDate`, `maximumDate`, `locale`, `formatOptions`, `placeholder`, `clearable` |
| `DateRangePicker` | `{ from?: Date, to?: Date }` | `fromLabel`, `toLabel`, `minimumDate`, `maximumDate`, `showHijriToggle`, `layout`, `locale` |
| `Checkbox` | `boolean` | `indeterminate` (label is the checkbox text) |
| `Switch` | `boolean` | (label is the switch text) |
| `RadioGroup` | `string \| number` | `options: { label: TextValue, value, description? }[]`, `layout: 'column' \| 'row'` |
| `ChipsGroup` | `string \| number` or array with `multiple` | `data: { text: TextValue, value, leftIcon?, disabled? }[]`, `multiple`, `max`, `scrollable` |
| `TextInput` · `Picker` · `Toggle` | as `Input` · `Select` · `Switch` | Aliases with the names used in other projects |
| `AmountInput` | `number \| null` | `currency`, `decimals`, `allowNegative`, `groupSeparator` — groups thousands while typing, accepts Arabic-Indic digits |
| `AmountWithCurrencyInput` | `{ amount: number \| null, currency }` | `currencies: (string \| { code, label?, decimals? })[]` — currency picker inside the field |
| `PhoneWithCountryInput` (alias `PhoneInput`) | `{ country: 'SA', number: '512345678' }` | `countries`, `defaultCountry`, `showFlag` — searchable country codes; `toE164()` / `isValidPhone()` helpers |
| `FileInput` | `PickedFile[]` | `pickFile` (or `setDefaultFilePicker` once), `multiple`, `maxFiles`, `maxSize`, `onReject`, `title`, `hint` |
| `AmountField` | `number \| null` | Large centred amount: `currency`, `hint`, `quickAmounts`, `useNumPad`, `decimals` |
| `OTP` | digits `string` | `length`, `secure`, `useNumPad`, `submitOnComplete` |
| `Slider` | `number` | `min`, `max`, `step`, `formatValue`, `showLimits` |
| `CheckboxGroup` | array | `options`, `selectAllLabel`, `max`, `layout` |
| `RadioImageGroup` | `string \| number` | `options: { value, title, description?, image }[]`, `columns`, `imageAspectRatio` |
| `BoxGroup` | value, or array with `multiple` | `options: { value, title, description?, icon? }[]`, `columns`, `multiple`, `max` |
| `SwatchGroup` | colour `string` | `options: (string \| { color, value?, label? })[]`, `size` |
| `RepeatedControls` | array of objects | `fields` (names relative to one item), `itemLabel`, `addText`, `removeText`, `min`, `max`, `newItem` |
| `Progress` *(display)* | — | `value: number \| (values) => number`, `total`, `tone`, `showValue`; `name` optional |
| `ActionText` *(display)* | — | `text`, `actionText`, `onPress(form)`; `name` optional |
| any React element | — | Rendered as-is between fields (headings, notes, dividers) |

### Repeated controls

```tsx
{
  type: 'RepeatedControls',
  name: 'beneficiaries',
  itemLabel: index => ({ localeKey: 'beneficiary.title', params: { n: index + 1 } }),
  addText: { localeKey: 'beneficiary.add' },
  min: 1, max: 5,
  newItem: { name: '', iban: '' },
  fields: [
    { type: 'TextInput', name: 'name', label: { localeKey: 'beneficiary.name' } },
    { type: 'TextInput', name: 'iban', label: 'IBAN', textDirection: 'ltr' },
  ],
}
```

Validation: `beneficiaries: Yup.array().of(Yup.object({ iban: Yup.string().required() })).min(1)`. Inside an item, `visibleWhen` receives that item's values.

## Your own field types

Register once, typed everywhere:

```tsx
// fields/IbanInput.tsx
import { Input, registerFormFieldType } from '@bunyan/design-system';

declare module '@bunyan/design-system' {
  interface FormFieldTypes {
    IbanInput: { country?: 'SA' | 'AE' };
  }
}

registerFormFieldType('IbanInput', ({ field, value, setValue, setTouched, invalid, disabled, t }) => (
  <Input
    value={String(value ?? '')}
    onChangeText={text => setValue(text.toUpperCase().replace(/\s/g, ''))}
    onBlur={setTouched}
    editable={!disabled}
    status={invalid ? 'error' : 'default'}
    accessibilityLabel={t(field.label)}
    placeholder={`${field.country ?? 'SA'}00 0000 0000 0000 0000 0000`}
  />
));

// anywhere
fields={[{ type: 'IbanInput', name: 'iban', label: { localeKey: 'transfer.iban' }, country: 'SA' }]}
```

The component receives `{ field, name, value, setValue, setTouched, error, invalid, disabled, t, form }`. Pass `{ wrap: false }` as the third argument when the control renders its own label (like Checkbox). `registerFormFieldType` can also replace a built-in type. For a one-off type use the `fieldTypes` prop of a single form.

## Yup comes from Bunyan — with ready-made rules

Bunyan ships Yup and extends it. Import it from the design system (never from `'yup'`) and every schema has these extra methods:

```ts
import { Yup } from '@bunyan/design-system';

const schema = Yup.object({
  name: Yup.string().required().onlyENAndARAlphabetic().minMax(2, 50),
  mobile: Yup.string().required().mobileNumber(),
  email: Yup.string().required().email('gmail'),
  password: Yup.string().required().password(),
  confirm: Yup.string().required().sameAs('password'),
  nationalId: Yup.string().saudiNationalId(),
  transactionDate: Yup.mixed().dateRange(true, true),
});
type Values = Yup.InferType<typeof schema>;
```

All rules pass on empty values, so combine them with `.required()` when the field is mandatory. Every method takes an optional last `message` (text or `{ localeKey }`).

| Method | Checks |
| --- | --- |
| `string().mobileNumber(options?)` | Digits only: `5XXXXXXXX` (9), `05XXXXXXXX` (10), or with country code `9665XXXXXXXX`, `+9665XXXXXXXX` (13 chars), `009665XXXXXXXX`. Arabic-Indic digits accepted. Options: `countryCode` (default `'966'`), `startsWith` (`'5'`), `nationalLength` (9). |
| `string().email(domain?)` | Yup's email check, plus an optional domain: `email('gmail')` → must end in `@gmail.com`; `email('outlook.com')`, `email('@company.sa')`, `email(['company.sa', 'company.com'])`. A sentence or locale key is still treated as the message: `email('errors.email')`. |
| `string().password(options?)` | Default: 8–64 characters, upper + lower case, number, special character, no spaces, English characters only. Options: `min`, `max`, `uppercase`, `lowercase`, `number`, `special`, `noSpaces`, `noSequence` (1234/abcd), `noRepeat` (aaaa), `englishOnly`. Shows one message: the first rule not met yet. |
| `string().minMax(min, max)` | Length between min and max with one message (also `number().minMax` for values and `array().minMax` for item count). |
| `string().noEmojis()` | No emoji (faces, symbols, flags, hearts…). |
| `string().noSpecialChar(options?)` | Only English/Arabic letters, digits and spaces. `{ allow: "-'." }` adds characters, `{ allowSpaces: false }`. |
| `string().onlyEnglishAlphabetic(options?)` | A–Z / a–z (and spaces). `{ allowDigits: true }`, `{ allowSpaces: false }`, `{ allow }`. |
| `string().onlyArabicAlphabetic(options?)` | Arabic letters incl. harakat (and spaces). Same options. |
| `string().onlyENAndARAlphabetic(options?)` | Arabic or English letters (and spaces). Same options. |
| `string().onlyNumbers()` | Digits only (Arabic-Indic accepted). |
| `string().fullName(minWords = 2)` | At least N names, Arabic/English letters, `-` and `'`. |
| `string().saudiNationalId(type?)` | 10 digits, starts with 1 (citizen) or 2 (Iqama), check digit verified. `type`: `'citizen'`, `'resident'`, `'any'`. |
| `string().iban(country?)` | IBAN with mod-97 check and country length; `iban('SA')` requires a Saudi IBAN. |
| `string().sameAs(field)` | Equals a sibling field (confirm password / email). |
| `number().maxDecimals(n = 2)` | At most n decimal places (amounts). |
| `date().minAge(years)` · `date().notFuture()` · `date().notPast()` | Birth dates and schedule dates. |
| `mixed().dateRange(requireFrom?, requireTo?)` | `DateRangePicker` value `{ from, to }`: required sides and from ≤ to. |
| `mixed().phone()` | `PhoneWithCountryInput` value `{ country, number }` with the country's number length. |

### Messages

Defaults are English. Replace any of them once for the whole app — plain text, or locale keys that are translated with the rule's params (`min`, `max`, `domain`, `years`…):

```ts
import { setValidationMessages } from '@bunyan/design-system';

setValidationMessages({
  mobileNumber: { localeKey: 'errors.mobileNumber' },
  minMax: { localeKey: 'errors.length' },            // 'Between %{min} and %{max} characters'
  emailDomain: { localeKey: 'errors.emailDomain' },  // 'Use a %{domain} address'
  passwordUppercase: { localeKey: 'errors.password.uppercase' },
});
```

The full list of keys is `defaultValidationMessages`.

### Without Yup

The same rules are plain functions for handlers, Formik `validate` or servers: `isMobileNumber`, `toNationalMobile`, `isEmail`, `passwordIssues`, `passwordStrength` (0–4 for a meter), `hasEmoji`, `hasNoSpecialChar`, `isOnlyEnglishAlphabetic`, `isOnlyArabicAlphabetic`, `isOnlyENAndARAlphabetic`, `isOnlyNumbers`, `isSaudiNationalId`, `isIban`, `ageOn`, `validateDateRange`.

## Standalone pieces

`ChipsGroup`, `RadioGroup` and `DateRangePicker` are normal components too, usable without `<Form>`.
