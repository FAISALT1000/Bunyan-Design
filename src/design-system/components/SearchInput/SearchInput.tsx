import React, { forwardRef, memo, useImperativeHandle, useRef, useState } from 'react';
import type { TextInputRef } from '../RNTheme';
import { IconButton } from '../IconButton';
import { Input, type InputProps } from '../Input';

export interface SearchInputProps extends Omit<InputProps, 'leadingIcon' | 'trailing'> {
  clearLabel?: string;
  onClear?: () => void;
}

export const SearchInput = memo(forwardRef<TextInputRef, SearchInputProps>(function SearchInput(
  {
    value,
    defaultValue,
    clearLabel = 'Clear search',
    onClear,
    onChangeText,
    returnKeyType = 'search',
    editable = true,
    ...props
  },
  ref,
) {
  const inputRef = useRef<TextInputRef>(null);
  useImperativeHandle(ref, () => inputRef.current as TextInputRef, []);
  // Track uncontrolled text too, so the clear button also works without `value`.
  const [internalValue, setInternalValue] = useState(defaultValue ?? '');
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  const clear = () => {
    if (!isControlled) {
      setInternalValue('');
      inputRef.current?.clear();
    }
    onChangeText?.('');
    onClear?.();
    inputRef.current?.focus();
  };

  return (
    <Input
      ref={inputRef}
      {...(isControlled ? { value } : {})}
      {...(defaultValue !== undefined ? { defaultValue } : {})}
      leadingIcon="search"
      returnKeyType={returnKeyType}
      accessibilityRole="search"
      autoCorrect={false}
      editable={editable}
      onChangeText={text => {
        if (!isControlled) setInternalValue(text);
        onChangeText?.(text);
      }}
      {...props}
      trailing={currentValue && editable ? (
        <IconButton icon="close" size="small" accessibilityLabel={clearLabel} onPress={clear} />
      ) : null}
    />
  );
}));
