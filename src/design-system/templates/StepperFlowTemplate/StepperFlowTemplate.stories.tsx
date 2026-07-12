import React, { useState } from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native';
import { InputField } from '../../components/InputField';
import { Text } from '../../components/Text';
import { ThemeProvider } from '../../providers';
import { StepperFlowTemplate } from './StepperFlowTemplate';

function StepperDemo({ loading = false }: { loading?: boolean }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  return (
    <StepperFlowTemplate
      title="Open an account"
      currentStep={step}
      steps={[
        {
          id: 'identity',
          title: 'Identity',
          description: 'Enter your personal information.',
          content: <InputField label="Full name" value={name} onChangeText={setName} />,
        },
        {
          id: 'address',
          title: 'Address',
          description: 'Tell us where you live.',
          content: <InputField label="City" value={city} onChangeText={setCity} />,
        },
        {
          id: 'review',
          title: 'Review',
          description: 'Review your application before submission.',
          content: <Text value="Everything looks ready." />,
        },
      ]}
      onNext={() => setStep(current => Math.min(current + 1, 2))}
      onBack={() => setStep(current => Math.max(current - 1, 0))}
      onStepPress={setStep}
      onSaveAndExit={() => undefined}
      loading={loading}
    />
  );
}

const meta = {
  title: 'Templates/StepperFlow',
  component: StepperFlowTemplate,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof StepperFlowTemplate>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { render: () => <StepperDemo /> };
export const Loading: Story = { render: () => <StepperDemo loading /> };
export const HiddenOptionalStep: Story = {
  args: {
    currentStep: 0,
    steps: [
      { id: 'one', title: 'Required', content: <Text value="Required step" /> },
      { id: 'hidden', title: 'Hidden', content: <Text value="Hidden" />, hidden: true },
      { id: 'optional', title: 'Optional', content: <Text value="Optional step" />, optional: true },
    ],
    onNext: () => undefined,
  },
};
export const ArabicRTL: Story = {
  render: () => <StepperDemo />,
  decorators: [
    (StoryComponent: React.ComponentType) => (
      <ThemeProvider locale="ar-SA"><StoryComponent /></ThemeProvider>
    ),
  ],
};
export const SmallDevice: Story = {
  render: () => <StepperDemo />,
  decorators: [
    (StoryComponent: React.ComponentType) => (
      <View style={{ width: 320, minHeight: 640 }}><StoryComponent /></View>
    ),
  ],
};
