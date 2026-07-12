import React, { forwardRef, memo } from 'react';
import {
  Text as NativeText,
  type AccessibilityRole,
  type TextStyle,
} from 'react-native';
import { useTheme } from '../../hooks';
import {
  resolveLocalizedText,
  type TranslationOptions,
  useOptionalLocalization,
} from '../../localization';
import type {
  TextTone,
  TextVariant,
  TextWeight,
} from '../../tokens';
import { warnDeprecated } from '../../utilities/deprecations';
import { logicalText } from '../../utilities/styles';

export type { TextTone, TextVariant, TextWeight } from '../../tokens';

export interface BaseTextProps {
  variant?: TextVariant | undefined;
  tone?: TextTone | undefined;
  weight?: TextWeight | undefined;
  align?: 'start' | 'center' | 'end' | undefined;
  numberOfLines?: number | undefined;
  selectable?: boolean | undefined;
  accessibilityLabel?: string | undefined;
  accessibilityRole?: AccessibilityRole | undefined;
  accessibilityLiveRegion?: 'none' | 'polite' | 'assertive' | undefined;
  nativeID?: string | undefined;
  testID?: string | undefined;
  decoration?: 'none' | 'underline';
  /**
   * Internal composition escape hatch for semantic components.
   */
  internalColor?: string;
}

export type TextProps = BaseTextProps & (
  | {
      localize: string;
      value?: string | number;
      translationOptions?: TranslationOptions;
      text?: never;
      children?: never;
    }
  | {
      localize?: never;
      value: string | number;
      translationOptions?: never;
      text?: never;
      children?: never;
    }
  | {
      localize?: never;
      value?: never;
      translationOptions?: never;
      /**
       * @deprecated Use the value prop. Scheduled for removal in 1.0.0.
       */
      text: string | number;
      children?: never;
    }
  | {
      localize?: never;
      value?: never;
      translationOptions?: never;
      text?: never;
      /**
       * @deprecated Use the value prop. Scheduled for removal in 1.0.0.
       */
      children: string | number;
    }
);

const variantStyle = (
  theme: ReturnType<typeof useTheme>['theme'],
  variant: TextVariant,
): TextStyle => {
  const { fontSize, lineHeight } = theme.typography;
  const variants: Record<TextVariant, TextStyle> = {
    displayLarge: { fontSize: fontSize.displayMd, lineHeight: lineHeight.displayMd },
    displayMedium: { fontSize: fontSize.displaySm, lineHeight: lineHeight.displaySm },
    headingLarge: { fontSize: fontSize.xxl, lineHeight: lineHeight.xxl },
    headingMedium: { fontSize: fontSize.xl, lineHeight: lineHeight.xl },
    headingSmall: { fontSize: fontSize.lg, lineHeight: lineHeight.lg },
    bodyLarge: { fontSize: fontSize.lg, lineHeight: lineHeight.lg },
    bodyMedium: { fontSize: fontSize.md, lineHeight: lineHeight.md },
    bodySmall: { fontSize: fontSize.sm, lineHeight: lineHeight.sm },
    labelLarge: { fontSize: fontSize.md, lineHeight: lineHeight.md },
    labelMedium: { fontSize: fontSize.sm, lineHeight: lineHeight.sm },
    labelSmall: { fontSize: fontSize.xs, lineHeight: lineHeight.xs },
    caption: { fontSize: fontSize.xs, lineHeight: lineHeight.xs },
  };
  return variants[variant];
};

export const Text = memo(forwardRef<
  React.ElementRef<typeof NativeText>,
  TextProps
>(function Text(
  {
    localize,
    value,
    translationOptions,
    text,
    children,
    variant = 'bodyMedium',
    tone = 'primary',
    align = 'start',
    weight = 'regular',
    decoration = 'none',
    internalColor,
    ...props
  },
  ref,
) {
  const { theme, direction } = useTheme();
  const localization = useOptionalLocalization();
  const fallbackValue = value ?? text ?? children;
  const resolvedText = resolveLocalizedText({
    ...(localize ? { localize } : {}),
    ...(fallbackValue !== undefined ? { value: fallbackValue } : {}),
    ...(translationOptions ? { translationOptions } : {}),
    ...(localization ? { localization } : {}),
  });

  if (value === undefined && text !== undefined) {
    warnDeprecated(
      'Text text is deprecated. Use <Text value="..." />. It will be removed in 1.0.0.',
    );
  }
  if (value === undefined && children !== undefined) {
    warnDeprecated(
      'Text children is deprecated. Use <Text value="..." />. It will be removed in 1.0.0.',
    );
  }

  const tones: Record<TextTone, string> = {
    primary: theme.color.text.primary,
    secondary: theme.color.text.secondary,
    tertiary: theme.color.text.tertiary,
    success: theme.color.success.text,
    warning: theme.color.warning.text,
    error: theme.color.error.text,
    info: theme.color.information.text,
    disabled: theme.color.disabled.text,
    inverse: theme.color.text.inverse,
  };
  const resolvedDirection = localization
    ? localization.isRTL ? 'rtl' : 'ltr'
    : direction;
  const textAlign = align === 'center'
    ? 'center'
    : align === 'end'
      ? (resolvedDirection === 'rtl' ? 'left' : 'right')
      : (resolvedDirection === 'rtl' ? 'right' : 'left');

  return (
    <NativeText
      ref={ref}
      allowFontScaling
      {...props}
      style={[
        logicalText(resolvedDirection),
        variantStyle(theme, variant),
        {
          color: internalColor ?? tones[tone],
          fontFamily: resolvedDirection === 'rtl'
            ? theme.typography.fontFamily.arabic
            : theme.typography.fontFamily.sans,
          fontWeight: theme.typography.fontWeight[weight],
          textAlign,
          textDecorationLine: decoration,
        },
      ]}
    >
      {resolvedText}
    </NativeText>
  );
}));
