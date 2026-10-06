import React from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native';
import { ThemeProvider } from '../../providers';
import { Button, type ButtonProps } from './Button';

const meta = {
  title: 'Core/Button',
  component: Button,
  args: {
    title: 'Continue',
    variant: 'primary',
    size: 'medium',
    disabled: false,
    loading: false,
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'tertiary', 'outline', 'ghost', 'link', 'danger'],
    },
    size: { control: 'select', options: ['small', 'medium', 'large'] },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AllVariants: Story = {
  render: () => (
    <View style={{ gap: 12 }}>
      {(['primary', 'secondary', 'tertiary', 'outline', 'ghost', 'link', 'danger'] as const).map(variant => (
        <Button key={variant} title={variant} variant={variant} />
      ))}
    </View>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <View style={{ gap: 12 }}>
      {(['small', 'medium', 'large'] as const).map(size => (
        <Button key={size} title={size} size={size} />
      ))}
    </View>
  ),
};

export const Loading: Story = { args: { loading: true } };
export const Disabled: Story = { args: { disabled: true } };
export const LongText: Story = {
  args: {
    fullWidth: true,
    title: 'Continue to review all submitted enterprise account information',
  },
};
export const SmallScreen: Story = {
  render: (args: ButtonProps) => <View style={{ width: 280 }}><Button {...args} fullWidth /></View>,
};
export const DarkTheme: Story = {
  decorators: [(StoryComponent: React.ComponentType) => <ThemeProvider initialPreference="dark"><StoryComponent /></ThemeProvider>],
};
export const BlackTheme: Story = {
  decorators: [(StoryComponent: React.ComponentType) => <ThemeProvider initialPreference="black"><StoryComponent /></ThemeProvider>],
};
export const ArabicRTL: Story = {
  args: { title: 'متابعة', rightIcon: 'chevron-right' },
  decorators: [(StoryComponent: React.ComponentType) => <ThemeProvider initialPreference="light" locale="ar-SA"><StoryComponent /></ThemeProvider>],
};

export const LinkAction: Story = {
  args: {
    title: 'View details',
    variant: 'link',
  },
};

export const LinkWithIcon: Story = {
  args: {
    title: 'View details',
    variant: 'link',
    rightIcon: 'chevron-end',
  },
};

export const ExternalLink: Story = {
  args: {
    title: 'Open website',
    variant: 'link',
    actionType: 'externalLink',
    rightIcon: 'chevron-end',
  },
};

export const DisabledLink: Story = {
  args: {
    title: 'Unavailable link',
    variant: 'link',
    disabled: true,
  },
};

export const ArabicLinkRTL: Story = {
  args: {
    title: 'عرض التفاصيل',
    variant: 'link',
    rightIcon: 'chevron-end',
  },
  decorators: [
    (StoryComponent: React.ComponentType) => (
      <ThemeProvider preference="dark" locale="ar-SA">
        <StoryComponent />
      </ThemeProvider>
    ),
  ],
};
