import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { Stack } from '../../base/Stack';
import { useText, type TextValue } from '../../i18n';
import { BottomSheet } from '../../components/BottomSheet';
import { InputField } from '../../components/InputField';
import type { StandardInputFieldProps } from '../../components/InputField';
import { Modal } from '../../components/Modal';
import type { IconName } from '../../components/Icon';
import { LineCard } from '../cards/LineCard';

export interface ConfirmOptions {
  title: TextValue;
  message?: TextValue;
  /** Default `'Confirm'`. */
  confirmText?: TextValue;
  /** Default `'Cancel'`. */
  cancelText?: TextValue;
  /** Red confirm button for destructive actions. */
  danger?: boolean;
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
  label: TextValue;
  initialValue?: string;
  placeholder?: TextValue;
  /** `InputField` type. Default `'text'`. */
  type?: StandardInputFieldProps['type'];
  confirmText?: TextValue;
  cancelText?: TextValue;
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
  const { options } = request;
  const [value, setValue] = useState(options.initialValue ?? '');
  const [error, setError] = useState<string>();
  const submit = () => {
    const message = options.validate?.(value);
    if (message) {
      setError(t(message));
      return;
    }
    onDone(value);
  };
  const messageText = t(options.message);
  return (
    <Modal
      visible
      size="small"
      title={t(options.title) ?? ''}
      {...(messageText ? { description: messageText } : {})}
      onClose={() => onDone(null)}
      primaryAction={{ label: t(options.confirmText ?? 'OK') ?? 'OK', onPress: submit }}
      secondaryAction={{ label: t(options.cancelText ?? 'Cancel') ?? 'Cancel', onPress: () => onDone(null), variant: 'ghost' }}
    >
      <InputField
        type={options.type ?? 'text'}
        label={t(options.label) ?? ''}
        value={value}
        onChangeText={next => {
          setValue(next);
          setError(undefined);
        }}
        autoFocus
        onSubmitEditing={submit}
        {...(options.placeholder ? { placeholder: t(options.placeholder) ?? '' } : {})}
        {...(error ? { errorText: error } : {})}
      />
    </Modal>
  );
}

/**
 * Hosts promise-based dialogs: `useConfirm()`, `useActionSheet()`, `usePrompt()`.
 * Put it once near the root, inside the theme / localization providers.
 */
export function OverlayProvider({ children }: { children: React.ReactNode }) {
  const t = useText();
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
    const { options } = current;
    const messageText = t(options.message);
    overlay = (
      <Modal
        visible
        size="small"
        title={t(options.title) ?? ''}
        {...(messageText ? { description: messageText } : {})}
        onClose={() => finish(false)}
        primaryAction={{
          label: t(options.confirmText ?? 'Confirm') ?? 'Confirm',
          onPress: () => finish(true),
          ...(options.danger ? { variant: 'danger' as const } : {}),
        }}
        secondaryAction={{ label: t(options.cancelText ?? 'Cancel') ?? 'Cancel', onPress: () => finish(false), variant: 'ghost' }}
      >
        {null}
      </Modal>
    );
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
