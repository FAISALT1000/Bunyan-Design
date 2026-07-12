import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  Accordion,
  Alert,
  ApplicationAdapterProvider,
  Avatar,
  Badge,
  BottomSheet,
  Box,
  Button,
  Card,
  Checkbox,
  Chip,
  DatePicker,
  DesignSystemProvider,
  Divider,
  EmptyState,
  ErrorState,
  FormField,
  Heading,
  Icon,
  IconButton,
  Inline,
  InputField,
  Line,
  ListItem,
  Modal,
  NavigationProvider,
  NavigationScope,
  Radio,
  ScrollContainer,
  Select,
  Skeleton,
  Spinner,
  Stack,
  Switch,
  Tabs,
  Text,
  TextArea,
  ToastProvider,
  Tooltip,
  useAccessibility,
  useAppState,
  useAsyncAction,
  useClipboard,
  useDebounce,
  useDisclosure,
  useHaptics,
  useKeyboard,
  useNavigation,
  useNetworkStatus,
  usePermissions,
  usePrevious,
  useRTL,
  useSafeArea,
  useTheme,
  useToast,
  useToggle,
  type ThemePreference,
} from '@bunyan/design-system';

import { previewAdapters } from './adapters';
import {
  previewNavigationAdapter,
  previewNavigationEvents,
  type PreviewLayout,
  type PreviewNavigationEvent,
  type PreviewNavigationOptions,
  type PreviewScreenParams,
} from './navigation';
import {
  previewTranslations,
  type PreviewLocale,
} from './translations';

type PreviewTab = 'components' | 'inputs' | 'overlays' | 'states' | 'hooks';

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Card variant="elevated" size="large" title={title} subtitle={description}>
      <Stack gap="lg">{children}</Stack>
    </Card>
  );
}

function ComponentSwatch({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Stack gap="sm">
      <Text value={title} variant="labelLarge" weight="semibold" />
      <Box>{children}</Box>
    </Stack>
  );
}

