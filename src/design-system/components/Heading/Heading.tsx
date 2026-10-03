import React, { forwardRef, memo } from 'react';
import { RNText, type TextProps as RNTextProps, type TextRef, type TextStyle } from '../RNTheme';
import { useTheme } from '../../hooks';
import { fontFamilyFor, logicalText, type LogicalAlign } from '../../utilities/styles';
import type { TextTone } from '../Text';

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export interface HeadingProps extends RNTextProps {
  level?: HeadingLevel;
  tone?: TextTone;
  align?: LogicalAlign;
}

export const Heading = memo(forwardRef<TextRef, HeadingProps>(function Heading(
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
      accessibilityRole={accessibilityRole ?? 'header'}
      aria-level={level}
      {...props}
      style={[
        logicalText(direction, align),
        levelStyles[level],
        {
          color: tones[tone],
          fontFamily: fontFamilyFor(theme, direction),
          fontWeight: theme.typography.fontWeight.bold,
          // Letter spacing breaks cursive joining in Arabic script.
          letterSpacing: direction === 'rtl' ? theme.typography.letterSpacing.normal : theme.typography.letterSpacing.tight,
        },
        style,
      ]}
    />
  );
}));
