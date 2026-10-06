import React, { forwardRef, memo, useEffect, useRef, useState } from 'react';
import type { TextInputRef } from '../RNTheme';
import { groupAmountText, parseAmount, sanitizeAmountText } from '../../utilities/numbers';
import { Input, type InputProps } from '../Input';
import { Text } from '../Text';

export interface AmountInputProps extends Omit<InputProps, 'value' | 'defaultValue' | 'onChangeText' | 'keyboardType' | 'inputMode'> {
  /** Numeric value (`null` when empty). */
  value?: number | null;
  onChangeValue?: (value: number | null) => void;
  /** Currency code or symbol shown after the amount (e.g. `'SAR'`). */
  currency?: string;
  /** Maximum decimals. Default `2`. */
  decimals?: number;
  allowNegative?: boolean;
  /** Thousands separator. Default `','`. */
  groupSeparator?: string;
}

const textFromValue = (value: number | null | undefined) =>
  value === null || value === undefined || !Number.isFinite(value) ? '' : String(value);

/**
 * Numeric amount entry: groups thousands while typing (`12,500.75`), accepts
 * Arabic-Indic digits, limits decimals and reports a `number`.
 */
export const AmountInput = memo(forwardRef<TextInputRef, AmountInputProps>(function AmountInput(
  { value, onChangeValue, currency, decimals = 2, allowNegative = false, groupSeparator = ',', trailing, ...props },
  ref,
) {
  const [text, setText] = useState(() => textFromValue(value));
  const lastEmitted = useRef<number | null | undefined>(value);

  // Follow external changes (reset, enableReinitialize) without fighting the user's typing.
  useEffect(() => {
    if (value !== lastEmitted.current) {
      lastEmitted.current = value;
      setText(textFromValue(value));
    }
  }, [value]);

  return (
    <Input
      ref={ref}
      keyboardType="decimal-pad"
      inputMode="decimal"
      textDirection="ltr"
      {...props}
      value={groupAmountText(text, groupSeparator)}
      onChangeText={raw => {
        const next = sanitizeAmountText(raw, { decimals, allowNegative });
        setText(next);
        const parsed = parseAmount(next);
        lastEmitted.current = parsed;
        onChangeValue?.(parsed);
      }}
      trailing={trailing ?? (currency ? <Text tone="secondary" weight="medium">{currency}</Text> : null)}
    />
  );
}));
