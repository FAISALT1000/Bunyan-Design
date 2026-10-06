import React, { memo, useEffect, useRef, useState } from 'react';
import { Pressable, TextInput, View } from '../RNTheme';
import { useTheme } from '../../hooks';
import { useText, type TextValue } from '../../i18n';
import { formatAmount, groupAmountText, parseAmount, sanitizeAmountText } from '../../utilities/numbers';
import { logicalRow, type FeedbackStatus } from '../../utilities/styles';
import { ChipsGroup } from '../ChipsGroup';
import { NumPad } from '../../templates/NumPad';
import { Text } from '../Text';

export interface AmountFieldProps {
  value?: number | null;
  onChangeValue?: (value: number | null) => void;
  currency?: string;
  decimals?: number;
  label?: TextValue;
  /** Line under the amount, e.g. "Available balance: 12,480.00 SAR". */
  hint?: TextValue;
  errorText?: string;
  status?: FeedbackStatus;
  /** One-tap amounts shown as chips. */
  quickAmounts?: readonly number[];
  /** Use the on-screen NumPad (with a decimal key) instead of the system keyboard. */
  useNumPad?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  placeholder?: string;
  testID?: string;
}

const textOf = (value: number | null | undefined) => (value === null || value === undefined || !Number.isFinite(value) ? '' : String(value));

/** Large centred amount entry for transfer / payment screens. */
export const AmountField = memo(function AmountField({
  value,
  onChangeValue,
  currency,
  decimals = 2,
  label,
  hint,
  errorText,
  status = 'default',
  quickAmounts,
  useNumPad = false,
  disabled = false,
  autoFocus = false,
  placeholder = '0',
  testID,
}: AmountFieldProps) {
  const { theme, direction } = useTheme();
  const t = useText();
  const [text, setText] = useState(() => textOf(value));
  const emitted = useRef(value);
  useEffect(() => {
    if (value !== emitted.current) {
      emitted.current = value;
      setText(textOf(value));
    }
  }, [value]);

  const set = (raw: string) => {
    const next = sanitizeAmountText(raw, { decimals });
    setText(next);
    const parsed = parseAmount(next);
    emitted.current = parsed;
    onChangeValue?.(parsed);
  };

  const invalid = status === 'error' || Boolean(errorText);
  const labelText = t(label);
  const hintText = t(hint);
  const size = theme.typography.fontSize.displayMd;
  const shown = groupAmountText(text) || placeholder;
  // Size the input to its content so the currency sits right after the amount on every platform.
  const inputWidth = Math.max(2, shown.length + 0.6) * size * 0.62;

  return (
    <View testID={testID} style={{ gap: theme.spacing.md, alignItems: 'stretch', opacity: disabled ? theme.opacity.disabled : theme.opacity.opaque }}>
      {labelText ? <Text variant="labelMedium" tone="secondary" align="center" value={labelText} /> : null}
      <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'baseline', gap: theme.spacing.sm }}>
        <TextInput
          value={groupAmountText(text)}
          onChangeText={set}
          editable={!disabled}
          autoFocus={autoFocus && !useNumPad}
          showSoftInputOnFocus={!useNumPad}
          keyboardType="decimal-pad"
          inputMode="decimal"
          placeholder={placeholder}
          accessibilityLabel={[labelText, currency].filter(Boolean).join(', ') || 'Amount'}
          aria-invalid={invalid}
          style={{
            width: inputWidth,
            maxWidth: '80%',
            textAlign: 'center',
            writingDirection: 'ltr',
            fontSize: size,
            lineHeight: theme.typography.lineHeight.displayMd,
            fontWeight: theme.typography.fontWeight.bold,
            color: invalid ? theme.color.error.text : theme.color.text.primary,
            padding: 0,
          }}
        />
        {currency ? <Text weight="semibold" tone="secondary" internalStyle={{ fontSize: theme.typography.fontSize.xl }} value={currency} /> : null}
      </View>
      {errorText ? (
        <Text accessibilityRole="alert" variant="bodySmall" tone="error" align="center" value={errorText} />
      ) : hintText ? (
        <Text variant="bodySmall" tone="secondary" align="center" value={hintText} />
      ) : null}
      {quickAmounts?.length ? (
        <View style={[logicalRow(direction), { justifyContent: 'center' }]}>
          <ChipsGroup
            value={value ?? null}
            onChange={amount => set(String(amount))}
            disabled={disabled}
            data={quickAmounts.map(amount => ({ text: formatAmount(amount, { decimals: amount % 1 ? decimals : 0 }), value: amount }))}
          />
        </View>
      ) : null}
      {useNumPad ? (
        <NumPad
          value={text}
          onChange={set}
          disabled={disabled}
          leadingAction={decimals > 0 ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Decimal point"
              disabled={disabled || text.includes('.')}
              onPress={() => set(`${text || '0'}.`)}
              style={({ pressed }) => ({ flex: 1, alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center', borderRadius: theme.radius.lg, backgroundColor: pressed ? theme.color.overlay.subtle : theme.color.overlay.transparent })}
            >
              <Text weight="semibold" internalStyle={{ fontSize: theme.typography.fontSize.xxl, lineHeight: theme.typography.lineHeight.xxl }} value="." />
            </Pressable>
          ) : undefined}
        />
      ) : null}
    </View>
  );
});
