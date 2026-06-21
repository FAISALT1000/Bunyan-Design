import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-native';
import { Heading } from '../../components/Heading';
import { Link } from '../../components/Link';
import { Text } from '../../components/Text';
import { ConfirmationScreenTemplate } from './ConfirmationScreenTemplate';

function ConfirmationDemo({ loading = false, error }: { loading?: boolean; error?: string }) {
  const [confirmed, setConfirmed] = useState(false);
  return (
    <ConfirmationScreenTemplate
      title="Review transfer"
      sections={[
        {
          id: 'transfer',
          title: 'Transfer details',
          rows: [
            { id: 'from', label: 'From', value: 'Current account •• 2481', onEdit: () => undefined },
            { id: 'to', label: 'To', value: 'Fatimah Ali •• 8930', onEdit: () => undefined },
          ],
        },
      ]}
      amountSummary={{
        label: 'Transfer amount',
        amount: <Heading level={4}>1,000 SAR</Heading>,
        fees: <Text>2.50 SAR</Text>,
        total: <Heading level={4}>1,002.50 SAR</Heading>,
      }}
      terms={<Text variant="bodySmall">Read the <Link>terms and conditions</Link>.</Text>}
      confirmationRequired
      confirmed={confirmed}
      onConfirmedChange={setConfirmed}
      primaryAction={{ label: 'Confirm transfer', onPress: () => undefined }}
      secondaryAction={{ label: 'Back', onPress: () => undefined }}
      loading={loading}
      {...(error !== undefined ? { error } : {})}
    />
  );
}

const meta = {
  title: 'Templates/ConfirmationScreen',
  component: ConfirmationScreenTemplate,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof ConfirmationScreenTemplate>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { render: () => <ConfirmationDemo /> };
export const Loading: Story = { render: () => <ConfirmationDemo loading /> };
export const Error: Story = {
  render: () => <ConfirmationDemo error="Review the confirmation before continuing." />,
};
