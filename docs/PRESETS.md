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

- `icon`: `'transfer'` or `{ name: 'transfer', tone: 'primary' }` (tones: primary, neutral, success, warning, error, info).
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

- Block types: every card above, `StatusBanner`, `Section`, `Grid`, `Row`,
  `List` (`renderAs` + `formatItem`, with DataState), `Heading`, `Text`,
  `Button`, `Spacer`, `Divider`.
- Falsy entries are skipped; React elements render as they are.
- Custom blocks: `registerBlockType('PromoBanner', PromoBanner)` and augment
  `ScreenBlockTypes` for typing.
- `scroll` (default true), `gap`, `padding`.

## Wrapping presets in your app

Apps should wrap the presets they use in their own `src/components` folder
(one folder per component) and import those wrappers in screens, instead of
importing Bunyan directly in every screen. The wrapper is where app defaults,
analytics and naming live, and it keeps screens stable if Bunyan changes.
See [ADOPTION_PROMPT.md](./ADOPTION_PROMPT.md).
