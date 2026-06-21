import React from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native';
import { Alert } from '../../components/Alert';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { IconButton } from '../../components/IconButton';
import { Text } from '../../components/Text';
import { ThemeProvider } from '../../providers';
import { BaseScreenTemplate } from './BaseScreenTemplate';

const meta = {
  title: 'Templates/BaseScreen',
  component: BaseScreenTemplate,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof BaseScreenTemplate>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Transfer',
    subtitle: 'Enter the transfer details',
    showBackButton: true,
    onBack: () => undefined,
    headerRight: <IconButton icon="info" accessibilityLabel="Help" />,
    children: <Card><Text>Screen content</Text></Card>,
    footer: <Button fullWidth>Continue</Button>,
  },
};

export const Loading: Story = {
  args: {
    ...Default.args,
    loading: true,
  },
};

export const Error: Story = {
  args: {
    ...Default.args,
    errorBanner: <Alert tone="error" title="Unable to load the latest information" />,
  },
};

export const Empty: Story = {
  args: {
    title: 'Accounts',
    children: null,
    state: {
      type: 'empty',
      title: 'No accounts',
      description: 'Eligible accounts will appear here.',
    },
  },
};

export const LongContent: Story = {
  args: {
    ...Default.args,
    children: (
      <View>
        {Array.from({ length: 20 }, (_, index) => (
          <Card key={index}><Text>Long content section {index + 1}</Text></Card>
        ))}
      </View>
    ),
  },
};

export const MultipleActions: Story = {
  args: {
    ...Default.args,
    footer: (
      <View>
        <Button fullWidth>Continue</Button>
        <Button fullWidth variant="ghost">Save draft</Button>
      </View>
    ),
  },
};

export const DarkTheme: Story = {
  args: Default.args,
  decorators: [
    (StoryComponent: React.ComponentType) => (
      <ThemeProvider initialPreference="dark"><StoryComponent /></ThemeProvider>
    ),
  ],
};

export const BlackTheme: Story = {
  args: Default.args,
  decorators: [
    (StoryComponent: React.ComponentType) => (
      <ThemeProvider initialPreference="black"><StoryComponent /></ThemeProvider>
    ),
  ],
};

export const ArabicRTL: Story = {
  args: {
    title: 'التحويل',
    subtitle: 'أدخل تفاصيل التحويل',
    showBackButton: true,
    onBack: () => undefined,
    children: <Card><Text>محتوى الشاشة</Text></Card>,
  },
  decorators: [
    (StoryComponent: React.ComponentType) => (
      <ThemeProvider locale="ar-SA"><StoryComponent /></ThemeProvider>
    ),
  ],
};

export const SmallDevice: Story = {
  args: Default.args,
  decorators: [
    (StoryComponent: React.ComponentType) => (
      <View style={{ width: 320, minHeight: 640 }}><StoryComponent /></View>
    ),
  ],
};
