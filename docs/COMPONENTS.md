# Component documentation

Each component is exported from `@bunyan/design-system`. Prop interfaces are the source of truth and are exported beside their components.

## NumPad template

- Purpose: Reusable numeric entry surface for OTP, PIN, amount, and authentication flows.
- Props: `NumPadProps`; controlled `value`, `onChange`, digit/delete callbacks, `maxLength`, disabled state, labels, and an optional leading action.
- Variants/sizes/states: Standard 3×4 keypad; empty, partially entered, length-limited, and disabled states.
- Accessibility: Every number and delete action is an individually labelled button. Numeric order stays conventional in both LTR and RTL locales.
- Example: `<NumPad value={pin} onChange={setPin} maxLength={4} />`.
- Do/don’t: Keep the entered value visible elsewhere in the flow; do not use the keypad as the only accessible representation of the current value.
- Edge cases: `onDigitPress` and `onDelete` support reducers or secure state stores; `onChange` offers the convenient controlled-value API.

## OTP template

- Purpose: Complete one-time-code verification flow using the same behavior across bottom-sheet, centered-overlay, and full-screen presentations.
- Props: `OTPTemplateProps`; `variant`, visibility, controlled value, submit/close/resend handlers, length, copy, destination, error/loading/disabled/secure states, and optional automatic submission.
- Variants/sizes/states: `bottomSheet`, `overlay`, `fullScreen`; four or custom digit length; incomplete, complete, error, loading, secure, and resend-disabled states.
- Accessibility: Includes a native one-time-code input for keyboard, paste, and password-manager support; slots announce entered/empty state; NumPad keys and actions are labelled.
- Example: `<OTPTemplate variant="fullScreen" value={code} onChange={setCode} onSubmit={verify} />`.
- Do/don’t: Keep verification logic outside the template; do not identify the recipient more than necessary.
- Edge cases: Input is digit-filtered and length-limited; `autoSubmit` fires once per completed value; set `useNumPad={false}` when the native keyboard is preferred.

## Text

- Purpose: Semantic body, label, caption, and code text.
- Props: `TextProps`; `variant`, `tone`, `align`, `weight`, plus native `TextProps`.
- Variants/sizes/states: `body`, `bodySmall`, `caption`, `label`, `code`; tone and weight APIs; inherits native selection and truncation states.
- Accessibility: Font scaling is enabled with a 2× multiplier; direction follows the provider.
- Example: `<Text variant="bodySmall" tone="secondary">Updated today</Text>`.
- Do/don’t: Use tone names; do not pass raw color or font styles.
- Edge cases: Use `numberOfLines` for constrained layouts and test at maximum font size.

## Heading

- Purpose: Establishes an accessible content hierarchy.
- Props: `HeadingProps`; `level`, `tone`, `align`, plus native text props.
- Variants/sizes/states: Levels 1–6 map to the type scale.
- Accessibility: Uses the header role and web `aria-level`.
- Example: `<Heading level={2}>Account summary</Heading>`.
- Do/don’t: Keep levels sequential; do not choose a level only for visual size.
- Edge cases: Long localized headings should wrap; avoid truncating critical titles.

## Icon

- Purpose: Renders the controlled Bunyan SVG icon set.
- Props: `IconProps`; `name`, `size`, `tone`, `color`, `mirroredInRTL`, `accessibilityLabel`.
- Variants/sizes/states: Six token sizes and eight semantic tones.
- Accessibility: Decorative icons (no `accessibilityLabel`) are hidden from assistive tech; labelled icons get the image role.
- Example: `<Icon name="chevron-right" mirroredInRTL />`.
- Do/don’t: Prefer semantic tone; use `color` only for approved brand exceptions.
- Edge cases: Directional icons (chevron-left/right, backspace) mirror automatically in RTL; pass `mirroredInRTL` to override.

## Button

