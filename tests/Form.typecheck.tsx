/* Compile-time checks for <Form> (run by `npm run typecheck`). Mirrors the filter example. */
import React from 'react';
import * as Yup from 'yup';
import { Form, addBunyanYupMethods, registerFormFieldType, type DateRange } from '../src';

addBunyanYupMethods(Yup);

declare module '../src' {
  interface FormFieldTypes {
    IbanInput: { country?: 'SA' | 'AE' };
  }
}
registerFormFieldType('IbanInput', ({ field, value }) => <>{`${field.country ?? 'SA'}${String(value ?? '')}`}</>);

const savedFilterData = { transactionInOrOut: '0', transactionDate: {} as DateRange, iban: '' };
const isRajhi = Math.random() > 0.5;
const applyFilter = (values: typeof savedFilterData) => values;

export const filterForm = (
  <Form
    formProps={{ enableReinitialize: true }}
    onSubmit={values => applyFilter(values)}
    validationSchema={Yup.object().shape({ transactionDate: Yup.mixed().dateRange(true, true) })}
    initialValues={{ ...savedFilterData }}
    fields={[
      isRajhi && {
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
      { type: 'IbanInput', name: 'iban', country: 'SA', label: 'IBAN' },
    ]}
  />
);

export const errors = (
  <Form
    initialValues={{ email: '' }}
    onSubmit={() => undefined}
    fields={[
      // @ts-expect-error unknown field type
      { type: 'Gauge', name: 'email' },
      // @ts-expect-error props are checked per type
      { type: 'DateRangePicker', name: 'email', maximumDate: 'tomorrow' },
      // @ts-expect-error name must exist in initialValues (or be a dotted path)
      { type: 'Input', name: 'phone' },
    ]}
  />
);

/* Every field type from the other project's list compiles. */
export const allTypes = (
  <Form
    initialValues={{
      name: '', city: '', amount: null as number | null, password: '', phone: { country: 'SA', number: '' },
      transfer: { amount: null as number | null, currency: 'SAR' }, birth: undefined as Date | undefined, period: {} as DateRange,
      docs: [], notes: '', alerts: true, terms: false, plan: 'a', tags: [] as string[], card: 'blue',
      beneficiaries: [{ iban: '' }], level: 3, color: '#2563EB', box: 'x', products: [] as string[], code: '', sendAmount: null as number | null,
    }}
    onSubmit={() => undefined}
    fields={[
      <></>,
      { type: 'TextInput', name: 'name', label: 'Name' },
      { type: 'Picker', name: 'city', options: [{ label: 'Riyadh', value: 'riyadh' }] },
      { type: 'AmountInput', name: 'amount', currency: 'SAR' },
      { type: 'PasswordInput', name: 'password' },
      { type: 'PhoneWithCountryInput', name: 'phone' },
      { type: 'AmountWithCurrencyInput', name: 'transfer', currencies: ['SAR', 'USD'] },
      { type: 'DatePicker', name: 'birth' },
      { type: 'DateRangePicker', name: 'period' },
      { type: 'FileInput', name: 'docs', multiple: true, maxSize: 5_000_000 },
      { type: 'TextArea', name: 'notes' },
      { type: 'Toggle', name: 'alerts', label: 'Alerts' },
      { type: 'Checkbox', name: 'terms', label: 'Terms' },
      { type: 'RadioGroup', name: 'plan', options: [{ label: 'A', value: 'a' }] },
      { type: 'ChipsGroup', name: 'tags', multiple: true, data: [{ text: 'x', value: 'x' }] },
      { type: 'RadioImageGroup', name: 'card', options: [{ value: 'blue', title: 'Blue', image: { uri: 'x' } }] },
      { type: 'RepeatedControls', name: 'beneficiaries', max: 3, newItem: { iban: '' }, fields: [{ type: 'Input', name: 'iban', label: 'IBAN' }] },
      { type: 'Progress', value: values => (values.name ? 0.5 : 0) },
      { type: 'Slider', name: 'level', min: 1, max: 5 },
      { type: 'ActionText', text: 'Forgot?', actionText: 'Reset', onPress: form => form.resetForm() },
      { type: 'SwatchGroup', name: 'color', options: ['#2563EB', '#16A34A'] },
      { type: 'BoxGroup', name: 'box', options: [{ value: 'x', title: 'X', icon: 'user' }] },
      { type: 'AmountField', name: 'sendAmount', currency: 'SAR', quickAmounts: [100, 500] },
      { type: 'CheckboxGroup', name: 'products', options: [{ label: 'Card', value: 'card' }] },
      { type: 'OTP', name: 'code', length: 6, submitOnComplete: true },
    ]}
  />
);
