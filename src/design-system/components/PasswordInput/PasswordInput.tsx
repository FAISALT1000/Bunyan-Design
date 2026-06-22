import React, { forwardRef, memo, useState } from 'react';
import type { BaseInputHandle } from '../../base/Input';
import { IconButton } from '../IconButton';
import { Input, type InputProps } from '../Input';

export type PasswordInputProps = Omit<InputProps, 'secureTextEntry' | 'trailing'> & {
  showPasswordLabel?: string;
  hidePasswordLabel?: string;
};

export const PasswordInput = memo(forwardRef<BaseInputHandle, PasswordInputProps>(function PasswordInput(
  { showPasswordLabel = 'Show password', hidePasswordLabel = 'Hide password', ...props },
  ref,
) {
  const [visible, setVisible] = useState(false);
  return (
    <Input
      ref={ref}
      autoCapitalize="none"
      autoCorrect={false}
      textContentType="password"
      secureTextEntry={!visible}
      {...props}
      trailing={(
        <IconButton
          icon={visible ? 'eye-off' : 'eye'}
          size="small"
          accessibilityLabel={visible ? hidePasswordLabel : showPasswordLabel}
          onPress={() => setVisible(current => !current)}
        />
      )}
    />
  );
}));
