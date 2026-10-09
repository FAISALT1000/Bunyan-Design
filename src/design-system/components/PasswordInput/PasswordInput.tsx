import React, { forwardRef, memo } from 'react';
import type { BaseInputHandle } from '../../base/Input';
import { warnDeprecated } from '../../utilities/deprecations';
import {
  InputField,
  type PasswordInputFieldProps,
} from '../InputField';

/**
 * @deprecated Use `InputField` with `type="password"`.
 */
export type PasswordInputProps = Omit<
  PasswordInputFieldProps,
  'type' | 'label' | 'value' | 'onChangeText'
> & {
  label?: string;
  value?: string;
  onChangeText?: (value: string) => void;
  showPasswordLabel?: string;
  hidePasswordLabel?: string;
};

/**
 * @deprecated Use `InputField` with `type="password"`.
 */
export const PasswordInput = memo(forwardRef<
  BaseInputHandle,
  PasswordInputProps
>(function PasswordInput(
  {
    label,
    value = '',
    onChangeText = () => undefined,
    accessibilityLabel,
    placeholder,
    showPasswordLabel: _showPasswordLabel,
    hidePasswordLabel: _hidePasswordLabel,
    ...props
  },
  ref,
) {
  warnDeprecated(
    'PasswordInput is deprecated. Use <InputField type="password" ... />. It will be removed in 1.0.0.',
  );
  return (
    <InputField
      ref={ref}
      type="password"
      label={label ?? accessibilityLabel ?? placeholder ?? 'Password'}
      value={value}
      onChangeText={onChangeText}
      {...(accessibilityLabel ? { accessibilityLabel } : {})}
      {...(placeholder ? { placeholder } : {})}
      {...props}
    />
  );
}));
