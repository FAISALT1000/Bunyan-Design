import React from 'react';
import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';
import { Path } from 'react-native-svg';
import { StyleSheet } from '../src/design-system/components/RNTheme/native';
import {
  ActionCard,
  AmountCard,
  DataState,
  DetailsCard,
  Grid,
  Icon,
  Money,
  OneLineCard,
  OverlayProvider,
  ProductCard,
  ProfileCard,
  Row,
  ScreenContent,
  Section,
  SettingsGroup,
  StatusBanner,
  StatusCard,
  StatusModal,
  StatusScreen,
  ThreeLineCard,
  ToastProvider,
  TwoLineCard,
  createIcon,
  formatDate,
  formatMoney,
  formatPhone,
  getIconNames,
  iconCategories,
  maskText,
  registerBlockType,
  registerIcons,
  useActionSheet,
  useConfirm,
  usePrompt,
  useStatusToast,
} from '../src';
import { glyphs } from '../src/design-system/icons';
import { renderWithTheme } from './test-utils';

const flat = (element: { props: { style?: unknown } }) =>
  StyleSheet.flatten(element.props.style as never) as Record<string, any>;

describe('line cards', () => {
  it('renders title, subtitle, value and handles press', () => {
    const onPress = jest.fn();
    renderWithTheme(
      <TwoLineCard icon="transfer" title="Transfer to Ahmed" subtitle="Today, 10:24" value="− 1,250.00 SAR" subValue="Completed" chevron onPress={onPress} />,
    );
    expect(screen.getByText('Transfer to Ahmed')).toBeTruthy();
    expect(screen.getByText('Today, 10:24')).toBeTruthy();
    expect(screen.getByText('Completed')).toBeTruthy();
    fireEvent.press(screen.getByRole('button', { name: /Transfer to Ahmed/ }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('toggles a switch row and translates locale keys', () => {
    const onChange = jest.fn();
    renderWithTheme(<OneLineCard icon="moon" title={{ localeKey: 'dark', fallback: 'Dark mode' }} toggle={{ value: false, onChange }} testID="dark" />);
    fireEvent(screen.getByTestId('dark-switch'), 'valueChange', true);
    expect(onChange).toHaveBeenCalledWith(true);
    expect(screen.getByText('Dark mode')).toBeTruthy();
  });

  it('shows meta, unread and a matching skeleton while loading', () => {
    const { rerender } = renderWithTheme(<ThreeLineCard title="Declined" subtitle="Visa" description="Try again" meta="2m" unread />);
    expect(screen.getByText('2m')).toBeTruthy();
    expect(screen.getByLabelText('Unread')).toBeTruthy();
    rerender(<ThreeLineCard title="Declined" loading testID="row" />);
    expect(screen.queryByText('Declined')).toBeNull();
  });
});

describe('group cards', () => {
  it('SettingsGroup skips falsy items and upper-cases its title', () => {
    const isAdmin = false;
    renderWithTheme(
      <SettingsGroup
        title="Preferences"
        items={[{ icon: 'globe', title: 'Language', value: 'العربية', chevron: true, onPress: jest.fn() }, isAdmin && { title: 'Admin' }]}
      />,
    );
    expect(screen.getByText('PREFERENCES')).toBeTruthy();
    expect(screen.getByText('Language')).toBeTruthy();
    expect(screen.queryByText('Admin')).toBeNull();
  });

  it('DetailsCard renders rows, badges, total and copy', () => {
    const onCopy = jest.fn();
    renderWithTheme(
      <DetailsCard
        title="Transfer details"
        rows={[{ label: 'Reference', value: 'TRX-1', copyable: true }, { label: 'Status', badge: { label: 'Completed', tone: 'success' } }]}
        total={{ label: 'Total', value: <Money amount={1250} currency="SAR" /> }}
        onCopy={onCopy}
      />,
    );
    expect(screen.getByText('Completed')).toBeTruthy();
    expect(screen.getByText('1,250.00 SAR')).toBeTruthy();
    fireEvent.press(screen.getByRole('button', { name: 'Copy Reference' }));
    return waitFor(() => expect(onCopy).toHaveBeenCalledWith(expect.objectContaining({ label: 'Reference' }), 'TRX-1'));
  });
});

describe('value cards', () => {
  it('AmountCard formats, hides and runs actions', () => {
    const onTransfer = jest.fn();
    renderWithTheme(
      <AmountCard variant="primary" label="Balance" amount={25430.5} currency="SAR" hideable trend={{ value: '+4.2%', direction: 'up' }}
        actions={[{ title: 'Transfer', icon: 'transfer', onPress: onTransfer }]} />,
    );
    expect(screen.getByText('25,430.50 SAR')).toBeTruthy();
    expect(screen.getByText('▲ +4.2%')).toBeTruthy();
    fireEvent.press(screen.getByRole('button', { name: 'Hide amount' }));
    expect(screen.queryByText('25,430.50 SAR')).toBeNull();
    fireEvent.press(screen.getByRole('button', { name: 'Transfer' }));
    expect(onTransfer).toHaveBeenCalled();
  });

  it('ProductCard toggles favourite, adds to cart and steps quantity', () => {
    const onFavorite = jest.fn();
    const onAdd = jest.fn();
    const onQuantity = jest.fn();
    const { rerender } = renderWithTheme(
      <ProductCard title="Earbuds" price={349} oldPrice={499} currency="SAR" rating={4.6} reviews={1280}
        badge={{ label: '-30%', tone: 'error' }} favorite={{ value: false, onChange: onFavorite }} cta={{ title: 'Add', icon: 'cart', onPress: onAdd }} />,
    );
    expect(screen.getByText('349 SAR')).toBeTruthy();
    expect(screen.getByText('4.6 (1280)')).toBeTruthy();
    fireEvent.press(screen.getByRole('button', { name: 'Add to favourites' }));
    expect(onFavorite).toHaveBeenCalledWith(true);
    fireEvent.press(screen.getByRole('button', { name: 'Add' }));
    expect(onAdd).toHaveBeenCalled();
    rerender(<ProductCard layout="horizontal" title="Coffee" price={89} quantity={{ value: 2, onChange: onQuantity, min: 1 }} />);
    fireEvent.press(screen.getByRole('button', { name: 'Increase quantity' }));
    expect(onQuantity).toHaveBeenCalledWith(3);
  });

  it('ProfileCard, ActionCard and StatusCard render their content', () => {
    const onPress = jest.fn();
    renderWithTheme(
      <>
        <ProfileCard layout="centered" name="Faisal" subtitle="Designer" badges={[{ label: 'Admin', tone: 'primary' }]} stats={[{ label: 'Projects', value: 24 }]} />
        <ActionCard icon="card" title="Cards" description="Freeze, limits" onPress={onPress} />
        <StatusCard status="warning" title="Verify your email" compact primaryAction={{ title: 'Resend', onPress: jest.fn() }} />
      </>,
    );
    expect(screen.getByText('Admin')).toBeTruthy();
    expect(screen.getByText('24')).toBeTruthy();
    fireEvent.press(screen.getByRole('button', { name: /Cards/ }));
    expect(onPress).toHaveBeenCalled();
    expect(screen.getByText('Resend')).toBeTruthy();
  });
});

describe('layout', () => {
  it('Row mirrors in RTL and Grid fills equal columns', () => {
    renderWithTheme(
      <>
        <Row testID="row"><Icon name="user" /></Row>
        <Grid columns={3} testID="grid">{[1, 2, 3, 4].map(n => <Icon key={n} name="grid" testID={`cell-${n}`} />)}</Grid>
      </>,
      { direction: 'rtl', locale: 'ar' },
    );
    expect(flat(screen.getByTestId('row')).flexDirection).toBe('row-reverse');
    expect(screen.getByTestId('cell-4')).toBeTruthy();
    // 4 items in 3 columns → 2 rows
    expect(screen.getByTestId('grid').children.length).toBe(2);
  });

  it('Section shows its action, skeletons and empty state', () => {
    const onSeeAll = jest.fn();
    const { rerender } = renderWithTheme(
      <Section title="Recent" action={{ title: 'See all', onPress: onSeeAll }}><TwoLineCard title="Row" /></Section>,
    );
    fireEvent.press(screen.getByRole('button', { name: 'See all' }));
    expect(onSeeAll).toHaveBeenCalled();
    rerender(<Section title="Recent" isEmpty empty={{ title: 'No transfers yet' }}><TwoLineCard title="Row" /></Section>);
    expect(screen.getByText('No transfers yet')).toBeTruthy();
    expect(screen.queryByText('Row')).toBeNull();
  });
});

describe('status feedback', () => {
  it('StatusScreen renders title, subtitle, children between them and the buttons', () => {
    const onDone = jest.fn();
    renderWithTheme(
      <StatusScreen status="success" title="Transfer sent" subtitle="1,250 SAR" primaryAction={{ title: 'Done', onPress: onDone }} secondaryAction={{ title: 'Share', onPress: jest.fn() }} animated={false}>
        <TwoLineCard title="Reference" subtitle="TRX-1" />
      </StatusScreen>,
    );
    expect(screen.getByText('Transfer sent')).toBeTruthy();
    expect(screen.getByText('TRX-1')).toBeTruthy();
    fireEvent.press(screen.getByRole('button', { name: 'Done' }));
    expect(onDone).toHaveBeenCalled();
  });

  it('StatusModal cannot be dismissed while pending', () => {
    const onClose = jest.fn();
    const { rerender } = renderWithTheme(<StatusModal visible status="pending" title="Verifying…" onClose={onClose} />);
    const modal = () => screen.UNSAFE_root.findAll(node => typeof node.props.onRequestClose === 'function')[0]!;
    act(() => modal().props.onRequestClose());
    expect(onClose).not.toHaveBeenCalled();
    rerender(<StatusModal visible status="error" title="Failed" onClose={onClose} />);
    act(() => modal().props.onRequestClose());
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('StatusBanner runs its action', () => {
    const onRetry = jest.fn();
    renderWithTheme(<StatusBanner status="error" title="No internet connection" action={{ title: 'Retry', onPress: onRetry }} />);
    fireEvent.press(screen.getByRole('button', { name: 'Retry' }));
    expect(onRetry).toHaveBeenCalled();
  });

  it('useStatusToast updates a pending toast in place', async () => {
    let api: ReturnType<typeof useStatusToast> | undefined;
    function Capture() {
      api = useStatusToast();
      return null;
    }
    renderWithTheme(<ToastProvider><Capture /></ToastProvider>);
    let handle: ReturnType<NonNullable<typeof api>['show']> | undefined;
    act(() => {
      handle = api!.show({ status: 'pending', title: 'Uploading…' });
    });
    expect(screen.getByText('Uploading…')).toBeTruthy();
    act(() => handle!.update({ status: 'success', title: 'Uploaded' }));
    expect(screen.queryByText('Uploading…')).toBeNull();
    expect(screen.getByText('Uploaded')).toBeTruthy();
    await act(async () => {
      await expect(api!.run(Promise.reject(new Error('Offline')), { pending: 'Saving…', success: 'Saved', error: e => (e as Error).message })).rejects.toThrow('Offline');
    });
    expect(screen.getByText('Offline')).toBeTruthy();
  });
});

describe('overlays', () => {
  function Harness({ onResult }: { onResult: (value: unknown) => void }) {
    const confirm = useConfirm();
    const actionSheet = useActionSheet();
    const prompt = usePrompt();
    return (
      <>
        <TwoLineCard title="Ask" onPress={() => void confirm({ title: 'Delete card?', danger: true, confirmText: 'Delete' }).then(onResult)} />
        <TwoLineCard title="Sheet" onPress={() => void actionSheet({ title: 'Options', options: [{ value: 'freeze', title: 'Freeze card', icon: 'lock' }, false] }).then(onResult)} />
        <TwoLineCard title="Rename" onPress={() => void prompt({ title: 'Rename', label: 'Name', validate: v => (v ? undefined : 'Required') }).then(onResult)} />
      </>
    );
  }

  it('confirm, actionSheet and prompt resolve with the user choice', async () => {
    const onResult = jest.fn();
    renderWithTheme(<OverlayProvider><Harness onResult={onResult} /></OverlayProvider>);
    fireEvent.press(screen.getByRole('button', { name: 'Ask' }));
    fireEvent.press(await screen.findByRole('button', { name: 'Delete' }));
    await waitFor(() => expect(onResult).toHaveBeenLastCalledWith(true));

    fireEvent.press(screen.getByRole('button', { name: 'Sheet' }));
    fireEvent.press(await screen.findByRole('button', { name: 'Freeze card' }));
    await waitFor(() => expect(onResult).toHaveBeenLastCalledWith('freeze'));

    fireEvent.press(screen.getByRole('button', { name: 'Rename' }));
    fireEvent.press(await screen.findByRole('button', { name: 'OK' }));
    expect(await screen.findByText('Required')).toBeTruthy();
    fireEvent.changeText(screen.getByLabelText('Name'), 'Travel card');
    fireEvent.press(screen.getByRole('button', { name: 'OK' }));
    await waitFor(() => expect(onResult).toHaveBeenLastCalledWith('Travel card'));
  });

  it('explains when the provider is missing', () => {
    function Lonely() {
      useConfirm();
      return null;
    }
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => renderWithTheme(<Lonely />)).toThrow('useConfirm must be used inside <OverlayProvider>.');
  });
});

describe('DataState', () => {
  it('shows skeletons, errors with retry, empty and data', () => {
    const refetch = jest.fn();
    const render = (query: object) => (
      <DataState query={query} empty={{ title: 'Nothing here' }} testID="state">
        {(data: string[]) => <>{data.map(item => <TwoLineCard key={item} title={item} />)}</>}
      </DataState>
    );
    const { rerender } = renderWithTheme(render({ isLoading: true }));
    expect(screen.getByTestId('state')).toBeTruthy();
    expect(screen.getAllByLabelText('Loading').length).toBeGreaterThan(0);
    rerender(render({ error: new Error('Offline'), isError: true, refetch }));
    expect(screen.getByText('Offline')).toBeTruthy();
    fireEvent.press(screen.getByRole('button', { name: 'Try again' }));
    expect(refetch).toHaveBeenCalled();
    rerender(render({ data: [] }));
    expect(screen.getByText('Nothing here')).toBeTruthy();
    rerender(render({ data: ['A', 'B'] }));
    expect(screen.getByText('B')).toBeTruthy();
  });
});

describe('formatters', () => {
  it('formats money, dates, phones and masks', () => {
    expect(formatMoney(-1250, { currency: 'SAR', signed: true })).toBe('−1,250.00 SAR');
    expect(formatMoney(400, { signed: true })).toBe('+400.00');
    expect(formatMoney(2400000, { compact: true })).toBe('2.4M');
    expect(formatMoney(1250, { locale: 'ar-SA', digits: 'arabic' })).toContain('١');
    const now = new Date(2026, 9, 9, 12, 0, 0);
    expect(formatDate(new Date(2026, 9, 9, 11, 55), { format: 'relative', now })).toBe('5 minutes ago');
    expect(formatDate(new Date(2026, 9, 3), { format: 'hijri' })).toMatch(/1448/);
    expect(formatPhone('+966512345678')).toBe('+966 51 234 5678');
    expect(maskText('4821000011112222', 'card')).toBe('•••• •••• •••• 2222');
    expect(maskText('SA0380000000608010167519', 'iban')).toBe('SA03 •••• •••• 7519');
  });
});

describe('ScreenContent', () => {
  it('renders blocks, skips falsy entries, repeats lists and supports custom blocks', () => {
    function Promo({ text }: { text: string }) {
      return <TwoLineCard title={text} />;
    }
    registerBlockType('Promo' as never, Promo as never);
    const isAdmin = false;
    renderWithTheme(
      <ScreenContent
        blocks={[
          { type: 'Heading', title: 'My account' },
          { type: 'AmountCard', label: 'Balance', amount: 100, currency: 'SAR' },
          isAdmin && { type: 'SettingsGroup', title: 'Admin', items: [] },
          { type: 'List', data: [{ name: 'Ahmed' }, { name: 'Noura' }], renderAs: 'TwoLineCard', formatItem: (item: { name: string }) => ({ title: item.name }) },
          { type: 'Promo', text: 'Custom block' } as never,
          { type: 'Nope' } as never,
          <TwoLineCard key="el" title="Plain element" />,
        ]}
      />,
    );
    expect(screen.getByText('My account')).toBeTruthy();
    expect(screen.getByText('100.00 SAR')).toBeTruthy();
    expect(screen.queryByText('ADMIN')).toBeNull();
    expect(screen.getByText('Noura')).toBeTruthy();
    expect(screen.getByText('Custom block')).toBeTruthy();
    expect(screen.getByText(/Unknown block type "Nope"/)).toBeTruthy();
    expect(screen.getByText('Plain element')).toBeTruthy();
  });
});

describe('icons', () => {
  it('every category entry is a built-in glyph and named icons render', () => {
    Object.values(iconCategories).flat().forEach(name => expect(glyphs).toHaveProperty(name));
    expect(Object.values(iconCategories).flat().length).toBe(Object.keys(glyphs).length);
    const WalletIcon = createIcon('wallet');
    renderWithTheme(<WalletIcon testID="wallet" size={24} />);
    expect(screen.getByTestId('wallet')).toBeTruthy();
  });

  it('registers app icons', () => {
    registerIcons({ 'app-logo': <Path d="M4 12h16" /> });
    expect(getIconNames()).toContain('app-logo');
    renderWithTheme(<Icon name={'app-logo' as never} testID="logo" />);
    expect(screen.getByTestId('logo')).toBeTruthy();
  });
});

describe('native RTL', () => {
  it('does not mirror rows twice when the app is natively RTL', () => {
    const { I18nManager } = require('../src/design-system/components/RNTheme/native');
    const { Inline } = require('../src');
    const original = I18nManager.isRTL;
    Object.defineProperty(I18nManager, 'isRTL', { value: true, configurable: true });
    try {
      renderWithTheme(<><Inline testID="inline"><Icon name="user" /></Inline><Row testID="row"><Icon name="user" /></Row></>, { direction: 'rtl', locale: 'ar' });
      expect(flat(screen.getByTestId('inline')).flexDirection).toBe('row');
      expect(flat(screen.getByTestId('row')).flexDirection).toBe('row');
    } finally {
      Object.defineProperty(I18nManager, 'isRTL', { value: original, configurable: true });
    }
  });
});
