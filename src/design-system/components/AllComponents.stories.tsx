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
  useToast,
} from '../../index';

function StoryStack({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  return <View style={{ gap: theme.spacing.lg }}>{children}</View>;
}

function CheckboxDemo() {
  const [checked, setChecked] = useState(false);
  return <Checkbox checked={checked} onChange={setChecked} label="Accept terms" description="Required to continue" />;
}

function RadioDemo() {
  const [value, setValue] = useState('standard');
  return (
    <StoryStack>
      <Radio selected={value === 'standard'} onSelect={() => setValue('standard')} label="Standard plan" />
      <Radio selected={value === 'premium'} onSelect={() => setValue('premium')} label="Premium plan" />
    </StoryStack>
  );
}

function SwitchDemo() {
  const [enabled, setEnabled] = useState(true);
  return <Switch value={enabled} onValueChange={setEnabled} label="Notifications" description="Receive account updates" />;
}

function SelectDemo() {
  const [value, setValue] = useState('riyadh');
  return (
    <Select
      title="Select a city"
      value={value}
      onValueChange={setValue}
      searchable
      options={[
        { value: 'riyadh', label: 'Riyadh' },
        { value: 'jeddah', label: 'Jeddah' },
        { value: 'dammam', label: 'Dammam' },
      ]}
    />
  );
}

function DatePickerDemo() {
  const [date, setDate] = useState<Date>();
  return <DatePicker {...(date ? { value: date } : {})} onChange={setDate} />;
}

function ChipDemo() {
  const [selected, setSelected] = useState(false);
  return <Chip label="Enterprise" selected={selected} onPress={() => setSelected(current => !current)} />;
}

function AccordionDemo() {
  return (
    <Accordion title="Account details">
      <Text
        value="Your enterprise account is active and verified."
        tone="secondary"
      />
    </Accordion>
  );
}

function TabsDemo() {
  const [tab, setTab] = useState('overview');
  return (
    <StoryStack>
      <Tabs
        value={tab}
        onValueChange={setTab}
        items={[
          { value: 'overview', label: 'Overview' },
          { value: 'activity', label: 'Activity', badge: '12' },
          { value: 'settings', label: 'Settings' },
        ]}
      />
      <Text value={`Selected tab: ${tab}`} />
    </StoryStack>
  );
}

function ModalDemo() {
  const [visible, setVisible] = useState(false);
  return (
    <>
      <Button title="Open modal" onPress={() => setVisible(true)} />
      <Modal
        visible={visible}
        onClose={() => setVisible(false)}
        title="Confirm changes"
        description="Review the information before continuing."
        primaryAction={{ label: 'Confirm', onPress: () => setVisible(false) }}
        secondaryAction={{ label: 'Cancel', onPress: () => setVisible(false) }}
      >
        <Text value="The selected account settings will be updated." />
      </Modal>
    </>
  );
}

function BottomSheetDemo() {
  const [visible, setVisible] = useState(false);
  return (
    <>
      <Button title="Open bottom sheet" onPress={() => setVisible(true)} />
      <BottomSheet visible={visible} onClose={() => setVisible(false)} title="Account actions">
        <ListItem title="Share account" onPress={() => setVisible(false)} />
        <ListItem title="Download statement" onPress={() => setVisible(false)} />
      </BottomSheet>
    </>
  );
}

function ToastTrigger() {
  const { showToast } = useToast();
  return (
    <Button
      title="Show toast"
      onPress={() => showToast({
        message: 'Changes saved successfully',
        tone: 'success',
      })}
    />
  );
}

function ToastDemo() {
  return (
    <ToastProvider>
      <ToastTrigger />
    </ToastProvider>
  );
}

const meta = {
  title: 'Components',
  component: View,
  parameters: {
    controls: { disable: true },
  },
} satisfies Meta<typeof View>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TextComponent: Story = {
  name: 'Text',
  render: () => (
    <StoryStack>
      <Text value="Primary body text" />
      <Text
        value="Secondary supporting text"
        variant="bodySmall"
        tone="secondary"
      />
      <Text value="Caption text" variant="caption" tone="tertiary" />
      <Text value="const bunyan = true;" variant="bodySmall" />
    </StoryStack>
  ),
};

export const HeadingComponent: Story = {
  name: 'Heading',
  render: () => (
    <StoryStack>
      <Heading title="Heading one" level={1} />
      <Heading title="Heading two" level={2} />
      <Heading title="Heading three" level={3} />
      <Heading title="Heading four" level={4} />
    </StoryStack>
  ),
};

export const IconComponent: Story = {
  name: 'Icon',
  render: () => (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
      <Icon name="search" accessibilityLabel="Search" />
      <Icon name="success" tone="success" accessibilityLabel="Success" />
      <Icon name="warning" tone="warning" accessibilityLabel="Warning" />
      <Icon name="error" tone="error" accessibilityLabel="Error" />
      <Icon name="user" accessibilityLabel="User" />
    </View>
  ),
};

export const ButtonComponent: Story = {
  name: 'Button',
  render: () => (
    <StoryStack>
      <Button title="Primary" />
      <Button title="Secondary" variant="secondary" />
      <Button title="Outline" variant="outline" />
      <Button title="Danger" variant="danger" />
      <Button title="Loading" loading />
    </StoryStack>
  ),
};

export const IconButtonComponent: Story = {
  name: 'IconButton',
  render: () => (
    <View style={{ flexDirection: 'row', gap: 12 }}>
      <IconButton icon="search" accessibilityLabel="Search" />
      <IconButton icon="check" variant="filled" accessibilityLabel="Approve" />
      <IconButton icon="close" variant="outline" accessibilityLabel="Close" />
    </View>
  ),
};

export const LinkComponent: Story = {
  name: 'Link',
  render: () => (
    <Link label="View documentation" href="https://example.com" external />
  ),
};

export const InputComponent: Story = {
  name: 'Input',
  render: () => (
    <StoryStack>
      <Input placeholder="Default input" />
      <Input leftIcon="search" placeholder="With icon" />
      <Input status="error" value="Invalid value" />
      <Input editable={false} value="Disabled input" />
    </StoryStack>
  ),
};

export const PasswordInputComponent: Story = {
  name: 'PasswordInput',
  render: () => <PasswordInput placeholder="Enter password" />,
};

export const TextAreaComponent: Story = {
  name: 'TextArea',
  render: () => <TextArea placeholder="Add notes" maxLength={200} />,
};

export const SearchInputComponent: Story = {
  name: 'SearchInput',
  render: function SearchStory() {
    const [query, setQuery] = useState('');
    return <SearchInput value={query} onChangeText={setQuery} onClear={() => setQuery('')} placeholder="Search records" />;
  },
};

export const FormFieldComponent: Story = {
  name: 'FormField',
  render: () => (
    <FormField label="Email address" description="Use your work email" error="Enter a valid email" required>
      {ids => <Input accessibilityLabelledBy={ids.labelId} aria-describedby={ids.errorId} status="error" value="invalid" />}
    </FormField>
  ),
};

export const CheckboxComponent: Story = {
  name: 'Checkbox',
  render: () => <CheckboxDemo />,
};

export const RadioComponent: Story = {
  name: 'Radio',
  render: () => <RadioDemo />,
};

export const SwitchComponent: Story = {
  name: 'Switch',
  render: () => <SwitchDemo />,
};

export const SelectComponent: Story = {
  name: 'Select',
  render: () => <SelectDemo />,
};

export const DatePickerComponent: Story = {
  name: 'DatePicker',
  render: () => <DatePickerDemo />,
};

export const BadgeComponent: Story = {
  name: 'Badge',
  render: () => (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
      <Badge label="Neutral" />
      <Badge label="Primary" tone="primary" />
      <Badge label="Approved" tone="success" />
      <Badge label="Pending" tone="warning" />
      <Badge label="Rejected" tone="error" />
    </View>
  ),
};

export const ChipComponent: Story = {
  name: 'Chip',
  render: () => <ChipDemo />,
};

export const AvatarComponent: Story = {
  name: 'Avatar',
  render: () => (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
      <Avatar name="Fatimah Ali" size="small" />
      <Avatar name="Fatimah Ali" size="medium" />
      <Avatar name="Fatimah Ali" size="large" />
      <Avatar size="xlarge" />
    </View>
  ),
};

export const DividerComponent: Story = {
  name: 'Divider',
  render: () => (
    <StoryStack>
      <Text value="Content above" />
      <Divider />
      <Text value="Content below" />
    </StoryStack>
  ),
};

export const CardComponent: Story = {
  name: 'Card',
  render: () => (
    <StoryStack>
      <Card variant="outline"><Text value="Outlined card" /></Card>
      <Card variant="tertiary"><Text value="Filled card" /></Card>
      <Card variant="elevated"><Text value="Elevated card" /></Card>
    </StoryStack>
  ),
};

export const ListItemComponent: Story = {
  name: 'ListItem',
  render: () => (
    <StoryStack>
      <ListItem title="Account settings" description="Security and preferences" leading={<Avatar name="Account Settings" />} onPress={() => undefined} />
      <ListItem title="Selected record" selected showChevron={false} onPress={() => undefined} />
      <ListItem title="Disabled record" disabled onPress={() => undefined} />
    </StoryStack>
  ),
};

export const AccordionComponent: Story = {
  name: 'Accordion',
  render: () => <AccordionDemo />,
};

export const TabsComponent: Story = {
  name: 'Tabs',
  render: () => <TabsDemo />,
};

export const ModalComponent: Story = {
  name: 'Modal',
  render: () => <ModalDemo />,
};

export const BottomSheetComponent: Story = {
  name: 'BottomSheet',
  render: () => <BottomSheetDemo />,
};

export const TooltipComponent: Story = {
  name: 'Tooltip',
  render: () => (
    <Tooltip content="Search all records">
      <IconButton icon="search" accessibilityLabel="Search" />
    </Tooltip>
  ),
};

export const ToastComponent: Story = {
  name: 'Toast',
  render: () => <ToastDemo />,
};

export const AlertComponent: Story = {
  name: 'Alert',
  render: () => (
    <StoryStack>
      <Alert tone="information" title="Information" description="Your account synchronizes automatically." />
      <Alert tone="success" title="Saved successfully" />
      <Alert tone="warning" title="Session expires soon" />
      <Alert tone="error" title="Unable to save" description="Review the highlighted fields." />
    </StoryStack>
  ),
};

export const SkeletonComponent: Story = {
  name: 'Skeleton',
  render: () => <Skeleton lines={4} />,
};

export const SpinnerComponent: Story = {
  name: 'Spinner',
  render: () => (
    <View style={{ flexDirection: 'row', gap: 32 }}>
      <Spinner label="Loading" />
      <Spinner size="large" label="Loading records" />
    </View>
  ),
};

export const EmptyStateComponent: Story = {
  name: 'EmptyState',
  render: () => <EmptyState title="No records" description="Create your first record to get started." actionLabel="Create record" onAction={() => undefined} />,
};

export const ErrorStateComponent: Story = {
  name: 'ErrorState',
  render: () => <ErrorState title="Unable to load records" description="Check your connection and try again." onRetry={() => undefined} />,
};
