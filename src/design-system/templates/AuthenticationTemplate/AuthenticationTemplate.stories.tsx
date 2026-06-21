import React, { useState } from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native';
import { Avatar } from '../../components/Avatar';
import { FormField } from '../../components/FormField';
import { Input } from '../../components/Input';
import { PasswordInput } from '../../components/PasswordInput';
import { useTheme } from '../../hooks';
import { OTPTemplate } from '../OTPTemplate';
import { AuthenticationTemplate } from './AuthenticationTemplate';

function LoginDemo({ error, loading = false }: { error?: string; loading?: boolean }) {
  const { theme } = useTheme();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  return (
    <AuthenticationTemplate
      mode="login"
      title="Welcome back"
      description="Sign in securely to continue."
      logo={<Avatar name="Bunyan" size="xlarge" />}
      form={(
        <View style={{ gap: theme.spacing.lg }}>
          <FormField label="Username" required>
            <Input value={username} onChangeText={setUsername} autoCapitalize="none" />
          </FormField>
          <FormField label="Password" required>
            <PasswordInput value={password} onChangeText={setPassword} />
          </FormField>
        </View>
      )}
      {...(error !== undefined ? { error } : {})}
      primaryAction={{ label: 'Sign in', onPress: () => undefined, loading }}
      secondaryActions={[
        { label: 'Forgot password?', onPress: () => undefined },
        { label: 'Create an account', onPress: () => undefined },
      ]}
      biometricAction={{ label: 'Use biometrics', onPress: () => undefined }}
    />
  );
}

const meta = {
  title: 'Templates/Authentication',
  component: AuthenticationTemplate,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof AuthenticationTemplate>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Login: Story = { render: () => <LoginDemo /> };
export const Loading: Story = { render: () => <LoginDemo loading /> };
export const Error: Story = { render: () => <LoginDemo error="The username or password is incorrect." /> };
export const Registration: Story = {
  args: {
    mode: 'registration',
    title: 'Create your account',
    description: 'Enter your details to begin.',
    form: <Input placeholder="Mobile number" />,
    primaryAction: { label: 'Continue', onPress: () => undefined },
  },
};
export const PasswordReset: Story = {
  args: {
    mode: 'passwordReset',
    title: 'Reset password',
    description: 'Choose a strong new password.',
    form: <PasswordInput placeholder="New password" />,
    primaryAction: { label: 'Reset password', onPress: () => undefined },
  },
};
export const OTP: Story = {
  render: function OTPStory() {
    const [value, setValue] = useState('');
    return (
      <OTPTemplate
        variant="fullScreen"
        value={value}
        onChange={setValue}
        onSubmit={() => undefined}
        title="Verify your identity"
      />
    );
  },
};
