import React from 'react';
import type { FormikValues } from 'formik';
import { View } from '../RNTheme';
import { Checkbox } from '../Checkbox';
import { ChipsGroup, type ChipValue } from '../ChipsGroup';
import { DatePicker } from '../DatePicker';
import { DateRangePicker, type DateRange } from '../DateRangePicker';
import { Input } from '../Input';
import { InputField } from '../InputField';
import { PasswordInput } from '../PasswordInput';
import { RadioGroup } from '../RadioGroup';
import { SearchInput } from '../SearchInput';
import { Select } from '../Select';
import { Switch } from '../Switch';
import { Text } from '../Text';
import { TextArea } from '../TextArea';
import { ActionText } from '../ActionText';
import { AmountField } from '../AmountField';
import { AmountInput } from '../AmountInput';
import { AmountWithCurrencyInput, type AmountWithCurrency } from '../AmountWithCurrencyInput';
import { BoxGroup } from '../BoxGroup';
import { CheckboxGroup } from '../CheckboxGroup';
import { FileInput, type PickedFile } from '../FileInput';
import type { OptionValue } from '../OptionTiles';
import { OTPInput } from '../OTPInput';
import { PhoneInput, type PhoneValue } from '../PhoneInput';
import { ProgressBar } from '../ProgressBar';
import { RadioImageGroup } from '../RadioImageGroup';
import { Slider } from '../Slider';
import { SwatchGroup } from '../SwatchGroup';
import type {
  FormFieldBase,
  FormFieldComponent,
  FormFieldConfig,
  FormFieldRegistration,
  FormFieldControlProps,
  FormFieldType,
  FormFieldTypes,
} from './Form.types';

const BASE_KEYS = ['type', 'name', 'label', 'description', 'required', 'disabled', 'visibleWhen', 'onValueChange', 'testID'] as const;

/** Optional translated prop: `{}` when empty so `exactOptionalPropertyTypes` stays happy. */
const opt = (key: string, text: string | undefined) => (text ? { [key]: text } : {});

/** Field config without the Form-level keys — i.e. the props meant for the control itself. */
export function controlProps<C extends object>(field: C): Omit<C, keyof FormFieldBase | 'type'> {
  const rest = { ...field } as Record<string, unknown>;
  for (const key of BASE_KEYS) delete rest[key];
  return rest as Omit<C, keyof FormFieldBase | 'type'>;
}

type Props<K extends FormFieldType> = FormFieldControlProps<FormFieldConfig<FormikValues, K>>;

const asString = (value: unknown) => (value === null || value === undefined ? '' : String(value));
const testIdOf = (field: { testID?: string | undefined }) => (field.testID ? { testID: field.testID } : {});

function textControl<K extends 'Input' | 'PasswordInput' | 'SearchInput' | 'TextArea'>(
  Control: React.ComponentType<any>,
): FormFieldComponent<FormFieldConfig<FormikValues, K>> {
  return function TextControl({ field, value, setValue, setTouched, invalid, disabled, t }: Props<K>) {
    const { placeholder, ...rest } = controlProps(field) as { placeholder?: Parameters<typeof t>[0] } & Record<string, unknown>;
    const placeholderText = t(placeholder);
    return (
      <Control
        {...rest}
        {...testIdOf(field)}
        value={asString(value)}
        onChangeText={(text: string) => setValue(text)}
        onBlur={setTouched}
        editable={!disabled}
        status={invalid ? 'error' : 'default'}
        accessibilityLabel={t(field.label) ?? field.name}
        {...(placeholderText ? { placeholder: placeholderText } : {})}
      />
    );
  };
}

const InputFieldControl: FormFieldComponent<FormFieldConfig<FormikValues, 'InputField'>> = ({ field, value, setValue, setTouched, error, disabled, t }) => {
  const { inputType = 'text', placeholder, helperText, ...rest } = controlProps(field);
  const common = {
    ...rest,
    ...testIdOf(field),
    label: t(field.label) ?? field.name ?? '',
    value: asString(value),
    onChangeText: (text: string) => setValue(text),
    onBlur: setTouched,
    disabled,
    required: Boolean(field.required),
    ...opt('placeholder', t(placeholder)),
    ...opt('helperText', t(helperText)),
    ...opt('errorText', error),
  };
  return inputType === 'password' ? <InputField {...common} type="password" /> : <InputField {...common} type={inputType} />;
};

