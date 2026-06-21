import React, { forwardRef, memo, useState } from 'react';
import { TextInput, View, type TextInputProps } from 'react-native';
import { useTheme } from '../../hooks';
import { logicalText, statusBorderColor, type FeedbackStatus } from '../../utilities/styles';
import { Text } from '../Text';

export interface TextAreaProps extends Omit<TextInputProps, 'style' | 'multiline'> {
  status?: FeedbackStatus;
  minRows?: number;
  maxLength?: number;
  showCounter?: boolean;
}

export const TextArea = memo(forwardRef<TextInput, TextAreaProps>(function TextArea(
  {
    status = 'default',
    minRows = 4,
    maxLength,
    showCounter = Boolean(maxLength),
    value,
    defaultValue,
    editable = true,
    onFocus,
    onBlur,
    onChangeText,
    ...props
  },
  ref,
) {
  const { theme, direction } = useTheme();
  const [focused, setFocused] = useState(false);
  const [internalValue, setInternalValue] = useState(defaultValue ?? '');
  const displayedValue = value ?? internalValue;

  return (
    <View style={{ gap: theme.spacing.xs }}>
      <TextInput
        ref={ref}
        multiline
        value={value}
        defaultValue={defaultValue}
        editable={editable}
        maxLength={maxLength}
        textAlignVertical="top"
        accessibilityState={{ disabled: !editable }}
        aria-invalid={status === 'error'}
        placeholderTextColor={theme.color.text.tertiary}
        selectionColor={theme.color.primary.default}
        onFocus={event => {
          setFocused(true);
          onFocus?.(event);
        }}
        onBlur={event => {
          setFocused(false);
          onBlur?.(event);
        }}
        onChangeText={text => {
          setInternalValue(text);
          onChangeText?.(text);
        }}
        {...props}
        style={[
          logicalText(direction),
          {
            minHeight: minRows * theme.typography.lineHeight.md + theme.spacing.xxl,
            padding: theme.spacing.md,
            borderRadius: theme.radius.md,
            borderWidth: focused ? theme.borderWidth.medium : theme.borderWidth.thin,
            borderColor: focused ? theme.color.border.focus : statusBorderColor(theme, status),
            backgroundColor: editable ? theme.color.surface.primary : theme.color.disabled.background,
            color: editable ? theme.color.text.primary : theme.color.disabled.text,
            fontFamily: direction === 'rtl' ? theme.typography.fontFamily.arabic : theme.typography.fontFamily.sans,
            fontSize: theme.typography.fontSize.md,
            lineHeight: theme.typography.lineHeight.md,
          },
        ]}
      />
      {showCounter && maxLength ? (
        <Text variant="caption" tone={displayedValue.length >= maxLength ? 'error' : 'tertiary'} align="end">
          {displayedValue.length}/{maxLength}
        </Text>
      ) : null}
    </View>
  );
}));
