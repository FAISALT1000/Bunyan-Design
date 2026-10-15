/**
 * StreamSpy gaps, phase 2 (0.0.6): lists, chat, attachments, charts, tables,
 * tab bar, toasts above modals, sheet snap points, date-time, form focus
 * chaining, auth header slot, theme persistence.
 */
import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import {
  AttachmentPicker,
  AuthenticationTemplate,
  BarChart,
  BarList,
  BottomSheet,
  ChatBubble,
  ChatComposer,
  ChatThread,
  DataTable,
  DateTimePicker,
  Form,
  Modal,
  PagedList,
  ScreenContent,
  Sparkline,
  TabBar,
  Text,
  ThemeProvider,
  ToastProvider,
  TypingIndicator,
  buildChatRows,
  tabBarPropsFromNavigation,
  useTheme,
  useToast,
  type ChatMessage,
  type ToastContextValue,
} from '../src';
import { renderWithTheme } from './test-utils';

describe('PagedList', () => {
  const pages = { pages: [[{ id: 'a', name: 'Alpha' }, { id: 'b', name: 'Beta' }], [{ id: 'c', name: 'Gamma' }]] };

  it('flattens infinite query pages and renders presets', () => {
    renderWithTheme(
      <PagedList query={{ data: pages, hasNextPage: false }} renderAs="TwoLineCard" formatItem={(item: { name: string }) => ({ title: item.name })} />,
    );
    expect(screen.getByText('Alpha')).toBeTruthy();
    expect(screen.getByText('Gamma')).toBeTruthy();
  });

  it('loads the next page once at the end and shows a retry row after a failed page', () => {
    const fetchNextPage = jest.fn();
    const { rerender } = renderWithTheme(
      <PagedList testID="list" query={{ data: pages, hasNextPage: true, fetchNextPage }} renderItem={(item: { name: string }) => <Text value={item.name} />} />,
    );
    const list = screen.getByTestId('list');
    act(() => {
      list.props.onEndReached?.({ distanceFromEnd: 0 });
      list.props.onEndReached?.({ distanceFromEnd: 0 });
    });
    expect(fetchNextPage).toHaveBeenCalledTimes(1);
    rerender(
      <PagedList testID="list" query={{ data: pages, hasNextPage: true, fetchNextPage, isFetchNextPageError: true, error: new Error('x') }} renderItem={(item: { name: string }) => <Text value={item.name} />} />,
    );
    fireEvent.press(screen.getByRole('button', { name: 'Try again' }));
    expect(fetchNextPage).toHaveBeenCalledTimes(2);
  });

  it('shows the empty state and the first-load error', () => {
    const { rerender } = renderWithTheme(<PagedList data={[]} renderItem={() => null} empty={{ title: 'No tickets yet' }} />);
    expect(screen.getByText('No tickets yet')).toBeTruthy();
    const refetch = jest.fn();
    rerender(<PagedList query={{ isError: true, error: new Error('Offline'), refetch }} renderItem={() => null} />);
    fireEvent.press(screen.getByRole('button', { name: 'Try again' }));
    expect(refetch).toHaveBeenCalled();
  });
});

describe('chat kit', () => {
  it('groups messages into runs with day dividers (newest first)', () => {
    const day = new Date(2026, 9, 14, 10, 0);
    const messages: ChatMessage[] = [
      { id: '1', side: 'incoming', createdAt: day, text: 'Hi' },
      { id: '2', side: 'incoming', createdAt: new Date(day.getTime() + 60_000), text: 'Are you there?' },
      { id: '3', side: 'outgoing', createdAt: new Date(day.getTime() + 120_000), text: 'Yes' },
      { id: '4', side: 'outgoing', createdAt: new Date(2026, 9, 15, 9, 0), text: 'Next day' },
    ];
    const rows = buildChatRows(messages);
    expect(rows.map(row => (row.kind === 'day' ? 'day' : `${row.message.id}:${row.position}`))).toEqual([
      '4:single', 'day', '3:single', '2:last', '1:first', 'day',
    ]);
  });

  it('bubble shows status, retry for failed messages; composer sends trimmed text', () => {
    const onRetry = jest.fn();
    const onSend = jest.fn();
    renderWithTheme(
      <>
        <ChatBubble side="outgoing" text="Hello" time="10:42" status="failed" onRetry={onRetry} />
        <ChatComposer value="  hi there " onChangeText={jest.fn()} onSend={onSend} onAttach={jest.fn()} />
        <ChatComposer testID="empty" value="   " onChangeText={jest.fn()} onSend={onSend} />
      </>,
    );
    fireEvent.press(screen.getByRole('button', { name: 'Not sent. Tap to retry' }));
    expect(onRetry).toHaveBeenCalled();
    const sendButtons = screen.getAllByRole('button', { name: 'Send' });
    fireEvent.press(sendButtons[0]!);
    expect(onSend).toHaveBeenCalledWith('hi there');
    fireEvent.press(sendButtons[1]!);
    expect(onSend).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Attach' })).toBeTruthy();
  });

  it('thread renders bubbles and a typing indicator; Arabic labels', () => {
    renderWithTheme(
      <ChatThread
        messages={[{ id: '1', side: 'incoming', createdAt: new Date(), text: 'مرحبا', author: { name: 'سارة' } }]}
        typing="سارة"
      />,
      { locale: 'ar', direction: 'rtl' },
    );
    expect(screen.getByText('مرحبا')).toBeTruthy();
    expect(screen.getByText('اليوم')).toBeTruthy();
    expect(screen.getByLabelText('سارة يكتب الآن')).toBeTruthy();
  });

  it('typing indicator has an accessible label', () => {
    renderWithTheme(<TypingIndicator />);
    expect(screen.getByLabelText('Typing')).toBeTruthy();
  });
});

