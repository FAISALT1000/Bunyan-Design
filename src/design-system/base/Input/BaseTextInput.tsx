import React, { forwardRef, memo } from 'react';
import {
  TextInput,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
} from 'react-native';
import { useTheme } from '../../hooks';
import { logicalText } from '../../utilities/styles';

export type BaseTextInputHandle = React.ElementRef<typeof TextInput>;

export interface BaseTextInputProps extends Omit<TextInputProps, 'style'> {
  forceLTR?: boolean;
  internalStyle?: StyleProp<TextStyle>;
}

export const BaseTextInput = memo(forwardRef<
  BaseTextInputHandle,
  BaseTextInputProps
>(function BaseTextInput(
  {
    editable = true,
    forceLTR = false,
    internalStyle,
    accessibilityState,
    ...props
  },
  ref,
) {
  const { direction, theme } = useTheme();
  const resolvedDirection = forceLTR ? 'ltr' : direction;

  return (
    <TextInput
      ref={ref}
      editable={editable}
      allowFontScaling
      accessibilityState={{
        ...accessibilityState,
        disabled: !editable,
      }}
      placeholderTextColor={theme.color.text.tertiary}
      selectionColor={theme.color.primary.default}
      cursorColor={theme.color.primary.default}
      {...props}
      style={[
        logicalText(resolvedDirection),
        {
          flex: 1,
          minWidth: theme.spacing.none,
          color: editable
            ? theme.color.text.primary
            : theme.color.disabled.text,
          fontFamily: resolvedDirection === 'rtl'
            ? theme.typography.fontFamily.arabic
            : theme.typography.fontFamily.sans,
          fontSize: theme.typography.fontSize.md,
          lineHeight: theme.typography.lineHeight.md,
          paddingVertical: theme.spacing.none,
          textAlign: resolvedDirection === 'rtl' ? 'right' : 'left',
        },
        internalStyle,
      ]}
    />
  );
}));