const SelectField: FormFieldComponent<FormFieldConfig<FormikValues, 'Select'>> = ({ field, value, setValue, setTouched, invalid, disabled, t }) => {
  const { options, placeholder, title, searchPlaceholder, emptyMessage, ...rest } = controlProps(field);
  const optional = (key: string, text: string | undefined) => (text ? { [key]: text } : {});
  return (
    <Select
      {...rest}
      {...testIdOf(field)}
      options={options.map(option => ({
        value: option.value,
        label: t(option.label) ?? String(option.value),
        ...(option.description ? { description: t(option.description) ?? '' } : {}),
        ...(option.disabled !== undefined ? { disabled: option.disabled } : {}),
      }))}
      {...(value !== undefined && value !== null ? { value: String(value) } : {})}
      onValueChange={next => {
        setValue(next);
        setTouched();
      }}
      status={invalid ? 'error' : 'default'}
      disabled={disabled}
      accessibilityLabel={t(field.label) ?? field.name}
      {...optional('placeholder', t(placeholder))}
      {...optional('title', t(title) ?? t(field.label))}
      {...optional('searchPlaceholder', t(searchPlaceholder))}
      {...optional('emptyMessage', t(emptyMessage))}
    />
  );
};

const DatePickerField: FormFieldComponent<FormFieldConfig<FormikValues, 'DatePicker'>> = ({ field, value, setValue, setTouched, invalid, disabled, t }) => {
  const { placeholder, title, clearLabel, confirmLabel, ...rest } = controlProps(field);
  const optional = (key: string, text: string | undefined) => (text ? { [key]: text } : {});
  return (
    <DatePicker
      {...rest}
      {...testIdOf(field)}
      {...(value instanceof Date ? { value } : {})}
      onChange={date => {
        setValue(date);
        setTouched();
      }}
      status={invalid ? 'error' : 'default'}
      disabled={disabled}
      accessibilityLabel={t(field.label) ?? field.name}
      {...optional('placeholder', t(placeholder))}
      {...optional('title', t(title) ?? t(field.label))}
      {...optional('clearLabel', t(clearLabel))}
      {...optional('confirmLabel', t(confirmLabel))}
    />
  );
};

const DateRangePickerField: FormFieldComponent<FormFieldConfig<FormikValues, 'DateRangePicker'>> = ({ field, value, setValue, setTouched, invalid, disabled }) => (
  <DateRangePicker
    {...controlProps(field)}
    {...testIdOf(field)}
    value={(value as DateRange | null | undefined) ?? null}
    onChange={range => {
      setValue(range);
      setTouched();
    }}
    status={invalid ? 'error' : 'default'}
    disabled={disabled}
  />
);

const InlineError = ({ error }: { error?: string | undefined }) =>
  error ? <Text accessibilityRole="alert" variant="caption" tone="error" value={error} /> : null;

const CheckboxField: FormFieldComponent<FormFieldConfig<FormikValues, 'Checkbox'>> = ({ field, value, setValue, setTouched, error, invalid, disabled, t }) => {
  const description = t(field.description);
  return (
    <View style={{ gap: 4 }} {...testIdOf(field)}>
      <Checkbox
        checked={Boolean(value)}
        onChange={checked => {
          setValue(checked);
          setTouched();
        }}
        label={`${t(field.label) ?? field.name}${field.required ? ' *' : ''}`}
        disabled={disabled}
        error={invalid}
        {...(field.indeterminate !== undefined ? { indeterminate: field.indeterminate } : {})}
        {...(description ? { description } : {})}
      />
      <InlineError error={error} />
    </View>
  );
};

