import React, { useState } from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native';
import { FormField } from '../../components/FormField';
import { Input } from '../../components/Input';
import { useTheme } from '../../hooks';
import { ThemeProvider } from '../../providers';
import { FormScreenTemplate } from './FormScreenTemplate';

function FormDemo({
  loading = false,
  withErrors = false,
}: {
  loading?: boolean;
  withErrors?: boolean;
}) {
  const { theme } = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  return (
    <FormScreenTemplate
      title="Personal information"
      subtitle="Tell us about yourself"
      sections={[
        {
          id: 'identity',
          title: 'Identity',
          description: 'Use the details shown on your official ID.',
          required: true,
          content: (
            <View style={{ gap: theme.spacing.lg }}>
              <FormField label="Full name" required>
                <Input value={name} onChangeText={setName} />
              </FormField>
              <FormField
                label="Email"
                required
                {...(withErrors ? { error: 'Enter a valid email' } : {})}
              >
                <Input value={email} onChangeText={setEmail} status={withErrors ? 'error' : 'default'} />
              </FormField>
            </View>
          ),
        },
      ]}
      validationSummary={withErrors ? [{ id: 'email', message: 'Email is invalid' }] : []}
      submitLabel="Continue"
      onSubmit={() => undefined}
      secondaryAction={{ label: 'Cancel', onPress: () => undefined }}
      loading={loading}
    />
  );
}

const meta = {
  title: 'Templates/FormScreen',
  component: FormScreenTemplate,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof FormScreenTemplate>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { render: () => <FormDemo /> };
export const Loading: Story = { render: () => <FormDemo loading /> };
export const Error: Story = { render: () => <FormDemo withErrors /> };
export const UnsavedChanges: Story = {
  render: () => (
    <FormScreenTemplate
      title="Profile"
      sections={[{ id: 'profile', content: <Input value="Changed value" /> }]}
      submitLabel="Save"
      onSubmit={() => undefined}
      unsavedChanges
    />
  ),
};
export const ArabicRTL: Story = {
  render: () => <FormDemo />,
  decorators: [
    (StoryComponent: React.ComponentType) => (
      <ThemeProvider locale="ar-SA"><StoryComponent /></ThemeProvider>
    ),
  ],
};
