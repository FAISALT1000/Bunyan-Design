import { useCallback, useMemo } from 'react';
import { useToast } from '../../components/Toast';
import { useText, type TextValue } from '../../i18n';
import type { StatusKind } from './StatusIcon';

export interface StatusToastOptions {
  status: StatusKind;
  title: TextValue;
  subtitle?: TextValue;
  action?: { title: TextValue; onPress: () => void };
  /** Milliseconds; default 4000 (pending stays until updated). */
  duration?: number;
}

export interface StatusToastHandle {
  id: number;
  update: (options: Partial<StatusToastOptions>) => void;
  dismiss: () => void;
}

export interface StatusRunTexts<T> {
  pending: TextValue;
  success: TextValue | ((result: T) => TextValue);
  error: TextValue | ((error: unknown) => TextValue);
  /** Subtitles per stage. */
  pendingSubtitle?: TextValue;
}

/**
 * Status toasts that can change in place (needs `ToastProvider`).
 *
 * ```tsx
 * const status = useStatusToast();
 * const t = status.show({ status: 'pending', title: 'Uploading…' });
 * t.update({ status: 'success', title: 'Uploaded' });
 *
 * await status.run(saveProfile(values), { pending: 'Saving…', success: 'Saved', error: e => String(e) });
 * ```
 */
export function useStatusToast() {
  const toast = useToast();
  const t = useText();

  const toToast = useCallback((options: Partial<StatusToastOptions>) => ({
    ...(options.status ? { status: options.status } : {}),
    ...(options.title !== undefined ? { message: t(options.title) ?? '' } : {}),
    ...(options.subtitle !== undefined ? { subtitle: t(options.subtitle) ?? '' } : {}),
    ...(options.action ? { actionLabel: t(options.action.title) ?? '', onAction: options.action.onPress } : {}),
    ...(options.duration !== undefined
      ? { duration: options.duration }
      : options.status && options.status !== 'pending' ? { duration: 4000 } : {}),
  }), [t]);

  const show = useCallback((options: StatusToastOptions): StatusToastHandle => {
    const id = toast.showToast({ message: '', ...toToast(options) });
    return {
      id,
      update: next => toast.updateToast(id, toToast(next)),
      dismiss: () => toast.dismissToast(id),
    };
  }, [toast, toToast]);

  const run = useCallback(async <T,>(work: Promise<T> | (() => Promise<T>), texts: StatusRunTexts<T>): Promise<T> => {
    const handle = show({
      status: 'pending',
      title: texts.pending,
      ...(texts.pendingSubtitle ? { subtitle: texts.pendingSubtitle } : {}),
    });
    try {
      const result = await (typeof work === 'function' ? work() : work);
      handle.update({ status: 'success', title: typeof texts.success === 'function' ? texts.success(result) : texts.success, subtitle: '' });
      return result;
    } catch (error) {
      handle.update({ status: 'error', title: typeof texts.error === 'function' ? texts.error(error) : texts.error, subtitle: '' });
      throw error;
    }
  }, [show]);

  return useMemo(() => ({ show, run, dismiss: toast.dismissToast }), [run, show, toast.dismissToast]);
}
