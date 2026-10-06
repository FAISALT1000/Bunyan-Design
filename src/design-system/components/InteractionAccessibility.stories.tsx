import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-native';
import { Stack } from '../base/Stack';
import { ThemeProvider } from '../providers';
import { Accordion } from './Accordion';
import { Alert } from './Alert';
import { IconButton } from './IconButton';
import { Switch } from './Switch';
import { Tabs } from './Tabs';
import { Text } from './Text';

function InteractionAccessibilityShowcase() {
  const [tab, setTab] = useState('overview');
  const [enabled, setEnabled] = useState(true);

  return (
    <Stack gap="xl">
      <IconButton
        icon="search"
        accessibilityLabel="Search accounts"
        accessibilityHint="Opens account search"
      />
      <Switch
        label="Transaction notifications"
        description="Receive an alert after each transaction"
        value={enabled}
        onValueChange={setEnabled}
      />
      <Tabs
        accessibilityLabel="Account sections"
        value={tab}
        onValueChange={setTab}
        items={[
          { value: 'overview', label: 'Overview', badge: '12' },
          { value: 'activity', label: 'Activity' },
          { value: 'statements', label: 'Statements', disabled: true },
        ]}
      />
      <Accordion title="Accessible account details">
        <Text value="The trigger announces its expanded state." />
      </Accordion>
      <Alert
        tone="warning"
        title="Review required"
        description="One item needs your attention before continuing."
        onDismiss={() => undefined}
      />
    </Stack>
  );
}

function ArabicAccessibilityShowcase() {
  const [tab, setTab] = useState('summary');

  return (
    <ThemeProvider locale="ar-SA">
      <Stack gap="xl">
        <Switch
          label="إشعارات العمليات"
          description="استلام إشعار بعد كل عملية"
          value
          onValueChange={() => undefined}
        />
        <Tabs
          accessibilityLabel="أقسام الحساب"
          value={tab}
          onValueChange={setTab}
          items={[
            { value: 'summary', label: 'الملخص' },
            { value: 'activity', label: 'العمليات', badge: '١٢' },
          ]}
        />
        <Accordion title="تفاصيل الحساب">
          <Text value="محتوى متوافق مع اتجاه الكتابة من اليمين إلى اليسار." />
        </Accordion>
      </Stack>
    </ThemeProvider>
  );
}

const meta = {
  title: 'Overview/Interaction Accessibility',
  component: InteractionAccessibilityShowcase,
} satisfies Meta<typeof InteractionAccessibilityShowcase>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

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
  render: () => <ArabicAccessibilityShowcase />,
};
