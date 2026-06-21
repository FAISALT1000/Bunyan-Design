import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-native';
import { Icon } from '../../components/Icon';
import { EmptyStateTemplate } from './EmptyStateTemplate';

const meta = {
  title: 'Templates/EmptyState',
  component: EmptyStateTemplate,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof EmptyStateTemplate>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FullScreen: Story = {
  args: {
    title: 'No beneficiaries',
    description: 'Add a beneficiary to start making transfers.',
    icon: 'user',
    primaryAction: { label: 'Add beneficiary', onPress: () => undefined },
    secondaryAction: { label: 'Learn more', onPress: () => undefined },
  },
};

export const Compact: Story = {
  args: {
    ...FullScreen.args,
    variant: 'compact',
  },
};

export const CustomIllustration: Story = {
  args: {
    ...FullScreen.args,
    illustration: <Icon name="search" size="xxl" tone="information" />,
  },
};
