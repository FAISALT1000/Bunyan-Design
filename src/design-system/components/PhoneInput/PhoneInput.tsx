import React, { forwardRef, memo } from 'react';
import type { TextInputRef } from '../RNTheme';
import { useTheme } from '../../hooks';
import { useText, type TextValue } from '../../i18n';
import { normalizeDigits } from '../../utilities/numbers';
import { InlinePicker } from '../InlinePicker';
import { Input, type InputProps } from '../Input';
import { DEFAULT_PHONE_COUNTRIES, flagEmoji, type PhoneCountry, type PhoneValue } from './countries';

export interface PhoneInputProps extends Omit<InputProps, 'value' | 'defaultValue' | 'onChangeText' | 'onChange' | 'keyboardType' | 'leading'> {
  value?: PhoneValue | null;
  onChange?: (value: PhoneValue) => void;
  countries?: readonly PhoneCountry[];
  /** Country when `value` is empty. Default: first of `countries`. */
  defaultCountry?: string;
  /** Show flag emoji on the country trigger. Default `true`. */
  showFlag?: boolean;
  countryTitle?: TextValue;
  countryAccessibilityLabel?: TextValue;
  searchPlaceholder?: TextValue;
}

/**
 * Phone number with a searchable country-code picker inside the field.
 * Accepts Arabic-Indic digits and drops a leading 0 (`0512…` → `512…`).
 */
export const PhoneInput = memo(forwardRef<TextInputRef, PhoneInputProps>(function PhoneInput(
  {
    value,
    onChange,
    countries = DEFAULT_PHONE_COUNTRIES,
    defaultCountry,
    showFlag = true,
    countryTitle = 'Country code',
    countryAccessibilityLabel = 'Country code',
    searchPlaceholder = 'Search countries',
    editable = true,
    ...props
  },
  ref,
) {
  const { isRTL } = useTheme();
  const t = useText();
  const country = value?.country ?? defaultCountry ?? countries[0]?.code ?? 'SA';
  const number = value?.number ?? '';
  const maxLength = Math.max(...(countries.find(item => item.code === country)?.lengths ?? [15]));

  return (
    <Input
      ref={ref}
      keyboardType="phone-pad"
      inputMode="tel"
      textContentType="telephoneNumber"
      autoComplete="tel"
      textDirection="ltr"
      maxLength={maxLength}
      {...props}
      editable={editable}
      value={number}
      onChangeText={text => onChange?.({ country, number: normalizeDigits(text).replace(/\D/g, '').replace(/^0+/, '') })}
      leading={(
        <InlinePicker
          value={country}
          onChange={code => onChange?.({ country: code, number })}
          disabled={!editable}
          title={t(countryTitle) ?? 'Country code'}
          accessibilityLabel={t(countryAccessibilityLabel) ?? 'Country code'}
          searchPlaceholder={t(searchPlaceholder) ?? 'Search'}
          searchable
          options={countries.map(item => ({
            value: item.code,
            short: `${showFlag ? `${flagEmoji(item.code)} ` : ''}${item.dialCode}`,
            label: (isRTL ? item.nameAr : undefined) ?? item.name,
            keywords: `${item.name} ${item.nameAr ?? ''} ${item.dialCode} ${item.code}`,
          }))}
        />
      )}
    />
  );
}));

/** Same component under the name used by other projects. */
export const PhoneWithCountryInput = PhoneInput;
export type PhoneWithCountryInputProps = PhoneInputProps;
