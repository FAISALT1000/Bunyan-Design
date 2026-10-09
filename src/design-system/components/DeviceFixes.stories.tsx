import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-native';
import { Inline } from '../base/Inline';
import { Stack } from '../base/Stack';
import { useTheme } from '../hooks';
import { ThemeProvider } from '../providers';
import type { ThemeMode } from '../themes/types';
import { Badge } from './Badge';
import { BottomSheet } from './BottomSheet';
import { Button } from './Button';
import { Chip } from './Chip';
import { Heading } from './Heading';
import { Icon } from './Icon';
import { InputField } from './InputField';
import { OTPInput } from './OTPInput';
import { View } from './RNTheme';
import { Text } from './Text';
import { ToastProvider, useToast } from './Toast';

/**
 * Visual checks for the 0.0.3 device fixes. Open each story on a real Android
 * phone (gesture and 3-button navigation) and an iPhone with a home indicator.
 */
const meta = {
  title: 'QA/Device fixes 0.0.3',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function Fields({ arabic }: { arabic: boolean }) {
  const [email, setEmail] = useState('name@example.com');
  const [search, setSearch] = useState('');
  const [password, setPassword] = useState('');
  const [server, setServer] = useState('');
  return (
    <Stack gap="lg">
      <InputField type="email" label={arabic ? 'البريد' : 'Email'} value={email} onChangeText={setEmail} />
      <InputField type="search" label={arabic ? 'بحث' : 'Search'} value={search} onChangeText={setSearch} leftIcon="search" />
      <InputField type="password" label={arabic ? 'كلمة المرور الجديدة' : 'New password'} value={password} onChangeText={setPassword} />
      <InputField
        type="url"
        label={arabic ? 'عنوان الخادم الكامل مع المنفذ' : 'Server address including port and path'}
        value={server}
        onChangeText={setServer}
        leftIcon="globe"
      />
    </Stack>
  );
}

/** 1 + 2: floated labels line up with the text; empty labels share the icon centre line. */
export const InputFieldAlignment: Story = {
  render: () => (
    <Stack gap="xxl">
      <ThemeProvider locale="en"><Fields arabic={false} /></ThemeProvider>
      <ThemeProvider locale="ar-SA"><Fields arabic /></ThemeProvider>
    </Stack>
  ),
};

/** 3 + 4: chip labels centred; the badge follows the row's `alignItems: 'center'`. */
export const ChipsAndBadges: Story = {
  render: function ChipsAndBadgesStory() {
    const [language, setLanguage] = useState('en');
    return (
      <Stack gap="xl">
        <Inline gap="sm">
          <Chip label="EN" selected={language === 'en'} onPress={() => setLanguage('en')} />
          <Chip label="عربي" selected={language === 'ar'} onPress={() => setLanguage('ar')} />
        </Inline>
        <Inline gap="sm" alignItems="center">
          <Heading title="Faisal Alhejaili" level={4} />
          <Badge label="Admin" tone="primary" />
        </Inline>
      </Stack>
    );
  },
};

/** 5 + 6: tap or long-press the slots inside a sheet; the sheet stays above the keyboard and nav bar. */
export const OTPInBottomSheet: Story = {
  render: function OTPInBottomSheetStory() {
    const [open, setOpen] = useState(false);
    const [code, setCode] = useState('');
    return (
      <ThemeProvider locale="ar-SA">
        <Button title="Open verification sheet" onPress={() => setOpen(true)} />
        <BottomSheet visible={open} onClose={() => setOpen(false)} title="Verify">
          <Stack gap="lg">
            <OTPInput value={code} onChange={setCode} length={6} autoFocus />
            <Button title="Verify" onPress={() => setOpen(false)} fullWidth />
            <Button title="Cancel" variant="ghost" onPress={() => setOpen(false)} fullWidth />
          </Stack>
        </BottomSheet>
      </ThemeProvider>
    );
  },
};

const TAB_BAR_HEIGHT = 56;

function ToastDemo() {
  const { showToast } = useToast();
  const { theme } = useTheme();
  return (
    <View style={{ flex: 1, minHeight: 480, justifyContent: 'space-between' }}>
      <Button title="Show toast" onPress={() => showToast({ message: 'Settings saved', tone: 'success' })} />
      <View
        style={{
          height: TAB_BAR_HEIGHT,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-around',
          borderTopWidth: theme.borderWidth.thin,
          borderTopColor: theme.color.border.secondary,
        }}
      >
        <Icon name="grid" />
        <Icon name="bell" />
        <Icon name="settings" />
      </View>
    </View>
  );
}

/** 7: toasts clear the system navigation bar and the app's tab bar. */
export const ToastWithTabBar: Story = {
  render: () => (
    <ToastProvider bottomOffset={TAB_BAR_HEIGHT}>
      <ToastDemo />
    </ToastProvider>
  ),
};

function ModeSample({ mode }: { mode: ThemeMode }) {
  const { theme, isDark } = useTheme();
  return (
    <View
      style={{
        padding: theme.spacing.lg,
        gap: theme.spacing.sm,
        borderRadius: theme.radius.lg,
        backgroundColor: theme.color.background.primary,
        borderWidth: theme.borderWidth.thin,
        borderColor: theme.color.border.primary,
      }}
    >
      <Inline gap="sm" alignItems="center">
        <Icon name={isDark ? 'moon' : 'sun'} />
        <Heading title={mode} level={4} />
        <Badge label={isDark ? 'dark' : 'light'} />
      </Inline>
      <Text value="Body text on the page background." tone="secondary" />
      <Button title="Primary action" onPress={() => undefined} />
    </View>
  );
}

/** 8 + 9: every theme mode, including the new dim and sepia. */
export const ThemeModes: Story = {
  render: () => (
    <Stack gap="md">
      {(['light', 'dark', 'black', 'dim', 'sepia'] as const).map(mode => (
        <ThemeProvider key={mode} initialPreference={mode}>
          <ModeSample mode={mode} />
        </ThemeProvider>
      ))}
    </Stack>
  ),
};
