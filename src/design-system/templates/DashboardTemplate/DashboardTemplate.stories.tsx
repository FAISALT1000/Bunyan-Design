import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-native';
import { Avatar } from '../../components/Avatar';
import { Badge } from '../../components/Badge';
import { Card } from '../../components/Card';
import { Heading } from '../../components/Heading';
import { ListItem } from '../../components/ListItem';
import { Text } from '../../components/Text';
import { DashboardTemplate } from './DashboardTemplate';

const meta = {
  title: 'Templates/Dashboard',
  component: DashboardTemplate,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof DashboardTemplate>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    greeting: 'Good morning, Faisal',
    subtitle: 'Here is your financial overview.',
    profileAction: <Avatar name="Faisal Alhejaili" />,
    balanceSummary: (
      <>
        <Text tone="secondary">Total balance</Text>
        <Heading level={2}>42,850.00 SAR</Heading>
        <Badge tone="success">Updated now</Badge>
      </>
    ),
    quickActions: [
      { id: 'transfer', label: 'Transfer', icon: 'chevron-right', onPress: () => undefined },
      { id: 'pay', label: 'Pay bill', icon: 'check', onPress: () => undefined },
      { id: 'cards', label: 'Cards', icon: 'user', onPress: () => undefined },
    ],
    promotionalBanner: (
      <Card variant="filled"><Heading level={4}>Explore premium banking</Heading></Card>
    ),
    sections: [
      {
        id: 'accounts',
        title: 'Accounts',
        action: { label: 'View all', onPress: () => undefined },
        content: <ListItem title="Current account" description="24,850.00 SAR" />,
      },
    ],
    recentActivity: (
      <>
        <ListItem title="Card purchase" description="-120.00 SAR" />
        <ListItem title="Salary" description="+18,500.00 SAR" />
      </>
    ),
  },
};

export const Loading: Story = { args: { ...Default.args, loading: true } };
export const Error: Story = {
  args: {
    ...Default.args,
    state: { type: 'error', message: 'Unable to load your dashboard' },
  },
};
