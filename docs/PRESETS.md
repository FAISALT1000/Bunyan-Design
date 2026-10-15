# Presets

Ready-made building blocks so screens contain data and logic instead of
stacks of `View`, `Text` and `Button`. Every preset:

- follows the active theme mode (light, dark, black, dim, sepia) and Arabic RTL;
- accepts plain strings or `{ localeKey, params?, fallback? }` for every text;
- has accessible roles and labels;
- shows a skeleton of the same shape when `loading` is true (cards).

Everything is exported from `@bunyan/design-system`.

## Setup

`ToastProvider` (toasts, status toasts) and `OverlayProvider` (confirm,
action sheet, prompt) go once near the root, inside the theme and
localization providers. The generated `DesignSystemSetup` already includes
both.

```tsx
<DesignSystemProvider theme={…} localization={…}>
  <ToastProvider bottomOffset={TAB_BAR_HEIGHT}>
    <OverlayProvider>{children}</OverlayProvider>
  </ToastProvider>
</DesignSystemProvider>
```

## Cards

| Component | Use it for | Key props |
| --- | --- | --- |
| `OneLineCard` | Settings rows, menu items | `title`, `icon` / `avatar` / `leading`, `value`, `badge`, `toggle`, `chevron`, `onPress`, `destructive` |
| `TwoLineCard` | Most list rows | adds `subtitle`, `subValue`, `valueTone` |
| `ThreeLineCard` | Notifications, tickets, messages | adds `description`, `meta`, `unread` |
| `SettingsGroup` | A titled group of rows (a whole settings screen is a few groups) | `title`, `footer`, `items` (falsy items skipped) |
| `DetailsCard` | Receipts, account details, order summaries | `title`, `rows: [{ label, value, badge, copyable, tone, emphasis }]`, `total`, `onCopy` |
| `AmountCard` | Balances and totals | `label`, `amount`, `currency`, `trend`, `hideable`, `actions`, `variant: 'primary' \| 'surface'` |
| `StatCard` | KPI tiles (put them in a `Grid`) | `label`, `value`, `trend`, `icon`, `caption` |
| `ProfileCard` | Account headers, team members | `avatar`, `name`, `subtitle`, `badges`, `stats`, `actions`, `layout: 'horizontal' \| 'centered'` |
| `ActionCard` | Menu / dashboard tiles | `icon`, `title`, `description`, `badge`, `selected`, `onPress` |
| `ProductCard` | Shop grids and cart rows | `image`, `title`, `price`, `oldPrice`, `currency`, `rating`, `reviews`, `badge`, `favorite`, `cta`, `quantity`, `layout` |
| `StatusCard` | Inline result or warning | `status: 'success' \| 'warning' \| 'error' \| 'info'`, `title`, `message`, actions, `compact` |

Shared prop shapes:

- `icon`: `'transfer'` or `{ name: 'transfer', tone: 'primary' }` (tones: primary, secondary, neutral, success, warning, error, info / information, inverse).
- `avatar`: `{ name, image, status: 'online' | 'busy' | 'offline' }`.
- `badge`: `'New'` or `{ label: 'Admin', tone: 'primary' }`.
- `toggle`: `{ value, onChange, disabled }`.
- actions: `{ title, onPress, icon, variant, disabled, loading }`.
- `value` may be text or any element, e.g. `<Money amount={-1250} signed colorize />`.

```tsx
<TwoLineCard
  avatar={{ name: 'Sara Ali', status: 'online' }}
  title="Sara Ali"
  subtitle="sara@company.sa"
  badge={{ label: 'Admin', tone: 'primary' }}
  chevron
  onPress={() => openUser(sara.id)}
/>

<SettingsGroup
  title="Preferences"
  items={[
    { icon: 'globe', title: 'Language', value: 'العربية', chevron: true, onPress: pickLanguage },
    { icon: 'bell', title: 'Notifications', toggle: { value: push, onChange: setPush } },
    isAdmin && { icon: 'users', title: 'Manage users', chevron: true, onPress: openUsers },
  ]}
/>
```

## Layout