- Purpose: Triggers an action, or — with `variant="link"` / `href` — navigates.
- Props: `ButtonProps`; native press props plus `variant`, `size`, `loading`, `fullWidth`, leading/trailing icons, `href`, `external`, `externalHint`, `onOpenError`.
- Variants/sizes/states: `primary`, `secondary`, `outline`, `ghost`, `danger`, `link`; small/medium/large; pressed, disabled, loading, busy.
- Accessibility: Button role (link role for `variant="link"` or when `href` is set); busy/disabled states are automatic; external links announce `externalHint`; compact sizes and links get hitSlop for a 44 pt target.
- Example: `<Button variant="primary" size="large" fullWidth>Continue</Button>` · `<Button variant="link" href="https://bunyan.sa" external>Help centre</Button>`.
- Do/don’t: Use one primary action per region; use `variant="link"` (not `ghost`) for navigation inside text-heavy layouts.
- Edge cases: Loading disables duplicate submission; `href` opens after `onPress` unless the event is `preventDefault`-ed; `openURL` failures go to `onOpenError`.

## IconButton

- Purpose: Compact icon-only action.
- Props: `IconButtonProps`; `icon`, required `accessibilityLabel`, `variant`, `size`, `tone`, `selected`.
- Variants/sizes/states: Filled, outline, ghost; small/medium/large; pressed, selected, disabled.
- Accessibility: A text label is mandatory despite the visual icon-only treatment.
- Example: `<IconButton icon="close" accessibilityLabel="Close dialog" />`.
- Do/don’t: Use familiar icons; do not rely on color alone for selection.
- Edge cases: Add surrounding space when several icon buttons form a toolbar.

## Link

- Purpose: Inline navigation text. `Link` is an alias of `<Button variant="link" />` and accepts every Button prop except `variant`.
- Props: `LinkProps` = `Omit<ButtonProps, 'variant'>`; `href`, `external`, `externalHint`, `onOpenError`, `size`, icons, `loading`, native press props.
- Variants/sizes/states: small/medium/large text; pressed, disabled, loading.
- Accessibility: Uses the link role; external links show ↗ and announce `externalHint`. `openURL` failures go to `onOpenError`.
- Example: `<Link href="https://example.com" external>Privacy policy</Link>` (same as `<Button variant="link" …>`).
- Do/don’t: Use descriptive text; do not label links “click here.”
- Edge cases: Kept for convenience and backwards compatibility; styling lives in Button, so both stay in sync.

## Input

- Purpose: Single-line text entry primitive.
- Props: `InputProps`; native input props plus `size`, `status`, `leadingIcon`, `trailing`, constrained `containerStyle`.
- Variants/sizes/states: Small/medium/large; default/error/success; focused and disabled.
- Accessibility: Supports native labelling props and announces invalid state with `aria-invalid`.
- Example: `<Input keyboardType="email-address" status="error" />`.
- Do/don’t: Wrap in `FormField`; do not use placeholder text as the only label.
- Edge cases: Controlled inputs require `onChangeText`; custom trailing controls must have labels.

## PasswordInput

- Purpose: Secure text entry with visibility control.
- Props: `PasswordInputProps`; Input props plus localized show/hide labels.
- Variants/sizes/states: Inherits Input states; hidden and visible states.
- Accessibility: Visibility button announces its current action.
- Example: `<PasswordInput accessibilityLabel="Password" />`.
- Do/don’t: Allow password managers; do not block paste.
- Edge cases: Platform keyboards may briefly retain suggestions after visibility changes.

## TextArea

- Purpose: Multi-line text entry.
- Props: `TextAreaProps`; `status`, `minRows`, `maxLength`, `showCounter`, native input props.
- Variants/sizes/states: Default/error/success; focused, disabled, character limit.
- Accessibility: Exposes invalid and disabled semantics; counter remains visible.
- Example: `<TextArea minRows={6} maxLength={500} />`.
- Do/don’t: Set realistic limits; do not resize based on every keystroke in dense forms.
- Edge cases: Very large font settings increase the rendered minimum height.

## SearchInput

- Purpose: Search query entry with search and clear affordances.
- Props: `SearchInputProps`; Input props plus `onClear` and localized `clearLabel`.
- Variants/sizes/states: Inherits Input; clear action appears when `value` is non-empty.
- Accessibility: Search return key and labelled clear button.
- Example: `<SearchInput value={query} onChangeText={setQuery} onClear={() => setQuery('')} />`.
- Do/don’t: Debounce network requests outside the component; do not clear without user action.
- Edge cases: Works controlled or uncontrolled; Clear calls `onChangeText('')` and `onClear`, then refocuses the field.

