import React from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native';
import { Text } from '../../components/Text';
import { BottomActionTemplate } from './BottomActionTemplate';

const meta = {
  title: 'Templates/BottomAction',
  component: BottomActionTemplate,
} satisfies Meta<typeof BottomActionTemplate>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PrimaryOnly: Story = {
  args: {
    primaryAction: { label: 'Continue', onPress: () => undefined },
  },
};

export const MultipleActions: Story = {
  args: {
    primaryAction: { label: 'Confirm', onPress: () => undefined },
    secondaryAction: { label: 'Back', onPress: () => undefined },
    layout: 'inline',
  },
};

export const Loading: Story = {
  args: {
    primaryAction: { label: 'Submitting', onPress: () => undefined, loading: true },
  },
};

export const Disabled: Story = {
  args: {
    primaryAction: { label: 'Continue', onPress: () => undefined, disabled: true },
  },
};

export const WithSupportingContent: Story = {
  args: {
    primaryAction: { label: 'Accept and continue', onPress: () => undefined },
    children: <Text variant="caption" tone="secondary" align="center">By continuing, you accept the terms.</Text>,
  },
};

export const SmallDevice: Story = {
  args: MultipleActions.args,
  decorators: [
    (StoryComponent: React.ComponentType) => (
      <View style={{ width: 320 }}><StoryComponent /></View>
    ),
  ],
};
