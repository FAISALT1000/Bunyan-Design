import React, { forwardRef, memo, useState } from 'react';
import type { TextInputRef } from '../RNTheme';
import { IconButton } from '../IconButton';
import { Input, type InputProps } from '../Input';

export type PasswordInputProps = Omit<InputProps, 'secureTextEntry' | 'trailing'> & {
  showPasswordLabel?: string;
  hidePasswordLabel?: string;
};

export const PasswordInput = memo(forwardRef<TextInputRef, PasswordInputProps>(function PasswordInput(
  { showPasswordLabel = 'Show password', hidePasswordLabel = 'Hide password', editable = true, ...props },
  ref,
) {
  const [visible, setVisible] = useState(false);
  return (
    <Input
      ref={ref}
      autoCapitalize="none"
      autoCorrect={false}
      autoComplete="password"
      textContentType="password"
      editable={editable}
      {...props}
      secureTextEntry={!visible}
      trailing={(
        <IconButton
          icon={visible ? 'eye-off' : 'eye'}
          size="small"
          disabled={!editable}
          accessibilityLabel={visible ? hidePasswordLabel : showPasswordLabel}
          onPress={() => setVisible(current => !current)}
        />
      )}
    />
  );
}));