## FormField

- Purpose: Groups label, description, control, error, and success feedback.
- Props: `FormFieldProps`; `label`, renderable `children`, `description`, `error`, `success`, `required`, `optionalLabel`.
- Variants/sizes/states: Required/optional, error/success.
- Accessibility: Render props provide stable IDs for label and description relationships.
- Example: `<FormField label="Email">{ids => <Input accessibilityLabelledBy={ids.labelId} />}</FormField>`.
- Do/don’t: Show one actionable error; do not encode required state only with an asterisk.
- Edge cases: Localize `optionalLabel` and all feedback strings.


## Form

- Purpose: Whole form from a `fields` array — Formik state, Yup validation, Bunyan controls with labels, errors, theme, RTL and accessibility. See [FORMS.md](FORMS.md).
- Props: `FormProps<Values>`; `initialValues`, `onSubmit`, `validationSchema`, `fields`, `formProps` (Formik config), `submitButton`, `resetButton`, `spacing`, `showOptional`, `fieldTypes`, `children`, `renderFooter`.
- Variants/sizes/states: Field types `Input`/`TextInput`, `PasswordInput`, `SearchInput`, `TextArea`, `Select`/`Picker`, `DatePicker`, `DateRangePicker`, `Checkbox`, `Switch`/`Toggle`, `RadioGroup`, `ChipsGroup`, `CheckboxGroup`, `RadioImageGroup`, `BoxGroup`, `SwatchGroup`, `Slider`, `AmountInput`, `AmountWithCurrencyInput`, `PhoneWithCountryInput`, `AmountField`, `FileInput`, `OTP`, `RepeatedControls`, display-only `Progress` and `ActionText`, React elements, and custom registered types; pristine, touched, invalid, submitting.
- Accessibility: Each control gets its label as accessible name; errors use alert semantics; submit shows busy state while submitting.
- Example: `<Form initialValues={{ email: '' }} validationSchema={schema} onSubmit={save} fields={[{ type: 'Input', name: 'email', label: { localeKey: 'common.email' } }]} />`.
- Do/don’t: Keep rules in `validationSchema` and texts as locale keys; do not render one Form inside another.
- Edge cases: Falsy `fields` entries are skipped; `visibleWhen` hides fields based on values; Yup messages can be locale keys; needs `formik` installed; use the `Yup` exported by Bunyan for schemas.
## Checkbox

- Purpose: Selects zero or more independent options.
- Props: `CheckboxProps`; `checked`, `onChange`, `label`, `description`, `disabled`, `indeterminate`, `error`.
- Variants/sizes/states: Checked, unchecked, mixed, disabled, error.
- Accessibility: Checkbox role and true/false/mixed state.
- Example: `<Checkbox checked={accepted} onChange={setAccepted} label="Accept terms" />`.
- Do/don’t: Use for independent choices; do not use for mutually exclusive options.
- Edge cases: Pressing a mixed (indeterminate) checkbox always reports `true`.

## Radio

- Purpose: Selects exactly one option in a set.
- Props: `RadioProps`; `selected`, `onSelect`, `label`, `description`, `disabled`, `value`.
- Variants/sizes/states: Selected, unselected, disabled.
- Accessibility: Radio role, checked state, and optional value.
- Example: `<Radio selected={plan === 'pro'} onSelect={() => setPlan('pro')} label="Pro" />`.
- Do/don’t: Present radios as a labelled group; do not offer only one radio.
- Edge cases: Re-pressing the selected radio is a no-op; product code owns arrow-key group navigation on web.


## RadioGroup

- Purpose: A labelled set of radios with one selected value.
- Props: `RadioGroupProps<V>`; `options` (`label`, `value`, `description`, `disabled`), `value`, `onChange`, `layout`, `disabled`, `accessibilityLabel`.
- Variants/sizes/states: Column or row; selected, disabled.
- Accessibility: Container uses the radiogroup role; labels accept locale keys.
- Example: `<RadioGroup value={plan} onChange={setPlan} options={[{ label: 'Basic', value: 'basic' }, { label: 'Pro', value: 'pro' }]} />`.
- Do/don’t: Offer at least two options.
- Edge cases: Values can be strings or numbers.
## Switch

