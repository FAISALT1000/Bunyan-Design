import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-native';
import { Stack } from '../base/Stack';
import { Button } from '../components/Button';
import { Icon } from '../components/Icon';
import { Text } from '../components/Text';
import { ToastProvider } from '../components/Toast';
import { View } from '../components/RNTheme';
import { iconCategories } from '../icons/glyphs';
import {
  ActionCard,
  AmountCard,
  DataState,
  DetailsCard,
  Grid,
  Money,
  OneLineCard,
  OverlayProvider,
  ProductCard,
  ProfileCard,
  ScreenContent,
  Section,
  SettingsGroup,
  StatCard,
  StatusBanner,
  StatusCard,
  StatusModal,
  StatusScreen,
  ThreeLineCard,
  TwoLineCard,
  useActionSheet,
  useConfirm,
  usePrompt,
  useStatusToast,
  type StatusKind,
} from '.';

const noop = () => undefined;

const meta = {
  title: 'Presets',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const LineCards: Story = {
  render: function LineCardsStory() {
    const [dark, setDark] = useState(false);
    return (
      <Stack gap="sm">
        <OneLineCard icon="globe" title="Language" value="العربية" chevron onPress={noop} />
        <OneLineCard icon="moon" title="Dark mode" toggle={{ value: dark, onChange: setDark }} />
        <TwoLineCard avatar={{ name: 'Sara Ali', status: 'online' }} title="Sara Ali" subtitle="sara@company.sa" badge={{ label: 'Admin', tone: 'primary' }} chevron onPress={noop} />
        <TwoLineCard icon={{ name: 'transfer', tone: 'primary' }} title="Transfer to Ahmed" subtitle="Today, 10:24" value={<Money amount={-1250} currency="SAR" signed colorize variant="bodySmall" />} subValue="Completed" />
        <ThreeLineCard icon={{ name: 'warning', tone: 'warning' }} title="Card payment declined" subtitle="Visa •••• 4821" description="The merchant could not verify your card." meta="2m" unread />
        <TwoLineCard title="Loading" loading />
      </Stack>
    );
  },
};

export const ValueCards: Story = {
  render: function ValueCardsStory() {
    const [liked, setLiked] = useState(false);
    return (
      <Stack gap="md">
        <AmountCard variant="primary" label="Available balance" amount={25430.5} currency="SAR" trend={{ value: '+4.2%', direction: 'up' }} hideable
          actions={[{ title: 'Transfer', icon: 'transfer', onPress: noop }, { title: 'Top up', icon: 'plus', onPress: noop }]} />
        <Grid columns={2}>
          <StatCard label="Orders" value={128} trend={{ value: '+12', direction: 'up' }} />
          <StatCard label="Refunds" value={3} trend={{ value: '-2', direction: 'down' }} />
        </Grid>
        <Grid columns={2}>
          <ProductCard title="Earbuds Pro" price={349} oldPrice={499} currency="SAR" rating={4.6} reviews={1280} badge={{ label: '-30%', tone: 'error' }}
            favorite={{ value: liked, onChange: setLiked }} cta={{ title: 'Add', icon: 'cart', onPress: noop }} />
          <ProductCard title="Smart Watch" price={899} currency="SAR" cta={{ title: 'Add', icon: 'cart', onPress: noop }} />
        </Grid>
        <ProfileCard layout="centered" name="Faisal Alhejaili" subtitle="Product designer" badges={[{ label: 'Admin', tone: 'primary' }]}
          stats={[{ label: 'Projects', value: 24 }, { label: 'Teams', value: 3 }]} actions={[{ title: 'Edit profile', onPress: noop }]} />
        <Grid columns={2}>
          <ActionCard icon="transfer" title="Transfer" description="Local & international" onPress={noop} />
          <ActionCard icon={{ name: 'card', tone: 'info' }} title="Cards" description="Freeze, limits, PIN" badge="New" onPress={noop} />
        </Grid>
        <StatusCard status="warning" compact title="Verify your email" message="sara@company.sa" primaryAction={{ title: 'Resend', onPress: noop }} />
      </Stack>
    );
  },
};

export const Groups: Story = {
  render: function GroupsStory() {
    const [push, setPush] = useState(true);
    return (
      <Stack gap="lg">
        <SettingsGroup title="Preferences" footer="Changes apply on all devices." items={[
          { icon: 'globe', title: 'Language', value: 'العربية', chevron: true, onPress: noop },
          { icon: 'bell', title: 'Notifications', toggle: { value: push, onChange: setPush } },
          { icon: 'face-id', title: 'Face ID', subtitle: 'Unlock with your face', toggle: { value: false, onChange: noop } },
        ]} />
        <DetailsCard title="Transfer details" onCopy={noop} rows={[
          { label: 'Beneficiary', value: 'Ahmed Saleh' },
          { label: 'Reference', value: 'TRX-482193', copyable: true },
          { label: 'Status', badge: { label: 'Completed', tone: 'success' } },
        ]} total={{ label: 'Total', value: <Money amount={1250} currency="SAR" variant="bodyLarge" /> }} />
        <Section title="Saved cards" action={{ title: 'Add', onPress: noop }} isEmpty empty={{ title: 'No cards yet', icon: 'card' }} />
      </Stack>
    );
  },
};

function StatusDemo() {
  const [status, setStatus] = useState<StatusKind>('pending');
  return (
    <View style={{ height: 640 }}>
      <StatusScreen
        status={status}
        title={status === 'success' ? 'Transfer sent' : status === 'error' ? 'Transfer failed' : 'Processing transfer'}
        subtitle="1,250.00 SAR to Ahmed Saleh"
        primaryAction={{ title: status === 'pending' ? 'Finish (success)' : 'Again', onPress: () => setStatus(status === 'pending' ? 'success' : 'pending') }}
        secondaryAction={{ title: 'Fail', onPress: () => setStatus('error') }}
      >
        <DetailsCard rows={[{ label: 'Reference', value: 'TRX-482193' }]} />
      </StatusScreen>
    </View>
  );
}

export const StatusScreenFlow: Story = { render: () => <StatusDemo /> };

export const StatusModalAndBanner: Story = {
  render: function StatusModalStory() {
    const [open, setOpen] = useState(false);
    return (
      <Stack gap="sm">
        <StatusBanner status="error" title="No internet connection" action={{ title: 'Retry', onPress: noop }} />
        <StatusBanner status="pending" title="Syncing your data…" />
        <StatusBanner status="success" title="All changes saved" onDismiss={noop} />
        <Button title="Open status modal" onPress={() => setOpen(true)} />
        <StatusModal visible={open} status="error" title="Payment failed" subtitle="The card was declined." onClose={() => setOpen(false)}
          primaryAction={{ title: 'Try another card', onPress: () => setOpen(false) }} secondaryAction={{ title: 'Cancel', onPress: () => setOpen(false) }}>
          <Text value="Error 51 · Insufficient funds" variant="caption" tone="secondary" align="center" />
        </StatusModal>
      </Stack>
    );
  },
};

function ToastDemo() {
  const status = useStatusToast();
  return (
    <Button
      title="Upload (pending → success)"
      onPress={() => void status.run(new Promise(resolve => setTimeout(resolve, 1500)), { pending: 'Uploading…', success: 'Uploaded', error: 'Upload failed' })}
    />
  );
}

export const StatusToast: Story = {
  render: () => <ToastProvider><View style={{ height: 400 }}><ToastDemo /></View></ToastProvider>,
};

function OverlayDemo() {
  const confirm = useConfirm();
  const actionSheet = useActionSheet();
  const prompt = usePrompt();
  const [result, setResult] = useState('—');
  return (
    <Stack gap="sm">
      <Text value={`Result: ${result}`} />
      <Button title="Confirm" onPress={() => void confirm({ title: 'Delete card?', message: 'This cannot be undone.', danger: true, confirmText: 'Delete' }).then(ok => setResult(String(ok)))} />
      <Button title="Action sheet" variant="outline" onPress={() => void actionSheet({ title: 'Card options', options: [
        { value: 'freeze', title: 'Freeze card', icon: 'lock' },
        { value: 'limits', title: 'Change limits', icon: 'sliders' },
        { value: 'delete', title: 'Delete card', icon: 'trash', destructive: true },
      ] }).then(value => setResult(String(value)))} />
      <Button title="Prompt" variant="ghost" onPress={() => void prompt({ title: 'Rename card', label: 'Card name', validate: v => (v ? undefined : 'Required') }).then(value => setResult(String(value)))} />
    </Stack>
  );
}

export const Overlays: Story = { render: () => <OverlayProvider><OverlayDemo /></OverlayProvider> };

export const DataStates: Story = {
  render: () => (
    <Stack gap="lg">
      <DataState loading>{() => null}</DataState>
      <DataState data={[]} empty={{ title: 'No transfers yet', icon: 'transfer' }}>{() => null}</DataState>
      <DataState error={new Error('Check your connection')} onRetry={noop}>{() => null}</DataState>
    </Stack>
  ),
};

export const ScreenBuilder: Story = {
  render: () => (
    <View style={{ height: 700 }}>
      <ScreenContent blocks={[
        { type: 'ProfileCard', name: 'Faisal Alhejaili', subtitle: 'Product designer', badges: [{ label: 'Admin', tone: 'primary' }] },
        { type: 'AmountCard', variant: 'primary', label: 'Available balance', amount: 25430.5, currency: 'SAR' },
        { type: 'Section', title: 'Recent transfers', action: { title: 'See all', onPress: noop }, blocks: [
          { type: 'List', data: [{ name: 'Ahmed Saleh', amount: -1250 }, { name: 'Noura Omar', amount: 400 }], renderAs: 'TwoLineCard',
            formatItem: (item: { name: string; amount: number }) => ({ avatar: { name: item.name }, title: item.name, subtitle: 'Today', value: <Money amount={item.amount} signed colorize variant="bodySmall" /> }) },
        ] },
        { type: 'Button', title: 'Log out', variant: 'danger', onPress: noop },
      ]} />
    </View>
  ),
};

export const Icons: Story = {
  render: () => (
    <Stack gap="md">
      {Object.entries(iconCategories).map(([category, names]) => (
        <Stack key={category} gap="xs">
          <Text value={category} variant="labelMedium" weight="bold" />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            {names.map(name => <Icon key={name} name={name} size="lg" />)}
          </View>
        </Stack>
      ))}
    </Stack>
  ),
};