function ComponentsPreview() {
  const [checked, setChecked] = useState(true);
  const [radio, setRadio] = useState('monthly');
  const [switchValue, setSwitchValue] = useState(true);
  const [tab, setTab] = useState('accounts');
  const [chipSelected, setChipSelected] = useState(true);

  return (
    <Stack gap="xl">
      <Section title="Foundations" description="Typography, icons, status colors, and layout primitives.">
        <ComponentSwatch title="Typography">
          <Stack gap="xs">
            <Heading title="Heading large" level={3} />
            <Text value="Body text uses semantic variants, dynamic font scaling, and logical alignment." />
            <Text value="Secondary caption" variant="caption" tone="secondary" />
          </Stack>
        </ComponentSwatch>

        <ComponentSwatch title="Icons">
          <Inline gap="lg" flexWrap="wrap" alignItems="center">
            {(['search', 'settings', 'transfer', 'success', 'warning', 'error', 'chevron-end'] as const).map(name => (
              <Icon key={name} name={name} size="lg" tone={name === 'error' ? 'error' : name === 'warning' ? 'warning' : 'primary'} mirroredInRTL />
            ))}
            <IconButton icon="settings" accessibilityLabel="Settings" variant="outline" />
          </Inline>
        </ComponentSwatch>

        <ComponentSwatch title="Badges and chips">
          <Inline gap="sm" flexWrap="wrap">
            <Badge label="Neutral" />
            <Badge label="Success" tone="success" />
            <Badge label="Warning" tone="warning" />
            <Badge label="Error" tone="error" />
            <Chip label="Selected chip" selected={chipSelected} onPress={() => setChipSelected(current => !current)} />
            <Chip label="Removable" onRemove={() => setChipSelected(false)} />
          </Inline>
        </ComponentSwatch>
      </Section>

      <Section title="Actions" description="One public API with platform-aware interaction tokens.">
        <Inline gap="md" flexWrap="wrap">
          <Button title="Primary" />
          <Button title="Secondary" variant="secondary" />
          <Button title="Outline" variant="outline" />
          <Button title="Ghost" variant="ghost" />
          <Button title="Danger" variant="danger" leftIcon="trash" />
          <Button title="Link action" variant="link" actionType="navigation" rightIcon="chevron-end" />
          <Button title="Loading" loading />
          <Button title="Disabled" disabled />
        </Inline>
      </Section>

      <Section title="Cards, lines, and lists" description="Reusable row and surface patterns for enterprise screens.">
        <Card
          variant="primary"
          title="Savings account"
          subtitle="Main account"
          description="View your balance and recent activity"
          rightIcon={{ name: 'chevron-end' }}
        >
          <Stack gap="sm">
            <Line
              leftText={{ text1: 'Available balance' }}
              rightText={{ text1: '25,000 SAR' }}
              showDivider
            />
            <Line
              type="3"
              leftIcon={{ name: 'transfer' }}
              leftText={{
                text1: 'Local transfer',
                text2: 'Ahmed Mohammed',
                text3: '22 June 2026',
              }}
              rightText={{
                text1: '-250 SAR',
                text2: 'Completed',
                text3: '10:30 AM',
              }}
            />
          </Stack>
        </Card>

        <ListItem
          title="Beneficiary profile"
          description="Tap row with RTL-aware chevron"
          leading={<Avatar name="Faisal Alhejaili" size="large" />}
          trailing={<Badge label="Verified" tone="success" />}
          onPress={() => undefined}
        />
      </Section>

      <Section title="Selection controls" description="Checkbox, radio, switch, tabs, accordion, and divider.">
        <Checkbox
          checked={checked}
          onChange={setChecked}
          label="Accept terms"
          description="Independent checkbox state"
        />
        <Radio
          selected={radio === 'monthly'}
          onSelect={() => setRadio('monthly')}
          label="Monthly payment"
          description="Radio option"
        />
        <Switch
          value={switchValue}
          onValueChange={setSwitchValue}
          label="Security alerts"
          description="Uses native platform switch behind one API"
        />
        <Tabs
          value={tab}
          onValueChange={setTab}
          variant="pill"
          items={[
            { value: 'accounts', label: 'Accounts' },
            { value: 'cards', label: 'Cards', badge: '2' },
            { value: 'loans', label: 'Loans' },
          ]}
        />
        <Divider />
        <Accordion title="Accordion details" defaultExpanded>
          <Text value="Expandable sections expose accessible expanded state and logical spacing." tone="secondary" />
        </Accordion>
      </Section>
    </Stack>
  );
}

