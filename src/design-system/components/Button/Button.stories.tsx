import React from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native';
import { ThemeProvider } from '../../providers';
import { Button, type ButtonProps } from './Button';

const meta = {
  title: 'Core/Button',
  component: Button,
  args: {
    children: 'Continue',
    variant: 'primary',
    size: 'medium',
    disabled: false,
    loading: false,
  },
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'outline', 'ghost', 'danger'] },
    size: { control: 'select', options: ['small', 'medium', 'large'] },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AllVariants: Story = {
  render: () => (
    <View style={{ gap: 12 }}>
      {(['primary', 'secondary', 'outline', 'ghost', 'danger'] as const).map(variant => (
        <Button key={variant} variant={variant}>{variant}</Button>
      ))}
    </View>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <View style={{ gap: 12 }}>
      {(['small', 'medium', 'large'] as const).map(size => <Button key={size} size={size}>{size}</Button>)}
    </View>
  ),
};

export const Loading: Story = { args: { loading: true } };
export const Disabled: Story = { args: { disabled: true } };
export const LongText: Story = {
  args: { fullWidth: true, children: 'Continue to review all submitted enterprise account information' },
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
  args: { children: 'متابعة', trailingIcon: 'chevron-right' },
  decorators: [(StoryComponent: React.ComponentType) => <ThemeProvider initialPreference="light" locale="ar-SA"><StoryComponent /></ThemeProvider>],
};
