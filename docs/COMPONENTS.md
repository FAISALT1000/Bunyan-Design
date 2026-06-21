# Component documentation

Each component is exported from `@bunyan/design-system`. Prop interfaces are the source of truth and are exported beside their components.

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
- Accessibility: Decorative icons are hidden; meaningful icons need a label.
- Example: `<Icon name="chevron-right" mirroredInRTL />`.
- Do/don’t: Prefer semantic tone; use `color` only for approved brand exceptions.
- Edge cases: Directional icons must set `mirroredInRTL`.

## Button

- Purpose: Triggers a primary or secondary action.
- Props: `ButtonProps`; native press props plus `variant`, `size`, `loading`, `fullWidth`, and leading/trailing icons.
- Variants/sizes/states: `primary`, `secondary`, `outline`, `ghost`, `danger`; small/medium/large; pressed, disabled, loading, busy.
- Accessibility: Button role and busy/disabled states are automatic.
- Example: `<Button variant="primary" size="large" fullWidth>Continue</Button>`.
- Do/don’t: Use one primary action per region; do not use a button for navigation.
- Edge cases: Loading disables duplicate submission; long text wraps within full-width buttons.

## IconButton

- Purpose: Compact icon-only action.
- Props: `IconButtonProps`; `icon`, required `accessibilityLabel`, `variant`, `size`, `tone`, `selected`.
- Variants/sizes/states: Filled, outline, ghost; small/medium/large; pressed, selected, disabled.
- Accessibility: A text label is mandatory despite the visual icon-only treatment.
- Example: `<IconButton icon="close" accessibilityLabel="Close dialog" />`.
- Do/don’t: Use familiar icons; do not rely on color alone for selection.
- Edge cases: Add surrounding space when several icon buttons form a toolbar.

## Link

- Purpose: Navigates to internal or external content.
- Props: `LinkProps`; `href`, `external`, native press props.
- Variants/sizes/states: Link tone; pressed and disabled native states.
- Accessibility: Uses the link role; external links include a visible marker.
- Example: `<Link href="https://example.com" external>Privacy policy</Link>`.
- Do/don’t: Use descriptive text; do not label links “click here.”
- Edge cases: Validate deep-link schemes before passing them to `href`.

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
- Edge cases: Controlled value is required for the clear affordance to track content.

## FormField

- Purpose: Groups label, description, control, error, and success feedback.
- Props: `FormFieldProps`; `label`, renderable `children`, `description`, `error`, `success`, `required`, `optionalLabel`.
- Variants/sizes/states: Required/optional, error/success.
- Accessibility: Render props provide stable IDs for label and description relationships.
- Example: `<FormField label="Email">{ids => <Input accessibilityLabelledBy={ids.labelId} />}</FormField>`.
- Do/don’t: Show one actionable error; do not encode required state only with an asterisk.
- Edge cases: Localize `optionalLabel` and all feedback strings.

## Checkbox

- Purpose: Selects zero or more independent options.
- Props: `CheckboxProps`; `checked`, `onChange`, `label`, `description`, `disabled`, `indeterminate`, `error`.
- Variants/sizes/states: Checked, unchecked, mixed, disabled, error.
- Accessibility: Checkbox role and true/false/mixed state.
- Example: `<Checkbox checked={accepted} onChange={setAccepted} label="Accept terms" />`.
- Do/don’t: Use for independent choices; do not use for mutually exclusive options.
- Edge cases: Mixed state should resolve predictably when pressed.

## Radio

- Purpose: Selects exactly one option in a set.
- Props: `RadioProps`; `selected`, `onSelect`, `label`, `description`, `disabled`, `value`.
- Variants/sizes/states: Selected, unselected, disabled.
- Accessibility: Radio role, checked state, and optional value.
- Example: `<Radio selected={plan === 'pro'} onSelect={() => setPlan('pro')} label="Pro" />`.
- Do/don’t: Present radios as a labelled group; do not offer only one radio.
- Edge cases: Product code owns arrow-key group navigation on web.

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
- Props: `DatePickerProps`; `value`, `onChange`, date bounds, locale, placeholder, disabled, status, clearable.
- Variants/sizes/states: Empty, selected, open, disabled, error.
- Accessibility: Labelled trigger; delegates date-grid semantics to the native picker.
- Example: `<DatePicker value={date} onChange={setDate} maximumDate={new Date()} />`.
- Do/don’t: Pass a locale and valid bounds; do not parse display text manually.
- Edge cases: Web hosts should provide the community picker’s web implementation or replace this adapter.

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
- Accessibility: Announces selected/disabled state; remove is a separate labelled action.
- Example: `<Chip label="Finance" selected onRemove={removeFinance} />`.
- Do/don’t: Use concise nouns; do not nest arbitrary controls inside a chip.
- Edge cases: Removing a selected filter should update focus predictably.

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
- Accessibility: Decorative by default.
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
- Edge cases: Horizontal scrolling handles narrow screens and long translations.

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
- Edge cases: Touch users reveal tooltips with long press.

## Toast and ToastProvider

- Purpose: Announces transient, non-blocking feedback.
- Props: `ToastProviderProps`; `maxVisible`. `showToast` accepts message, tone, duration, and optional action.
- Variants/sizes/states: Neutral, success, warning, error, information; timed or persistent.
- Accessibility: Polite live region; errors use alert semantics.
- Example: `useToast().showToast({ message: 'Saved', tone: 'success' })`.
- Do/don’t: Use concise status messages; do not use a toast for required decisions.
- Edge cases: `duration: 0` persists until dismissed; queue length is bounded.

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
