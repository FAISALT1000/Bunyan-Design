import React, { forwardRef, memo } from 'react';
import { Text as RNText, type TextProps as RNTextProps, type TextStyle } from 'react-native';
import { useTheme } from '../../hooks';
import { logicalText } from '../../utilities/styles';

export type TextVariant = 'body' | 'bodySmall' | 'caption' | 'label' | 'code';
export type TextTone = 'primary' | 'secondary' | 'tertiary' | 'inverse' | 'link' | 'error' | 'success';

export interface TextProps extends RNTextProps {
  variant?: TextVariant;
  tone?: TextTone;
  align?: 'start' | 'center' | 'end';
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
}

export const Text = memo(forwardRef<RNText, TextProps>(function Text(
  { variant = 'body', tone = 'primary', align = 'start', weight = 'regular', style, ...props },
  ref,
) {
  const { theme, direction } = useTheme();
  const variants: Record<TextVariant, TextStyle> = {
    body: { fontSize: theme.typography.fontSize.md, lineHeight: theme.typography.lineHeight.md },
    bodySmall: { fontSize: theme.typography.fontSize.sm, lineHeight: theme.typography.lineHeight.sm },
    caption: { fontSize: theme.typography.fontSize.xs, lineHeight: theme.typography.lineHeight.xs },
    label: { fontSize: theme.typography.fontSize.sm, lineHeight: theme.typography.lineHeight.sm },
    code: {
      fontFamily: theme.typography.fontFamily.mono,
      fontSize: theme.typography.fontSize.sm,
      lineHeight: theme.typography.lineHeight.sm,
    },
  };
  const tones: Record<TextTone, string> = {
    primary: theme.color.text.primary,
    secondary: theme.color.text.secondary,
    tertiary: theme.color.text.tertiary,
    inverse: theme.color.text.inverse,
    link: theme.color.text.link,
    error: theme.color.error.text,
    success: theme.color.success.text,
  };
  const alignment = align === 'center' ? 'center' : align === 'end'
    ? (direction === 'rtl' ? 'left' : 'right')
    : (direction === 'rtl' ? 'right' : 'left');

  return (
    <RNText
      ref={ref}
      allowFontScaling
      maxFontSizeMultiplier={2}
      {...props}
      style={[
        {
          color: tones[tone],
          fontFamily: direction === 'rtl' ? theme.typography.fontFamily.arabic : theme.typography.fontFamily.sans,
          fontWeight: theme.typography.fontWeight[weight],
          textAlign: alignment,
        },
        logicalText(direction),
        variants[variant],
        style,
      ]}
    />
  );
}));
