/**
 * Gaps reported by StreamSpy (0.0.6): bugs, missing props and new presets.
 */
import React from 'react';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { StyleSheet } from '../src/design-system/components/RNTheme/native';
import {
  ActionCard,
  Alert,
  Badge,
  Button,
  CodeBlock,
  CodeField,
  ConfirmPhraseInput,
  CountBadge,
  CountdownButton,
  DataState,
  DesignSystemLocalizationProvider,
  DetailsCard,
  DoubleButtons,
  FilterChips,
  Fill,
  Form,
  Heading,
  IconBox,
  IconButton,
  InputField,
  OverlayProvider,
  Rating,
  Row,
  ScreenContent,
  Section,
  SettingsGroup,
  Skeleton,
  StepperHeader,
  Tabs,
  Text,
  ThemeProvider,
  ThreeLineCard,
  TimelineEvent,
  TwoLineCard,
  bunyanTranslations,
  formatDate,
  lightTheme,
  phraseMatches,
  useConfirm,
  usePrompt,
} from '../src';
import { renderWithTheme } from './test-utils';

const flat = (element: { props: { style?: unknown } }) =>
  StyleSheet.flatten(element.props.style as never) as Record<string, any>;

describe('bugs', () => {
  it('SettingsGroup items with a key do not spread `key` into JSX', () => {
    const errors = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    renderWithTheme(<SettingsGroup items={[{ key: 'lang', title: 'Language' }, { key: 'theme', title: 'Theme' }]} />);
    expect(errors.mock.calls.flat().join(' ')).not.toMatch(/"key" prop is being spread/);
    errors.mockRestore();
  });

  it('validate-translations reports real missing keys only', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bunyan-tr-'));
    fs.writeFileSync(path.join(dir, 'en.json'), JSON.stringify({ a: { b: 'x' }, c: 'y' }));
    fs.writeFileSync(path.join(dir, 'ar.json'), JSON.stringify({ a: { b: 'س' } }));
    const result = spawnSync(process.execPath, ['scripts/validate-translations.mjs', path.join(dir, 'en.json'), path.join(dir, 'ar.json')], { encoding: 'utf8' });
    const report = JSON.parse(result.stdout);
    expect(report.missingByLocale).toEqual({ en: [], ar: ['c'] });
  });

  it('formatDate accepts dateStyle / timeStyle', () => {
    expect(formatDate(new Date(2026, 9, 15, 9, 5), { intl: { dateStyle: 'medium', timeStyle: 'short' } })).toMatch(/2026/);
  });
});

describe('translated defaults', () => {
  it('uses Arabic built-in labels for Arabic locales and app overrides under bunyan.*', () => {
    const { rerender } = renderWithTheme(<InputField type="password" label="كلمة المرور" value="" onChangeText={jest.fn()} />, { locale: 'ar', direction: 'rtl' });
    expect(screen.getByRole('button', { name: 'إظهار كلمة المرور' })).toBeTruthy();
    rerender(<InputField type="password" label="Password" value="" onChangeText={jest.fn()} showPasswordLabel="Reveal" />);
    expect(screen.getByRole('button', { name: 'Reveal' })).toBeTruthy();

    render(
      <ThemeProvider>
        <DesignSystemLocalizationProvider<'en'> locale="en" translations={{ en: { bunyan: { ...bunyanTranslations.en.bunyan, tryAgain: 'Retry now' } } }}>
          <DataState error={new Error('x')} onRetry={jest.fn()}>{() => null}</DataState>
        </DesignSystemLocalizationProvider>
      </ThemeProvider>,
    );
    expect(screen.getByRole('button', { name: 'Retry now' })).toBeTruthy();
  });
});

