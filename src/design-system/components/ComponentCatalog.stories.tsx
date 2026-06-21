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
  FormField,
  Heading,
  Icon,
  IconButton,
  Input,
  Link,
  ListItem,
  Modal,
  PasswordInput,
  Radio,
  SearchInput,
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

  return (
    <ToastProvider>
      <View style={{ gap: theme.spacing.xxl }}>
        <Heading level={1}>Bunyan component catalog</Heading>
        <Text tone="secondary">A compact visual regression surface for every exported component.</Text>

        <Card variant="outlined">
          <View style={{ gap: theme.spacing.md }}>
            <Heading level={4}>Typography and actions</Heading>
            <Text>Body text with <Link>an accessible link</Link>.</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
              <Button leadingIcon="check">Primary</Button>
              <IconButton icon="search" accessibilityLabel="Search" />
              <Badge tone="success">Approved</Badge>
              <Chip label="Enterprise" selected />
              <Avatar name="Bunyan System" />
              <Tooltip content="Helpful context"><Icon name="info" accessibilityLabel="Information" /></Tooltip>
            </View>
          </View>
        </Card>

        <Card>
          <View style={{ gap: theme.spacing.lg }}>
            <Heading level={4}>Form controls</Heading>
            <FormField label="Full name" required><Input placeholder="Enter your name" /></FormField>
            <FormField label="Password"><PasswordInput placeholder="Enter a password" /></FormField>
            <SearchInput value="" placeholder="Search records" />
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
        <Accordion title="Advanced details"><Text>Expanded enterprise configuration.</Text></Accordion>
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
          <Button onPress={() => setModal(true)}>Open modal</Button>
          <Button variant="outline" onPress={() => setSheet(true)}>Open sheet</Button>
        </View>
        <Modal visible={modal} onClose={() => setModal(false)} title="Confirm change">
          <Text>This action updates the selected record.</Text>
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
      <FormField label="Email" error="Enter a valid email"><Input status="error" value="invalid" /></FormField>
      <Alert tone="error" title="Validation failed" description="Resolve all errors before continuing." />
    </View>
  ),
};