function InputsPreview() {
  const [text, setText] = useState('Faisal');
  const [email, setEmail] = useState('faisal@example.com');
  const [password, setPassword] = useState('secure123');
  const [phone, setPhone] = useState('+966 50 000 0000');
  const [amount, setAmount] = useState('1000');
  const [search, setSearch] = useState('');
  const [otp, setOtp] = useState('');
  const [pin, setPin] = useState('');
  const [notes, setNotes] = useState('This is a longer text area preview.');
  const [select, setSelect] = useState('sar');
  const [date, setDate] = useState<Date | undefined>(new Date(2026, 5, 22));

  return (
    <Stack gap="xl">
      <Section title="InputField" description="Unified field API for text, credentials, search, OTP/PIN, and numeric entry.">
        <InputField label="Full name" value={text} onChangeText={setText} helperText="Floating label, helper text, and semantic state." leftIcon="user" />
        <InputField type="email" labelLocalize="preview.email" label="Email address" value={email} onChangeText={setEmail} leftIcon="info" />
        <InputField type="password" labelLocalize="preview.password" label="Password" value={password} onChangeText={setPassword} showPasswordToggle />
        <InputField type="phone" label="Phone number" value={phone} onChangeText={setPhone} />
        <InputField type="number" labelLocalize="preview.amount" label="Amount" value={amount} onChangeText={setAmount} successText="Amount looks valid" rightIcon="success" />
        <InputField type="search" labelLocalize="preview.search" label="Search components" value={search} onChangeText={setSearch} showClearButton onSearch={setSearch} />
        <InputField type="otp" label="OTP code" value={otp} onChangeText={setOtp} length={6} helperText="Length-gated completion." />
        <InputField type="pin" label="PIN" value={pin} onChangeText={setPin} length={4} />
        <InputField label="Error example" value="Invalid value" onChangeText={() => undefined} state="error" errorText="This field shows an accessible error." />
        <InputField label="Disabled field" value="Read only value" onChangeText={() => undefined} disabled />
      </Section>

      <Section title="Form components" description="FormField, TextArea, Select, and DatePicker.">
        <FormField label="Reference" description="The label and description are connected through generated IDs." required>
          {fieldProps => (
            <InputField
              label="Reference"
              value="TRX-123456"
              onChangeText={() => undefined}
              accessibilityLabelledBy={fieldProps.labelId}
              aria-describedby={fieldProps.descriptionId}
            />
          )}
        </FormField>
        <TextArea
          accessibilityLabel="Notes"
          placeholder="Write notes"
          value={notes}
          onChangeText={setNotes}
          maxLength={120}
        />
        <Select
          title="Currency"
          placeholder="Select currency"
          value={select}
          onValueChange={setSelect}
          searchable
          options={[
            { value: 'sar', label: 'Saudi Riyal', description: 'SAR' },
            { value: 'usd', label: 'US Dollar', description: 'USD' },
            { value: 'aed', label: 'UAE Dirham', description: 'AED' },
          ]}
        />
        <DatePicker
          value={date}
          onChange={setDate}
          accessibilityLabel="Transfer date"
        />
      </Section>
    </Stack>
  );
}

function OverlaysPreview() {
  const [modalVisible, setModalVisible] = useState(false);
  const [sheetVisible, setSheetVisible] = useState(false);
  const toast = useToast();

  return (
    <Stack gap="xl">
      <Section title="Feedback" description="Alerts, toast notifications, tooltip, spinner, and skeleton.">
        <Alert
          title="Information alert"
          description="Alerts use semantic tone, icon, live region, and optional action."
          actionLabel="Review"
          onAction={() => undefined}
        />
        <Alert title="Success alert" description="Operation completed." tone="success" />
        <Tooltip content="Tooltip appears on hover, focus, or long press.">
          <Button title="Show tooltip" variant="outline" />
        </Tooltip>
        <Inline gap="xl" alignItems="center" flexWrap="wrap">
          <Spinner label="Loading data" />
          <Box flex={1} minWidth={220}>
            <Skeleton lines={3} />
          </Box>
        </Inline>
        <Button
          title="Show toast"
          onPress={() => toast.showToast({
            message: 'Preview toast message',
            tone: 'success',
            actionLabel: 'Undo',
            onAction: () => undefined,
          })}
        />
      </Section>

      <Section title="Modal and bottom sheet" description="Shared API, platform-aware presentation and safe-area behavior.">
        <Inline gap="md" flexWrap="wrap">
          <Button title="Open modal" onPress={() => setModalVisible(true)} />
          <Button title="Open bottom sheet" variant="secondary" onPress={() => setSheetVisible(true)} />
        </Inline>
      </Section>

      <Modal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title="Confirmation modal"
        description="Modal preview with action buttons."
        primaryAction={{ label: 'Confirm', onPress: () => setModalVisible(false) }}
        secondaryAction={{ label: 'Cancel', onPress: () => setModalVisible(false), variant: 'ghost' }}
      >
        <Text value="This modal uses the design-system base modal and focus-friendly close action." />
      </Modal>

      <BottomSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        title="Bottom sheet"
        description="Sheet content is scrollable and dismissible."
      >
        <Stack gap="md">
          <Line leftText={{ text1: 'Action sheet row' }} rightIcon={{ name: 'chevron-end' }} onPress={() => setSheetVisible(false)} />
          <Button title="Close sheet" fullWidth onPress={() => setSheetVisible(false)} />
        </Stack>
      </BottomSheet>
    </Stack>
  );
}