- Purpose: Immediately toggles a setting.
- Props: `SwitchProps`; `value`, `onValueChange`, `label`, `description`, `disabled`.
- Variants/sizes/states: On, off, disabled.
- Accessibility: Native switch role and checked state.
- Example: `<Switch value={enabled} onValueChange={setEnabled} label="Notifications" />`.
- Do/don’t: Use for immediate effects; use Checkbox when submission is required.
- Edge cases: Persist failures should restore the prior value and show feedback.

## Select

- Purpose: Chooses one value from a list.
- Props: `SelectProps`; `options`, `value`, `onValueChange`, labels, `disabled`, `status`, `size`, `searchable`.
- Variants/sizes/states: Small/medium/large; expanded, disabled, error, selected, empty search.
- Accessibility: Combobox role, current value, expanded and invalid state.
- Example: `<Select options={countries} value={country} onValueChange={setCountry} searchable />`.
- Do/don’t: Use search for long lists; do not use for fewer than three obvious choices.
- Edge cases: Disabled options remain visible; missing values show the placeholder.

## DatePicker

- Purpose: Selects a calendar date consistently across native platforms.
- Props: `DatePickerProps`; `value`, `onChange`, date bounds, locale, `formatOptions`, placeholder, title, disabled, status, size, clearable, localisable clear/confirm labels.
- Variants/sizes/states: Empty, selected, open, disabled, error.
- Accessibility: Pressable trigger with button role, current value and expanded state; clear is a separate labelled button.
- Example: `<DatePicker value={date} onChange={setDate} maximumDate={new Date()} />`.
- Do/don’t: Pass a locale and valid bounds; do not parse display text manually.
- Edge cases: Label uses the Gregorian calendar by default (ar-SA would otherwise show Hijri); override with `formatOptions`. Value is clamped to min/max on confirm.


## DateRangePicker

- Purpose: From/to date selection with an optional Gregorian/Hijri display toggle.
- Props: `DateRangePickerProps`; `value` (`{ from, to }`), `onChange`, `fromLabel`, `toLabel`, placeholders, `minimumDate`, `maximumDate`, `showHijriToggle`, `calendar` / `defaultCalendar` / `onCalendarChange`, `layout`, `locale`, `disabled`, `status`, `clearable`.
- Variants/sizes/states: Row or column; empty, partial, complete; Gregorian or Hijri display; error; disabled.
- Accessibility: Each side is a labelled DatePicker; the calendar toggle is a ChipsGroup.
- Example: `<DateRangePicker value={range} onChange={setRange} maximumDate={new Date()} showHijriToggle />`.
- Do/don’t: Validate with Bunyan's `Yup.mixed().dateRange()`, `dateRangeSchema()` or `validateDateRange()`.
- Edge cases: Each side is bounded by the other, so `from` ≤ `to`; Hijri changes display only — values stay `Date`s and the native picker grid stays Gregorian.
## Badge

- Purpose: Displays compact read-only status or metadata.
- Props: `BadgeProps`; `children`, `tone`, `size`.
- Variants/sizes/states: Neutral, primary, success, warning, error, information; small/medium.
- Accessibility: Text remains the source of meaning; color is supplemental.
- Example: `<Badge tone="success">Approved</Badge>`.
- Do/don’t: Keep copy short; do not make badges interactive.
- Edge cases: Long localized status text may wrap; use a Chip if interaction is needed.

## Chip

- Purpose: Represents a filter, selection, or removable value.
- Props: `ChipProps`; `label`, `selected`, `disabled`, `onPress`, `onRemove`, `accessibilityLabel`.
- Variants/sizes/states: Default, selected, pressed, disabled, removable.
- Accessibility: Label and remove are sibling buttons (never nested), each with its own label and state.
- Example: `<Chip label="Finance" selected onRemove={removeFinance} />`.
- Do/don’t: Use concise nouns; do not nest arbitrary controls inside a chip.
- Edge cases: Removing a selected filter should update focus predictably.


## ChipsGroup

