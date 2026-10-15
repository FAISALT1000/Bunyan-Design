import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { Stack } from '../../base/Stack';
import { useText, type TextValue } from '../../i18n';
import { BottomSheet } from '../../components/BottomSheet';
import { InputField } from '../../components/InputField';
import type { StandardInputFieldProps } from '../../components/InputField';
import { Modal } from '../../components/Modal';
import type { IconName } from '../../components/Icon';
import { Text } from '../../components/Text';
import { LineCard } from '../cards/LineCard';
import { ConfirmPhraseInput, phraseMatches } from '../forms/ConfirmPhraseInput';
import { useStrings } from '../../i18n/strings';

export interface ConfirmOptions {
  title: TextValue;
  message?: TextValue;
  /** Default `'Confirm'`. */
  confirmText?: TextValue;
  /** Default `'Cancel'`. */
  cancelText?: TextValue;
  /** Red confirm button for destructive actions. */
  danger?: boolean;
  /** Extra content under the message (e.g. the list of changes). */
  children?: React.ReactNode;
  /**
   * Runs when the user confirms. The confirm button shows a spinner until it
   * finishes; the promise then resolves `true`. If it throws, the dialog stays
   * open and shows the error, so the user can retry or cancel.
   */
  onConfirm?: () => unknown;
  /** Message for a failed `onConfirm`. Default: the error's message. */
  errorMessage?: (error: unknown) => TextValue | undefined;
}

export interface ActionSheetOption<V extends string = string> {
  value: V;
  title: TextValue;
  subtitle?: TextValue;
  icon?: IconName;
  destructive?: boolean;
  disabled?: boolean;
}

export interface ActionSheetOptions<V extends string = string> {
  title: TextValue;
  message?: TextValue;
  options: ReadonlyArray<ActionSheetOption<V> | false | null | undefined>;
}

export interface PromptOptions {
  title: TextValue;
  message?: TextValue;
  /** Field label. Default: the title. */
  label?: TextValue;
  initialValue?: string;
  placeholder?: TextValue;
  helperText?: TextValue;
  /** `InputField` type. Default `'text'` (`'password'` with `secureTextEntry`). */
  type?: StandardInputFieldProps['type'];
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  /** Lines for a multiline answer. Default 1. */
  numberOfLines?: number;
  confirmText?: TextValue;
  cancelText?: TextValue;
  /** Red confirm button. */
  danger?: boolean;
  /** Confirm stays disabled until the user types this phrase ("DELETE"). */
  confirmPhrase?: string | { phrase: string; caseSensitive?: boolean };
  /** Return an error message to block confirming. */
  validate?: (value: string) => TextValue | undefined;
}

type Request = { id: number } & (
  | { kind: 'confirm'; options: ConfirmOptions; resolve: (value: boolean) => void }
  | { kind: 'sheet'; options: ActionSheetOptions; resolve: (value: string | null) => void }
  | { kind: 'prompt'; options: PromptOptions; resolve: (value: string | null) => void }
);
type NewRequest = Request extends infer R ? (R extends Request ? Omit<R, 'id'> : never) : never;

interface OverlayContextValue {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  actionSheet: <V extends string>(options: ActionSheetOptions<V>) => Promise<V | null>;
  prompt: (options: PromptOptions) => Promise<string | null>;
}

const OverlayContext = createContext<OverlayContextValue | null>(null);

function PromptBody({ request, onDone }: { request: Extract<Request, { kind: 'prompt' }>; onDone: (value: string | null) => void }) {
  const t = useText();
  const strings = useStrings();
  const { options } = request;
  const [value, setValue] = useState(options.initialValue ?? '');
  const [error, setError] = useState<string>();
  const phrase = typeof options.confirmPhrase === 'string' ? { phrase: options.confirmPhrase } : options.confirmPhrase;
  const matched = phrase ? phraseMatches(value, phrase.phrase, phrase.caseSensitive ?? true) : true;
  const submit = () => {
    if (!matched) return;
    const message = options.validate?.(value);
    if (message) {
      setError(t(message));
      return;
    }
    onDone(value);
  };
  const messageText = t(options.message);
  const helper = t(options.helperText);
  const titleText = t(options.title) ?? '';
  return (
    <Modal
      visible
      size="small"
      title={titleText}
      {...(messageText ? { description: messageText } : {})}
      onClose={() => onDone(null)}
      primaryAction={{
        label: t(options.confirmText) ?? strings('ok'),
        onPress: submit,
        disabled: !matched,
        ...(options.danger ? { variant: 'danger' as const } : {}),
      }}
      secondaryAction={{ label: t(options.cancelText) ?? strings('cancel'), onPress: () => onDone(null), variant: 'ghost' }}
    >
      {phrase ? (
        <ConfirmPhraseInput
          phrase={phrase.phrase}
          caseSensitive={phrase.caseSensitive ?? true}
          value={value}
          onChangeText={next => {
            setValue(next);
            setError(undefined);
          }}
          {...(options.label ? { label: options.label } : {})}
          {...(helper ? { helperText: helper } : {})}
        />
      ) : (
        <InputField
          type={options.secureTextEntry ? 'password' : options.type ?? 'text'}
          label={t(options.label) ?? titleText}
          value={value}
          onChangeText={next => {
            setValue(next);
            setError(undefined);
          }}
          autoFocus
          {...(options.numberOfLines && options.numberOfLines > 1 ? { numberOfLines: options.numberOfLines } : { onSubmitEditing: submit })}
          {...(options.autoCapitalize ? { autoCapitalize: options.autoCapitalize } : {})}
          {...(options.placeholder ? { placeholder: t(options.placeholder) ?? '' } : {})}
          {...(helper ? { helperText: helper } : {})}
          {...(error ? { errorText: error } : {})}
        />
      )}
    </Modal>
  );
}

