import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-native';
import { Stack } from '../base/Stack';
import { ThemeProvider } from '../providers';
import type { DesignSystemPlatform } from '../platform';
import type { ThemePreference } from '../providers';
import { Button } from './Button';
import { Card } from './Card';
import { Line } from './Line';
import { Text } from './Text';

interface FoundationPreviewProps {
  platform: DesignSystemPlatform;
  locale?: 'en' | 'ar';
  theme?: ThemePreference;
}

function FoundationPreview({
  platform,
  locale = 'en',
  theme = 'light',
}: FoundationPreviewProps) {
  const arabic = locale === 'ar';
  return (
    <ThemeProvider
      platform={platform}
      locale={locale}
      preference={theme}
    >
      <Stack gap="lg">
        <Text
          value={arabic ? 'معاينة النظام عبر المنصات' : 'Cross-platform preview'}
          variant="headingLarge"
        />
        <Text
          value={
            arabic
              ? 'واجهة عامة واحدة مع أهداف لمس وتأثيرات ضغط وارتفاعات مناسبة لكل منصة.'
              : 'One public API with platform-appropriate touch targets, press feedback, and elevation.'
          }
          tone="secondary"
        />
        <Button
          title={arabic ? 'تأكيد' : 'Confirm'}
          leftIcon="check"
        />
        <Button
          title={arabic ? 'جارٍ التحميل' : 'Loading'}
          loading
          variant="secondary"
        />
        <Button
          title={arabic ? 'غير متاح' : 'Disabled'}
          disabled
          variant="outline"
        />
        <Card variant="elevated" title={arabic ? 'الحساب' : 'Account'}>
          <Line
            leftText={{ text1: arabic ? 'الرصيد المتاح' : 'Available balance' }}
            rightText={{ text1: arabic ? '١٠٬٠٠٠ ر.س' : '10,000 SAR' }}
          />
        </Card>
      </Stack>
    </ThemeProvider>
  );
}

const meta = {
  title: 'Foundations/Cross-platform behavior',
  component: FoundationPreview,
  argTypes: {
    platform: {
      control: 'select',
      options: ['ios', 'android', 'web'],
    },
    locale: {
      control: 'select',
      options: ['en', 'ar'],
    },
    theme: {
      control: 'select',
      options: ['light', 'dark', 'black'],
    },
  },
} satisfies Meta<typeof FoundationPreview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const IOS: Story = {
  args: { platform: 'ios' },
};

export const Android: Story = {
  args: { platform: 'android' },
};

export const ArabicRTL: Story = {
  args: { platform: 'ios', locale: 'ar' },
};

export const AndroidArabicRTL: Story = {
  args: { platform: 'android', locale: 'ar' },
};

export const LongAccessibleContent: Story = {
  args: { platform: 'ios' },
  render: (args: FoundationPreviewProps) => (
    <ThemeProvider
      platform={args.platform}
      {...(args.locale ? { locale: args.locale } : {})}
      {...(args.theme ? { preference: args.theme } : {})}
    >
      <Stack gap="lg">
        <Text
          value="This deliberately long heading verifies wrapping and remains readable when the device accessibility text size is increased."
          variant="headingLarge"
        />
        <Button
          title="Continue with the selected account and review all transfer details"
          fullWidth
        />
      </Stack>
    </ThemeProvider>
  ),
};
