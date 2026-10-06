import React, { memo, useId } from 'react';
import { Inline } from '../../base/Inline';
import { Stack } from '../../base/Stack';
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
  testID?: string;
}

export const FormField = memo(function FormField({
  label,
  children,
  description,
  error,
  success,
  required = false,
  optionalLabel = 'Optional',
  testID,
}: FormFieldProps) {
  const id = useId();
  const renderProps: FormFieldRenderProps = {
    inputId: `${id}-input`,
    labelId: `${id}-label`,
    ...(description ? { descriptionId: `${id}-description` } : {}),
    ...(error ? { errorId: `${id}-error` } : {}),
  };

  return (
    <Stack gap="sm" testID={testID}>
      <Inline gap="xs" alignItems="baseline">
        <Text
          value={`${label}${required ? ' *' : ''}`}
          nativeID={renderProps.labelId}
          variant="labelMedium"
          weight="semibold"
        />
        {!required ? (
          <Text value={`(${optionalLabel})`} variant="caption" tone="tertiary" />
        ) : null}
      </Inline>
      {description ? (
        <Text
          value={description}
          nativeID={renderProps.descriptionId}
          variant="caption"
          tone="secondary"
        />
      ) : null}
      {typeof children === 'function' ? children(renderProps) : children}
      {error ? (
        <Text
          value={error}
          nativeID={renderProps.errorId}
          accessibilityRole="alert"
          accessibilityLiveRegion="assertive"
          variant="caption"
          tone="error"
        />
      ) : success ? (
        <Text
          value={success}
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
          variant="caption"
          tone="success"
        />
      ) : null}
    </Stack>
  );
});
