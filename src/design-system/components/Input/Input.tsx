import React, { forwardRef, memo } from 'react';
import type {
  BaseInputHandle,
  BaseInputProps,
} from '../../base/Input';
import type { TranslationOptions } from '../../localization';
import { warnDeprecated } from '../../utilities/deprecations';
import { InputField } from '../InputField';

/**
 * @deprecated Use `InputField`. Scheduled for removal in 1.0.0.
 */
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

/**
 * @deprecated Use `InputField`. Scheduled for removal in 1.0.0.
 */
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
    value = '',
    onChangeText = () => undefined,
    editable = true,
    leftIcon,
    accessibilityLabel,
    accessibilityHint,
    accessibilityLabelledBy,
    accessibilityRole,
    testID,
    autoCapitalize,
    autoComplete,
    autoCorrect,
    autoFocus,
    inputMode,
    keyboardType,
    maxLength,
    multiline,
    numberOfLines,
    onBlur,
    onFocus,
    onPressIn,
    onSubmitEditing,
    returnKeyType,
    secureTextEntry,
    submitBehavior,
    textContentType,
  },
  ref,
) {
  warnDeprecated(
    'Input is deprecated. Use <InputField type="text" ... />. It will be removed in 1.0.0.',
  );
  const resolvedLabel = label
    ?? accessibilityLabel
    ?? placeholder
    ?? 'Input';

  return (
    <InputField
      ref={ref}
      type="text"
      label={resolvedLabel}
      {...(labelLocalize ? { labelLocalize } : {})}
      {...(labelTranslationOptions ? { labelTranslationOptions } : {})}
      value={String(value)}
      onChangeText={onChangeText}
      {...(placeholder !== undefined ? { placeholder } : {})}
      {...(placeholderLocalize ? { placeholderLocalize } : {})}
      {...(placeholderTranslationOptions
        ? { placeholderTranslationOptions }
        : {})}
      {...(helperText ? { helperText } : {})}
      {...(errorText ? { errorText } : {})}
      {...(successText ? { successText } : {})}
      state={status}
      disabled={!editable}
      {...(leftIcon ? { leftIcon } : {})}
      {...(accessibilityLabel ? { accessibilityLabel } : {})}
      {...(accessibilityHint ? { accessibilityHint } : {})}
      {...(accessibilityLabelledBy ? { accessibilityLabelledBy } : {})}
      {...(accessibilityRole ? { accessibilityRole } : {})}
      {...(testID ? { testID } : {})}
      {...(autoCapitalize ? { autoCapitalize } : {})}
      {...(autoComplete ? { autoComplete } : {})}
      {...(autoCorrect !== undefined ? { autoCorrect } : {})}
      {...(autoFocus !== undefined ? { autoFocus } : {})}
      {...(inputMode ? { inputMode } : {})}
      {...(keyboardType ? { keyboardType } : {})}
      {...(maxLength !== undefined ? { maxLength } : {})}
      numberOfLines={multiline ? numberOfLines ?? 3 : numberOfLines ?? 1}
      {...(onBlur ? { onBlur } : {})}
      {...(onFocus ? { onFocus } : {})}
      {...(onPressIn ? { onPressIn } : {})}
      {...(onSubmitEditing ? { onSubmitEditing } : {})}
      {...(returnKeyType ? { returnKeyType } : {})}
      {...(secureTextEntry !== undefined ? { secureTextEntry } : {})}
      {...(submitBehavior ? { submitBehavior } : {})}
      {...(textContentType ? { textContentType } : {})}
    />
  );
}));