describe('component props', () => {
  it('Heading localize and selectable; Text mono / micro / transform', () => {
    render(
      <ThemeProvider>
        <DesignSystemLocalizationProvider<'en'> locale="en" translations={{ en: { invite: { title: 'Your invite code' } } }}>
          <Heading localize="invite.title" selectable />
          <Text value="AB-12" mono variant="micro" transform="uppercase" testID="code" />
        </DesignSystemLocalizationProvider>
      </ThemeProvider>,
    );
    expect(screen.getByText('Your invite code').props.selectable).toBe(true);
    const code = flat(screen.getByTestId('code'));
    expect(code.fontFamily).toBe(lightTheme.typography.fontFamily.mono);
    expect(code.fontSize).toBe(lightTheme.typography.fontSize.xxs);
    expect(code.textTransform).toBe('uppercase');
  });

  it('InputField textAlign end follows the reading direction', () => {
    renderWithTheme(<InputField testID="ar" label="العنوان" value="" onChangeText={jest.fn()} textAlign="end" />, { direction: 'rtl', locale: 'ar' });
    expect(flat(screen.getByTestId('ar')).textAlign).toBe('left');
  });

  it('tone aliases, IconBox inverse and Badge icon', () => {
    renderWithTheme(
      <>
        <Badge label="Info" tone="info" icon="info" testID="badge" />
        <Alert title="Heads up" tone="info" actionLabel="Keep" onAction={jest.fn()} secondaryActionLabel="Discard" onSecondaryAction={jest.fn()} />
        <IconBox name="grid" tone="inverse" size="lg" testID="tile" />
      </>,
    );
    expect(screen.getByText('Info')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Discard' })).toBeTruthy();
    expect(flat(screen.getByTestId('tile'))).toMatchObject({ width: lightTheme.tileSize.lg, backgroundColor: lightTheme.color.primary.default });
  });

  it('IconButton mirrors only directional icons, supports tonal, numeric size and a11y state', () => {
    renderWithTheme(
      <>
        <IconButton icon="copy" accessibilityLabel="Copy" variant="tonal" size={44} accessibilityState={{ checked: true }} accessibilityRole="checkbox" />
        <IconButton icon="arrow-left" accessibilityLabel="Back" />
      </>,
      { direction: 'rtl', locale: 'ar' },
    );
    const copy = screen.getByRole('checkbox', { name: 'Copy' });
    expect(copy.props.accessibilityState).toMatchObject({ checked: true });
    expect(flat(copy)).toMatchObject({ width: 44, backgroundColor: lightTheme.color.primary.subtle });
  });

  it('Tabs show count badges and Button fill grows in a row', () => {
    renderWithTheme(
      <>
        <Tabs value="open" onValueChange={jest.fn()} items={[{ value: 'open', label: 'Open', badge: 3 }, { value: 'done', label: 'Done', badge: { dot: true } }]} />
        <Row><Button title="Send" fill onPress={jest.fn()} /></Row>
      </>,
    );
    expect(screen.getByText('3')).toBeTruthy();
    expect(flat(screen.getByRole('button', { name: 'Send' })).flex).toBe(1);
  });
});

describe('preset additions', () => {
  it('line cards: badges, unread count, tone, footer, actions and long press', () => {
    const onAccept = jest.fn();
    const onLongPress = jest.fn();
    renderWithTheme(
      <ThreeLineCard
        testID="ticket"
        title="SUP-000123"
        subtitle="Login fails"
        description="Long text"
        descriptionLines={1}
        badges={[{ label: 'Open', tone: 'primary' }, { label: 'Overdue', tone: 'error' }]}
        unreadCount={4}
        tone="warning"
        footer={<Text value="Assigned to you" />}
        actions={[{ title: 'Accept', onPress: onAccept }, false]}
        onLongPress={onLongPress}
      />,
    );
    expect(screen.getByText('Overdue')).toBeTruthy();
    expect(screen.getByText('4')).toBeTruthy();
    expect(screen.getByText('Assigned to you')).toBeTruthy();
    fireEvent.press(screen.getByRole('button', { name: 'Accept' }));
    expect(onAccept).toHaveBeenCalled();
    fireEvent(screen.getByRole('button', { name: /SUP-000123/ }), 'longPress');
    expect(onLongPress).toHaveBeenCalled();
    expect(flat(screen.getByTestId('ticket')).backgroundColor).toBe(lightTheme.color.warning.subtle);
  });

  it('DetailsCard rows can be pressed; Section has a right slot; Row style and Fill', () => {
    const onOpen = jest.fn();
    renderWithTheme(
      <>
        <DetailsCard rows={[{ label: 'Customer', value: 'Sara', onPress: onOpen }]} />
        <Section title="Extractor server" right={<Badge label="Online" tone="success" />} />
        <Row testID="row" style={{ marginTop: 4 }}><Fill testID="fill"><Text value="x" /></Fill></Row>
      </>,
    );
    fireEvent.press(screen.getByRole('button', { name: 'Customer' }));
    expect(onOpen).toHaveBeenCalled();
    expect(screen.getByText('Online')).toBeTruthy();
    expect(flat(screen.getByTestId('row')).marginTop).toBe(4);
    expect(flat(screen.getByTestId('fill')).flex).toBe(1);
  });

  it('ActionCard loading blocks presses; Skeleton presets render', () => {
    const onPress = jest.fn();
    renderWithTheme(
      <>
        <ActionCard icon="scan" title="Extract" loading onPress={onPress} />
        <Skeleton preset="TwoLineCard" accessibilityLabel="Loading tickets" />
      </>,
    );
    fireEvent.press(screen.getByRole('button', { name: /Extract/ }));
    expect(onPress).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Loading tickets')).toBeTruthy();
  });

  it('DataState: renderError, translated loading label and refreshing', () => {
    const { rerender } = renderWithTheme(
      <DataState loading loadingLabel="Loading tickets">{() => null}</DataState>,
    );
    expect(screen.getByLabelText('Loading tickets')).toBeTruthy();
    rerender(<DataState error={new Error('boom')} renderError={error => <Text value={`Request failed: ${(error as Error).message}`} />}>{() => null}</DataState>);
    expect(screen.getByText('Request failed: boom')).toBeTruthy();
    rerender(<DataState data={['a']} refreshing>{data => <Text value={data.join()} />}</DataState>);
    expect(screen.getByText('a')).toBeTruthy();
    expect(screen.getByRole('progressbar')).toBeTruthy();
  });
});

describe('dialogs', () => {
  function Harness({ action, onResult }: { action: () => Promise<unknown>; onResult: (value: unknown) => void }) {
    const confirm = useConfirm();
    const prompt = usePrompt();
    return (
      <>
        <TwoLineCard title="Delete" onPress={() => void confirm({ title: 'Delete table?', danger: true, confirmText: 'Delete', children: <Text value="3 changes" />, onConfirm: action }).then(onResult)} />
        <TwoLineCard title="Kill" onPress={() => void prompt({ title: 'Kill all sessions', confirmPhrase: { phrase: 'KILL_ALL', caseSensitive: false }, danger: true, confirmText: 'Kill' }).then(onResult)} />
      </>
    );
  }

  it('useConfirm keeps the dialog open with a spinner, shows errors, then resolves', async () => {
    const onResult = jest.fn();
    let attempt = 0;
    const action = jest.fn(() => (++attempt === 1 ? Promise.reject(new Error('Server busy')) : Promise.resolve()));
    renderWithTheme(<OverlayProvider><Harness action={action} onResult={onResult} /></OverlayProvider>);
    fireEvent.press(screen.getByRole('button', { name: 'Delete' }));
    expect(await screen.findByText('3 changes')).toBeTruthy();
    await act(async () => {
      fireEvent.press(screen.getAllByRole('button', { name: 'Delete' }).at(-1)!);
    });
    expect(await screen.findByText('Server busy')).toBeTruthy();
    expect(onResult).not.toHaveBeenCalled();
    await act(async () => {
      fireEvent.press(screen.getAllByRole('button', { name: 'Delete' }).at(-1)!);
    });
    await waitFor(() => expect(onResult).toHaveBeenCalledWith(true));
  });

  it('usePrompt with confirmPhrase enables confirm only when the phrase matches', async () => {
    const onResult = jest.fn();
    renderWithTheme(<OverlayProvider><Harness action={() => Promise.resolve()} onResult={onResult} /></OverlayProvider>);
    fireEvent.press(screen.getByRole('button', { name: 'Kill' }));
    const field = await screen.findByLabelText(/Type KILL_ALL to confirm/);
    fireEvent.press(screen.getAllByRole('button', { name: 'Kill' }).at(-1)!);
    expect(onResult).not.toHaveBeenCalled();
    fireEvent.changeText(field, 'kill_all');
    fireEvent.press(screen.getAllByRole('button', { name: 'Kill' }).at(-1)!);
    await waitFor(() => expect(onResult).toHaveBeenCalledWith('kill_all'));
    expect(phraseMatches(' DELETE ', 'DELETE')).toBe(true);
  });
});

describe('new components', () => {
  it('DoubleButtons stacked and row', () => {
    const verify = jest.fn();
    const cancel = jest.fn();
    const { rerender } = renderWithTheme(<DoubleButtons primary={{ title: 'Verify', onPress: verify }} secondary={{ title: 'Cancel', onPress: cancel }} tertiary={{ title: 'Resend', onPress: jest.fn() }} />);
    fireEvent.press(screen.getByRole('button', { name: 'Verify' }));
    expect(verify).toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Resend' })).toBeTruthy();
    rerender(<DoubleButtons layout="row" primary={{ title: 'Verify', onPress: verify }} secondary={{ title: 'Cancel', onPress: cancel }} />);
    expect(flat(screen.getByRole('button', { name: 'Cancel' })).flex).toBe(1);
  });

  it('CountdownButton waits, then calls onPress and restarts', async () => {
    jest.useFakeTimers();
    const onPress = jest.fn();
    renderWithTheme(<CountdownButton seconds={3} onPress={onPress} title="Resend code" />);
    expect(screen.getByText('Resend in 3s')).toBeTruthy();
    act(() => jest.advanceTimersByTime(3200));
    fireEvent.press(screen.getByRole('button', { name: 'Resend code' }));
    await act(async () => { await Promise.resolve(); });
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Resend in 3s')).toBeTruthy();
    jest.useRealTimers();
  });

  it('CodeField shows the error and a resend countdown', () => {
    renderWithTheme(<CodeField value="12" onChange={jest.fn()} errorText="Wrong code" resend={{ onPress: jest.fn(), cooldownSeconds: 30 }} />);
    expect(screen.getByText('Wrong code')).toBeTruthy();
    expect(screen.getByText('Resend in 30s')).toBeTruthy();
    expect(screen.getByLabelText('Verification code input').props.autoComplete).toBe('one-time-code');
  });

  it('FilterChips single and multi select with counts', () => {
    const onChange = jest.fn();
    const onMulti = jest.fn();
    renderWithTheme(
      <>
        <FilterChips value="mine" onChange={onChange} items={[{ value: 'mine', label: 'Mine', count: 4 }, { value: 'open', label: 'Open' }]} />
        <FilterChips multiple values={['a']} onChange={onMulti} items={[{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }]} />
      </>,
    );
    expect(screen.getByText('4')).toBeTruthy();
    fireEvent.press(screen.getByRole('radio', { name: 'Open' }));
    expect(onChange).toHaveBeenCalledWith('open');
    fireEvent.press(screen.getByRole('checkbox', { name: 'B' }));
    expect(onMulti).toHaveBeenCalledWith(['a', 'b']);
  });

  it('Rating is adjustable and has a compact read-only form', () => {
    const onChange = jest.fn();
    renderWithTheme(
      <>
        <Rating value={3} onChange={onChange} testID="rate" />
        <Rating value={4.6} count={120} compact />
      </>,
    );
    fireEvent.press(screen.getByTestId('rate-star-5'));
    expect(onChange).toHaveBeenCalledWith(5);
    fireEvent(screen.getByTestId('rate'), 'accessibilityAction', { nativeEvent: { actionName: 'decrement' } });
    expect(onChange).toHaveBeenLastCalledWith(2);
    expect(screen.getByText('4.6 (120)')).toBeTruthy();
  });

  it('CodeBlock, TimelineEvent, StepperHeader, ConfirmPhraseInput, CountBadge', () => {
    const onCopy = jest.fn();
    const onMerged = jest.fn();
    const onMatch = jest.fn();
    function Phrase() {
      const [value, setValue] = React.useState('');
      return <ConfirmPhraseInput phrase="DELETE" value={value} onChangeText={setValue} onMatchChange={onMatch} />;
    }
    renderWithTheme(
      <>
        <CodeBlock title="Log" value='{"ok":true}' onCopy={onCopy} />
        <TimelineEvent text="Merged into SUP-000123" icon="link" onPress={onMerged} />
        <StepperHeader step={2} total={3} title="Try this first" onBack={jest.fn()} />
        <Phrase />
        <CountBadge count={120} />
      </>,
    );
    fireEvent.press(screen.getByRole('button', { name: 'Copy Log' }));
    return waitFor(() => expect(onCopy).toHaveBeenCalledWith('{"ok":true}')).then(() => {
      fireEvent.press(screen.getByRole('link', { name: 'Merged into SUP-000123' }));
      expect(onMerged).toHaveBeenCalled();
      expect(screen.getAllByText('Step 2 of 3').length).toBeGreaterThan(0);
      fireEvent.changeText(screen.getByLabelText(/Type DELETE to confirm/), 'DELETE');
      expect(onMatch).toHaveBeenCalledWith(true);
      expect(screen.getByText('99+')).toBeTruthy();
    });
  });
});

describe('Form additions', () => {
  it('OTP onComplete, Select noneOption, reorderable RepeatedControls and cancelButton', async () => {
    const onComplete = jest.fn();
    const onCancel = jest.fn();
    renderWithTheme(
      <Form
        initialValues={{ code: '', topic: '', items: [{ name: 'A' }, { name: 'B' }] }}
        onSubmit={jest.fn()}
        cancelButton={{ text: 'Cancel', onPress: onCancel }}
        fields={[
          { type: 'OTP', name: 'code', length: 4, onComplete },
          { type: 'Select', name: 'topic', label: 'Topic', options: [{ value: 'x', label: 'X' }], noneOption: 'None' },
          { type: 'RepeatedControls', name: 'items', reorderable: true, itemLabel: index => `Item ${index + 1}`, fields: [{ type: 'Input', name: 'name', label: 'Name' }] },
        ]}
      />,
    );
    fireEvent.changeText(screen.getByLabelText('Verification code input'), '1234');
    await waitFor(() => expect(onComplete).toHaveBeenCalledWith('1234', expect.anything()));
    fireEvent.press(screen.getByRole('button', { name: 'Move down Item 1' }));
    await waitFor(() => expect(screen.getAllByDisplayValue(/A|B/)[0]!.props.value).toBe('B'));
    fireEvent.press(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalled();
  });

  it('ScreenContent renders the new blocks', () => {
    renderWithTheme(
      <ScreenContent blocks={[
        { type: 'StepperHeader', step: 1, total: 2, title: 'Verify phone' },
        { type: 'TimelineEvent', text: 'Code sent' },
        { type: 'DoubleButtons', primary: { title: 'Verify', onPress: jest.fn() }, secondary: { title: 'Cancel', onPress: jest.fn() } },
      ]} />,
    );
    expect(screen.getByText('Code sent')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Verify' })).toBeTruthy();
  });
});