const SwitchField: FormFieldComponent<FormFieldConfig<FormikValues, 'Switch'>> = ({ field, value, setValue, setTouched, error, disabled, t }) => {
  const description = t(field.description);
  return (
    <View style={{ gap: 4 }} {...testIdOf(field)}>
      <Switch
        value={Boolean(value)}
        onValueChange={next => {
          setValue(next);
          setTouched();
        }}
        label={t(field.label) ?? field.name}
        disabled={disabled}
        {...(description ? { description } : {})}
      />
      <InlineError error={error} />
    </View>
  );
};

const RadioGroupField: FormFieldComponent<FormFieldConfig<FormikValues, 'RadioGroup'>> = ({ field, value, setValue, setTouched, disabled, t }) => (
  <RadioGroup
    {...controlProps(field)}
    {...testIdOf(field)}
    value={(value as string | number | null | undefined) ?? null}
    onChange={next => {
      setValue(next);
      setTouched();
    }}
    disabled={disabled}
    accessibilityLabel={t(field.label) ?? field.name}
  />
);

const ChipsGroupField: FormFieldComponent<FormFieldConfig<FormikValues, 'ChipsGroup'>> = ({ field, value, setValue, setTouched, disabled, t }) => {
  const { data, multiple, max, scrollable } = controlProps(field);
  const common = {
    data,
    disabled,
    accessibilityLabel: t(field.label) ?? field.name,
    ...(scrollable !== undefined ? { scrollable } : {}),
    ...testIdOf(field),
  };
  return multiple ? (
    <ChipsGroup
      {...common}
      multiple
      value={Array.isArray(value) ? (value as ChipValue[]) : []}
      onChange={next => {
        setValue(next);
        setTouched();
      }}
      {...(max !== undefined ? { max } : {})}
    />
  ) : (
    <ChipsGroup
      {...common}
      value={(value as ChipValue | null | undefined) ?? null}
      onChange={next => {
        setValue(next);
        setTouched();
      }}
    />
  );
};


const AmountInputField: FormFieldComponent<FormFieldConfig<FormikValues, 'AmountInput'>> = ({ field, value, setValue, setTouched, invalid, disabled, t }) => {
  const { placeholder, ...rest } = controlProps(field);
  return (
    <AmountInput
      {...rest}
      {...testIdOf(field)}
      value={typeof value === 'number' ? value : null}
      onChangeValue={setValue}
      onBlur={setTouched}
      editable={!disabled}
      status={invalid ? 'error' : 'default'}
      accessibilityLabel={t(field.label) ?? field.name}
      {...opt('placeholder', t(placeholder))}
    />
  );
};

const AmountWithCurrencyField: FormFieldComponent<FormFieldConfig<FormikValues, 'AmountWithCurrencyInput'>> = ({ field, value, setValue, setTouched, invalid, disabled, t }) => {
  const { placeholder, ...rest } = controlProps(field);
  return (
    <AmountWithCurrencyInput
      {...rest}
      {...testIdOf(field)}
      value={(value as AmountWithCurrency | null | undefined) ?? null}
      onChange={setValue}
      onBlur={setTouched}
      editable={!disabled}
      status={invalid ? 'error' : 'default'}
      accessibilityLabel={t(field.label) ?? field.name}
      {...opt('placeholder', t(placeholder))}
    />
  );
};

const PhoneField: FormFieldComponent<FormFieldConfig<FormikValues, 'PhoneWithCountryInput'>> = ({ field, value, setValue, setTouched, invalid, disabled, t }) => {
  const { placeholder, ...rest } = controlProps(field);
  return (
    <PhoneInput
      {...rest}
      {...testIdOf(field)}
      value={(value as PhoneValue | null | undefined) ?? null}
      onChange={setValue}
      onBlur={setTouched}
      editable={!disabled}
      status={invalid ? 'error' : 'default'}
      accessibilityLabel={t(field.label) ?? field.name}
      {...opt('placeholder', t(placeholder))}
    />
  );
};

