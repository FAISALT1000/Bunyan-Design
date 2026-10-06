import type React from 'react';
import type { FormikConfig, FormikHelpers, FormikProps, FormikValues } from 'formik';
import type { StyleProp, ViewStyle } from '../RNTheme';
import type { TextValue, TranslateFn } from '../../i18n';
import type { Responsive } from '../../responsive/createResponsive';
import type { ThemeBreakpoint } from '../../themes/types';
import type { ButtonProps } from '../Button';
import type { ChipsGroupItem, ChipValue } from '../ChipsGroup';
import type { DatePickerProps } from '../DatePicker';
import type { DateRangePickerProps } from '../DateRangePicker';
import type { InputProps } from '../Input';
import type { StandardInputFieldProps } from '../InputField';
import type { ListSpacing } from '../List';
import type { PasswordInputProps } from '../PasswordInput';
import type { RadioGroupOption } from '../RadioGroup';
import type { SearchInputProps } from '../SearchInput';
import type { SelectOption, SelectProps } from '../Select';
import type { TextAreaProps } from '../TextArea';
import type { ActionTextProps } from '../ActionText';
import type { AmountFieldProps } from '../AmountField';
import type { AmountInputProps } from '../AmountInput';
import type { AmountWithCurrencyInputProps } from '../AmountWithCurrencyInput';
import type { CheckboxGroupProps } from '../CheckboxGroup';
import type { FileInputProps } from '../FileInput';
import type { OptionTile, OptionValue } from '../OptionTiles';
import type { OTPInputProps } from '../OTPInput';
import type { PhoneInputProps } from '../PhoneInput';
import type { ProgressBarProps } from '../ProgressBar';
import type { RadioImageGroupProps } from '../RadioImageGroup';
import type { SliderProps } from '../Slider';
import type { SwatchGroupProps } from '../SwatchGroup';

/** Props the Form controls for you (value, change, blur, error state). */
type Controlled = 'value' | 'defaultValue' | 'onChangeText' | 'onBlur' | 'editable' | 'status' | 'placeholder' | 'accessibilityLabel';

type Translated<T, K extends keyof T> = Omit<T, K> & { [P in K]?: TextValue };

/**
 * Field-specific props per `type`. Augment it to add your own field types:
 *
 * ```ts
 * declare module '@bunyan/design-system' {
 *   interface FormFieldTypes {
 *     IbanInput: { country?: 'SA' | 'AE' };
 *   }
 * }
 * registerFormFieldType('IbanInput', IbanField);
 * ```
 */
export interface FormFieldTypes {
  /** Floating-label `InputField` (recommended). Shows its own label and error, so it is not wrapped in `FormField`. */
  InputField: Omit<
    StandardInputFieldProps,
    'type' | 'label' | 'value' | 'onChangeText' | 'onBlur' | 'errorText' | 'state' | 'disabled' | 'required' | 'placeholder' | 'helperText'
  > & {
    /** `InputField` type. Default `'text'`. */
    inputType?: StandardInputFieldProps['type'] | 'password';
    placeholder?: TextValue;
    helperText?: TextValue;
  };
  Input: Omit<InputProps, Controlled> & { placeholder?: TextValue };
  PasswordInput: Omit<PasswordInputProps, Controlled> & { placeholder?: TextValue };
  SearchInput: Omit<SearchInputProps, Controlled | 'onClear'> & { placeholder?: TextValue };
  TextArea: Omit<TextAreaProps, Controlled> & { placeholder?: TextValue };
  Select: Omit<SelectProps, 'value' | 'onValueChange' | 'status' | 'disabled' | 'options' | 'placeholder' | 'title' | 'searchPlaceholder' | 'emptyMessage' | 'accessibilityLabel'> & {
    options: readonly (Omit<SelectOption, 'label' | 'description'> & { label: TextValue; description?: TextValue })[];
    placeholder?: TextValue;
    title?: TextValue;
    searchPlaceholder?: TextValue;
    emptyMessage?: TextValue;
  };
  DatePicker: Translated<Omit<DatePickerProps, 'value' | 'onChange' | 'status' | 'disabled' | 'accessibilityLabel'>, 'placeholder' | 'title' | 'clearLabel' | 'confirmLabel'>;
  DateRangePicker: Omit<DateRangePickerProps, 'value' | 'onChange' | 'status' | 'disabled'>;
  Checkbox: { indeterminate?: boolean };
  Switch: Record<never, never>;
  RadioGroup: { options: readonly RadioGroupOption<string | number>[]; layout?: 'column' | 'row' };
  ChipsGroup: {
    data: readonly ChipsGroupItem<ChipValue>[];
    /** Value becomes an array. */
    multiple?: boolean;
    max?: number;
    scrollable?: boolean;
  };

