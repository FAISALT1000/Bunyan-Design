# Template layer

Templates are reusable screen structures built from Bunyan components and semantic
theme tokens. They own layout, safe-area, scrolling, keyboard, responsive, RTL,
and screen-state behavior. Applications own data fetching, navigation, validation
rules, analytics, and all other business logic.

## Shared contracts

```ts
type ScreenState =
  | { type: 'content' }
  | { type: 'loading'; label?: string }
  | { type: 'empty'; title: string; description?: string; action?: TemplateAction }
  | {
      type: 'error';
      title?: string;
      message: string;
      retryAction?: TemplateAction;
      referenceCode?: string;
    }
  | { type: 'success'; title: string; description?: string };

interface TemplateAction {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  accessibilityLabel?: string;
}
```

Shared configuration types are exported for headers, footers, forms, validation,
flat and sectioned lists, pagination, detail rows, confirmation rows, dashboard
sections, result details, and steps.

All templates:

- inherit light, dark, and black themes from `ThemeProvider`;
- use logical alignment and the provider direction for English LTR and Arabic RTL;
- preserve native dynamic type and font scaling;
- expose actions as callbacks and content as slots;
- avoid API, navigation-library, Redux, and global-state dependencies;
- render controlled loading, empty, error, success, and content states;
- constrain visual customization to semantic variants instead of style props.

## BaseScreenTemplate

**Purpose:** The foundational safe screen shell for application screens.

**Use it for:** Screens that need a header, scrolling, keyboard avoidance, state
replacement, bottom content, or a sticky footer.

**Do not use it for:** A small embedded panel, list row, modal body, or product
workflow that already uses a more specific template.

**Primary props:** `children`, `title`, `subtitle`, `header`, `showBackButton`,
`onBack`, `headerLeft`, `headerRight`, `scrollable`, `keyboardAvoiding`,
`keyboardBehavior`, `keyboardVerticalOffset`, `loading`, `state`, `errorBanner`,
`bottomContent`, `footer`, `stickyFooter`, `background`, `padding`, `safeArea`,
`statusBar`, and `refreshControl`.

**Slots:** Header leading/actions, error banner, content, bottom content, and
footer.

**Variants:** Background `primary | secondary | surface`; padding
`none | compact | comfortable`; scrollable or fixed; sticky or non-sticky footer.

**States:** `ScreenState` plus a non-destructive loading overlay.

**Accessibility and RTL:** The header exposes heading semantics, loading is a
named progress indicator, content can receive one screen-level label, and the
back icon mirrors through the design-system icon behavior.

```tsx
<BaseScreenTemplate
  title="Transfer"
  subtitle="Enter the transfer details"
  showBackButton
  onBack={goBack}
  footer={<Button onPress={continueTransfer}>Continue</Button>}
>
  <TransferFields />
</BaseScreenTemplate>
```

**Do:** Use `state` when content should be replaced and `loading` when current
content should remain visible beneath a busy overlay.

**Don't:** Put network requests or route-state decisions inside the template.

## BottomActionTemplate

**Purpose:** A consistent, safe-area-aware action region fixed at the bottom.

**Use it for:** One primary action, or a primary and secondary action, below
screen content.

**Do not use it for:** Inline card actions or three or more equal-priority actions.

**Primary props:** `primaryAction`, `secondaryAction`, `layout`, `safeArea`,
`keyboardAware`, and `children`.

**Slots:** Optional supporting content above the action buttons.

**Variants:** `stacked | inline`.

**States:** Disabled and loading are controlled independently on each action.

**Accessibility and RTL:** Uses accessible Bunyan buttons, logical row order, a
bottom safe area, and keyboard-aware positioning.

```tsx
<BottomActionTemplate
  primaryAction={{ label: 'Continue', onPress: onContinue }}
  secondaryAction={{ label: 'Cancel', onPress: onCancel, variant: 'outline' }}
  layout="inline"
/>
```

**Do:** Keep the primary outcome visually dominant.

**Don't:** Pass custom button styling or hide a required action behind decoration.

## FormScreenTemplate

**Purpose:** Structure multi-field data-entry screens.

**Use it for:** Forms with sections, descriptions, validation summaries, and
sticky submit actions.

