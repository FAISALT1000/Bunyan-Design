import React, { forwardRef, memo } from 'react';
import { Text as RNText, type TextProps as RNTextProps, type TextStyle } from 'react-native';
import { useTheme } from '../../hooks';
import { logicalText } from '../../utilities/styles';
import type { TextTone } from '../Text';

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export interface HeadingProps extends RNTextProps {
  level?: HeadingLevel;
  tone?: TextTone;
  align?: 'start' | 'center' | 'end';
}

export const Heading = memo(forwardRef<RNText, HeadingProps>(function Heading(
  { level = 2, tone = 'primary', align = 'start', style, accessibilityRole, ...props },
  ref,
) {
  const { theme, direction } = useTheme();
  const levelStyles: Record<HeadingLevel, TextStyle> = {
    1: { fontSize: theme.typography.fontSize.displayMd, lineHeight: theme.typography.lineHeight.displayMd },
    2: { fontSize: theme.typography.fontSize.displaySm, lineHeight: theme.typography.lineHeight.displaySm },
    3: { fontSize: theme.typography.fontSize.xxl, lineHeight: theme.typography.lineHeight.xxl },
    4: { fontSize: theme.typography.fontSize.xl, lineHeight: theme.typography.lineHeight.xl },
    5: { fontSize: theme.typography.fontSize.lg, lineHeight: theme.typography.lineHeight.lg },
    6: { fontSize: theme.typography.fontSize.md, lineHeight: theme.typography.lineHeight.md },
  };
  const toneColor = tone === 'error' ? theme.color.error.text
    : tone === 'success' ? theme.color.success.text
    : tone === 'inverse' ? theme.color.text.inverse
    : tone === 'secondary' ? theme.color.text.secondary
    : tone === 'tertiary' ? theme.color.text.tertiary
    : tone === 'link' ? theme.color.text.link
    : theme.color.text.primary;
  const textAlign = align === 'center' ? 'center' : align === 'end'
    ? (direction === 'rtl' ? 'left' : 'right')
    : (direction === 'rtl' ? 'right' : 'left');

  return (
    <RNText
      ref={ref}
      accessibilityRole={accessibilityRole ?? 'header'}
      aria-level={level}
      allowFontScaling
      {...props}
      style={[
        logicalText(direction),
        levelStyles[level],
        {
          color: toneColor,
          fontFamily: direction === 'rtl' ? theme.typography.fontFamily.arabic : theme.typography.fontFamily.sans,
          fontWeight: theme.typography.fontWeight.bold,
          letterSpacing: theme.typography.letterSpacing.tight,
          textAlign,
        },
        style,
      ]}
    />
  );
}));
