import React, { forwardRef, memo } from 'react';
import type { TextInput } from 'react-native';
import { IconButton } from '../IconButton';
import { Input, type InputProps } from '../Input';

export interface SearchInputProps extends Omit<InputProps, 'leadingIcon' | 'trailing'> {
  clearLabel?: string;
  onClear?: () => void;
}

export const SearchInput = memo(forwardRef<TextInput, SearchInputProps>(function SearchInput(
  { value, clearLabel = 'Clear search', onClear, returnKeyType = 'search', ...props },
  ref,
) {
  return (
    <Input
      ref={ref}
      value={value}
      leadingIcon="search"
      returnKeyType={returnKeyType}
      {...props}
      trailing={value ? (
        <IconButton icon="close" size="small" accessibilityLabel={clearLabel} onPress={onClear} />
      ) : null}
    />
  );
}));