| Component | Notes |
| --- | --- |
| `Row` | Horizontal, mirrored in Arabic. `gap`, `p`/`px`/`py`/`pt`/`pb`/`ps`/`pe`, `bg`, `radius`, `bordered`, `align`, `justify`, `wrap`, `flex` |
| `Column` | Vertical, same props |
| `Center` | Centres on both axes |
| `Grid` | Equal columns: `columns={2}` or per breakpoint `{ compact: 2, medium: 4 }` |
| `Spacer` | (from base) fixed token space |
| `Section` | Title row + optional action ("See all"), content, `loading` skeletons, `isEmpty` + `empty` state |

Spacing values are theme token names (`xs`, `sm`, `md`, `lg`, `xl`…), and `bg` is
a theme background name (`surface`, `surfaceSecondary`, `background`, `primarySubtle`…).

## Status feedback

All take `status: 'success' | 'error' | 'pending'` and `title`, and animate:
success scales in and draws a check, error draws an X and shakes once, pending
spins until the status changes. The system Reduce Motion setting shows the
final frame. `animation` replaces the icon (for example a Lottie view).

| Component | Notes |
| --- | --- |
| `StatusScreen` | Full screen. `subtitle`, `children` (between the subtitle and the buttons), `primaryAction`, `secondaryAction`, `haptics` |
| `StatusModal` | Same content in a dialog. `visible`, `onClose`; not dismissible while pending (override with `dismissible`) |
| `useStatusToast()` | `show()` returns `{ update, dismiss }`; `run(promise, { pending, success, error })` (needs `ToastProvider`) |
| `StatusBanner` | Inline bar: `title`, `subtitle`, `action`, `onDismiss`. Named Banner so it does not clash with React Native's `StatusBar` |
| `StatusIcon` | The animated mark on its own |

```tsx
<StatusScreen
  status={state}
  title={state === 'success' ? 'Transfer sent' : state === 'error' ? 'Transfer failed' : 'Processing transfer'}
  subtitle="1,250.00 SAR to Ahmed Saleh"
  primaryAction={{ title: 'Done', onPress: goHome }}
  secondaryAction={{ title: 'Share receipt', onPress: share }}
>
  <DetailsCard rows={[{ label: 'Reference', value: 'TRX-482193' }]} />
</StatusScreen>

const status = useStatusToast();
await status.run(saveProfile(values), { pending: 'Saving…', success: 'Profile saved', error: e => String(e) });
```

## Dialogs as functions

Need `OverlayProvider`. No `visible` state, no modal JSX in the screen.

```tsx
const confirm = useConfirm();
const actionSheet = useActionSheet();
const prompt = usePrompt();

if (await confirm({ title: 'Delete card?', message: 'This cannot be undone.', danger: true, confirmText: 'Delete' })) {
  await deleteCard(id);
}

const choice = await actionSheet({
  title: 'Card options',
  options: [
    { value: 'freeze', title: 'Freeze card', icon: 'lock' },
    { value: 'delete', title: 'Delete card', icon: 'trash', destructive: true },
  ],
}); // 'freeze' | 'delete' | null

const name = await prompt({ title: 'Rename card', label: 'Card name', validate: v => (v ? undefined : 'Required') });
```

## Data states

```tsx
const transfers = useQuery({ queryKey: ['transfers'], queryFn: fetchTransfers });

<DataState query={transfers} skeleton="TwoLineCard" empty={{ title: 'No transfers yet', icon: 'transfer' }}>
  {data => <List Component={TwoLineCard} data={data} formatItem={toRow} />}
</DataState>
```

`query` reads `isLoading` / `isPending`, `error`, `data` and `refetch` (retry
button). You can also pass `loading`, `error` and `data` yourself.

## Formatting

| Component | Function | Example |
| --- | --- | --- |
| `Money` | `formatMoney` | `<Money amount={-1250} currency="SAR" signed colorize />` → `−1,250.00 SAR` |
| `DateText` | `formatDate` | `format`: `date`, `time`, `datetime`, `month`, `relative` ("5 minutes ago"), `hijri` |
| `PhoneText` | `formatPhone` | `+966512345678` → `+966 51 234 5678` |
| `MaskedText` | `maskText` | `type`: `card`, `iban`, `phone`, `account`; `reveal` |