- Purpose: Single- or multi-select set of chips (filters, segments, tags).
- Props: `ChipsGroupProps<V>`; `data` (`text`, `value`, `leftIcon`, `disabled`), `value`, `onChange`, `multiple`, `max`, `scrollable`, `disabled`, `accessibilityLabel`.
- Variants/sizes/states: Single, multiple, wrapping or horizontally scrolling; selected and disabled chips.
- Accessibility: Each chip announces its selected state; texts accept locale keys.
- Example: `<ChipsGroup value={dir} onChange={setDir} data={[{ text: 'All', value: '0' }, { text: 'In', value: '1', leftIcon: 'arrow-down-left' }]} />`.
- Do/don’t: Use for 2–8 short options; use Select for long lists.
- Edge cases: Single mode ignores re-pressing the selected chip; multiple mode stops at `max`.
## Avatar

- Purpose: Identifies a person or entity with image, initials, or fallback icon.
- Props: `AvatarProps`; `source`, `name`, `size`, `accessibilityLabel`.
- Variants/sizes/states: Four sizes; image, initials, fallback, image-error fallback.
- Accessibility: Exposes an image role and meaningful label.
- Example: `<Avatar name="Fatimah Ali" source={{ uri }} />`.
- Do/don’t: Provide `name`; do not use an avatar as the only identity label in critical flows.
- Edge cases: Initials use the first two whitespace-separated words.

## Divider

- Purpose: Separates adjacent content groups.
- Props: `DividerProps`; `orientation`, `inset`, `decorative`.
- Variants/sizes/states: Horizontal/vertical and four inset levels.
- Accessibility: Decorative by default (hidden from screen readers); `decorative={false}` exposes the separator role.
- Example: `<Divider inset="medium" />`.
- Do/don’t: Use spacing before adding dividers; do not over-segment simple layouts.
- Edge cases: Vertical dividers need a parent with defined height.

## Card

- Purpose: Groups related content or exposes a single card-level action.
- Props: `CardProps`; `variant`, `padding`, children, and a discriminated interactive `onPress` form.
- Variants/sizes/states: Elevated, outlined, filled; four padding levels; pressed.
- Accessibility: Interactive cards require an accessibility label and use button semantics.
- Example: `<Card variant="elevated"><Text>Summary</Text></Card>`.
- Do/don’t: Keep one information hierarchy; do not nest multiple large interactive regions.
- Edge cases: Use `padding="none"` for edge-to-edge media.

## ListItem

- Purpose: Standard row for settings, navigation, selection, or metadata.
- Props: `ListItemProps`; title, description, leading/trailing slots, press behavior, disabled, selected, chevron.
- Variants/sizes/states: Static, interactive, pressed, selected, disabled.
- Accessibility: Interactive rows expose button role and selected state.
- Example: `<ListItem title="Security" description="Password and devices" onPress={openSecurity} />`.
- Do/don’t: Put the primary label in `title`; do not hide critical actions in an unlabeled trailing slot.
- Edge cases: Long descriptions wrap while trailing content remains aligned.


## List

- Purpose: Generic list/grid that renders any component once per data item — rows of `ListItem`, a wrap of `Chip`s, a grid of `Card`s, a row of `Button`s, or your own component.
- Props: `ListProps<T, D>`; `Component`, `data`, `formatItem`, `shareProps`, `keyExtractor`; layout `flexDirection`, `flexWrap`, `columns`, `spacing`; dividers `withDivider`, `dividerSpacing`, `dividerStyle`; container `cardVariant`, `isScrolling`, `style`, `paddingStyle`, `rowStyle`, `cellStyle`, `scrollViewContentContainerStyle`; states `loading`, `loadingConfig`, `emptyForm`, `filterNull`; `ListHeaderComponent`, `ListFooterComponent`.
- Variants/sizes/states: Column (default), row, wrapping row, horizontal scroll, n-column grid; with/without dividers; inside a Card; loading skeletons; empty state.
- Accessibility: Items container uses the list role and each cell the listitem role; loading is one progressbar announcement for the whole region; item accessibility comes from the rendered component.
- Example: `<List Component={ListItem} data={users} formatItem={u => ({ title: u.name, description: u.email })} shareProps={{ onPress: open }} withDivider cardVariant="outlined" />`.
- Do/don’t: Map API objects in `formatItem` and put common props in `shareProps`; do not use it for thousands of rows (it renders every item — use a virtualized list for very long data).
- Edge cases: Item props override `shareProps`; `formatItem` is required by TypeScript when `data` does not match the component's props; returning `null` from `formatItem` skips the item (with `filterNull`, default on); keys default to `id`, then `key`, then index; the last grid row is padded so cells keep equal widths; spacing accepts points or token names (`'md'`); requires TypeScript ≥ 5.4 (`NoInfer`).

