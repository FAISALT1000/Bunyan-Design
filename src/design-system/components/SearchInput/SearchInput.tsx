import React, { forwardRef, memo } from 'react';
import type { BaseInputHandle } from '../../base/Input';
import { warnDeprecated } from '../../utilities/deprecations';
import {
  InputField,
  type SearchInputFieldProps,
} from '../InputField';

/**
 * @deprecated Use `InputField` with `type="search"`.
 */
export type SearchInputProps = Omit<
  SearchInputFieldProps,
  'type' | 'label' | 'value' | 'onChangeText'
> & {
  label?: string;
  value?: string;
  onChangeText?: (value: string) => void;
  clearLabel?: string;
  onClear?: () => void;
};

/**
 * @deprecated Use `InputField` with `type="search"`.
 */
export const SearchInput = memo(forwardRef<
  BaseInputHandle,
  SearchInputProps
>(function SearchInput(
  {
    label,
    value = '',
    onChangeText = () => undefined,
    accessibilityLabel,
    placeholder,
    clearLabel,
    onClear,
    ...props
  },
  ref,
) {
  warnDeprecated(
    'SearchInput is deprecated. Use <InputField type="search" ... />. It will be removed in 1.0.0.',
  );
  return (
    <InputField
      ref={ref}
      type="search"
      label={label ?? accessibilityLabel ?? placeholder ?? 'Search'}
      value={value}
      onChangeText={nextValue => {
        onChangeText(nextValue);
        if (!nextValue) onClear?.();
      }}
      {...(accessibilityLabel ? { accessibilityLabel } : {})}
      {...(placeholder ? { placeholder } : {})}
      {...(clearLabel ? { clearAccessibilityLabel: clearLabel } : {})}
      {...props}
    />
  );
}));
