import React, { useState } from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native';
import {
  Accordion,
  Alert,
  Avatar,
  Badge,
  BottomSheet,
  Button,
  Card,
  Checkbox,
  Chip,
  DatePicker,
  Divider,
  EmptyState,
  ErrorState,
  Heading,
  Icon,
  IconButton,
  InputField,
  ListItem,
  Modal,
  Radio,
  Select,
  Skeleton,
  Spinner,
  Switch,
  Tabs,
  Text,
  TextArea,
  ToastProvider,
  Tooltip,
  useTheme,
} from '../../index';

function Catalog() {
  const { theme } = useTheme();
  const [checked, setChecked] = useState(false);
  const [switched, setSwitched] = useState(true);
  const [selected, setSelected] = useState('one');
  const [tab, setTab] = useState('overview');
  const [date, setDate] = useState<Date>();
  const [modal, setModal] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [query, setQuery] = useState('');

  return (
    <ToastProvider>
      <View style={{ gap: theme.spacing.xxl }}>
        <Heading title="Bunyan component catalog" level={1} />
        <Text
          value="A compact visual regression surface for every exported component."
          tone="secondary"
        />

        <Card variant="outline">
          <View style={{ gap: theme.spacing.md }}>
            <Heading title="Typography and actions" level={4} />
            <View style={{ gap: theme.spacing.xs }}>
              <Text value="Body text with an accessible link." />
              <Button title="Open accessible link" variant="link" actionType="navigation" />
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
              <Button title="Primary" leftIcon="check" />
              <IconButton icon="search" accessibilityLabel="Search" />
              <Badge label="Approved" tone="success" />
              <Chip label="Enterprise" selected />
              <Avatar name="Bunyan System" />
              <Tooltip content="Helpful context"><Icon name="info" accessibilityLabel="Information" /></Tooltip>
            </View>
          </View>
        </Card>

        <Card>
          <View style={{ gap: theme.spacing.lg }}>
            <Heading title="Form controls" level={4} />
            <InputField label="Full name" value={name} onChangeText={setName} required />
            <InputField type="password" label="Password" value={password} onChangeText={setPassword} />
            <InputField type="search" label="Search records" value={query} onChangeText={setQuery} showClearButton />
            <TextArea placeholder="Add notes" maxLength={200} />
            <Checkbox checked={checked} onChange={setChecked} label="Accept terms" />
            <Radio selected onSelect={() => undefined} label="Primary account" />
            <Switch value={switched} onValueChange={setSwitched} label="Notifications" />
            <Select
              value={selected}
              onValueChange={setSelected}
              options={[{ value: 'one', label: 'Option one' }, { value: 'two', label: 'Option two' }]}
            />
            <DatePicker {...(date ? { value: date } : {})} onChange={setDate} />
          </View>
        </Card>

        <Alert tone="information" title="Information" description="This record is synchronized automatically." />
        <Alert tone="error" title="Could not save" description="Review the highlighted fields." />
        <Divider />
        <ListItem title="Account settings" description="Security and preferences" leading={<Avatar name="Account" />} onPress={() => undefined} />
        <Accordion title="Advanced details">
          <Text value="Expanded enterprise configuration." />
        </Accordion>
        <Tabs
          value={tab}
          onValueChange={setTab}
          items={[{ value: 'overview', label: 'Overview' }, { value: 'activity', label: 'Activity', badge: '12' }]}
        />
        <View style={{ flexDirection: 'row', gap: theme.spacing.lg }}>
          <Spinner label="Loading" />
          <View style={{ flex: 1 }}><Skeleton lines={3} /></View>
        </View>
        <EmptyState title="No records" description="Create a record to get started." actionLabel="Create record" onAction={() => undefined} />
        <ErrorState title="Unable to load" description="Check your connection and retry." onRetry={() => undefined} />
        <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
          <Button title="Open modal" onPress={() => setModal(true)} />
          <Button
            title="Open sheet"
            variant="outline"
            onPress={() => setSheet(true)}
          />
        </View>
        <Modal visible={modal} onClose={() => setModal(false)} title="Confirm change">
          <Text value="This action updates the selected record." />
        </Modal>
        <BottomSheet visible={sheet} onClose={() => setSheet(false)} title="Actions">
          <ListItem title="Share record" onPress={() => setSheet(false)} />
        </BottomSheet>
      </View>
    </ToastProvider>
  );
}

const meta = {
  title: 'Overview/Component Catalog',
  component: Catalog,
} satisfies Meta<typeof Catalog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const ErrorStates: Story = {
  render: () => (
    <View style={{ gap: 16 }}>
      <InputField
        type="email"
        label="Email"
        value="invalid"
        onChangeText={() => undefined}
        errorText="Enter a valid email"
      />
      <Alert tone="error" title="Validation failed" description="Resolve all errors before continuing." />
    </View>
  ),
};