function ConfirmBody({ request, onDone }: { request: Extract<Request, { kind: 'confirm' }>; onDone: (value: boolean) => void }) {
  const t = useText();
  const strings = useStrings();
  const { options } = request;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const messageText = t(options.message);
  const confirm = async () => {
    if (!options.onConfirm) {
      onDone(true);
      return;
    }
    setBusy(true);
    setError(undefined);
    try {
      await options.onConfirm();
      onDone(true);
    } catch (failure) {
      const message = options.errorMessage?.(failure)
        ?? (failure instanceof Error ? failure.message : strings('somethingWentWrong'));
      setError(t(message) ?? strings('somethingWentWrong'));
      setBusy(false);
    }
  };
  return (
    <Modal
      visible
      size="small"
      title={t(options.title) ?? ''}
      {...(messageText ? { description: messageText } : {})}
      dismissible={!busy}
      onClose={() => onDone(false)}
      primaryAction={{
        label: t(options.confirmText) ?? strings('confirm'),
        onPress: () => void confirm(),
        loading: busy,
        ...(options.danger ? { variant: 'danger' as const } : {}),
      }}
      secondaryAction={{ label: t(options.cancelText) ?? strings('cancel'), onPress: () => onDone(false), variant: 'ghost', disabled: busy }}
    >
      {options.children || error ? (
        <Stack gap="md">
          {options.children}
          {error ? <Text value={error} variant="bodySmall" tone="error" accessibilityRole="alert" /> : null}
        </Stack>
      ) : null}
    </Modal>
  );
}

/**
 * Hosts promise-based dialogs: `useConfirm()`, `useActionSheet()`, `usePrompt()`.
 * Put it once near the root, inside the theme / localization providers.
 */
export function OverlayProvider({ children }: { children: React.ReactNode }) {
  const t = useText();
  const strings = useStrings();
  const [queue, setQueue] = useState<Request[]>([]);
  const queueRef = useRef(queue);
  queueRef.current = queue;
  const current = queue[0];

  const nextId = useRef(0);
  const push = useCallback((request: NewRequest) => {
    const withId = { ...request, id: ++nextId.current } as Request;
    setQueue(items => [...items, withId]);
  }, []);
  const finish = useCallback((value: unknown) => {
    const head = queueRef.current[0];
    if (!head) return;
    (head.resolve as (value: unknown) => void)(value);
    setQueue(items => items.slice(1));
  }, []);

  const value = useMemo<OverlayContextValue>(() => ({
    confirm: options => new Promise<boolean>(resolve => push({ kind: 'confirm', options, resolve })),
    actionSheet: <V extends string>(options: ActionSheetOptions<V>) =>
      new Promise<V | null>(resolve => push({ kind: 'sheet', options, resolve: resolve as (value: string | null) => void })),
    prompt: options => new Promise<string | null>(resolve => push({ kind: 'prompt', options, resolve })),
  }), [push]);

  let overlay: React.ReactNode = null;
  if (current?.kind === 'confirm') {
    overlay = <ConfirmBody key={current.id} request={current} onDone={finish} />;
  } else if (current?.kind === 'sheet') {
    const { options } = current;
    const messageText = t(options.message);
    const items = options.options.filter(Boolean) as ActionSheetOption[];
    overlay = (
      <BottomSheet visible title={t(options.title) ?? ''} {...(messageText ? { description: messageText } : {})} onClose={() => finish(null)}>
        <Stack gap="none">
          {items.map(option => (
            <LineCard
              key={option.value}
              lines={option.subtitle ? 2 : 1}
              variant="plain"
              title={option.title}
              {...(option.subtitle ? { subtitle: option.subtitle } : {})}
              {...(option.icon ? { icon: option.icon } : {})}
              {...(option.destructive ? { destructive: true } : {})}
              {...(option.disabled ? { disabled: true } : {})}
              onPress={() => finish(option.value)}
            />
          ))}
        </Stack>
      </BottomSheet>
    );
  } else if (current?.kind === 'prompt') {
    overlay = <PromptBody key={current.id} request={current} onDone={finish} />;
  }

  return (
    <OverlayContext.Provider value={value}>
      {children}
      {overlay}
    </OverlayContext.Provider>
  );
}

function useOverlay(hook: string) {
  const context = useContext(OverlayContext);
  if (!context) throw new Error(`${hook} must be used inside <OverlayProvider>.`);
  return context;
}

/** `const confirm = useConfirm(); if (await confirm({ title: 'Delete?', danger: true })) …` */
export const useConfirm = () => useOverlay('useConfirm').confirm;

/** `const choice = await actionSheet({ title, options: [{ value: 'edit', title: 'Edit', icon: 'edit' }] })` → value or null. */
export const useActionSheet = () => useOverlay('useActionSheet').actionSheet;

/** `const name = await prompt({ title: 'Rename', label: 'Name', initialValue })` → text or null. */
export const usePrompt = () => useOverlay('usePrompt').prompt;
