import React, { forwardRef, memo, useState } from 'react';
import { TextInput, View, type TextInputProps, type TextInputRef, type ViewStyle } from '../RNTheme';
import { useTheme } from '../../hooks';
import { fontFamilyFor, heightForSize, logicalRow, logicalText, statusBorderColor, type ComponentSize, type FeedbackStatus } from '../../utilities/styles';
import type { IconName } from '../Icon';
import { Icon } from '../Icon';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  size?: ComponentSize;
  status?: FeedbackStatus;
  leadingIcon?: IconName;
  trailing?: React.ReactNode;
  containerStyle?: Pick<ViewStyle, 'flex' | 'width' | 'maxWidth' | 'minWidth' | 'alignSelf'>;
  /** Content before the text (after `leadingIcon`), e.g. a country-code picker. */
  leading?: React.ReactNode;
  /**
   * Direction of the typed text. Use `'ltr'` for phone numbers, IBANs, emails and
   * amounts so they read correctly inside an Arabic UI. Default: the UI direction.
   */
  textDirection?: 'ltr' | 'rtl';
}

export const Input = memo(forwardRef<TextInputRef, InputProps>(function Input(
  {
    size = 'medium',
    status = 'default',
    leadingIcon,
    leading,
    trailing,
    textDirection,
    editable = true,
    containerStyle,
    onFocus,
    onBlur,
    accessibilityState,
    ...props
  },
  ref,
) {
  const { theme, direction } = useTheme();
  const [focused, setFocused] = useState(false);
  const disabled = !editable;

  return (
    <View
      style={[
        logicalRow(direction),
        {
          minHeight: heightForSize(theme, size),
          alignItems: 'center',
          gap: theme.spacing.sm,
          paddingHorizontal: theme.spacing.md,
          borderRadius: theme.radius.md,
          borderWidth: focused ? theme.borderWidth.medium : theme.borderWidth.thin,
          borderColor: focused ? theme.color.border.focus : statusBorderColor(theme, status),
          backgroundColor: disabled ? theme.color.disabled.background : theme.color.surface.primary,
          opacity: disabled ? theme.opacity.disabled : theme.opacity.opaque,
        },
        containerStyle,
      ]}
    >
      {leadingIcon ? <Icon name={leadingIcon} size="md" tone="secondary" /> : null}
      {leading}
      <TextInput
        ref={ref}
        editable={editable}
        accessibilityState={{ ...accessibilityState, disabled }}
        aria-invalid={status === 'error'}
        onFocus={event => {
          setFocused(true);
          onFocus?.(event);
        }}
        onBlur={event => {
          setFocused(false);
          onBlur?.(event);
        }}
        {...props}
        style={[
          logicalText(direction),
          textDirection ? { writingDirection: textDirection } : null,
          {
            flex: 1,
            minWidth: theme.spacing.none,
            color: disabled ? theme.color.disabled.text : theme.color.text.primary,
            fontFamily: fontFamilyFor(theme, direction),
            fontSize: theme.typography.fontSize.md,
            lineHeight: theme.typography.lineHeight.md,
            paddingVertical: theme.spacing.none,
          },
        ]}
      />
      {trailing}
    </View>
  );
}));