**Do not use it for:** A single search input or read-only details.

**Primary props:** `title`, `subtitle`, `sections`, `submitLabel`, `onSubmit`,
`secondaryAction`, `validationSummary`, `unsavedChanges`,
`unsavedChangesMessage`, `loading`, `submitDisabled`, `state`, `onBack`,
`headerRight`, and `requiredLabel`.

**Slots:** Each `FormSection.content` is a composed form fragment; the header
action is also a slot.

**Variants:** Section title/description/error/required metadata and optional
secondary action.

**States:** Screen states, validation errors, loading, disabled submission, and
unsaved-change warning.

**Accessibility and RTL:** Validation summaries and inline errors use alert
semantics, required state is communicated in text, keyboard avoidance is enabled,
and section alignment follows direction.

```tsx
<FormScreenTemplate
  title="Personal information"
  sections={[{ id: 'identity', title: 'Identity', content: <IdentityFields /> }]}
  submitLabel="Continue"
  onSubmit={handleSubmit}
/>
```

**Do:** Keep field state and validation in the application or form library.

**Don't:** Trigger validation, persistence, or navigation from section definitions.

## ListScreenTemplate

**Purpose:** Present searchable, filterable, refreshable flat or sectioned data.

**Use it for:** Accounts, cards, transactions, beneficiaries, and products.

**Do not use it for:** A short static group of key-value details.

**Primary props:** `data`, `keyExtractor`, `renderItem`, `search`, `filter`,
`sort`, `tabs`, `headerSummary`, `state`, `refreshing`, `onRefresh`,
`pagination`, `floatingAction`, `emptyTitle`, `emptyDescription`, `emptyAction`,
`skeletonCount`, `onBack`, and `headerRight`.

**Slots:** Item renderer, filter, sort, summary, header action, and floating action.

**Variants:** Discriminated `flat` or `sectioned` data; optional search, tabs,
pagination, refresh, and floating action.

**States:** Initial skeleton loading, refreshing, pagination loading, empty,
error, success, and content.

**Accessibility and RTL:** Search and controls retain component labels and states,
sections expose headings, refresh uses native behavior, and action placement uses
logical positioning.

```tsx
<ListScreenTemplate
  title="Beneficiaries"
  data={{ mode: 'flat', data: beneficiaries }}
  keyExtractor={item => item.id}
  renderItem={item => <BeneficiaryItem beneficiary={item} />}
  search={{ value: query, onChangeText: setQuery }}
/>
```

**Do:** Memoize expensive item renderers and use stable keys.

**Don't:** Fetch the next page inside the template; use `onLoadMore`.

## DetailsScreenTemplate

**Purpose:** Display structured, grouped, optionally expandable information.

**Use it for:** Account, card, transaction, beneficiary, and product details.

**Do not use it for:** Editable forms or pre-submission confirmation.

**Primary props:** `headerSection`, `status`, `summary`, `sections`,
`primaryAction`, `secondaryAction`, `shareAction`, `downloadAction`, `state`,
`loading`, and `onBack`.

**Slots:** Header section, summary card content, section content, and row values.

**Variants:** Status tone, static or expandable sections, and available actions.

**States:** Screen states and loading overlay.

**Accessibility and RTL:** Status uses badge semantics, expandable sections
announce expanded state, row values preserve readable order, and action icons
require labels from their `TemplateAction`.

```tsx
<DetailsScreenTemplate
  title="Transfer details"
  status={{ label: 'Completed', tone: 'success' }}
  sections={[{ id: 'details', rows }]}
  shareAction={{ label: 'Share', onPress: share }}
/>
```

**Do:** Use rows for label/value facts and `content` for richer compositions.

**Don't:** Turn a details screen into an editable form by placing uncontrolled
inputs in rows.

## ConfirmationScreenTemplate

**Purpose:** Review information and collect explicit confirmation before submission.

**Use it for:** Transfers, payments, applications, and destructive operations.

**Do not use it for:** Final result receipts or ordinary data entry.

**Primary props:** `sections`, `amountSummary`, `terms`, `confirmationLabel`,
`confirmed`, `onConfirmedChange`, `confirmationRequired`, `primaryAction`,
`secondaryAction`, `state`, `error`, `loading`, and `onBack`.

