# Cross-platform component standard

Bunyan uses one public React Native API with token-driven iOS and Android
adaptation. Apple Human Interface Guidelines and Material Design 3 are design
references; neither platform vocabulary is copied directly into the public API.

Primary references:

- Apple Human Interface Guidelines:
  https://developer.apple.com/design/human-interface-guidelines/
- Apple accessibility:
  https://developer.apple.com/design/human-interface-guidelines/accessibility
- Apple layout and safe areas:
  https://developer.apple.com/design/human-interface-guidelines/layout
- Material Design 3:
  https://m3.material.io/
- Android accessibility:
  https://developer.android.com/guide/topics/ui/accessibility/apps

This document records Bunyan's interpretation. It does not claim automatic
platform compliance; each component still needs implementation and device
review.

## Decision model

Every component decision is classified as:

- **Shared:** public props, semantic colors, content hierarchy, disabled and
  loading states, accessibility contract, localization, and RTL behavior.
- **Platform-adaptive:** touch target, press feedback, elevation rendering,
  motion timing, focus treatment, modal presentation, and native control
  behavior.
- **Platform-specific:** an internal `.ios.tsx` or `.android.tsx`
  implementation only when tokens and shared behavior cannot represent the
  platform difference cleanly.
- **Application-controlled:** brand values, translations, screen structure,
  persistence, analytics events, business logic, and native adapter choices.

Public platform forks such as `IOSButton` and `AndroidButton` are prohibited.

## Foundation decision report

Component: interaction and surface foundation

Purpose: provide consistent platform adaptation for every interactive or
elevated component.

Shared requirements:

- One semantic API.
- Accessible roles, labels, states, focus, disabled, and loading behavior.
- Dynamic text scaling without an arbitrary maximum multiplier.
- Logical RTL alignment and directional icons.
- Semantic elevation levels and interaction states.

Apple considerations:

- Controls use a minimum 44-point interactive area.
- Press feedback is restrained and does not add elevation by default.
- Shadows represent visual hierarchy without imitating Material surfaces.
- Dynamic Type and safe-area layout remain enabled.

Material 3 considerations:

- Interactive targets use at least 48dp.
- Press feedback uses a state-layer/ripple model.
- Elevation resolves through Android elevation rather than iOS shadow
  properties.
- Semantic state and contrast remain visible independently of color alone.

Cross-platform decision:

- Shared implementation: `BasePressable`, semantic elevation levels, common
  accessibility and component APIs.
- Platform token differences: target size, feedback mode, motion duration,
  focus width, safe-area inset, and elevation styles.
- Platform-specific implementation: none required for this foundation.
- Application-controlled behavior: branding and optional haptic adapters.

Accessibility:

- iOS target minimum: 44 points.
- Android target minimum: 48dp.
- Text allows operating-system font scaling without Bunyan imposing a `2x`
  ceiling.
- Decorative icons remain hidden and parent controls announce their purpose.
- Reduced-motion behavior must use the existing accessibility hook and the
  platform motion token's `reduced` duration.

RTL:

- Components continue using logical start/end alignment.
- Directional semantic icons such as `chevron-end` mirror internally.
- Platform adaptation never derives direction from `Platform.OS`.

## Public platform API

```ts
type DesignSystemPlatform = "ios" | "android" | "web" | "default";
type ElevationLevel = "none" | "low" | "medium" | "high";
type InteractionFeedback = "auto" | "opacity" | "stateLayer" | "none";
```

`ThemeProvider` accepts a `platform` override for deterministic tests and
Storybook. Applications normally omit it so React Native supplies the runtime
platform.

```tsx
<ThemeProvider platform="android">
  <Button title="Confirm" />
</ThemeProvider>
```

Components do not receive a platform prop. Consumers continue using:

```tsx
<Button title="Confirm" variant="primary" />
<Card variant="elevated" title="Account" />
```

## Token ownership

Platform tokens live under `src/design-system/platform` and include:

- minimum touch target
- default press feedback
- pressed/state-layer opacity
- focus-ring width
- motion durations
- minimum safe-area content inset
- semantic elevation styles

`resolvePlatformToken` is the only general-purpose selection helper. Composite
components consume resolved tokens through `useTheme`; they must not import
React Native `Platform`.

## Elevation mapping

| Semantic level | iOS | Android |
| --- | --- | --- |
| none | no shadow | elevation 0 |
| low | subtle shadow | elevation 1 |
| medium | standard floating shadow | elevation 4 |
| high | prominent overlay shadow | elevation 8 |

These are Bunyan defaults, not exported Apple or Material token names.

## Component review template

Before implementation, record:

```text
Component:
Purpose:

Shared requirements:
- ...

Apple considerations:
- ...

Material 3 considerations:
- ...

Cross-platform decision:
- Shared implementation:
- Platform token differences:
- Platform-specific implementation:
- Application-controlled behavior:

Accessibility:
- ...

RTL:
- ...

Proposed API:
- ...
```

Then inspect existing primitives, define semantic tokens, implement through
base components, add platform files only with written justification, and add
behavioral tests and Storybook stories for both platforms.

## Tests

Every interactive component should cover:

- shared public API and type inference
- iOS and Android resolved tokens
- minimum target and press feedback
- platform elevation where relevant
- accessibility role and state
- disabled/loading interaction
- English LTR and Arabic RTL
- long content and system text scaling
- parity between internal platform implementations, if any

Prefer behavior assertions over snapshots.

## Storybook

The cross-platform foundation story exposes platform, theme, and locale as
typed controls. Platform stories should also include disabled, loading,
selected, error, long-content, and Arabic cases. Font scaling and reduced
motion must be verified using device accessibility settings until a
deterministic accessibility-preview provider is introduced.

## Platform-specific files

Before adding `.ios.tsx` or `.android.tsx`, document:

1. Why shared logic plus platform tokens is insufficient.
2. The exact behavior that differs.
3. Confirmation that both files export the same public type.
4. Platform parity tests.

Native date/time pickers and switches are reasonable candidates. Brand buttons,
cards, rows, and typography normally are not.