function StatesPreview() {
  return (
    <Stack gap="xl">
      <Section title="Empty and error states" description="Reusable feedback compositions for screens and cards.">
        <EmptyState
          title="No beneficiaries yet"
          description="Create your first beneficiary to start transferring money."
          icon="user"
          actionLabel="Add beneficiary"
          onAction={() => undefined}
          secondaryActionLabel="Learn more"
          onSecondaryAction={() => undefined}
        />
        <ErrorState
          title="Could not load transactions"
          description="Check your connection and try again."
          onRetry={() => undefined}
        />
      </Section>

      <Section title="Loading and disabled states" description="State styling remains semantic across light, dark, black, LTR, and RTL.">
        <Card loading title="Loading card" />
        <Line loading type="3" />
        <Button title="Loading action" loading fullWidth />
        <Button title="Disabled action" disabled fullWidth />
      </Section>

      <Section title="Deprecated migration wrappers" description="Input, PasswordInput, SearchInput, and Link remain as compatibility wrappers, but new screens should use InputField and Button variant='link'." >
        <Text value="Canonical APIs: <InputField ... /> and <Button title='View details' variant='link' />." tone="secondary" />
      </Section>
    </Stack>
  );
}

function HookMetric({
  label,
  value,
}: {
  label: string;
  value: string | number | boolean | undefined;
}) {
  return (
    <Line
      leftText={{ text1: label }}
      rightText={{ text1: value === undefined ? 'undefined' : String(value) }}
      padding="small"
    />
  );
}

