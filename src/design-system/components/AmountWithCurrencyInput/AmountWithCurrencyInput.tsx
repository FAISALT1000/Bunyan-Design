import React, { forwardRef, memo } from 'react';
import type { TextInputRef } from '../RNTheme';
import { useText, type TextValue } from '../../i18n';
import { AmountInput, type AmountInputProps } from '../AmountInput';
import { InlinePicker } from '../InlinePicker';

export interface CurrencyOption {
  code: string;
  label?: TextValue;
  /** Decimals for this currency (e.g. 3 for KWD). */
  decimals?: number;
}

export interface AmountWithCurrency {
  amount: number | null;
  currency: string;
}

export interface AmountWithCurrencyInputProps extends Omit<AmountInputProps, 'value' | 'onChangeValue' | 'onChange' | 'currency' | 'trailing' | 'decimals'> {
  value?: AmountWithCurrency | null;
  onChange?: (value: AmountWithCurrency) => void;
  currencies: readonly (string | CurrencyOption)[];
  currencyTitle?: TextValue;
  currencyAccessibilityLabel?: TextValue;
}

/** Amount plus a currency picker inside the same field. Value: `{ amount, currency }`. */
export const AmountWithCurrencyInput = memo(forwardRef<TextInputRef, AmountWithCurrencyInputProps>(function AmountWithCurrencyInput(
  { value, onChange, currencies, currencyTitle = 'Currency', currencyAccessibilityLabel = 'Currency', editable = true, ...props },
  ref,
) {
  const t = useText();
  const options = currencies.map(item => (typeof item === 'string' ? { code: item } : item));
  const currency = value?.currency ?? options[0]?.code ?? '';
  const decimals = options.find(option => option.code === currency)?.decimals ?? 2;
  return (
    <AmountInput
      ref={ref}
      {...props}
      editable={editable}
      decimals={decimals}
      value={value?.amount ?? null}
      onChangeValue={amount => onChange?.({ amount, currency })}
      trailing={(
        <InlinePicker
          value={currency}
          onChange={code => onChange?.({ amount: value?.amount ?? null, currency: code })}
          title={t(currencyTitle) ?? 'Currency'}
          accessibilityLabel={t(currencyAccessibilityLabel) ?? 'Currency'}
          disabled={!editable}
          options={options.map(option => ({ value: option.code, short: option.code, label: t(option.label) ?? option.code }))}
        />
      )}
    />
  );
}));