  // ── Names used by other projects (aliases) ────────────────────────────────
  /** Alias of `Input`. */
  TextInput: FormFieldTypes['Input'];
  /** Alias of `Select`. */
  Picker: FormFieldTypes['Select'];
  /** Alias of `Switch`. */
  Toggle: FormFieldTypes['Switch'];

  // ── Specialised inputs ────────────────────────────────────────────────────
  /** Value: `number | null`. */
  AmountInput: Omit<AmountInputProps, Controlled | 'onChangeValue'> & { placeholder?: TextValue };
  /** Value: `{ amount: number | null, currency: string }`. */
  AmountWithCurrencyInput: Omit<AmountWithCurrencyInputProps, Controlled | 'onChange'> & { placeholder?: TextValue };
  /** Value: `{ country: 'SA', number: '512345678' }`. */
  PhoneWithCountryInput: Omit<PhoneInputProps, Controlled | 'onChange'> & { placeholder?: TextValue };
  /** Alias of `PhoneWithCountryInput`. */
  PhoneInput: FormFieldTypes['PhoneWithCountryInput'];
  /** Value: `PickedFile[]`. */
  FileInput: Omit<FileInputProps, 'value' | 'onChange' | 'disabled' | 'status' | 'accessibilityLabel'>;
  /** Large centred amount (transfer screens). Value: `number | null`. */
  AmountField: Omit<AmountFieldProps, 'value' | 'onChangeValue' | 'errorText' | 'status' | 'disabled' | 'label'>;
  /** One-time code. Value: digits string. */
  OTP: Omit<OTPInputProps, 'value' | 'onChange' | 'error' | 'errorText' | 'disabled' | 'onComplete'> & {
    /** Submit the form when all digits are entered. */
    submitOnComplete?: boolean;
  };
  /** Value: number. */
  Slider: Omit<SliderProps, 'value' | 'onChange' | 'disabled' | 'label'>;

  // ── Choice groups ────────────────────────────────────────────────────────
  /** Value: array of option values. */
  CheckboxGroup: Omit<CheckboxGroupProps<string | number>, 'value' | 'onChange' | 'disabled' | 'error' | 'accessibilityLabel'>;
  /** Picture cards, single choice. */
  RadioImageGroup: Omit<RadioImageGroupProps<OptionValue>, 'value' | 'onChange' | 'disabled' | 'accessibilityLabel'>;
  /** Icon boxes, single (or multiple → array) choice. */
  BoxGroup: {
    options: readonly OptionTile<OptionValue>[];
    columns?: RadioImageGroupProps['columns'];
    multiple?: boolean;
    max?: number;
  };
  /** Colour swatches. Value: colour string. */
  SwatchGroup: Omit<SwatchGroupProps, 'value' | 'onChange' | 'disabled' | 'accessibilityLabel'>;

  // ── Structure & display (no own value) ───────────────────────────────────
  /**
   * A list of sub-forms (beneficiaries, items…). Value: array of objects.
   * Sub-field names are relative to one item: `{ type: 'Input', name: 'iban' }`.
   */
  RepeatedControls: {
    fields: readonly FormFieldEntry<any>[];
    /** Card title per item, e.g. `index => ({ localeKey: 'beneficiary.n', params: { n: index + 1 } })`. */
    itemLabel?: TextValue | ((index: number) => TextValue);
    addText?: TextValue;
    removeText?: TextValue;
    min?: number;
    max?: number;
    /** Values of a new item. */
    newItem?: Record<string, unknown> | (() => Record<string, unknown>);
  };
  /** Display-only progress. `value` can be computed from the form values; `name` is optional. */
  Progress: Omit<ProgressBarProps, 'value' | 'label'> & { value?: number | ((values: any) => number) };
  /** Display-only sentence with an inline action; `name` is optional. */
  ActionText: Omit<ActionTextProps, 'onPress' | 'disabled'> & { onPress: (form: FormikProps<any>) => void };
}

/** Field types that show something but do not hold a value (`name` optional). */
export type FormDisplayFieldType = 'Progress' | 'ActionText';