function HooksPreview() {
  const {
    mode,
    preference,
    setPreference,
    direction,
    locale,
    platform,
  } = useTheme();
  const rtl = useRTL();
  const safeArea = useSafeArea();
  const accessibility = useAccessibility();
  const appState = useAppState();
  const keyboard = useKeyboard();
  const toggle = useToggle(false);
  const disclosure = useDisclosure(false);
  const [rawValue, setRawValue] = useState('Bunyan');
  const debouncedValue = useDebounce(rawValue, 500);
  const previousValue = usePrevious(rawValue);
  const network = useNetworkStatus();
  const clipboard = useClipboard();
  const haptics = useHaptics();
  const permissions = usePermissions<'camera'>('camera');
  const [copiedValue, setCopiedValue] = useState('');
  const [navigationEvent, setNavigationEvent] = useState<PreviewNavigationEvent>({
    command: 'setAppRoot',
    screen: 'PreviewHome',
  });
  const navigation = useNavigation<
    PreviewScreenParams,
    PreviewLayout,
    PreviewNavigationOptions,
    string
  >('preview-root');
  const asyncAction = useAsyncAction(
    useCallback(async () => {
      await new Promise(resolve => setTimeout(resolve, 450));
      return 'Async hook completed';
    }, []),
  );

  useEffect(
    () => previewNavigationEvents.subscribe(setNavigationEvent),
    [],
  );

  const nextThemePreference = useMemo<ThemePreference>(() => {
    if (preference === 'system') return 'light';
    if (preference === 'light') return 'dark';
    if (preference === 'dark') return 'black';
    return 'system';
  }, [preference]);

  return (
    <Stack gap="xl">
      <Section title="Theme, RTL, safe area, and accessibility hooks" description="Live values from provider and native runtime context.">
        <HookMetric label="mode" value={mode} />
        <HookMetric label="preference" value={preference} />
        <HookMetric label="next preference" value={nextThemePreference} />
        <HookMetric label="direction" value={direction} />
        <HookMetric label="locale" value={locale} />
        <HookMetric label="platform" value={platform} />
        <HookMetric label="isRTL" value={rtl.isRTL} />
        <HookMetric label="safeArea top/bottom" value={`${safeArea.top}/${safeArea.bottom}`} />
        <HookMetric label="screenReaderEnabled" value={accessibility.screenReaderEnabled} />
        <HookMetric label="reduceMotionEnabled" value={accessibility.reduceMotionEnabled} />
        <HookMetric label="boldTextEnabled" value={accessibility.boldTextEnabled} />
        <Button title={`Cycle theme to ${nextThemePreference}`} onPress={() => setPreference(nextThemePreference)} />
      </Section>

      <Section title="State and lifecycle hooks" description="Toggle, disclosure, app state, keyboard, debounce, previous, and async action.">
        <InputField label="Debounced value" value={rawValue} onChangeText={setRawValue} />
        <HookMetric label="debounced value" value={debouncedValue} />
        <HookMetric label="previous value" value={previousValue} />
        <HookMetric label="toggle value" value={toggle.value} />
        <HookMetric label="disclosure isOpen" value={disclosure.isOpen} />
        <HookMetric label="appState" value={appState.appState} />
        <HookMetric label="keyboard visible" value={keyboard.isVisible} />
        <HookMetric label="keyboard height" value={keyboard.height} />
        <HookMetric label="async status" value={asyncAction.status} />
        <HookMetric label="async data" value={asyncAction.data} />
        <Inline gap="md" flexWrap="wrap">
          <Button title="Toggle" onPress={toggle.toggle} />
          <Button title={disclosure.isOpen ? 'Close disclosure' : 'Open disclosure'} variant="secondary" onPress={disclosure.toggle} />
          <Button title="Run async action" loading={asyncAction.loading} onPress={() => void asyncAction.execute()} />
          <Button title="Dismiss keyboard" variant="ghost" onPress={keyboard.dismiss} />
        </Inline>
      </Section>

      <Section title="Adapter-backed hooks" description="Preview no-op adapters keep shared hooks runnable without app business logic.">
        <HookMetric label="network supported" value={network.isSupported} />
        <HookMetric label="network connected" value={String(network.isConnected)} />
        <HookMetric label="clipboard supported" value={clipboard.isSupported} />
        <HookMetric label="clipboard value" value={copiedValue || clipboard.value || 'empty'} />
        <HookMetric label="haptics supported" value={haptics.isSupported} />
        <HookMetric label="permission status" value={permissions.status} />
        <HookMetric label="permission granted" value={permissions.isGranted} />
        <Inline gap="md" flexWrap="wrap">
          <Button
            title="Copy preview text"
            onPress={() => {
              void clipboard.copy('Copied from Bunyan preview').then(() => setCopiedValue('Copied from Bunyan preview'));
            }}
          />
          <Button
            title="Paste"
            variant="secondary"
            onPress={() => {
              void clipboard.paste().then(setCopiedValue);
            }}
          />
          <Button title="Haptic selection" variant="outline" onPress={() => void haptics.selection()} />
          <Button title="Request permission" variant="ghost" onPress={() => void permissions.request()} />
        </Inline>
      </Section>

      <Section title="Navigation abstraction hook" description="No app screen names live in the design system; this preview supplies a tiny app-owned adapter.">
        <HookMetric label="last command" value={navigationEvent.command} />
        <HookMetric label="componentId" value={navigationEvent.componentId} />
        <HookMetric label="screen" value={navigationEvent.screen} />
        <Inline gap="md" flexWrap="wrap">
          <Button
            title="Push detail"
            onPress={() => void navigation.push('ComponentDetail', { component: 'Button' }, { options: { title: 'Button' } })}
          />
          <Button title="Show modal" variant="secondary" onPress={() => void navigation.showModal('PreviewHome')} />
          <Button title="Merge options" variant="outline" onPress={() => navigation.mergeOptions({ title: 'Preview updated' })} />
          <Button title="Pop" variant="ghost" onPress={() => void navigation.pop()} />
        </Inline>
      </Section>
    </Stack>
  );
}