`digits`: `'latin'` (default), `'arabic'` (Arabic-Indic) or `'auto'` (follows
the locale). The locale defaults to the ThemeProvider locale.

## ScreenContent

A screen described as data, in the same style as `<Form fields>`:

```tsx
<ScreenContent
  blocks={[
    { type: 'ProfileCard', name: user.name, subtitle: user.role },
    { type: 'AmountCard', variant: 'primary', label: 'Balance', amount: balance, currency: 'SAR' },
    { type: 'Section', title: 'Recent transfers', action: { title: 'See all', onPress: goHistory }, blocks: [
      { type: 'List', query: transfers, renderAs: 'TwoLineCard', formatItem: toRow, empty: { title: 'No transfers yet' } },
    ] },
    isAdmin && { type: 'SettingsGroup', title: 'Admin', items: adminItems },
    { type: 'Button', title: 'Log out', variant: 'danger', onPress: logout },
  ]}
/>
```

- Block types: every card above, `StatusBanner`, `DoubleButtons`,
  `CodeBlock`, `TimelineEvent`, `StepperHeader`, `BarList`, `BarChart`,
  `Sparkline`, `DataTable`, `Section`, `Grid`, `Row`,
  `List` (`renderAs` + `formatItem`, with DataState), `Heading`, `Text`,
  `Button`, `Spacer`, `Divider`.
- Falsy entries are skipped; React elements render as they are.
- Custom blocks: `registerBlockType('PromoBanner', PromoBanner)` and augment
  `ScreenBlockTypes` for typing.
- `scroll` (default true), `gap`, `padding`.

## Actions, forms and display (0.0.6)

| Component | Use it for | Key props |
| --- | --- | --- |
| `DoubleButtons` | The primary + secondary button pair at the bottom of forms and sheets | `primary`, `secondary`, `tertiary` (actions), `layout: 'stacked' \| 'row'`, `size` |
| `CountdownButton` | "Resend in 42s" buttons | action props + `seconds`, `startOnMount`, `retryAfterSeconds` (server Retry-After), `countdownTitle` / `countdownLocalize` (`%{seconds}`) |
| `useCountdown(seconds, { autoStart })` | Your own countdown UI | returns `{ remaining, running, start(seconds?), stop }` |
| `CodeField` | One-time codes: OTP slots + error + resend | OTPInput props (default `length` 6, autofill on iOS and Android), `errorText`, `resend: { onPress, cooldownSeconds, startOnMount, retryAfterSeconds, label, labelLocalize, countdownLocalize }` |
| `ConfirmPhraseInput` | "Type DELETE to confirm" | `phrase`, `value`, `onChangeText`, `onMatchChange`, `caseSensitive`, `label`, `helperText`; `phraseMatches()` helper |
| `FilterChips` | Inbox / category / audit filters | `items: [{ value, label \| labelLocalize, count, icon, disabled }]`, `value` + `onChange`, or `multiple` with `values`; `scrollable` |
| `Rating` | Stars, interactive or read-only | `value`, `onChange` (omit for read-only, half stars shown), `max`, `size`, `compact` + `count` ("★ 4.6 (120)") |
| `CodeBlock` | Logs, JSON, request IDs | `value`, `title`, `copyable` (default true), `onCopy`, `wrap`, `maxLines`; always monospace and left-to-right |
| `TimelineEvent` | Centred activity lines in tickets and chats | `text`, `icon`, `meta`, `tone`, `onPress` (adds an arrow) |
| `StepperHeader` | Multi-step flows | `step`, `total`, `title`, `subtitle`, `onBack` |
| `CountBadge` | Unread counts and dots | `count`, `max` (99+), `dot`, `tone` |

