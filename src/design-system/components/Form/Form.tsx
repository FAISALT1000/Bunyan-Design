import React, { createContext, memo, useContext, useMemo } from 'react';
import { Formik, getIn, useFormikContext, type FormikProps, type FormikValues } from 'formik';
import { View } from '../RNTheme';
import { useTheme } from '../../hooks';
import { isTextValue, useText, type TextValue } from '../../i18n';
import { useResponsive } from '../../responsive';
import type { Theme } from '../../themes/types';
import { logicalRow } from '../../utilities/styles';
import { Button } from '../Button';
import { Card } from '../Card';
import { IconButton } from '../IconButton';
import { FormField } from '../FormField';
import type { ListSpacing } from '../List';
import { Text } from '../Text';
import { controlProps, registerFormFieldType, resolveFieldType } from './fieldTypes';
import type { FormButtonConfig, FormFieldComponent, FormFieldConfig, FormFieldEntry, FormProps } from './Form.types';

const resolveSpacing = (theme: Theme, value: ListSpacing | undefined, fallback: number) =>
  value === undefined ? fallback : typeof value === 'number' ? value : theme.spacing[value];

/** First message inside a (possibly nested) Formik error: a string or a `{ localeKey, params }` object. */
const firstError = (error: unknown): TextValue | undefined => {
  if (!error) return undefined;
  if (typeof error === 'string') return error;
  if (isTextValue(error)) return error;
  if (Array.isArray(error)) return error.map(firstError).find(Boolean);
  if (typeof error === 'object') return Object.values(error as Record<string, unknown>).map(firstError).find(Boolean);
  return undefined;
};

interface FormSettings {
  fieldTypes: FormProps<FormikValues>['fieldTypes'];
  showOptional: boolean;
  optionalLabel: string;
}

const FormSettingsContext = createContext<FormSettings>({ fieldTypes: undefined, showOptional: false, optionalLabel: 'Optional' });

const joinName = (prefix: string | undefined, name: string | undefined) =>
  prefix ? (name ? `${prefix}.${name}` : prefix) : name;

/** Renders one config entry with its registered control, wired to Formik. */
const FormFieldItem = memo(function FormFieldItem({ field, prefix }: { field: FormFieldConfig<FormikValues>; prefix?: string | undefined }) {
  const form = useFormikContext<FormikValues>();
  const { fieldTypes, showOptional, optionalLabel } = useContext(FormSettingsContext);
  const t = useText();
  const registration = resolveFieldType(field.type, fieldTypes);
  const name = joinName(prefix, field.name);
  // Inside RepeatedControls, conditions see the values of their own item.
  const scopeValues = prefix ? (getIn(form.values, prefix) as FormikValues | undefined) ?? {} : form.values;

  if (field.visibleWhen && !field.visibleWhen(scopeValues)) return null;

  if (!registration) {
    return <Text tone="error">{`Unknown field type "${field.type}" for "${name ?? ''}". Register it with registerFormFieldType().`}</Text>;
  }

  const touched = name ? Boolean(getIn(form.touched, name)) || form.submitCount > 0 : false;
  const rawError = name ? firstError(getIn(form.errors, name)) : undefined;
  // Error strings may be locale keys; untranslated keys fall back to the text itself.
  const error = touched && rawError
    ? t(typeof rawError === 'string' ? { localeKey: rawError, fallback: rawError } : rawError)
    : undefined;
  const disabled = Boolean(field.disabled) || form.isSubmitting;
  const Control = registration.component;

  const control = (
    <Control
      field={field}
      name={name ?? ''}
      value={name ? getIn(form.values, name) : undefined}
      setValue={value => {
        if (!name) return;
        void form.setFieldValue(name, value);
        field.onValueChange?.(value, form);
      }}
      setTouched={() => {
        if (name) void form.setFieldTouched(name, true);
      }}
      error={error}
      invalid={Boolean(error)}
      disabled={disabled}
      t={t}
      form={form}
    />
  );

  if (registration.wrap === false) return control;

  const label = t(field.label);
  if (!label) {
    return (
      <View style={{ gap: 6 }}>
        {control}
        {error ? <Text accessibilityRole="alert" variant="caption" tone="error">{error}</Text> : null}
      </View>
    );
  }
  const description = t(field.description);
  return (
    <FormField
      label={label}
      required={Boolean(field.required)}
      showOptional={showOptional}
      optionalLabel={optionalLabel}
      {...(description ? { description } : {})}
      {...(error ? { error } : {})}
    >
      {control}
    </FormField>
  );
});

/** Renders a `fields` array: skips falsy entries, renders React elements as they are. */
function FormEntries({ entries, prefix }: { entries: readonly FormFieldEntry<any>[]; prefix?: string }) {
  return (
    <>
      {entries.map((entry, index) => {
        if (!entry) return null;
        if (React.isValidElement(entry)) return <React.Fragment key={`node-${index}`}>{entry}</React.Fragment>;
        const field = entry as FormFieldConfig<FormikValues>;
        return <FormFieldItem key={`${field.type}:${field.name ?? index}`} field={field} {...(prefix ? { prefix } : {})} />;
      })}
    </>
  );
}

