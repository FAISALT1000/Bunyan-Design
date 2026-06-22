import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-native';
import { Stack } from '../../base/Stack';
import { ThemeProvider } from '../../providers';
import { Badge } from '../Badge';
import { Line } from '../Line';
import { Card } from './Card';
import type { CardVariant } from './Card.types';

const meta = {
  title: 'Components/Card',
  component: Card,
  args: {
    title: 'Savings account',
    subtitle: 'Main account',
    description: 'View your balance and recent activity',
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

const variantStory = (variant: CardVariant): Story => ({
  args: { variant },
});

export const Primary = variantStory('primary');
export const Secondary = variantStory('secondary');
export const Tertiary = variantStory('tertiary');
export const Outline = variantStory('outline');
export const Elevated = variantStory('elevated');
export const Ghost = variantStory('ghost');
export const Success = variantStory('success');
export const Warning = variantStory('warning');
export const Error = variantStory('error');
export const Pressable: Story = {
  args: {
    variant: 'elevated',
    onPress: () => undefined,
  },
};
export const Disabled: Story = {
  args: {
    ...Pressable.args,
    disabled: true,
  },
};
export const Loading: Story = {
  args: {
    loading: true,
  },
};
export const WithLines: Story = {
  render: () => (
    <Card
      variant="secondary"
      title="Savings account"
      subtitle="Main account"
      showDivider
    >
      <Stack gap="none">
        <Line
          leftText={{ text1: 'Available balance' }}
          rightText={{ text1: '15,000 SAR' }}
          showDivider
        />
        <Line
          leftText={{ text1: 'Account status' }}
          rightContent={<Badge label="Active" tone="success" />}
        />
      </Stack>
    </Card>
  ),
};
export const ArabicRTL: Story = {
  args: {
    title: 'حساب التوفير',
    subtitle: 'الحساب الرئيسي',
    description: 'عرض الرصيد والعمليات الأخيرة',
    rightIcon: { name: 'chevron-end' },
  },
  decorators: [
    (StoryComponent: React.ComponentType) => (
      <ThemeProvider locale="ar-SA">
        <StoryComponent />
      </ThemeProvider>
    ),
  ],
};
export const DarkTheme: Story = {
  args: {
    variant: 'elevated',
  },
  decorators: [
    (StoryComponent: React.ComponentType) => (
      <ThemeProvider initialPreference="dark">
        <StoryComponent />
      </ThemeProvider>
    ),
  ],
};
