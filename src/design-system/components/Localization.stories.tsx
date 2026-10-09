import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-native';
import { Stack } from '../base/Stack';
import { DesignSystemLocalizationProvider } from '../localization';
import { ThemeProvider } from '../providers';
import { Badge } from './Badge';
import { Button } from './Button';
import { InputField } from './InputField';
import { Line } from './Line';
import { Text } from './Text';

const storyTranslations = {
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
    long: {
      description: 'Your account information is available in a clear and accessible format.',
    },
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
    long: {
      description: 'معلومات حسابك متاحة بصيغة واضحة ومتوافقة مع متطلبات إمكانية الوصول.',
    },
  },
} as const;

function LocalizedSurface({ locale }: { locale: 'en' | 'ar' }) {
  return (
    <DesignSystemLocalizationProvider
      locale={locale}
      fallbackLocale="en"
      translations={storyTranslations}
    >
      <ThemeProvider locale={locale}>
        <Stack gap="lg">
          <Text localize="welcome.message" value="Welcome" translationOptions={{ name: 'Faisal' }} />
          <Text localize="missing.key" value="Fallback value" tone="secondary" />
          <Button title="Confirm" titleLocalize="common.confirm" />
          <InputField
            type="text"
            label="Account number"
            labelLocalize="account.number"
            value=""
            onChangeText={() => undefined}
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
          />
          <Text
            localize="long.description"
            value="Account information"
            numberOfLines={3}
          />
        </Stack>
      </ThemeProvider>
    </DesignSystemLocalizationProvider>
  );
}

function RuntimeLocaleSwitching() {
  const [locale, setLocale] = useState<'en' | 'ar'>('en');
  return (
    <Stack gap="lg">
      <Button
        title={locale === 'en' ? 'Switch to Arabic' : 'Switch to English'}
        variant="outline"
        onPress={() => setLocale(current => current === 'en' ? 'ar' : 'en')}
      />
      <LocalizedSurface locale={locale} />
    </Stack>
  );
}

const meta = {
  title: 'Overview/Localization',
  component: RuntimeLocaleSwitching,
} satisfies Meta<typeof RuntimeLocaleSwitching>;

export default meta;
type Story = StoryObj<typeof meta>;

export const English: Story = {
  render: () => <LocalizedSurface locale="en" />,
};

export const ArabicRTL: Story = {
  render: () => <LocalizedSurface locale="ar" />,
};

export const RuntimeSwitching: Story = {};