/** `RepeatedControls`: a card per array item with its own sub-fields, plus add / remove. */
const RepeatedControlsField: FormFieldComponent<FormFieldConfig<FormikValues, 'RepeatedControls'>> = ({ field, name, value, form, disabled, t }) => {
  const { theme, direction } = useTheme();
  const items = Array.isArray(value) ? (value as unknown[]) : [];
  const { fields, itemLabel, addText = 'Add', removeText = 'Remove', min = 0, max = Infinity, newItem = {} } = controlProps(field);
  const labelOf = (index: number) => t(typeof itemLabel === 'function' ? itemLabel(index) : itemLabel) ?? `#${index + 1}`;
  return (
    <View style={{ gap: theme.spacing.md }}>
      {items.map((_, index) => (
        <Card key={index} variant="outlined" padding="medium">
          <View style={{ gap: theme.spacing.md }}>
            <View style={[logicalRow(direction), { alignItems: 'center', justifyContent: 'space-between' }]}>
              <Text weight="semibold">{labelOf(index)}</Text>
              {items.length > min ? (
                <IconButton
                  icon="trash"
                  size="small"
                  tone="error"
                  disabled={disabled}
                  accessibilityLabel={`${t(removeText) ?? 'Remove'} ${labelOf(index)}`}
                  onPress={() => void form.setFieldValue(name, items.filter((__, i) => i !== index))}
                />
              ) : null}
            </View>
            <FormEntries entries={fields} prefix={`${name}.${index}`} />
          </View>
        </Card>
      ))}
      {items.length < max ? (
        <Button
          variant="outline"
          leadingIcon="plus"
          disabled={disabled}
          onPress={() => void form.setFieldValue(name, [...items, typeof newItem === 'function' ? newItem() : { ...newItem }])}
        >
          {t(addText) ?? 'Add'}
        </Button>
      ) : null}
    </View>
  );
};
registerFormFieldType('RepeatedControls', RepeatedControlsField);

function FormButtons<Values extends FormikValues>({
  form,
  submitButton,
  resetButton,
  initialValues,
}: {
  form: FormikProps<Values>;
  submitButton: FormButtonConfig | false;
  resetButton: FormButtonConfig | false;
  initialValues: Values;
}) {
  const { theme, direction } = useTheme();
  const t = useText();
  if (!submitButton && !resetButton) return null;
  const { text: submitText = 'Submit', ...submitProps } = submitButton || {};
  const { text: resetText = 'Reset', ...resetProps } = resetButton || {};
  return (
    <View style={[logicalRow(direction), { gap: theme.spacing.md, flexWrap: 'wrap' }]}>
      {resetButton ? (
        <View style={{ flex: 1 }}>
          <Button variant="outline" fullWidth {...resetProps} disabled={form.isSubmitting || Boolean(resetProps.disabled)} onPress={() => form.resetForm({ values: initialValues })}>
            {t(resetText)}
          </Button>
        </View>
      ) : null}
      {submitButton ? (
        <View style={{ flex: 1 }}>
          <Button fullWidth {...submitProps} loading={form.isSubmitting || Boolean(submitProps.loading)} onPress={() => form.handleSubmit()}>
            {t(submitText)}
          </Button>
        </View>
      ) : null}
    </View>
  );
}

function FormInner<Values extends FormikValues>({
  initialValues,
  onSubmit,
  validationSchema,
  fields,
  formProps,
  submitButton = {},
  resetButton = false,
  spacing: spacingProp,
  showOptional = false,
  optionalLabel = 'Optional',
  fieldTypes,
  children,
  renderFooter,
  style,
  testID,
}: FormProps<Values>) {
  const { theme } = useTheme();
  const t = useText();
  const r = useResponsive();
  const gap = resolveSpacing(theme, r.resolve(spacingProp), theme.spacing.lg);
  const settings = useMemo<FormSettings>(
    () => ({ fieldTypes, showOptional, optionalLabel: t(optionalLabel) ?? 'Optional' }),
    [fieldTypes, optionalLabel, showOptional, t],
  );

  return (
    <Formik<Values>
      {...formProps}
      initialValues={initialValues}
      onSubmit={(values, helpers) => onSubmit(values, helpers) as void | Promise<unknown>}
      {...(validationSchema ? { validationSchema } : {})}
    >
      {form => (
        <FormSettingsContext.Provider value={settings}>
        <View testID={testID} style={[{ gap }, style]}>
          <FormEntries entries={fields} />
          {typeof children === 'function' ? children(form) : children}
          {renderFooter ? renderFooter(form) : (
            <FormButtons form={form} submitButton={submitButton} resetButton={resetButton} initialValues={initialValues} />
          )}
        </View>
        </FormSettingsContext.Provider>
      )}
    </Formik>
  );
}

/**
 * Declarative form: describe fields as data, Formik handles state and Yup validates.
 *
 * ```tsx
 * <Form
 *   formProps={{ enableReinitialize: true }}
 *   initialValues={{ direction: '0', transactionDate: {} }}
 *   validationSchema={Yup.object({ transactionDate: Yup.mixed().dateRange(true, true) })}
 *   onSubmit={applyFilter}
 *   submitButton={{ text: { localeKey: 'common.apply' } }}
 *   fields={[
 *     isRajhi && { type: 'ChipsGroup', name: 'direction', data: [...] },
 *     { type: 'DateRangePicker', name: 'transactionDate', fromLabel: { localeKey: 'common.from' }, maximumDate: new Date(), showHijriToggle: true },
 *   ]}
 * />
 * ```
 */
export const Form = FormInner as <Values extends FormikValues>(props: FormProps<Values>) => React.ReactElement;
