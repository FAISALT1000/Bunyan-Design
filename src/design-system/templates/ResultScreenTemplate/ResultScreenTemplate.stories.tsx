import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-native';
import { Text } from '../../components/Text';
import { ResultScreenTemplate } from './ResultScreenTemplate';

const meta = {
  title: 'Templates/ResultScreen',
  component: ResultScreenTemplate,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof ResultScreenTemplate>;

export default meta;
type Story = StoryObj<typeof meta>;

const baseArgs = {
  title: 'Transfer completed',
  description: 'Your transfer was completed successfully.',
  referenceNumber: 'TRX-123456',
  dateTime: '21 June 2026, 10:30 AM',
  details: [
    { id: 'amount', label: 'Amount', value: '1,000 SAR' },
    { id: 'recipient', label: 'Recipient', value: 'Fatimah Ali' },
  ],
  primaryAction: { label: 'Done', onPress: () => undefined },
  secondaryAction: { label: 'Make another transfer', onPress: () => undefined },
  shareAction: { label: 'Share receipt', onPress: () => undefined },
  downloadAction: { label: 'Download receipt', onPress: () => undefined },
} as const;

export const Success: Story = { args: { ...baseArgs, status: { type: 'success' } } };
export const Failure: Story = {
  args: {
    ...baseArgs,
    status: { type: 'error' },
    title: 'Transfer failed',
    description: 'No funds were deducted from your account.',
  },
};
export const Pending: Story = {
  args: { ...baseArgs, status: { type: 'pending' }, title: 'Transfer pending' },
};
export const Warning: Story = {
  args: { ...baseArgs, status: { type: 'warning' }, title: 'Action required' },
};
export const UnderReview: Story = {
  args: { ...baseArgs, status: { type: 'underReview' }, title: 'Transfer under review' },
};
export const Blocked: Story = {
  args: { ...baseArgs, status: { type: 'blocked' }, title: 'Transfer blocked' },
};
export const Custom: Story = {
  args: {
    ...baseArgs,
    status: { type: 'custom', label: 'Scheduled', icon: 'calendar', tone: 'primary' },
    title: 'Transfer scheduled',
    details: [{
      id: 'schedule',
      label: 'Execution date',
      value: <Text value="24 June 2026" />,
    }],
  },
};