```tsx
<CodeField value={code} onChange={setCode} onComplete={verify} errorText={error}
  resend={{ onPress: resend, cooldownSeconds: 60 }} />

<DoubleButtons layout="row"
  primary={{ titleLocalize: 'common.save', onPress: save, loading: saving }}
  secondary={{ titleLocalize: 'common.cancel', onPress: close }} />

<FilterChips value={filter} onChange={setFilter} scrollable items={[
  { value: 'all', labelLocalize: 'inbox.all' },
  { value: 'mine', labelLocalize: 'inbox.mine', count: 4 },
]} />
```

`DoubleButtons`, `CodeBlock`, `TimelineEvent` and `StepperHeader` are also
`ScreenContent` block types.

### New props on existing presets

- `LineCard` / `OneLineCard` / `TwoLineCard` / `ThreeLineCard`: `badges[]`,
  `unreadCount`, `onLongPress`, `tone`, `selectable`, `footer`, `actions[]`
  (only the row is pressable when these are set); `ThreeLineCard`
  `descriptionLines`.
- `DetailsCard` rows: `onPress`. `ActionCard`: `loading`. `Section`: `right`
  slot. `IconBox`: tones `secondary`, `information`, `inverse`; `size` is a
  tile token (`xs`…`hero`) or a number; `iconRatio`.
- Layout: `bg` adds `successSubtle`, `warningSubtle`, `errorSubtle`,
  `infoSubtle`; `style` on `Row` / `Column` / `Center` / `Grid`; new `Fill`
  (flex 1).
- `useConfirm`: `children` (custom body), `onConfirm` (async; shows a spinner,
  keeps the dialog open and shows the error if it throws), `errorMessage`.
- `usePrompt`: `label` optional (defaults to the title), `helperText`,
  `secureTextEntry`, `autoCapitalize`, `numberOfLines`, `danger`,
  `confirmPhrase` (`'DELETE'` or `{ phrase, caseSensitive }`).
- `DataState`: `renderError(error, retry)`, `loadingLabel`, `refreshing`
  (defaults to `query.isRefetching`); `skeleton` adds `'card'` and `'field'`.
- Action objects (`PresetAction`): `title` optional when `titleLocalize` is
  set; `accessibilityLabel`.

## Lists, chat, charts and navigation (0.0.6)

| Component | Use it for | Key props |
| --- | --- | --- |
| `PagedList` | Infinite lists (tickets, invoices, audit log) | `query` (a `useInfiniteQuery` result; pages are flattened with `getItems`) or `data` + `hasMore` + `loadingMore` + `onLoadMore` + `onRefresh`; `renderAs` + `formatItem` or `renderItem`; `empty`, `skeleton`, `endMessage`, `header`, `inverted`, `listProps` |
| `ChatThread` | A conversation | `messages` (oldest first: `{ id, side, createdAt, text, status, author, attachments, system }`), `typing`, `showAvatars`, `onRetry`, `onLongPress`, `onLoadOlder` + `hasOlder` + `loadingOlder`, `renderMessage` |
| `ChatBubble` | One message | `side: 'outgoing' \| 'incoming'`, `text`, `time`, `status: 'sending' \| 'sent' \| 'delivered' \| 'read' \| 'failed'`, `onRetry`, `attachments`, `author`, `position` |
| `ChatComposer` | Message input | `value`, `onChangeText`, `onSend(text)`, `onAttach`, `attachments` (chips), `sending`, `maxLength`, `maxLines`, `bottomInset` |
| `TypingIndicator`, `ChatDayDivider` | Parts of a thread | `name`; `date` |
| `AttachmentPicker` | Files for tickets, chats, forms | `value` (`{ uri, name, size, type, status: 'uploading' \| 'uploaded' \| 'error', progress, error }`), `onChange`, `pickFile` or `sources: [{ key, label, icon, pick }]`, `maxFiles`, `maxSize`, `onReject`, `onRetry`, `onPreview`, `layout: 'list' \| 'grid'` |
| `BarList` | Ranked bars (top endpoints, spend by category) | `items: [{ label, value, valueLabel, icon, tone, onPress }]`, `max`, `sorted`, `limit`, `formatValue` |
| `BarChart` | Vertical bars per day / month | `items: [{ label, value }]`, `height`, `highlightIndex`, `showValues`, `onBarPress` |
| `Sparkline` | Trend line in KPI tiles | `values`, `width` (default: fills), `height`, `tone`, `area`, `showLastPoint` |
| `ChartLegend` | Dots + labels under a chart | `items: [{ label, tone, value }]` |
| `DataTable` | Small data grids | `columns: [{ key, title, width, flex, numeric, align, value, render, sortable, sortValue }]`, `rows`, `onRowPress`, `sort` / `defaultSort` / `onSortChange` / `manualSort`, `striped`, `dense`, `loading` |
| `TabBar` | Bottom tabs | `items: [{ key, icon, activeIcon, label, badge }]`, `activeKey`, `onChange`, `variant: 'default' \| 'floating'`, `showLabels`; `tabBarPropsFromNavigation(props, config)` for React Navigation |