## Accordion

- Purpose: Progressively discloses secondary content.
- Props: `AccordionProps`; title, children, controlled/uncontrolled expansion, disabled.
- Variants/sizes/states: Collapsed, expanded, disabled.
- Accessibility: Announces expanded state and connects trigger to content.
- Example: `<Accordion title="Advanced"><AdvancedSettings /></Accordion>`.
- Do/don’t: Use for optional detail; do not hide required form fields unexpectedly.
- Edge cases: Controlled mode requires the parent to update `expanded`.

## Tabs

- Purpose: Switches between peer content views.
- Props: `TabsProps`; `items`, `value`, `onValueChange`, `variant`, label.
- Variants/sizes/states: Line/pill; selected, pressed, disabled; optional badge.
- Accessibility: Tablist and tab roles with selected state.
- Example: `<Tabs items={items} value={tab} onValueChange={setTab} />`.
- Do/don’t: Keep labels short; do not use tabs as a stepper.
- Edge cases: Horizontal scrolling handles long translations; re-pressing the active tab does not fire `onValueChange`.

## Modal

- Purpose: Interruptive, focused task or confirmation.
- Props: `ModalProps`; visibility, close handler, title, description, children, actions, dismissibility, size.
- Variants/sizes/states: Small/medium/large; open/closed; dismissible; action loading/disabled.
- Accessibility: Isolates modal content and supports platform back dismissal.
- Example: `<Modal visible={open} onClose={close} title="Confirm">…</Modal>`.
- Do/don’t: Keep tasks short; do not stack modals.
- Edge cases: Non-dismissible modals must provide a clear completion action.

## BottomSheet

- Purpose: Mobile-friendly contextual actions or compact tasks.
- Props: `BottomSheetProps`; visibility, close handler, title, description, children, dismissible.
- Variants/sizes/states: Open/closed and dismissible/non-dismissible.
- Accessibility: Modal isolation and labelled close control.
- Example: `<BottomSheet visible={open} onClose={close} title="Actions">…</BottomSheet>`.
- Do/don’t: Use for short choices; use Modal for complex keyboard-heavy tasks.
- Edge cases: Content scrolls when it exceeds 90% of viewport height.

## Tooltip

- Purpose: Supplies supplemental context for a focused or hovered control.
- Props: `TooltipProps`; `content`, one child element, top/bottom placement.
- Variants/sizes/states: Top/bottom; hover, focus, long-press visibility.
- Accessibility: Content is also provided as an accessibility hint.
- Example: `<Tooltip content="Archive record"><IconButton … /></Tooltip>`.
- Do/don’t: Keep it brief; do not put essential instructions only in a tooltip.
- Edge cases: Touch users reveal tooltips with long press; the bubble stays for `touchDuration` ms after release.

## Toast and ToastProvider

- Purpose: Announces transient, non-blocking feedback.
- Props: `ToastProviderProps`; `maxVisible`. `showToast` accepts message, tone, duration, and optional action.
- Variants/sizes/states: Neutral, success, warning, error, information; timed or persistent.
- Accessibility: Polite live region; errors use alert semantics.
- Example: `useToast().showToast({ message: 'Saved', tone: 'success' })`.
- Do/don’t: Use concise status messages; do not use a toast for required decisions.
- Edge cases: `duration: 0` persists until dismissed; the queue is capped at `maxVisible` (oldest evicted); pressing an action also dismisses; `dismissAll()` clears everything.

## Alert

- Purpose: Persistent contextual feedback inside a screen.
- Props: `AlertProps`; title, description, tone, action, dismiss handler.
- Variants/sizes/states: Information, success, warning, error; actionable, dismissible.
- Accessibility: Warning/error use alert semantics; icon and color are redundant cues.
- Example: `<Alert tone="warning" title="Session expires soon" />`.
- Do/don’t: Place near affected content; do not show multiple competing alerts.
- Edge cases: Long actions should move below the description naturally.

