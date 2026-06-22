import React, { forwardRef, memo } from 'react';
import {
  BaseInput,
  type BaseInputHandle,
  type BaseInputProps,
} from '../../base/Input';
import { Stack } from '../../base/Stack';
import {
  resolveLocalizedText,
  type TranslationOptions,
  useOptionalLocalization,
} from '../../localization';
import { Text } from '../Text';

export interface InputProps extends BaseInputProps {
  label?: string;
  labelLocalize?: string;
  labelTranslationOptions?: TranslationOptions;
  placeholderLocalize?: string;
  placeholderTranslationOptions?: TranslationOptions;
  helperText?: string;
  errorText?: string;
  successText?: string;
}

export const Input = memo(forwardRef<BaseInputHandle, InputProps>(function Input(
  {
    label,
    labelLocalize,
    labelTranslationOptions,
    placeholder,
    placeholderLocalize,
    placeholderTranslationOptions,
    helperText,
    errorText,
    successText,
    status = errorText ? 'error' : successText ? 'success' : 'default',
    accessibilityLabel,
    ...props
  },
  ref,
) {
  const localization = useOptionalLocalization();
  const supportingText = errorText ?? successText ?? helperText;
  const resolvedLabel = labelLocalize
    ? resolveLocalizedText({
        localize: labelLocalize,
        ...(label !== undefined ? { value: label } : {}),
        ...(labelTranslationOptions
          ? { translationOptions: labelTranslationOptions }
          : {}),
        ...(localization ? { localization } : {}),
      })
    : label;
  const resolvedPlaceholder = placeholderLocalize
    ? resolveLocalizedText({
        localize: placeholderLocalize,
        ...(placeholder !== undefined ? { value: placeholder } : {}),
        ...(placeholderTranslationOptions
          ? { translationOptions: placeholderTranslationOptions }
          : {}),
        ...(localization ? { localization } : {}),
      })
    : placeholder;

  return (
    <Stack gap="xs">
      {label || labelLocalize ? (
        <Text
          {...(labelLocalize ? { localize: labelLocalize } : {})}
          {...(label !== undefined ? { value: label } : {})}
          {...(labelTranslationOptions
            ? { translationOptions: labelTranslationOptions }
            : {})}
          variant="labelMedium"
          weight="semibold"
        />
      ) : null}
      <BaseInput
        ref={ref}
        status={status}
        accessibilityLabel={
          accessibilityLabel
          ?? (resolvedLabel !== undefined ? String(resolvedLabel) : undefined)
        }
        placeholder={
          resolvedPlaceholder !== undefined
            ? String(resolvedPlaceholder)
            : undefined
        }
        {...props}
      />
      {supportingText ? (
        <Text
          value={supportingText}
          variant="caption"
          tone={errorText ? 'error' : successText ? 'success' : 'secondary'}
          accessibilityRole={errorText ? 'alert' : undefined}
        />
      ) : null}
    </Stack>
  );
}));
