import React, { useState } from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native';
import { Badge } from '../../components/Badge';
import { Text } from '../../components/Text';
import { useTheme } from '../../hooks';
import { NumPad } from './NumPad';

function NumPadDemo({ maxLength = 8 }: { maxLength?: number }) {
  const { theme } = useTheme();
  const [value, setValue] = useState('');

  return (
    <View style={{ width: '100%', maxWidth: theme.breakpoint.medium, alignSelf: 'center', gap: theme.spacing.xxl }}>
      <View style={{ alignItems: 'center', gap: theme.spacing.sm }}>
        <Text tone="secondary">Entered value</Text>
        <Badge tone={value ? 'primary' : 'neutral'} size="medium">
          {value || 'Empty'}
        </Badge>
      </View>
      <NumPad value={value} onChange={setValue} maxLength={maxLength} />
    </View>
  );
}

const meta = {
  title: 'Templates/NumPad',
  component: NumPad,
  parameters: {
    controls: { disable: true },
  },
} satisfies Meta<typeof NumPad>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <NumPadDemo />,
};

export const FourDigitLimit: Story = {
  render: () => <NumPadDemo maxLength={4} />,
};

export const Disabled: Story = {
  args: {
    value: '1234',
    disabled: true,
  },
};
