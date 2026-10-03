import React, { forwardRef, memo } from 'react';
import { RNText, type TextProps as RNTextProps, type TextRef, type TextStyle } from '../RNTheme';
import { useTheme } from '../../hooks';
import { fontFamilyFor, logicalText, type LogicalAlign } from '../../utilities/styles';

export type TextVariant = 'body' | 'bodySmall' | 'caption' | 'label' | 'code';
export type TextTone = 'primary' | 'secondary' | 'tertiary' | 'inverse' | 'link' | 'error' | 'success';
export type TextWeight = 'regular' | 'medium' | 'semibold' | 'bold';

export interface TextProps extends RNTextProps {
  variant?: TextVariant;
  tone?: TextTone;
  align?: LogicalAlign;
  weight?: TextWeight;
}

export const Text = memo(forwardRef<TextRef, TextProps>(function Text(
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

  return (
    <RNText
      ref={ref}
      {...props}
      style={[
        // Alignment must come from the same place as writingDirection; previously a
        // trailing logicalText() overrode `align="center" | "end"`.
        logicalText(direction, align),
        {
          color: tones[tone],
          fontFamily: variant === 'code' ? theme.typography.fontFamily.mono : fontFamilyFor(theme, direction),
          fontWeight: theme.typography.fontWeight[weight],
        },
        variants[variant],
        style,
      ]}
    />
  );
}));