## Skeleton

- Purpose: Preserves layout while content is loading.
- Props: `SkeletonProps`; width, height, radius, lines, label.
- Variants/sizes/states: Single/multiple lines and four radii.
- Accessibility: Exposes progress semantics and respects reduced motion.
- Example: `<Skeleton lines={3} />`.
- Do/don’t: Match the final layout; do not use for actions waiting on submission.
- Edge cases: The final line is shortened to resemble natural text.

## Spinner

- Purpose: Indicates indeterminate activity.
- Props: `SpinnerProps`; size, label, tone.
- Variants/sizes/states: Small/large; primary/inverse.
- Accessibility: Progress role and text label.
- Example: `<Spinner label="Loading accounts" />`.
- Do/don’t: Use a task-specific label; do not cover an entire screen for background work.
- Edge cases: Use Skeleton for content-shaped loading.

## EmptyState

- Purpose: Explains an empty collection and offers a next step.
- Props: `EmptyStateProps`; title, description, icon, primary and secondary actions.
- Variants/sizes/states: Informational and actionable.
- Accessibility: Clear heading hierarchy and real button actions.
- Example: `<EmptyState title="No invoices" actionLabel="Create invoice" onAction={create} />`.
- Do/don’t: Explain why it is empty; do not imply an error when emptiness is valid.
- Edge cases: Omit actions when the user cannot change the state.

## ErrorState

- Purpose: Full-region failure with an optional retry.
- Props: `ErrorStateProps`; EmptyState props plus `retryLabel`, `onRetry`.
- Variants/sizes/states: Static error or retryable error.
- Accessibility: Uses visible text and error icon rather than color alone.
- Example: `<ErrorState title="Unable to load" onRetry={reload} />`.
- Do/don’t: Explain recovery; do not expose raw server messages.
- Edge cases: Disable or debounce retry in product code while a retry is running.

## Input specialisations: AmountInput, AmountWithCurrencyInput, PhoneInput

- Purpose: Money and phone entry built on Input.
- Props: `AmountInputProps` (`value`, `onChangeValue`, `currency`, `decimals`, `allowNegative`, `groupSeparator`); `AmountWithCurrencyInputProps` (`value: { amount, currency }`, `onChange`, `currencies`); `PhoneInputProps` (`value: { country, number }`, `onChange`, `countries`, `defaultCountry`, `showFlag`). `Input` also gained `leading` and `textDirection`.
- Variants/sizes/states: All Input sizes and statuses; currency / country pickers open a searchable sheet.
- Accessibility: Pickers are labelled buttons announcing the current value; amounts, phones and codes are typed left-to-right inside Arabic UIs.
- Example: `<AmountInput value={amount} onChangeValue={setAmount} currency="SAR" />` · `<PhoneInput value={phone} onChange={setPhone} />`.
- Do/don’t: Keep amounts as numbers in state; format only for display (`formatAmount`). Do not store the grouped text.
- Edge cases: Arabic-Indic digits are converted; leading zeros and extra decimals are dropped; `toE164()` builds `+966…`; `isValidPhone()` checks national-number length.

## FileInput

- Purpose: Upload box with the list of picked files.
- Props: `FileInputProps`; `value`, `onChange`, `pickFile` (or `setDefaultFilePicker`), `multiple`, `maxFiles`, `maxSize`, `onReject`, `title`, `hint`, `removeLabel`, `disabled`, `status`.
- Variants/sizes/states: Empty, busy (picking), with files, error, disabled.
- Accessibility: Upload area is a labelled button with the hint; each file has a labelled remove button.
- Example: `<FileInput value={files} onChange={setFiles} multiple maxSize={5e6} hint="PDF or JPG, up to 5 MB" />`.
- Do/don’t: Provide the platform picker once with `setDefaultFilePicker`; Bunyan ships no native module.
- Edge cases: Oversized files and files over `maxFiles` go to `onReject` with a reason.

## AmountField