describe('AttachmentPicker', () => {
  it('adds picked files within limits, rejects large ones, shows progress and retry', async () => {
    const onChange = jest.fn();
    const onReject = jest.fn();
    const onRetry = jest.fn();
    const pickFile = jest.fn(async () => [
      { uri: 'file://a.pdf', name: 'a.pdf', size: 1000, type: 'application/pdf' },
      { uri: 'file://big.mov', name: 'big.mov', size: 50_000_000, type: 'video/quicktime' },
    ]);
    renderWithTheme(
      <AttachmentPicker
        value={[
          { uri: 'file://x.png', name: 'x.png', status: 'uploading', progress: 0.4 },
          { uri: 'file://y.pdf', name: 'y.pdf', status: 'error' },
        ]}
        onChange={onChange}
        onReject={onReject}
        onRetry={onRetry}
        pickFile={pickFile}
        maxFiles={5}
        maxSize={10_000_000}
      />,
    );
    expect(screen.getByText('Uploading 40%')).toBeTruthy();
    expect(screen.getByText('2 of 5 files')).toBeTruthy();
    fireEvent.press(screen.getByRole('button', { name: 'Retry y.pdf' }));
    expect(onRetry).toHaveBeenCalled();
    fireEvent.press(screen.getByRole('button', { name: 'Add attachment' }));
    await waitFor(() => expect(onChange).toHaveBeenCalled());
    expect(onChange.mock.calls[0][0].map((file: { name: string }) => file.name)).toEqual(['x.png', 'y.pdf', 'a.pdf']);
    expect(onReject.mock.calls[0][0][0].reason).toBe('maxSize');
    fireEvent.press(screen.getByRole('button', { name: 'Remove x.png' }));
    expect(onChange).toHaveBeenLastCalledWith([expect.objectContaining({ name: 'y.pdf' })]);
  });
});

describe('charts and table', () => {
  it('BarList, BarChart and Sparkline render with accessible values', () => {
    renderWithTheme(
      <>
        <BarList items={[{ label: '/v1/streams', value: 1240 }, { label: '/v1/users', value: 620 }]} sorted />
        <BarChart items={[{ label: 'Mon', value: 3 }, { label: 'Tue', value: 7 }]} />
        <Sparkline values={[1, 4, 2, 8]} width={100} />
      </>,
    );
    expect(screen.getByLabelText('/v1/streams, 1240')).toBeTruthy();
    expect(screen.getByLabelText('Tue, 7')).toBeTruthy();
    expect(screen.getByLabelText('4 values from 1 to 8, latest 8')).toBeTruthy();
  });

  it('DataTable sorts by a column and reports row presses', () => {
    const onRowPress = jest.fn();
    renderWithTheme(
      <DataTable
        columns={[{ key: 'name', title: 'Name', sortable: true }, { key: 'calls', title: 'Calls', numeric: true, sortable: true }]}
        rows={[{ id: 1, name: 'B', calls: 5 }, { id: 2, name: 'A', calls: 9 }]}
        onRowPress={onRowPress}
      />,
    );
    const rowNames = () => screen.getAllByRole('button').map(node => node.props.accessibilityLabel).filter((label: string) => label?.startsWith('Name:'));
    expect(rowNames()).toEqual(['Name: B, Calls: 5', 'Name: A, Calls: 9']);
    fireEvent.press(screen.getByRole('button', { name: 'Calls' }));
    fireEvent.press(screen.getByRole('button', { name: 'Calls, sorted ascending' }));
    expect(rowNames()).toEqual(['Name: A, Calls: 9', 'Name: B, Calls: 5']);
    fireEvent.press(screen.getByRole('button', { name: 'Name: A, Calls: 9' }));
    expect(onRowPress).toHaveBeenCalledWith(expect.objectContaining({ name: 'A' }), 0);
  });

  it('ScreenContent renders chart and table blocks', () => {
    renderWithTheme(
      <ScreenContent scroll={false} blocks={[
        { type: 'BarList', items: [{ label: 'SA', value: 3 }] },
        { type: 'DataTable', columns: [{ key: 'k', title: 'Key' }], rows: [{ k: 'v' }] },
      ]} />,
    );
    expect(screen.getByText('SA')).toBeTruthy();
    expect(screen.getByText('v')).toBeTruthy();
  });
});

