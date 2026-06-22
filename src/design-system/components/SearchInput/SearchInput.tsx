import React, { forwardRef, memo } from 'react';
import type { BaseInputHandle } from '../../base/Input';
import { IconButton } from '../IconButton';
import { Input, type InputProps } from '../Input';

export interface SearchInputProps extends Omit<InputProps, 'leftIcon' | 'trailing'> {
  clearLabel?: string;
  onClear?: () => void;
}

export const SearchInput = memo(forwardRef<BaseInputHandle, SearchInputProps>(function SearchInput(
  { value, clearLabel = 'Clear search', onClear, returnKeyType = 'search', ...props },
  ref,
) {
  return (
    <Input
      ref={ref}
      value={value}
      leftIcon="search"
      returnKeyType={returnKeyType}
      {...props}
      trailing={value ? (
        <IconButton icon="close" size="small" accessibilityLabel={clearLabel} onPress={onClear} />
      ) : null}
    />
  );
}));