**Slots:** Row values, amount/fees/total, and terms content.

**Variants:** Optional amount card, editable rows, required checkbox, and one or
two actions.

**States:** Screen states, inline error, loading, confirmed, and unconfirmed.

**Accessibility and RTL:** Editable rows have explicit edit labels, the checkbox
announces checked state, errors use alert semantics, and financial labels and
values remain logically ordered.

```tsx
<ConfirmationScreenTemplate
  title="Review transfer"
  sections={sections}
  confirmationRequired
  confirmed={confirmed}
  onConfirmedChange={setConfirmed}
  primaryAction={{ label: 'Confirm', onPress: confirm }}
/>
```

**Do:** Disable or guard confirmation until all required acknowledgements are met.

**Don't:** Perform the transaction inside `onConfirmedChange`.

## ResultScreenTemplate

**Purpose:** Communicate a completed operation outcome and its receipt details.

**Use it for:** Success, failure, pending, warning, review, blocked, or custom
results.

**Do not use it for:** Recoverable inline form errors or transient toast messages.

**Primary props:** `status`, `title`, `description`, `referenceNumber`,
`dateTime`, `details`, `primaryAction`, `secondaryAction`, `shareAction`,
`downloadAction`, `state`, and `onBack`.

**Slots:** Detail values.

**Variants:** Built-in status objects `{ type: 'success' | 'error' | 'pending' |
'warning' | 'underReview' | 'blocked' }`, or
`{ type: 'custom', label, icon, tone }`.

**States:** Result status plus screen loading, empty, error, and success states.

**Accessibility and RTL:** The status icon is decorative beside an announced
status label, receipt facts remain readable with large text, and all receipt
actions use labelled buttons.

```tsx
<ResultScreenTemplate
  status={{ type: 'success' }}
  title="Transfer completed"
  referenceNumber="TRX-123456"
  primaryAction={{ label: 'Done', onPress: finish }}
/>
```

**Do:** Supply a meaningful reference and timestamp when available.

**Don't:** Rely on color or icon alone to communicate the result.

## EmptyStateTemplate

**Purpose:** Explain that content is unavailable because the collection is empty.

**Use it for:** First-use, no-data, and no-search-results experiences.

**Do not use it for:** Failures, permissions, or maintenance.

**Primary props:** `title`, `description`, `illustration`, `icon`,
`primaryAction`, `secondaryAction`, `supportingContent`, and `variant`.

**Slots:** Illustration and supporting content.

**Variants:** `compact | fullScreen`.

**States:** Optional one or two actions.

**Accessibility and RTL:** Heading and description remain grouped, provided icons
are decorative, and action order follows direction.

```tsx
<EmptyStateTemplate
  title="No beneficiaries yet"
  description="Add a beneficiary to make a transfer."
  primaryAction={{ label: 'Add beneficiary', onPress: add }}
/>
```

**Do:** Explain the next useful step.

**Don't:** Blame the user or use an empty state for a technical failure.

## ErrorStateTemplate

**Purpose:** Present actionable, user-friendly screen errors.

**Use it for:** General, network, server, expired-session, permission, and
maintenance failures.

**Do not use it for:** Field validation or successful empty results.

**Primary props:** `type`, `title`, `message`, `illustration`, `retryAction`,
`secondaryAction`, `referenceCode`, and `variant`.

**Slots:** Optional illustration.

**Variants:** Error type and `compact | fullScreen`.

**States:** Retry available/unavailable and optional secondary recovery action.

**Accessibility and RTL:** The error is announced as an alert, copy is not
color-dependent, references are selectable/readable text, and buttons follow
direction.

```tsx
<ErrorStateTemplate
  type="network"
  retryAction={{ label: 'Try again', onPress: retry }}
/>
```

**Do:** Offer a safe recovery action and a support reference when useful.

**Don't:** Expose stack traces, credentials, or raw server responses.

## AuthenticationTemplate

**Purpose:** Provide a secure, keyboard-aware shell for authentication journeys.

**Use it for:** Login, registration, OTP, password reset, PIN, and biometric
entry.