describe('TabBar', () => {
  it('marks the selected tab, shows badges and maps React Navigation props', () => {
    const navigate = jest.fn();
    const emit = jest.fn(() => ({ defaultPrevented: false }));
    const props = tabBarPropsFromNavigation(
      {
        state: { index: 0, routes: [{ key: 'home-1', name: 'Home' }, { key: 'inbox-1', name: 'Inbox' }] },
        descriptors: { 'home-1': { options: { title: 'Home' } }, 'inbox-1': { options: { title: 'Inbox', tabBarBadge: 3 } } },
        navigation: { emit, navigate },
      },
      { Home: { icon: 'home' }, Inbox: { icon: 'inbox' } },
    );
    renderWithTheme(<TabBar {...props} />);
    expect(screen.getByRole('tab', { name: 'Home' }).props.accessibilityState.selected).toBe(true);
    fireEvent.press(screen.getByRole('tab', { name: 'Inbox, 3' }));
    expect(navigate).toHaveBeenCalledWith('Inbox');
  });
});

describe('overlays', () => {
  it('shows toasts inside an open modal and back at the root after it closes', () => {
    let api: ToastContextValue | undefined;
    function Capture() {
      api = useToast();
      return null;
    }
    const tree = (open: boolean) => (
      <ToastProvider testID="toasts">
        <Capture />
        <Modal visible={open} onClose={jest.fn()} title="Edit">
          <Text value="inside" />
        </Modal>
      </ToastProvider>
    );
    const { rerender } = renderWithTheme(tree(true));
    act(() => {
      api?.showToast({ message: 'Saved', duration: 0 });
    });
    const modal = screen.UNSAFE_root.findAll(node => node.props.transparent === true && node.props.visible === true)[0];
    expect(modal).toBeTruthy();
    expect(modal!.findAll(node => node.props.testID === 'toasts').length).toBeGreaterThan(0);
    rerender(tree(false));
    expect(screen.getByText('Saved')).toBeTruthy();
  });

  it('BottomSheet snap points set the height and the handle is adjustable', () => {
    const onSnapChange = jest.fn();
    renderWithTheme(
      <BottomSheet testID="sheet" visible onClose={jest.fn()} title="Filters" snapPoints={[300, 600]} onSnapChange={onSnapChange}>
        <Text value="body" />
      </BottomSheet>,
    );
    const sheet = screen.getByTestId('sheet');
    const style = Object.assign({}, ...[sheet.props.style].flat(3).filter(Boolean));
    expect(style.height?.__getValue ? style.height.__getValue() : style.height).toBe(300);
    const handle = screen.getByLabelText('Resize sheet');
    act(() => handle.props.onAccessibilityAction({ nativeEvent: { actionName: 'increment' } }));
    expect(onSnapChange).toHaveBeenCalledWith(1);
  });
});

describe('forms and templates', () => {
  it('DateTimePicker uses date-time labels', () => {
    renderWithTheme(<DateTimePicker onChange={jest.fn()} />);
    act(() => screen.getByLabelText('Date').props.onPressIn?.());
    expect(screen.getByText('Select date and time')).toBeTruthy();
  });

  it('Form chains keyboard Next between text fields and submits on Done', async () => {
    const onSubmit = jest.fn();
    renderWithTheme(
      <Form
        initialValues={{ name: 'Sara', email: 'sara@x.sa', notes: '' }}
        onSubmit={onSubmit}
        fields={[
          { type: 'InputField', name: 'name', label: 'Name', testID: 'name' },
          { type: 'Switch', name: 'notes', label: 'Notes' },
          { type: 'InputField', name: 'email', label: 'Email', testID: 'email' },
        ]}
      />,
    );
    const inputs = screen.UNSAFE_root.findAll(node => node.props.returnKeyType !== undefined && typeof node.props.onSubmitEditing === 'function' && (node.type as unknown) === 'TextInput');
    expect(inputs.map(node => node.props.returnKeyType)).toEqual(['next', 'done']);
    act(() => inputs[1]!.props.onSubmitEditing({ nativeEvent: { text: '' } }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
  });

  it('AuthenticationTemplate renders a header slot', () => {
    renderWithTheme(
      <AuthenticationTemplate mode="login" title="Sign in" form={<Text value="form" />} header={<Text value="عربي" />} />,
    );
    expect(screen.getByText('عربي')).toBeTruthy();
  });
});

describe('ThemeProvider persistence', () => {
  it('restores and saves the theme preference', async () => {
    const store: Record<string, string> = { 'bunyan.themePreference': 'dark' };
    const storage = {
      getItem: jest.fn(async (key: string) => store[key] ?? null),
      setItem: jest.fn(async (key: string, value: string) => {
        store[key] = value;
      }),
    };
    let ctx: ReturnType<typeof useTheme> | undefined;
    function Probe() {
      ctx = useTheme();
      return <Text value={`${ctx.mode}:${String(ctx.preferenceLoaded)}`} />;
    }
    render(<ThemeProvider storage={storage}><Probe /></ThemeProvider>);
    await waitFor(() => expect(screen.getByText('dark:true')).toBeTruthy());
    act(() => ctx?.setPreference('sepia'));
    await waitFor(() => expect(store['bunyan.themePreference']).toBe('sepia'));
  });
});

