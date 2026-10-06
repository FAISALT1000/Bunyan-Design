import React, { memo, useEffect, useRef } from 'react';
import { Pressable, TextInput, View, type TextInputRef } from '../RNTheme';
import { useTheme } from '../../hooks';
import { normalizeDigits } from '../../utilities/numbers';
import { NumPad } from '../../templates/NumPad';
import { Text } from '../Text';

export interface OTPInputProps {
  value: string;
  onChange: (value: string) => void;
  /** Called once each time the code becomes complete. */
  onComplete?: (value: string) => void;
  length?: number;
  /** Show dots instead of digits. */
  secure?: boolean;
  /** Red slots. Pass `errorText` to also show a message under them. */
  error?: boolean;
  errorText?: string;
  disabled?: boolean;
  /** Show Bunyan's NumPad and keep the system keyboard hidden. */
  useNumPad?: boolean;
  autoFocus?: boolean;
  /** Screen-reader label of the slot row; receives entered/total counts. */
  slotsLabel?: (entered: number, length: number) => string;
  inputAccessibilityLabel?: string;
  testID?: string;
}

const onlyDigits = (value: string, length: number) => normalizeDigits(value).replace(/\D/g, '').slice(0, length);

/**
 * One-time-code entry: digit slots backed by a hidden native input (paste,
 * SMS autofill, password managers), or the on-screen NumPad. Digits always
 * read left-to-right, also in Arabic.
 */
export const OTPInput = memo(function OTPInput({
  value,
  onChange,
  onComplete,
  length = 4,
  secure = false,
  error = false,
  errorText,
  disabled = false,
  useNumPad = false,
  autoFocus = false,
  slotsLabel = (entered, total) => `Verification code, ${entered} of ${total} digits entered`,
  inputAccessibilityLabel = 'Verification code input',
  testID,
}: OTPInputProps) {
  const { theme } = useTheme();
  const inputRef = useRef<TextInputRef>(null);
  const code = onlyDigits(value, length);
  const complete = code.length === length;
  const completed = useRef<string | undefined>(undefined);
  const hasError = error || Boolean(errorText);

  useEffect(() => {
    if (complete && completed.current !== code) {
      completed.current = code;
      onComplete?.(code);
    }
    if (!complete) completed.current = undefined;
  }, [code, complete, onComplete]);

  const update = (next: string) => {
    if (!disabled) onChange(onlyDigits(next, length));
  };

  return (
    <View testID={testID} style={{ gap: theme.spacing.lg }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={slotsLabel(code.length, length)}
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={() => {
          if (!useNumPad) inputRef.current?.focus();
        }}
        style={{ flexDirection: 'row', justifyContent: 'center', gap: theme.spacing.sm }}
      >
        {Array.from({ length }, (_, index) => {
          const digit = code[index];
          const active = index === code.length && !complete && !disabled;
          return (
            <View
              key={index}
              accessible
              accessibilityLabel={digit ? `Digit ${index + 1} entered` : `Digit ${index + 1} empty`}
              style={{
                width: theme.componentHeight.lg,
                height: theme.componentHeight.xl,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: theme.radius.md,
                borderWidth: active || hasError ? theme.borderWidth.medium : theme.borderWidth.thin,
                borderColor: hasError
                  ? theme.color.border.error
                  : active
                  ? theme.color.border.focus
                  : digit
                  ? theme.color.primary.default
                  : theme.color.border.primary,
                backgroundColor: digit ? theme.color.primary.subtle : theme.color.surface.primary,
                opacity: disabled ? theme.opacity.disabled : theme.opacity.opaque,
              }}
            >
              <Text weight="bold" style={{ fontSize: theme.typography.fontSize.xl, lineHeight: theme.typography.lineHeight.xl }}>
                {digit ? (secure ? '•' : digit) : ''}
              </Text>
            </View>
          );
        })}
      </Pressable>

      <TextInput
        ref={inputRef}
        value={code}
        onChangeText={update}
        maxLength={length}
        keyboardType="number-pad"
        inputMode="numeric"
        textContentType="oneTimeCode"
        autoComplete="one-time-code"
        autoFocus={autoFocus && !useNumPad}
        accessibilityLabel={inputAccessibilityLabel}
        accessibilityState={{ disabled }}
        editable={!disabled}
        showSoftInputOnFocus={!useNumPad}
        {...(useNumPad ? { accessibilityElementsHidden: true, importantForAccessibility: 'no-hide-descendants' as const } : {})}
        caretHidden
        style={{ position: 'absolute', width: theme.spacing.xs, height: theme.spacing.xs, opacity: theme.opacity.invisible }}
      />

      {errorText ? (
        <Text accessibilityRole="alert" variant="bodySmall" tone="error" align="center">{errorText}</Text>
      ) : null}

      {useNumPad ? <NumPad value={code} onChange={update} maxLength={length} disabled={disabled} /> : null}
    </View>
  );
});