**Do not use it for:** Authenticated account settings or product-specific session
logic.

**Primary props:** `mode`, `title`, `description`, `logo`, `form`, `error`,
`primaryAction`, `secondaryActions`, `biometricAction`, `footer`, `loading`,
`onBack`, and `background`.

**Slots:** Logo, form, and footer.

**Variants:** `login | registration | otp | passwordReset | pin | biometric`
and semantic background variants.

**States:** Error, loading, disabled action, and biometric availability controlled
by the application.

**Accessibility and RTL:** Secure input behavior comes from composed inputs,
errors are announced, keyboard avoidance and safe areas are enabled, and action
alignment follows direction.

```tsx
<AuthenticationTemplate
  mode="login"
  title="Welcome back"
  form={<LoginFields />}
  primaryAction={{ label: 'Sign in', onPress: signIn }}
/>
```

**Do:** Compose `PasswordInput`, `OTPTemplate`, or secure PIN controls in `form`.

**Don't:** Store credentials, request biometrics, or manage sessions in the template.

## DashboardTemplate

**Purpose:** Compose the high-level regions of a personalized landing screen.

**Use it for:** Greeting, profile, balances, quick actions, banners, horizontal
content, and recent activity.

**Do not use it for:** A single-purpose workflow screen.

**Primary props:** `greeting`, `subtitle`, `profileAction`, `balanceSummary`,
`quickActions`, `promotionalBanner`, `sections`, `recentActivity`, `state`,
`loading`, `refreshing`, and `onRefresh`.

**Slots:** Profile, balance summary, promotional banner, section content, and
recent activity.

**Variants:** Optional regions and any number of typed sections or quick actions.

**States:** Skeleton loading, pull-to-refresh, screen states, and disabled quick
actions.

**Accessibility and RTL:** Greeting is a heading, quick actions are labelled
controls with disabled state, horizontal regions honor direction, and refresh
uses native semantics.

```tsx
<DashboardTemplate
  greeting="Good morning, Sara"
  balanceSummary={<BalanceCard />}
  quickActions={quickActions}
  sections={dashboardSections}
  onRefresh={refresh}
/>
```

**Do:** Keep each section focused and defer data ownership to the screen.

**Don't:** Put dashboard API orchestration or personalization rules in the template.

## StepperFlowTemplate

**Purpose:** Structure dynamic multi-step banking and onboarding flows.

**Use it for:** Journeys with visible progress, validation gates, previous/next,
and save-and-exit behavior.

**Do not use it for:** Independent tabs or unordered tasks.

**Primary props:** `steps`, `currentStep`, `onNext`, `onBack`, `onSaveAndExit`,
`onStepPress`, `canContinue`, `loading`, `state`, labels, and `nextAction`.

**Slots:** Each `StepConfiguration.content` is the body for that step.

**Variants:** Hidden, optional, disabled, completed, current, and pending steps;
optional navigation to completed steps.

**States:** Progress, loading, disabled continuation, and all screen states.

**Accessibility and RTL:** Progress exposes min/max/current values, each visible
step announces its title and state, and connectors progress in the provider’s
logical direction.

```tsx
<StepperFlowTemplate
  title="Open an account"
  steps={steps}
  currentStep={currentStep}
  onNext={next}
  onBack={back}
  onSaveAndExit={save}
/>
```

**Do:** Validate in the screen before updating `currentStep`.

**Don't:** Mutate or reorder steps inside the template callback.

## Testing templates

Render templates with the package test helper so themes are available:

```tsx
renderWithTheme(
  <ResultScreenTemplate
    status={{ type: 'success' }}
    title="Completed"
    primaryAction={{ label: 'Done', onPress }}
  />,
);
```

Prefer assertions for roles, labels, states, callbacks, loading indicators,
direction, and visible content. Snapshot only stable structures that cannot be
expressed as a behavior assertion.

## Storybook coverage

Template stories live beside each implementation and are automatically included
by both the package and standalone showcase Storybook configurations. The catalog
covers default, loading, empty, error, dark/black theme, Arabic RTL, long content,
large text scenarios, small devices, multiple actions, and template-specific
variants.