const FileInputField: FormFieldComponent<FormFieldConfig<FormikValues, 'FileInput'>> = ({ field, value, setValue, setTouched, invalid, disabled, t }) => (
  <FileInput
    {...controlProps(field)}
    {...testIdOf(field)}
    value={Array.isArray(value) ? (value as PickedFile[]) : []}
    onChange={files => {
      setValue(files);
      setTouched();
    }}
    disabled={disabled}
    status={invalid ? 'error' : 'default'}
    accessibilityLabel={t(field.label) ?? field.name}
  />
);

const AmountFieldField: FormFieldComponent<FormFieldConfig<FormikValues, 'AmountField'>> = ({ field, value, setValue, setTouched, error, disabled, t }) => (
  <AmountField
    {...controlProps(field)}
    {...testIdOf(field)}
    value={typeof value === 'number' ? value : null}
    onChangeValue={next => {
      setValue(next);
      setTouched();
    }}
    disabled={disabled}
    {...opt('label', t(field.label))}
    {...opt('errorText', error)}
  />
);

const OTPField: FormFieldComponent<FormFieldConfig<FormikValues, 'OTP'>> = ({ field, value, setValue, setTouched, error, disabled, form }) => {
  const { submitOnComplete, ...rest } = controlProps(field);
  return (
    <OTPInput
      {...rest}
      {...testIdOf(field)}
      value={asString(value)}
      onChange={setValue}
      onComplete={() => {
        setTouched();
        // Let Formik apply the last digit before submitting.
        if (submitOnComplete) setTimeout(() => void form.submitForm(), 0);
      }}
      disabled={disabled}
      error={Boolean(error)}
    />
  );
};

const SliderField: FormFieldComponent<FormFieldConfig<FormikValues, 'Slider'>> = ({ field, value, setValue, setTouched, disabled }) => (
  <Slider
    {...controlProps(field)}
    {...testIdOf(field)}
    {...(typeof value === 'number' ? { value } : {})}
    onChange={setValue}
    onChangeEnd={setTouched}
    disabled={disabled}
  />
);

const CheckboxGroupField: FormFieldComponent<FormFieldConfig<FormikValues, 'CheckboxGroup'>> = ({ field, value, setValue, setTouched, invalid, disabled, t }) => (
  <CheckboxGroup
    {...controlProps(field)}
    {...testIdOf(field)}
    value={Array.isArray(value) ? (value as (string | number)[]) : []}
    onChange={next => {
      setValue(next);
      setTouched();
    }}
    disabled={disabled}
    error={invalid}
    accessibilityLabel={t(field.label) ?? field.name}
  />
);

const RadioImageGroupField: FormFieldComponent<FormFieldConfig<FormikValues, 'RadioImageGroup'>> = ({ field, value, setValue, setTouched, disabled, t }) => (
  <RadioImageGroup
    {...controlProps(field)}
    {...testIdOf(field)}
    value={(value as OptionValue | null | undefined) ?? null}
    onChange={next => {
      setValue(next);
      setTouched();
    }}
    disabled={disabled}
    accessibilityLabel={t(field.label) ?? field.name}
  />
);

const BoxGroupField: FormFieldComponent<FormFieldConfig<FormikValues, 'BoxGroup'>> = ({ field, value, setValue, setTouched, disabled, t }) => {
  const { options, columns, multiple, max } = controlProps(field);
  const common = {
    options,
    disabled,
    accessibilityLabel: t(field.label) ?? field.name,
    ...(columns !== undefined ? { columns } : {}),
    ...testIdOf(field),
  };
  const change = (next: unknown) => {
    setValue(next);
    setTouched();
  };
  return multiple ? (
    <BoxGroup {...common} multiple value={Array.isArray(value) ? (value as OptionValue[]) : []} onChange={change} {...(max !== undefined ? { max } : {})} />
  ) : (
    <BoxGroup {...common} value={(value as OptionValue | null | undefined) ?? null} onChange={change} />
  );
};

const SwatchGroupField: FormFieldComponent<FormFieldConfig<FormikValues, 'SwatchGroup'>> = ({ field, value, setValue, setTouched, disabled, t }) => (
  <SwatchGroup
    {...controlProps(field)}
    {...testIdOf(field)}
    value={typeof value === 'string' ? value : null}
    onChange={next => {
      setValue(next);
      setTouched();
    }}
    disabled={disabled}
    accessibilityLabel={t(field.label) ?? field.name}
  />
);

