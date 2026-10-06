import React, { useState } from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native';
import { Button } from '../../components/Button';
import { Text } from '../../components/Text';
import { useTheme } from '../../hooks';
import { OTPTemplate, type OTPTemplateVariant } from './OTPTemplate';

function OTPDemo({
  variant,
  initialVisible = true,
  error,
}: {
  variant: OTPTemplateVariant;
  initialVisible?: boolean;
  error?: string;
}) {
  const { theme } = useTheme();
  const [visible, setVisible] = useState(initialVisible);
  const [value, setValue] = useState('');
  const [message, setMessage] = useState('');

  return (
    <View style={{ flex: 1, minHeight: 640 }}>
      {!visible ? (
        <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1, gap: theme.spacing.md }}>
          <Text value={message || 'Verification closed'} tone="secondary" />
          <Button title="Open OTP" onPress={() => setVisible(true)} />
        </View>
      ) : null}
      <OTPTemplate
        variant={variant}
        visible={visible}
        value={value}
        onChange={setValue}
        onClose={() => setVisible(false)}
        onSubmit={code => {
          setMessage(`Verified code ${code}`);
          setVisible(false);
        }}
        onResend={() => {
          setValue('');
          setMessage('A new code was sent');
        }}
        title="Verify your mobile number"
        description="Enter the four-digit code sent to"
        destination="+966 •• ••• 2481"
        {...(error ? { error } : {})}
      />
    </View>
  );
}

const meta = {
  title: 'Templates/OTP',
  component: OTPTemplate,
  parameters: {
    controls: { disable: true },
    layout: 'fullscreen',
  },
} satisfies Meta<typeof OTPTemplate>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BottomSheet: Story = {
  render: () => <OTPDemo variant="bottomSheet" />,
};

export const MiddleScreenOverlay: Story = {
  render: () => <OTPDemo variant="overlay" />,
};

export const FullScreen: Story = {
  render: () => <OTPDemo variant="fullScreen" />,
};

export const ErrorState: Story = {
  render: () => <OTPDemo variant="fullScreen" error="The code is incorrect. Try again." />,
};

export const SixDigitSecure: Story = {
  render: function SixDigitStory() {
    const [value, setValue] = useState('');
    return (
      <OTPTemplate
        variant="fullScreen"
        value={value}
        onChange={setValue}
        onSubmit={() => undefined}
        length={6}
        secure
        title="Confirm transaction"
        description="Enter the secure code to authorize this payment."
      />
    );
  },
};

export const ArabicRTL: Story = {
  render: function ArabicStory() {
    const [value, setValue] = useState('');
    return (
      <OTPTemplate
        variant="fullScreen"
        value={value}
        onChange={setValue}
        onSubmit={() => undefined}
        title="أدخل رمز التحقق"
        description="أدخل الرمز المكون من أربعة أرقام المرسل إلى"
        destination="+966 •• ••• 2481"
        submitLabel="تحقق"
        resendLabel="إعادة إرسال الرمز"
      />
    );
  },
};
