import React, { forwardRef, memo, useState } from 'react';
import { TextInput, View, type TextInputProps, type TextInputRef } from '../RNTheme';
import { useTheme } from '../../hooks';
import { fontFamilyFor, logicalText, statusBorderColor, type FeedbackStatus } from '../../utilities/styles';
import { Text } from '../Text';

export interface TextAreaProps extends Omit<TextInputProps, 'style' | 'multiline'> {
  status?: FeedbackStatus;
  minRows?: number;
  maxLength?: number;
  showCounter?: boolean;
}

export const TextArea = memo(forwardRef<TextInputRef, TextAreaProps>(function TextArea(
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
    accessibilityState,
    ...props
  },
  ref,
) {
  const { theme, direction } = useTheme();
  const [focused, setFocused] = useState(false);
  const [internalValue, setInternalValue] = useState(defaultValue ?? '');
  const displayedValue = value ?? internalValue;
  const counterVisible = showCounter && maxLength !== undefined;

  return (
    <View style={{ gap: theme.spacing.xs }}>
      <TextInput
        ref={ref}
        multiline
        {...(value !== undefined ? { value } : {})}
        {...(defaultValue !== undefined ? { defaultValue } : {})}
        {...(maxLength !== undefined ? { maxLength } : {})}
        editable={editable}
        textAlignVertical="top"
        accessibilityState={{ ...accessibilityState, disabled: !editable }}
        aria-invalid={status === 'error'}
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
            fontFamily: fontFamilyFor(theme, direction),
            fontSize: theme.typography.fontSize.md,
            lineHeight: theme.typography.lineHeight.md,
          },
        ]}
      />
      {counterVisible ? (
        <Text
          variant="caption"
          tone={displayedValue.length >= maxLength ? 'error' : 'tertiary'}
          align="end"
          accessibilityLiveRegion="polite"
        >
          {displayedValue.length}/{maxLength}
        </Text>
      ) : null}
    </View>
  );
}));