const ProgressField: FormFieldComponent<FormFieldConfig<FormikValues, 'Progress'>> = ({ field, value, form, t }) => {
  const { value: configured, ...rest } = controlProps(field);
  const resolved = typeof configured === 'function' ? configured(form.values) : configured ?? (typeof value === 'number' ? value : 0);
  return <ProgressBar {...rest} {...testIdOf(field)} value={resolved} {...opt('label', t(field.label))} />;
};

const ActionTextField: FormFieldComponent<FormFieldConfig<FormikValues, 'ActionText'>> = ({ field, disabled, form }) => {
  const { onPress, ...rest } = controlProps(field);
  return <ActionText {...rest} {...testIdOf(field)} disabled={disabled} onPress={() => onPress(form)} />;
};

const registry = new Map<string, FormFieldRegistration<any>>([
  ['InputField', { component: InputFieldControl, wrap: false }],
  ['Input', { component: textControl<'Input'>(Input) }],
  ['PasswordInput', { component: textControl<'PasswordInput'>(PasswordInput) }],
  ['SearchInput', { component: textControl<'SearchInput'>(SearchInput) }],
  ['TextArea', { component: textControl<'TextArea'>(TextArea) }],
  ['Select', { component: SelectField }],
  ['DatePicker', { component: DatePickerField }],
  ['DateRangePicker', { component: DateRangePickerField }],
  ['Checkbox', { component: CheckboxField, wrap: false }],
  ['Switch', { component: SwitchField, wrap: false }],
  ['RadioGroup', { component: RadioGroupField }],
  ['ChipsGroup', { component: ChipsGroupField }],
  // Aliases (names used by other projects)
  ['TextInput', { component: textControl<'Input'>(Input) }],
  ['Picker', { component: SelectField }],
  ['Toggle', { component: SwitchField, wrap: false }],
  // Specialised inputs
  ['AmountInput', { component: AmountInputField }],
  ['AmountWithCurrencyInput', { component: AmountWithCurrencyField }],
  ['PhoneWithCountryInput', { component: PhoneField }],
  ['PhoneInput', { component: PhoneField }],
  ['FileInput', { component: FileInputField }],
  ['AmountField', { component: AmountFieldField, wrap: false }],
  ['OTP', { component: OTPField }],
  ['Slider', { component: SliderField }],
  // Choice groups
  ['CheckboxGroup', { component: CheckboxGroupField }],
  ['RadioImageGroup', { component: RadioImageGroupField }],
  ['BoxGroup', { component: BoxGroupField }],
  ['SwatchGroup', { component: SwatchGroupField }],
  // Display
  ['Progress', { component: ProgressField, wrap: false }],
  ['ActionText', { component: ActionTextField, wrap: false }],
]);

/**
 * Register (or replace) a field type for every `<Form>` in the app.
 *
 * ```tsx
 * declare module '@bunyan/design-system' {
 *   interface FormFieldTypes { IbanInput: { country?: 'SA' } }
 * }
 *
 * registerFormFieldType('IbanInput', ({ value, setValue, setTouched, invalid, field }) => (
 *   <Input value={String(value ?? '')} onChangeText={setValue} onBlur={setTouched}
 *          status={invalid ? 'error' : 'default'} placeholder="SA00 0000 …" />
 * ));
 * ```
 */
export function registerFormFieldType<K extends FormFieldType>(
  type: K,
  component: FormFieldComponent<FormFieldConfig<FormikValues, K>>,
  options: { wrap?: boolean } = {},
) {
  registry.set(type, { component, ...options });
}

export function resolveFieldType(
  type: string,
  local?: Record<string, FormFieldComponent<any> | FormFieldRegistration<any>>,
): FormFieldRegistration<any> | undefined {
  const entry = local?.[type];
  if (entry) return typeof entry === 'function' ? { component: entry } : entry;
  return registry.get(type);
}

export type { FormFieldTypes };