```tsx
const tickets = useInfiniteQuery({ queryKey: ['tickets'], queryFn, initialPageParam: 1, getNextPageParam });
<PagedList query={tickets} renderAs="ThreeLineCard" formatItem={toTicketRow} empty={{ title: 'No tickets yet', icon: 'inbox' }} />

<ChatThread messages={messages} typing={agentTyping && agent.name} onRetry={resend} onLoadOlder={loadOlder} hasOlder={hasOlder} />
<ChatComposer value={draft} onChangeText={setDraft} onSend={send} onAttach={attach} bottomInset={insets.bottom} />

<Tab.Navigator tabBar={props => <TabBar {...tabBarPropsFromNavigation(props, {
  Home: { icon: 'home' }, Inbox: { icon: 'inbox', badge: unread }, Account: { icon: 'user' },
})} />} />
```

`BarList`, `BarChart`, `Sparkline` and `DataTable` are also `ScreenContent`
block types. Don't put a `PagedList` or `ChatThread` inside `ScreenContent`
(they scroll themselves).

### Overlays and screens

- **Toasts above modals:** `ToastProvider` now shows toasts inside the
  top-most open Bunyan `Modal` / `BottomSheet` (and dialogs from
  `useConfirm` / `usePrompt`). Turn it off with `aboveModals={false}`.
- **BottomSheet:** `snapPoints={['40%', '90%']}` (drag the handle between
  them; screen readers get an adjustable control), `initialSnap`,
  `onSnapChange`, `height` (`'auto'` default, points or `'%'`), `draggable`
  (drag down to close), `scrollable={false}` for lists that scroll
  themselves, `footer` (pinned buttons), `title` is optional.
- **DateTimePicker** (and `DatePicker mode="time" | "datetime"`), `label`,
  `is24Hour`, `minuteInterval`; Android asks for the date, then the time.
  Form field type `DateTimePicker`.
- **Form focus chaining:** text fields get "Next" and the last one "Done",
  which submits. `focusChain={false}` or `submitOnDone={false}` to opt out;
  your own `returnKeyType` / `onSubmitEditing` win. Custom field types opt
  in with `registerFormFieldType(type, component, { focusable: true })` and
  spread `focus` onto their input.
- **AuthenticationTemplate:** `header` (above the logo), `headerRight`,
  `headerLeft`, `contentAccessibilityLabel`.
- **ThemeProvider persistence:** `storage={AsyncStorage}` (any
  `getItem` / `setItem`), `storageKey`; `useTheme().preferenceLoaded` is
  false while reading.

## Built-in labels

Bunyan's own labels ("Loading", "Try again", "Close", "Optional", "Show
password", "Resend in %{seconds}s"…) ship in English and Arabic and follow
the locale. To change one, add the key under `bunyan.` in your app
translations (`bunyan.tryAgain`), or merge `bunyanTranslations` into your
i18n resources and edit them. `useStrings()` returns the lookup function, and
`bunyanDefaultStrings` lists every key. See LOCALIZATION.md.

## Wrapping presets in your app

Apps should wrap the presets they use in their own `src/components` folder
(one folder per component) and import those wrappers in screens, instead of
importing Bunyan directly in every screen. The wrapper is where app defaults,
analytics and naming live, and it keeps screens stable if Bunyan changes.
See [ADOPTION_PROMPT.md](./ADOPTION_PROMPT.md).
