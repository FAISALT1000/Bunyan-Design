import React, { forwardRef, memo, useCallback, useEffect, useImperativeHandle, useRef } from 'react';
import { Pressable, TextInput, View, type TextInputRef } from '../RNTheme';
import { InteractionManager, Keyboard, StyleSheet } from '../RNTheme/native';
import { useOverlayShown } from '../../base/Modal';
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

/** Imperative handle: `const otp = useRef<OTPInputHandle>(null); otp.current?.focus()`. */
export interface OTPInputHandle {
  /** Focuses the hidden input and opens the keyboard, also when RN thinks it is already focused. */
  focus: () => void;
  blur: () => void;
  /** Empties the code (calls `onChange('')`). */
  clear: () => void;
}

const onlyDigits = (value: string, length: number) => normalizeDigits(value).replace(/\D/g, '').slice(0, length);

/** Keypads and codes keep slot 1 on the left in every locale. */
const LTR = { direction: 'ltr' } as const;

/**
 * One-time-code entry: digit slots backed by a native input laid over them
 * (tap to type, long-press to paste, SMS autofill, password managers), or the
 * on-screen NumPad. Digits always read left-to-right, also in Arabic.
 */
export const OTPInput = memo(forwardRef<OTPInputHandle, OTPInputProps>(function OTPInput({
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
}, ref) {
  const { theme } = useTheme();
  const inputRef = useRef<TextInputRef>(null);
  const overlayShown = useOverlayShown();
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

  // Android can leave the input "focused" without a keyboard (e.g. autoFocus
  // while a sheet slides in), which turns focus() into a no-op: blur first.
  const focusInput = useCallback(() => {
    const input = inputRef.current;
    if (!input || disabled || useNumPad) return;
    if (input.isFocused?.()) {
      if (Keyboard.isVisible?.()) return;
      input.blur();
      setTimeout(() => inputRef.current?.focus(), 0);
      return;
    }
    input.focus();
  }, [disabled, useNumPad]);

  useImperativeHandle(ref, () => ({
    focus: focusInput,
    blur: () => inputRef.current?.blur(),
    clear: () => onChange(''),
  }), [focusInput, onChange]);

  // Deferred autoFocus: wait for the surrounding modal / sheet to finish
  // showing and for running animations, then focus.
  useEffect(() => {
    if (!autoFocus || useNumPad || disabled || !overlayShown) return undefined;
    const task = InteractionManager.runAfterInteractions(() => focusInput());
    return () => task.cancel();
    // Only when it becomes possible to focus, not on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFocus, overlayShown]);

  return (
    <View testID={testID} style={{ gap: theme.spacing.lg }}>
      <View style={{ position: 'relative' }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={slotsLabel(code.length, length)}
          accessibilityState={{ disabled }}
          disabled={disabled}
          onPress={focusInput}
          style={[LTR, { flexDirection: 'row', justifyContent: 'center', gap: theme.spacing.sm }]}
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
                <Text weight="bold" internalStyle={{ fontSize: theme.typography.fontSize.xl, lineHeight: theme.typography.lineHeight.xl }}
                  value={digit ? (secure ? '•' : digit) : ''}
                />
              </View>
            );
          })}
        </Pressable>

        <TextInput
          ref={inputRef}
          value={code}
          onChangeText={update}
          keyboardType="number-pad"
          inputMode="numeric"
          textContentType="oneTimeCode"
          autoComplete="one-time-code"
          accessibilityLabel={inputAccessibilityLabel}
          accessibilityState={{ disabled }}
          editable={!disabled}
          showSoftInputOnFocus={!useNumPad}
          {...(useNumPad ? { accessibilityElementsHidden: true, importantForAccessibility: 'no-hide-descendants' as const } : {})}
          caretHidden
          contextMenuHidden={false}
          selectionColor="transparent"
          onPressIn={() => {
            // Tapping an input RN already treats as focused would not reopen
            // the keyboard on Android.
            if (inputRef.current?.isFocused?.() && !Keyboard.isVisible?.()) focusInput();
          }}
          style={useNumPad
            ? { position: 'absolute', width: theme.spacing.xs, height: theme.spacing.xs, opacity: theme.opacity.invisible }
            // Laid over the slots (transparent text, still hittable: iOS ignores
            // touches on views with opacity 0) so long-press offers Paste.
            : [StyleSheet.absoluteFill, { color: 'transparent', backgroundColor: 'transparent', fontSize: 1 }]}
        />
      </View>

      {errorText ? (
        <Text accessibilityRole="alert" variant="bodySmall" tone="error" align="center" value={errorText} />
      ) : null}

      {useNumPad ? (
        <View style={LTR}>
          <NumPad value={code} onChange={update} maxLength={length} disabled={disabled} />
        </View>
      ) : null}
    </View>
  );
}));