export type FormFieldType = keyof FormFieldTypes;

/** Top-level field name or a dotted path (`'address.city'`). */
export type FormFieldName<Values> = Extract<keyof Values, string> | `${string}.${string}`;

export interface FormFieldBase<Values = FormikValues> {
  name: FormFieldName<Values>;
  label?: TextValue;
  description?: TextValue;
  /** Shows `*` after the label. Validation itself comes from `validationSchema`. */
  required?: boolean;
  disabled?: boolean;
  /** Render the field only when this returns true (based on current form values). */
  visibleWhen?: (values: Values) => boolean;
  /** Runs after the value changes, e.g. to reset a dependent field. */
  onValueChange?: (value: unknown, form: FormikProps<Values>) => void;
  testID?: string;
}

/** One entry of `fields`: `{ type, name, ...props for that type }`. */
export type FormFieldConfig<Values = FormikValues, K extends FormFieldType = FormFieldType> = K extends FormFieldType
  ? { type: K } & (K extends FormDisplayFieldType
      ? Omit<FormFieldBase<Values>, 'name'> & { name?: FormFieldName<Values> }
      : FormFieldBase<Values>) & FormFieldTypes[K]
  : never;

/**
 * One entry of `fields`. Falsy entries are skipped (`condition && { … }`), and
 * React elements are rendered as they are (headings, notes, dividers…).
 */
export type FormFieldEntry<Values> = FormFieldConfig<Values> | React.ReactElement | false | null | undefined | 0 | '';

export interface FormFieldControlProps<C = FormFieldConfig> {
  /** The field config from `fields`. */
  field: C;
  name: string;
  value: unknown;
  setValue: (value: unknown) => void;
  /** Mark as touched (call on blur / after a selection). */
  setTouched: () => void;
  /** Translated error message, shown when the field was touched or the form submitted. */
  error?: string | undefined;
  invalid: boolean;
  disabled: boolean;
  /** Resolves `TextValue`s with the app translate function. */
  t: (value: TextValue | null | undefined) => string | undefined;
  form: FormikProps<FormikValues>;
}

export type FormFieldComponent<C = FormFieldConfig> = React.ComponentType<FormFieldControlProps<C>>;

export interface FormFieldRegistration<C = FormFieldConfig> {
  component: FormFieldComponent<C>;
  /**
   * Wrap in FormField (label, description, error). Default `true`.
   * Set `false` for controls that render their own label (Checkbox, Switch).
   */
  wrap?: boolean;
}

export type FormButtonConfig = Omit<ButtonProps, 'children' | 'onPress' | 'title'> & { text?: TextValue };

export interface FormProps<Values extends FormikValues> {
  initialValues: Values;
  onSubmit: (values: Values, helpers: FormikHelpers<Values>) => unknown;
  /** Yup schema (or any schema Formik accepts). */
  validationSchema?: FormikConfig<Values>['validationSchema'];
  /** Field list. Falsy entries are skipped. */
  fields: readonly FormFieldEntry<Values>[];
  /** Extra Formik config, e.g. `{ enableReinitialize: true, validateOnMount: true, innerRef }`. */
  formProps?: Omit<FormikConfig<Values>, 'initialValues' | 'onSubmit' | 'validationSchema' | 'children' | 'component' | 'render'>;
  /** Submit button config, or `false` to hide it (e.g. when submitting from a header button). Default text `'Submit'`. */
  submitButton?: FormButtonConfig | false;
  /** Optional reset button (`text` default `'Reset'`). Resets to `initialValues`. */
  resetButton?: FormButtonConfig | false;
  /** Gap between fields: points, a spacing token or per breakpoint. Default `'lg'`. */
  spacing?: Responsive<ThemeBreakpoint, ListSpacing>;
  /** Show `(Optional)` next to labels of fields that are not `required`. Default `false`. */
  showOptional?: boolean;
  /** Text of the optional marker. Default `'Optional'`. */
  optionalLabel?: TextValue;
  /** Extra field types for this form only (merged over the global registry). */
  fieldTypes?: Record<string, FormFieldComponent<any> | FormFieldRegistration<any>>;
  /** Content between the fields and the buttons. */
  children?: React.ReactNode | ((form: FormikProps<Values>) => React.ReactNode);
  /** Replace the default buttons row. */
  renderFooter?: (form: FormikProps<Values>) => React.ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export type { TranslateFn };
