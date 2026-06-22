import React from 'react';
import {
  fireEvent,
  render,
  renderHook,
  screen,
} from '@testing-library/react-native';
import {
  Badge,
  Button,
  DesignSystemLocalizationProvider,
  Input,
  Line,
  Text,
  ThemeProvider,
  useLocalization,
} from '../src';
import { renderWithTheme } from './test-utils';

const translations = {
  en: {
    common: { confirm: 'Confirm' },
    account: {
      number: 'Account number',
      placeholder: 'Enter account number',
      balance: 'Available balance',
      amount: '25,000 SAR',
    },
    status: { pending: 'Pending' },
    welcome: { message: 'Welcome, %{name}' },
  },
  ar: {
    common: { confirm: 'تأكيد' },
    account: {
      number: 'رقم الحساب',
      placeholder: 'أدخل رقم الحساب',
      balance: 'الرصيد المتاح',
      amount: '٢٥٬٠٠٠ ر.س',
    },
    status: { pending: 'قيد الانتظار' },
    welcome: { message: 'مرحباً، %{name}' },
  },
} as const;

const LocalizationWrapper = ({
  locale,
  children,
}: {
  locale: 'en' | 'ar';
  children: React.ReactNode;
}) => (
  <DesignSystemLocalizationProvider
    locale={locale}
    fallbackLocale="en"
    translations={translations}
  >
    <ThemeProvider locale={locale}>{children}</ThemeProvider>
  </DesignSystemLocalizationProvider>
);

describe('localization provider and hook', () => {
  it('provides locale, RTL state, a stable manager, and controlled updates', () => {
    let latest: ReturnType<typeof useLocalization<'en' | 'ar'>> | undefined;
    function Probe() {
      latest = useLocalization<'en' | 'ar'>();
      return <Text value={latest.locale} />;
    }

    const view = render(
      <LocalizationWrapper locale="en"><Probe /></LocalizationWrapper>,
    );
    const manager = latest?.manager;

    expect(latest?.locale).toBe('en');
    expect(latest?.isRTL).toBe(false);
    view.rerender(
      <LocalizationWrapper locale="ar"><Probe /></LocalizationWrapper>,
    );
    expect(latest?.locale).toBe('ar');
    expect(latest?.isRTL).toBe(true);
    expect(latest?.manager).toBe(manager);
  });

  it('throws a helpful error outside the provider', () => {
    expect(() => renderHook(() => useLocalization())).toThrow(
      'useLocalization must be used inside DesignSystemLocalizationProvider.',
    );
  });
});

describe('localized semantic components', () => {
  it('renders direct, English, Arabic, interpolated, and fallback Text values', () => {
    const view = renderWithTheme(<Text value="Static text" />);
    expect(view.getByText('Static text')).toBeTruthy();
    view.unmount();

    const english = renderWithTheme(
      <LocalizationWrapper locale="en">
        <Text localize="common.confirm" value="Confirm fallback" />
        <Text
          localize="welcome.message"
          value="Welcome"
          translationOptions={{ name: 'Faisal' }}
        />
        <Text localize="missing.key" value="Fallback value" />
      </LocalizationWrapper>,
    );
    expect(english.getByText('Confirm')).toBeTruthy();
    expect(english.getByText('Welcome, Faisal')).toBeTruthy();
    expect(english.getByText('Fallback value')).toBeTruthy();
    english.unmount();

    renderWithTheme(
      <LocalizationWrapper locale="ar">
        <Text
          localize="common.confirm"
          value="Confirm"
          numberOfLines={2}
          accessibilityLabel="تأكيد العملية"
        />
      </LocalizationWrapper>,
    );
    const arabic = screen.getByText('تأكيد');
    expect(arabic).toHaveStyle({ textAlign: 'right', writingDirection: 'rtl' });
    expect(arabic.props.numberOfLines).toBe(2);
    expect(screen.getByLabelText('تأكيد العملية')).toBeTruthy();
  });

  it('localizes Button, Input, Badge, and Line through shared resolution', () => {
    const onPress = jest.fn();
    renderWithTheme(
      <LocalizationWrapper locale="ar">
        <Button
          title="Confirm"
          titleLocalize="common.confirm"
          onPress={onPress}
        />
        <Input
          label="Account number"
          labelLocalize="account.number"
          placeholder="Enter account number"
          placeholderLocalize="account.placeholder"
        />
        <Badge label="Pending" labelLocalize="status.pending" />
        <Line
          leftText={{
            text1: {
              value: 'Available balance',
              localize: 'account.balance',
            },
          }}
          rightText={{
            text1: {
              value: '25,000 SAR',
              localize: 'account.amount',
            },
          }}
          onPress={jest.fn()}
        />
      </LocalizationWrapper>,
    );

    fireEvent.press(screen.getByRole('button', { name: 'تأكيد' }));
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(screen.getByText('رقم الحساب')).toBeTruthy();
    expect(screen.getByPlaceholderText('أدخل رقم الحساب')).toBeTruthy();
    expect(screen.getByText('قيد الانتظار')).toBeTruthy();
    expect(screen.getByRole('button', {
      name: 'الرصيد المتاح, ٢٥٬٠٠٠ ر.س',
    })).toBeTruthy();
  });

  it('requires the provider only when a localization key is used', () => {
    expect(() => renderWithTheme(
      <Text localize="common.confirm" value="Confirm" />,
    )).toThrow(
      'Localized content must be rendered inside DesignSystemLocalizationProvider.',
    );
  });
});