function PreviewCatalog({
  locale,
  onLocaleChange,
}: {
  locale: PreviewLocale;
  onLocaleChange: (locale: PreviewLocale) => void;
}) {
  const { theme, mode, direction } = useTheme();
  const [tab, setTab] = useState<PreviewTab>('components');

  return (
    <ScrollContainer
      keyboardShouldPersistTaps="handled"
      padding="lg"
      gap="xl"
      internalStyle={{ backgroundColor: theme.color.background.primary }}
    >
      <Card variant="elevated" size="large">
        <Stack gap="lg">
          <Inline gap="md" alignItems="flex-start" justifyContent="space-between">
            <Stack flex={1} gap="xs">
              <Text localize="preview.title" value="Bunyan Design System Preview" variant="headingLarge" weight="bold" />
              <Text localize="preview.subtitle" value="Custom catalog for components, hooks, themes, RTL, and accessibility." tone="secondary" />
              <Text value={`Mode: ${mode} · Direction: ${direction}`} variant="caption" tone="tertiary" />
            </Stack>
            <Badge label={locale === 'ar' ? 'AR' : 'EN'} tone="primary" />
          </Inline>
          <Inline gap="md" flexWrap="wrap">
            <Button
              title={locale === 'ar' ? 'English' : 'العربية'}
              variant="outline"
              onPress={() => onLocaleChange(locale === 'ar' ? 'en' : 'ar')}
            />
            <Button title="Theme in hooks" variant="link" actionType="navigation" onPress={() => setTab('hooks')} />
          </Inline>
        </Stack>
      </Card>

      <Tabs
        value={tab}
        onValueChange={value => setTab(value as PreviewTab)}
        variant="pill"
        items={[
          { value: 'components', label: 'Components' },
          { value: 'inputs', label: 'Inputs' },
          { value: 'overlays', label: 'Overlays' },
          { value: 'states', label: 'States' },
          { value: 'hooks', label: 'Hooks' },
        ]}
      />

      {tab === 'components' ? <ComponentsPreview /> : null}
      {tab === 'inputs' ? <InputsPreview /> : null}
      {tab === 'overlays' ? <OverlaysPreview /> : null}
      {tab === 'states' ? <StatesPreview /> : null}
      {tab === 'hooks' ? <HooksPreview /> : null}
    </ScrollContainer>
  );
}

export default function PreviewEntry() {
  return <PreviewCompositionRoot />;
}

export function PreviewCompositionRoot() {
  const [locale, setLocale] = useState<PreviewLocale>('en');
  const [themePreference, setThemePreference] = useState<ThemePreference>('system');

  return (
    <SafeAreaProvider>
      <ApplicationAdapterProvider adapters={previewAdapters}>
        <NavigationProvider adapter={previewNavigationAdapter}>
          <NavigationScope componentId="preview-root">
            <DesignSystemRoot
              locale={locale}
              themePreference={themePreference}
              onLocaleChange={setLocale}
              onThemePreferenceChange={setThemePreference}
            />
          </NavigationScope>
        </NavigationProvider>
      </ApplicationAdapterProvider>
    </SafeAreaProvider>
  );
}

function DesignSystemRoot({
  locale,
  themePreference,
  onLocaleChange,
  onThemePreferenceChange,
}: {
  locale: PreviewLocale;
  themePreference: ThemePreference;
  onLocaleChange: (locale: PreviewLocale) => void;
  onThemePreferenceChange: (preference: ThemePreference) => void;
}) {
  return (
    <DesignSystemProvider
      localization={{
        locale,
        fallbackLocale: 'en',
        translations: previewTranslations,
        rtlLocales: ['ar'],
      }}
      theme={{
        preference: themePreference,
        onPreferenceChange: onThemePreferenceChange,
        blackForSystemDark: true,
      }}
    >
      <ToastProvider>
        <PreviewCatalog locale={locale} onLocaleChange={onLocaleChange} />
      </ToastProvider>
    </DesignSystemProvider>
  );
}