- Purpose: Large centred amount for transfer and payment screens.
- Props: `AmountFieldProps`; `value`, `onChangeValue`, `currency`, `decimals`, `label`, `hint`, `errorText`, `quickAmounts`, `useNumPad`, `disabled`.
- Variants/sizes/states: Keyboard or NumPad (with decimal key); quick-amount chips; error.
- Accessibility: The amount input is labelled with label and currency; errors use alert semantics.
- Example: `<AmountField value={amount} onChangeValue={setAmount} currency="SAR" quickAmounts={[100, 500, 1000]} hint="Available 12,480.00 SAR" />`.
- Do/don’t: Show the available balance or limits in `hint`.
- Edge cases: Same sanitising as AmountInput (Arabic digits, decimals limit).

## OTPInput

- Purpose: One-time-code slots usable anywhere (also used by OTPTemplate and the `OTP` form field).
- Props: `OTPInputProps`; `value`, `onChange`, `onComplete`, `length`, `secure`, `error`, `errorText`, `disabled`, `useNumPad`, `autoFocus`.
- Variants/sizes/states: Keyboard or NumPad; secure; error; disabled.
- Accessibility: Slot row announces progress; hidden native input supports paste and SMS autofill.
- Example: `<OTPInput value={code} onChange={setCode} length={6} onComplete={verify} />`.
- Do/don’t: Keep verification logic outside.
- Edge cases: `onComplete` fires once per completed code.

## Slider

- Purpose: Choose a number in a range.
- Props: `SliderProps`; `value`, `onChange`, `onChangeEnd`, `min`, `max`, `step`, `label`, `showValue`, `formatValue`, `showLimits`, `disabled`.
- Variants/sizes/states: With/without value and limits; disabled.
- Accessibility: Adjustable role with increment/decrement actions and a value text.
- Example: `<Slider label="Installments" min={3} max={24} step={3} value={n} onChange={setN} formatValue={v => `${v} months`} />`.
- Do/don’t: Prefer an input for exact values over large ranges.
- Edge cases: Dependency-free (PanResponder); mirrors in RTL.

## ProgressBar

- Purpose: Determinate progress (uploads, completion, steps).
- Props: `ProgressBarProps`; `value` (0–1, or current with `total`), `label`, `showValue`, `formatValue`, `tone`, `size`.
- Variants/sizes/states: Primary, success, warning, error; three sizes.
- Accessibility: Progressbar role with min/max/now values.
- Example: `<ProgressBar label="Profile" value={3} total={5} />`.
- Do/don’t: Use Spinner/Skeleton for unknown durations.
- Edge cases: Value is clamped to 0–100%.

## ActionText

- Purpose: A sentence with an inline link ("Don't have an account? Sign up").
- Props: `ActionTextProps`; `text`, `actionText`, `onPress`, `trailingText`, `variant`, `align`, `disabled`.
- Variants/sizes/states: Any Text variant; disabled.
- Accessibility: The action is a nested text with the link role.
- Example: `<ActionText text="Forgot your password?" actionText="Reset it" onPress={reset} />`.
- Do/don’t: Keep the action short and descriptive.
- Edge cases: Wraps naturally across lines and in RTL.

## CheckboxGroup, RadioImageGroup, BoxGroup, SwatchGroup

- Purpose: Choice groups — several checkboxes, picture cards, icon boxes and colour swatches.
- Props: `CheckboxGroupProps` (`options`, `value[]`, `onChange`, `selectAllLabel`, `max`, `layout`); `RadioImageGroupProps` (`options` with `image`, `value`, `onChange`, `columns`, `imageAspectRatio`); `BoxGroupProps` (`options` with `icon`, single or `multiple`, `max`, `columns`); `SwatchGroupProps` (`options` colours, `value`, `onChange`, `size`).
- Variants/sizes/states: Single/multiple; selected; disabled options; responsive columns.
- Accessibility: Radio/checkbox roles with checked state; swatches are labelled with their name or value; select-all shows the mixed state.
- Example: `<BoxGroup value={type} onChange={setType} options={[{ value: 'personal', title: 'Personal', icon: 'user' }]} />`.
- Do/don’t: Give swatches a `label` (colour names) for screen readers.
- Edge cases: Grids use `List` (equal-width cells, padded last row); swatch check mark picks black or white for contrast.

