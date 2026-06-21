import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-native';
import { Heading } from '../../components/Heading';
import { Text } from '../../components/Text';
import { DetailsScreenTemplate } from './DetailsScreenTemplate';

const sections = [
  {
    id: 'account',
    title: 'Account information',
    rows: [
      { id: 'name', label: 'Account name', value: 'Current account' },
      { id: 'iban', label: 'IBAN', value: 'SA00 •••• 2481' },
      { id: 'currency', label: 'Currency', value: 'SAR' },
    ],
  },
  {
    id: 'limits',
    title: 'Limits',
    expandable: true,
    rows: [
      { id: 'daily', label: 'Daily transfer limit', value: '50,000 SAR' },
    ],
  },
] as const;

const meta = {
  title: 'Templates/DetailsScreen',
  component: DetailsScreenTemplate,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof DetailsScreenTemplate>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Account details',
    status: { label: 'Active', tone: 'success' },
    summary: (
      <>
        <Text tone="secondary">Available balance</Text>
        <Heading level={2}>24,850.00 SAR</Heading>
      </>
    ),
    sections,
    primaryAction: { label: 'Transfer', onPress: () => undefined },
    secondaryAction: { label: 'Close', onPress: () => undefined },
    shareAction: { label: 'Share', onPress: () => undefined },
    downloadAction: { label: 'Download', onPress: () => undefined },
  },
};

export const Loading: Story = {
  args: { ...Default.args, loading: true },
};

export const Error: Story = {
  args: {
    ...Default.args,
    state: { type: 'error', message: 'Unable to load account details' },
  },
};

export const LongContent: Story = {
  args: {
    ...Default.args,
    sections: [...sections, ...sections.map(section => ({ ...section, id: `${section.id}-copy` }))],
  },
};
