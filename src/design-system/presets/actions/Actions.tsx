import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Inline } from '../../base/Inline';
import { Stack } from '../../base/Stack';
import { useText, type TextValue } from '../../i18n';
import { useStrings } from '../../i18n/strings';
import { Button, type ButtonProps } from '../../components/Button';
import type { ComponentSize } from '../../utilities/styles';
import { useActionButton } from '../cards/useActionButton';
import type { PresetAction } from '../shared';

export interface DoubleButtonsProps {
  /** Main action. Default variant `'primary'` (`'danger'` for destructive). */
  primary: PresetAction;
  /** Second action. Default variant `'ghost'` (stacked) or `'outline'` (row). */
  secondary?: PresetAction | false | null;
  /** Third action, stacked layout only. Default variant `'link'`. */
  tertiary?: PresetAction | false | null;
  /**
   * `'stacked'` (default): primary on top, full width, then secondary, tertiary.
   * `'row'`: secondary | primary side by side with equal widths (primary at the end).
   */
  layout?: 'stacked' | 'row';
  size?: ComponentSize;
  testID?: string;
}

/**
 * A primary + secondary (+ tertiary) action pair with fixed order, spacing and
 * widths, for forms, sheets, dialogs and result screens.
 *
 * ```tsx
 * <DoubleButtons
 *   primary={{ titleLocalize: 'phone.verify', onPress: submit, loading }}
 *   secondary={{ titleLocalize: 'common.cancel', onPress: cancel }}
 * />
 * ```
 */
export const DoubleButtons = memo(function DoubleButtons({ primary, secondary, tertiary, layout = 'stacked', size = 'medium', testID }: DoubleButtonsProps) {
  const renderAction = useActionButton();
  if (layout === 'row') {
    return (
      <Inline gap="md" alignItems="center" {...(testID ? { testID } : {})}>
        {secondary ? renderAction({ variant: 'outline', ...secondary }, { size, fill: true }) : null}
        {renderAction({ variant: 'primary', ...primary }, { size, fill: true })}
      </Inline>
    );
  }
  return (
    <Stack gap="sm" {...(testID ? { testID } : {})}>
      {renderAction({ variant: 'primary', ...primary }, { size, fullWidth: true })}
      {secondary ? renderAction({ variant: 'ghost', ...secondary }, { size, fullWidth: true }) : null}
      {tertiary ? renderAction({ variant: 'link', ...tertiary }, { size, fullWidth: true }) : null}
    </Stack>
  );
});

/**
 * Seconds left in a cooldown. `start(seconds)` (re)starts it; it stops at 0.
 *
 * ```ts
 * const { remaining, running, start } = useCountdown(60, { autoStart: true });
 * ```
 */
export function useCountdown(initialSeconds: number, { autoStart = false }: { autoStart?: boolean } = {}) {
  const [endsAt, setEndsAt] = useState<number | null>(() => (autoStart ? Date.now() + initialSeconds * 1000 : null));
  const [now, setNow] = useState(() => Date.now());
  const timer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  const start = useCallback((seconds: number = initialSeconds) => {
    setNow(Date.now());
    setEndsAt(Date.now() + Math.max(0, seconds) * 1000);
  }, [initialSeconds]);
  const stop = useCallback(() => setEndsAt(null), []);

  useEffect(() => {
    if (endsAt === null) return undefined;
    timer.current = setInterval(() => {
      const current = Date.now();
      setNow(current);
      if (current >= endsAt) {
        setEndsAt(null);
      }
    }, 250);
    return () => clearInterval(timer.current);
  }, [endsAt]);

  const remaining = endsAt === null ? 0 : Math.max(0, Math.ceil((endsAt - now) / 1000));
  return { remaining, running: remaining > 0, start, stop };
}

export interface CountdownButtonProps extends Omit<ButtonProps, 'title' | 'children' | 'onPress' | 'disabled'> {
  title?: TextValue;
  /** Called on press; the cooldown restarts after it resolves (a thrown error skips the restart). */
  onPress: () => unknown;
  /** Cooldown in seconds. Default 60. */
  seconds?: number;
  /** Start the cooldown when mounted (e.g. a code was just sent). Default true. */
  startOnMount?: boolean;
  /**
   * Overrides the cooldown once, e.g. from a `Retry-After` header. Changing it
   * restarts the countdown with this many seconds.
   */
  retryAfterSeconds?: number;
  /** Label while waiting; receives the seconds left. Default: "Resend in 42s" (translated). */
  countdownTitle?: (seconds: number) => TextValue;
  /** Translation key for the waiting label with a `%{seconds}` param. */
  countdownLocalize?: string;
  disabled?: boolean;
}

/**
 * A button disabled for N seconds with a live countdown label: resend codes,
 * rate-limited retries.
 */
export const CountdownButton = memo(function CountdownButton({
  title,
  onPress,
  seconds = 60,
  startOnMount = true,
  retryAfterSeconds,
  countdownTitle,
  countdownLocalize,
  disabled = false,
  variant = 'link',
  ...buttonProps
}: CountdownButtonProps) {
  const t = useText();
  const strings = useStrings();
  const { remaining, running, start } = useCountdown(seconds, { autoStart: startOnMount });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (retryAfterSeconds !== undefined) start(retryAfterSeconds);
  }, [retryAfterSeconds, start]);

  const waitingTitle = countdownLocalize
    ? t({ localeKey: countdownLocalize, params: { seconds: remaining }, fallback: strings('resendIn', { seconds: remaining }) })
    : countdownTitle
      ? t(countdownTitle(remaining))
      : strings('resendIn', { seconds: remaining });
  const label = running ? waitingTitle ?? '' : t(title) ?? strings('resend');

  return (
    <Button
      {...buttonProps}
      variant={variant}
      title={label}
      disabled={disabled || running}
      loading={busy}
      onPress={async () => {
        setBusy(true);
        try {
          await onPress();
          start(seconds);
        } catch {
          // Leave the button enabled so the user can retry.
        } finally {
          setBusy(false);
        }
      }}
    />
  );
});

