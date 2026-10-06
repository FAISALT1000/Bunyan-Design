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

Any text prop accepts a plain string **or** `{ localeKey, params?, fallback? }`. Give Bunyan your translate function once:

```tsx
import i18n from './i18n';

<ThemeProvider locale={i18n.language} translate={i18n.t}>…</ThemeProvider>
```

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
| `Input` · `PasswordInput` · `SearchInput` · `TextArea` | `string` | All Input/TextArea props (`keyboardType`, `maxLength`, `leadingIcon`…); `placeholder` may be a `TextValue` |
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

## Yup comes from Bunyan

Bunyan ships Yup as a dependency and re-exports it with its helpers already registered:

```ts
import { Yup } from '@bunyan/design-system';

const schema = Yup.object({
  email: Yup.string().email('errors.email').required('errors.required'),
  transactionDate: Yup.mixed().dateRange(true, true),   // Bunyan helper
});
type FilterValues = Yup.InferType<typeof schema>;
```

- It is the complete Yup API (`Yup.object`, `Yup.string`, `Yup.InferType`, `Yup.ValidationError`…), types included.
- Apps should **not** install or import `yup` directly. Replace `import * as Yup from 'yup'` with `import { Yup } from '@bunyan/design-system'` and remove `yup` from the app's `package.json`, so the whole app uses one copy with the same helpers.
- Prefer not to extend Yup? `dateRangeSchema(requireFrom, requireTo, messages)` returns the same rule as a schema.
- `addBunyanYupMethods(otherYup)` is only for an app that must keep its own separate `yup` copy.

## Standalone pieces

`ChipsGroup`, `RadioGroup` and `DateRangePicker` are normal components too, usable without `<Form>`. `validateDateRange(value, requireFrom, requireTo, messages)` validates a range without Yup.
