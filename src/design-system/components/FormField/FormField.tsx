import React, { memo, useId } from 'react';
import { View } from 'react-native';
import { useTheme } from '../../hooks';
import { Text } from '../Text';

export interface FormFieldRenderProps {
  inputId: string;
  labelId: string;
  descriptionId?: string;
  errorId?: string;
}

export interface FormFieldProps {
  label: string;
  children: React.ReactNode | ((props: FormFieldRenderProps) => React.ReactNode);
  description?: string;
  error?: string;
  success?: string;
  required?: boolean;
  optionalLabel?: string;
}

export const FormField = memo(function FormField({
  label,
  children,
  description,
  error,
  success,
  required = false,
  optionalLabel = 'Optional',
}: FormFieldProps) {
  const { theme } = useTheme();
  const id = useId();
  const renderProps: FormFieldRenderProps = {
    inputId: `${id}-input`,
    labelId: `${id}-label`,
    ...(description ? { descriptionId: `${id}-description` } : {}),
    ...(error ? { errorId: `${id}-error` } : {}),
  };

  return (
    <View style={{ gap: theme.spacing.sm }}>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: theme.spacing.xs }}>
        <Text nativeID={renderProps.labelId} variant="label" weight="semibold">
          {label}{required ? ' *' : ''}
        </Text>
        {!required ? <Text variant="caption" tone="tertiary">({optionalLabel})</Text> : null}
      </View>
      {description ? <Text nativeID={renderProps.descriptionId} variant="caption" tone="secondary">{description}</Text> : null}
      {typeof children === 'function' ? children(renderProps) : children}
      {error ? (
        <Text nativeID={renderProps.errorId} accessibilityRole="alert" variant="caption" tone="error">{error}</Text>
      ) : success ? (
        <Text accessibilityRole="alert" variant="caption" tone="success">{success}</Text>
      ) : null}
    </View>
  );
});
