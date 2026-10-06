import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-native';
import { Stack } from '../../base/Stack';
import { ThemeProvider } from '../../providers';
import { Avatar } from '../Avatar';
import { Badge } from '../Badge';
import { Line } from './Line';

const meta = {
  title: 'Components/Line',
  component: Line,
  args: {
    leftText: { text1: 'Reference number' },
    rightText: { text1: 'TRX-123456' },
  },
} satisfies Meta<typeof Line>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SingleLine: Story = {};
export const DoubleLine: Story = {
  args: {
    type: '2',
    leftText: {
      text1: 'Ahmed Mohammed',
      text2: 'Local beneficiary',
    },
    rightIcon: { name: 'chevron-end' },
  },
};
export const TripleLine: Story = {
  args: {
    type: '3',
    leftIcon: { name: 'transfer' },
    leftText: {
      text1: 'Local transfer',
      text2: 'Ahmed Mohammed',
      text3: '22 June 2026',
    },
    rightText: {
      text1: '-250 SAR',
      text2: 'Completed',
      text3: '10:30 AM',
    },
  },
};
export const LeftIcon: Story = {
  args: {
    leftIcon: { name: 'settings' },
    leftText: { text1: 'Settings' },
  },
};
export const RightIcon: Story = {
  args: {
    leftText: { text1: 'Account details' },
    rightIcon: { name: 'chevron-end' },
  },
};
export const TwoIcons: Story = {
  args: {
    leftIcon: { name: 'settings' },
    leftText: { text1: 'Settings' },
    rightIcon: { name: 'chevron-end' },
  },
};
export const RightButton: Story = {
  args: {
    type: '2',
    leftText: {
      text1: 'New beneficiary',
      text2: 'Requires activation',
    },
    rightButton: {
      title: 'Activate',
      variant: 'secondary',
      size: 'small',
      onPress: () => undefined,
    },
  },
};
export const LeftAndRightButtons: Story = {
  args: {
    leftButton: {
      title: 'Cancel',
      variant: 'ghost',
      size: 'small',
      onPress: () => undefined,
    },
    rightButton: {
      title: 'Confirm',
      size: 'small',
      onPress: () => undefined,
    },
  },
};
export const CustomContent: Story = {
  args: {
    leftContent: <Avatar name="Faisal" size="medium" />,
    leftText: {
      text1: 'Faisal',
      text2: 'Primary account holder',
    },
    rightContent: <Badge label="Verified" tone="success" />,
  },
};
export const Pressable: Story = {
  args: {
    leftText: { text1: 'Account settings' },
    rightIcon: { name: 'chevron-end' },
    onPress: () => undefined,
  },
};
export const Disabled: Story = {
  args: {
    ...Pressable.args,
    disabled: true,
  },
};
export const Loading: Story = {
  args: {
    type: '2',
    loading: true,
  },
};
export const Divider: Story = {
  args: {
    showDivider: true,
    dividerInset: 'content',
  },
};
export const DarkTheme: Story = {
  decorators: [
    (StoryComponent: React.ComponentType) => (
      <ThemeProvider initialPreference="dark">
        <StoryComponent />
      </ThemeProvider>
    ),
  ],
};
export const ArabicRTL: Story = {
  args: {
    type: '2',
    leftText: {
      text1: 'حساب التوفير',
      text2: 'الحساب الرئيسي',
    },
    rightText: {
      text1: '٢٥٬٠٠٠ ر.س',
      text2: 'الرصيد المتاح',
    },
    rightIcon: { name: 'chevron-end' },
  },
  decorators: [
    (StoryComponent: React.ComponentType) => (
      <ThemeProvider locale="ar-SA">
        <StoryComponent />
      </ThemeProvider>
    ),
  ],
};
export const LongContent: Story = {
  args: {
    type: '3',
    leftText: {
      text1: {
        value: 'A very long account name that demonstrates truncation behavior',
        numberOfLines: 2,
      },
      text2: 'A long supporting description for smaller devices',
      text3: 'Updated recently',
    },
    rightText: {
      text1: '125,000,000.00 SAR',
      text2: 'Available balance',
    },
  },
};
export const LargeFontScale: Story = {
  render: () => (
    <Stack gap="md">
      <Line
        leftText={{
          text1: {
            value: 'Large accessible text',
            variant: 'displayMedium',
            numberOfLines: 2,
          },
        }}
        rightIcon={{ name: 'chevron-end' }}
      />
    </Stack>
  ),
};
