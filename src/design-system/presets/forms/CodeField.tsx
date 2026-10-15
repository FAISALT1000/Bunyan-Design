import React, { forwardRef, memo } from 'react';
import { Stack } from '../../base/Stack';
import { useText, type TextValue } from '../../i18n';
import { OTPInput, type OTPInputHandle, type OTPInputProps } from '../../components/OTPInput';
import { CountdownButton } from '../actions/Actions';

export interface CodeFieldResend {
  /** Sends a new code; the cooldown restarts after it resolves. */
  onPress: () => unknown;
  /** Seconds before the user may resend. Default 60. */
  cooldownSeconds?: number;
  /** Start the cooldown on mount (a code was just sent). Default true. */
  startOnMount?: boolean;
  /** Overrides the cooldown once (e.g. `Retry-After`). */
  retryAfterSeconds?: number;
  label?: TextValue;
  labelLocalize?: string;
  /** Translation key of the waiting label with `%{seconds}`. */
  countdownLocalize?: string;
}

export interface CodeFieldProps extends Omit<OTPInputProps, 'errorText' | 'error'> {
  /** Error text under the slots (wrong or expired code). */
  errorText?: TextValue;
  /** Built-in "Resend code" button with a countdown. */
  resend?: CodeFieldResend;
}

/**
 * One-time code entry with autofill (`oneTimeCode` / `sms-otp`), paste, error
 * text and a Resend button with countdown. Default length 6.
 *
 * ```tsx
 * <CodeField value={code} onChange={setCode} onComplete={verify} errorText={error}
 *   resend={{ onPress: resend, cooldownSeconds: 60, labelLocalize: 'recovery.resend', countdownLocalize: 'recovery.resendIn' }} />
 * ```
 */
export const CodeField = memo(forwardRef<OTPInputHandle, CodeFieldProps>(function CodeField(
  { errorText, resend, length = 6, testID, ...otpProps },
  ref,
) {
  const t = useText();
  const error = t(errorText);
  return (
    <Stack gap="md" alignItems="center" {...(testID ? { testID } : {})}>
      <OTPInput
        ref={ref}
        length={length}
        {...otpProps}
        {...(error ? { errorText: error, error: true } : {})}
      />
      {resend ? (
        <CountdownButton
          onPress={resend.onPress}
          seconds={resend.cooldownSeconds ?? 60}
          startOnMount={resend.startOnMount ?? true}
          {...(resend.retryAfterSeconds !== undefined ? { retryAfterSeconds: resend.retryAfterSeconds } : {})}
          {...(resend.labelLocalize
            ? { title: { localeKey: resend.labelLocalize, fallback: t(resend.label) ?? resend.labelLocalize } }
            : resend.label ? { title: resend.label } : {})}
          {...(resend.countdownLocalize ? { countdownLocalize: resend.countdownLocalize } : {})}
          {...(testID ? { testID: `${testID}-resend` } : {})}
        />
      ) : null}
    </Stack>
  );
}));
