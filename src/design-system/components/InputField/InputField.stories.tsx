import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-native';
import { Stack } from '../../base/Stack';
import { ThemeProvider } from '../../providers';
import {
  InputField,
} from './InputField';
import type { InputFieldProps } from './InputField.types';

type WithoutControl<T> = T extends unknown
  ? Omit<T, 'value' | 'onChangeText'>
  : never;

function ControlledField(props: WithoutControl<InputFieldProps>) {
  const [value, setValue] = useState('');
  const inputProps = {
    ...props,
    value,
    onChangeText: setValue,
  } as InputFieldProps;
  return React.createElement(InputField, inputProps);
}

const meta = {
  title: 'Core/InputField',
  component: InputField,
  args: {
    type: 'text',
    variant: 'outlined',
    label: 'Full name',
    value: '',
    onChangeText: () => undefined,
  },
  argTypes: {
    type: {
      control: 'select',
      options: [
        'text',
        'email',
        'password',
        'phone',
        'number',
        'decimal',
        'search',
        'url',
        'otp',
        'pin',
      ],
    },
    variant: {
      control: 'select',
      options: ['outlined', 'filled', 'underlined'],
    },
  },
} satisfies Meta<typeof InputField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Text: Story = {
  render: () => <ControlledField type="text" label="Full name" />,
};

export const Email: Story = {
  render: () => (
    <ControlledField
      type="email"
      label="Email address"
      placeholder="name@example.com"
    />
  ),
};

export const Password: Story = {
  render: () => (
    <ControlledField
      type="password"
      label="Password"
      showPasswordToggle
    />
  ),
};

export const Phone: Story = {
  render: () => <ControlledField type="phone" label="Mobile number" />,
};

export const Number: Story = {
  render: () => <ControlledField type="number" label="Amount" />,
};

export const Search: Story = {
  render: () => (
    <ControlledField
      type="search"
      label="Search accounts"
      showClearButton
    />
  ),
};

export const OTP: Story = {
  render: () => (
    <ControlledField
      type="otp"
      label="Verification code"
      length={6}
    />
  ),
};

export const PIN: Story = {
  render: () => (
    <ControlledField
      type="pin"
      label="PIN"
      length={4}
    />
  ),
};

export const Variants: Story = {
  render: () => (
    <Stack gap="lg">
      <ControlledField type="text" variant="outlined" label="Outlined" />
      <ControlledField type="text" variant="filled" label="Filled" />
      <ControlledField type="text" variant="underlined" label="Underlined" />
    </Stack>
  ),
};

export const Focused: Story = {
  args: {
    autoFocus: true,
    label: 'Focused field',
  },
};

export const FilledValue: Story = {
  args: {
    label: 'Account name',
    value: 'Primary account',
  },
};

export const Error: Story = {
  args: {
    label: 'Email',
    value: 'invalid',
    errorText: 'Enter a valid email address',
  },
};

export const Success: Story = {
  args: {
    label: 'Email',
    value: 'name@example.com',
    successText: 'Email address is valid',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled field',
    value: 'Unavailable',
    disabled: true,
  },
};

export const DarkTheme: Story = {
  decorators: [
    (StoryComponent: React.ComponentType) => (
      <ThemeProvider preference="dark">
        <StoryComponent />
      </ThemeProvider>
    ),
  ],
};

export const ArabicRTL: Story = {
  render: () => (
    <ControlledField
      type="text"
      label="الاسم الكامل"
      placeholder="أدخل الاسم الكامل"
      helperText="استخدم الاسم المسجل في الهوية"
    />
  ),
  decorators: [
    (StoryComponent: React.ComponentType) => (
      <ThemeProvider locale="ar-SA">
        <StoryComponent />
      </ThemeProvider>
    ),
  ],
};

export const LargeFontContent: Story = {
  args: {
    label: 'Long accessible account description',
    helperText: 'Increase the device text size to verify wrapping and field height.',
  },
};

export const ReducedMotion: Story = {
  args: {
    label: 'Reduced motion field',
    reduceMotion: true,
  },
};
