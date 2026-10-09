import React, { memo } from 'react';
import { useTheme } from '../../hooks';
import { Text, type TextTone, type TextVariant, type TextWeight } from '../../components/Text';
import {
  formatDate,
  formatMoney,
  formatPhone,
  maskText,
  type DateFormat,
  type DigitStyle,
  type MaskType,
  type MoneyFormatOptions,
} from './format';

interface FormatTextBaseProps {
  variant?: TextVariant;
  tone?: TextTone;
  weight?: TextWeight;
  align?: 'start' | 'center' | 'end';
  /** Default `'latin'`. `'arabic'` uses Arabic-Indic digits; `'auto'` follows the locale. */
  digits?: DigitStyle;
  /** Defaults to the ThemeProvider locale. */
  locale?: string;
  accessibilityLabel?: string;
  testID?: string;
}

const textProps = ({ variant, tone, weight, align, accessibilityLabel, testID }: FormatTextBaseProps) => ({
  ...(variant ? { variant } : {}),
  ...(tone ? { tone } : {}),
  ...(weight ? { weight } : {}),
  ...(align ? { align } : {}),
  ...(accessibilityLabel ? { accessibilityLabel } : {}),
  ...(testID ? { testID } : {}),
});

export interface MoneyProps extends FormatTextBaseProps, Omit<MoneyFormatOptions, 'locale' | 'digits'> {
  amount: number;
  /** Colour negative amounts red and (with `signed`) positive ones green. */
  colorize?: boolean;
  /** Show `••••` instead of the amount (balance privacy). */
  hidden?: boolean;
}

/**
 * Formatted amount: `<Money amount={-1250} currency="SAR" signed />` → `−1,250.00 SAR`.
 */
export const Money = memo(function Money({
  amount,
  currency,
  decimals,
  signed,
  compact,
  currencyPosition,
  colorize = false,
  hidden = false,
  digits = 'latin',
  locale,
  ...rest
}: MoneyProps) {
  const theme = useTheme();
  const resolvedLocale = locale ?? theme.locale;
  const text = hidden
    ? `•••••${currency && currencyPosition !== 'none' ? ` ${currency}` : ''}`
    : formatMoney(amount, {
      locale: resolvedLocale,
      digits,
      ...(currency ? { currency } : {}),
      ...(decimals !== undefined ? { decimals } : {}),
      ...(signed !== undefined ? { signed } : {}),
      ...(compact !== undefined ? { compact } : {}),
      ...(currencyPosition ? { currencyPosition } : {}),
    });
  const autoTone: TextTone | undefined = colorize && !hidden
    ? amount < 0 ? 'error' : signed && amount > 0 ? 'success' : undefined
    : undefined;
  const tone = rest.tone ?? autoTone;
  return (
    <Text
      value={text}
      {...textProps(rest)}
      {...(tone ? { tone } : {})}
      weight={rest.weight ?? 'semibold'}
      internalStyle={{ writingDirection: 'ltr' }}
    />
  );
});

export interface DateTextProps extends FormatTextBaseProps {
  value: Date | string | number;
  /** Default `'date'`. `'relative'` → "5 minutes ago", `'hijri'` → Umm al-Qura date. */
  format?: DateFormat;
  intl?: Intl.DateTimeFormatOptions;
}

export const DateText = memo(function DateText({ value, format = 'date', intl, digits = 'latin', locale, ...rest }: DateTextProps) {
  const theme = useTheme();
  const text = formatDate(value, { format, locale: locale ?? theme.locale, digits, ...(intl ? { intl } : {}) });
  return <Text value={text} {...textProps(rest)} />;
});

export interface PhoneTextProps extends FormatTextBaseProps {
  /** International number, e.g. `+966512345678`. */
  value: string;
}

export const PhoneText = memo(function PhoneText({ value, digits = 'latin', locale, ...rest }: PhoneTextProps) {
  const theme = useTheme();
  return (
    <Text
      value={formatPhone(value, digits, locale ?? theme.locale)}
      {...textProps(rest)}
      internalStyle={{ writingDirection: 'ltr' }}
    />
  );
});

export interface MaskedTextProps extends FormatTextBaseProps {
  value: string;
  type: MaskType;
  /** Show the full value (still grouped). */
  reveal?: boolean;
}

export const MaskedText = memo(function MaskedText({ value, type, reveal = false, ...rest }: MaskedTextProps) {
  return (
    <Text
      value={maskText(value, type, reveal)}
      {...textProps(rest)}
      internalStyle={{ writingDirection: 'ltr' }}
    />
  );
});
