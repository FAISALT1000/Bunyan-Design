# Bunyan Design System

A strongly typed React Native design system for iOS, Android, and web. Bunyan supports light, dark, and true-black themes; English and Arabic; LTR and RTL layouts; WCAG 2.2 AA-oriented interaction patterns; and controlled component customization through semantic variants.

## 1. Architecture overview

The system has four dependency directions:

1. Primitive tokens contain raw values and never import components.
2. Themes map primitives to semantic roles such as `color.text.secondary`.
3. Utilities resolve direction, size, and state from the active theme.
4. Components consume semantic tokens through `useTheme`.

Components never depend on product screens. Product code may compose components, but should not reach into component internals. This keeps visual changes centralized and makes theme, RTL, and accessibility behavior consistent.

Important decisions:

- Raw color, spacing, typography, radius, elevation, and motion values live only in `tokens`.
- Theme colors are semantic. A component asks for `theme.color.border.error`, not a red palette step.
- RTL is provider-scoped. Arabic stories and embedded web surfaces can be tested without mutating the process-wide `I18nManager`.
- Public styling is constrained to variants, sizes, status, and a small layout-only `containerStyle` surface.
- Inputs are controlled or uncontrolled using native React Native conventions.
- `Select`, `Modal`, and `BottomSheet` remain dependency-light. `DatePicker` delegates platform behavior to the community date picker.
- Motion-sensitive loading animation checks the operating system’s reduced-motion preference.

## 2. Token definitions

Tokens are exported from `src/design-system/tokens`.

```ts
import { spacing, tokens } from '@bunyan/design-system';

const mediumGap = spacing.md;
const focusColor = lightTheme.color.border.focus;
```

Available scales:

- Color palette and semantic colors
- Font family, size, weight, line height, and letter spacing
- Spacing, radius, and border width
- Shadow and Android elevation
- Icon size and component height
- Breakpoints
- Motion duration and easing
- Opacity and z-index

## 3. Theme implementation

```tsx
import { ThemeProvider, useTheme } from '@bunyan/design-system';

export function App() {
  return (
    <ThemeProvider initialPreference="system" locale="ar-SA" blackForSystemDark>
      <RootNavigator />
    </ThemeProvider>
  );
}

function ThemeSettings() {
  const { mode, preference, setPreference, isRTL } = useTheme();
  // preference: system | light | dark | black
  return null;
}
```

`ThemeProvider` listens for system appearance changes when preference is `system`. Set `direction` only when the application must override the direction inferred from its locale.

## 4. Folder structure

```text
src/
  design-system/
    components/
      RNTheme/                 # themed RN primitives; native.ts is the only react-native import
      createThemedComponent/   # factory used by RNTheme (and available to apps)
      Button/
        Button.tsx
        Button.stories.tsx
        index.ts
    hooks/
    providers/
    themes/
    tokens/
    utilities/
    index.ts
  index.ts
tests/
.rnstorybook/
docs/
```

## 5. RNTheme: the React Native boundary

Design-system code never imports from `react-native` directly. All primitives come
from `src/design-system/components/RNTheme`, and
`components/RNTheme/native.ts` is the **only** file allowed to import
`react-native` (a test enforces this).

```tsx
// inside a component
import { Pressable, View, type ViewRef } from '../RNTheme';
```

Every primitive is built with `createThemedComponent`, so it reads the active theme
and accepts an optional `themeStyle` resolver:

| Primitive | Theme defaults |
| --- | --- |
| `View`, `Pressable`, `Image`, `RNModal` | none (layout-neutral), `themeStyle` + ref forwarding |
| `RNText` | text colour, direction-aware font family, `writingDirection`, font scaling capped at 2x |
| `TextInput` | text/placeholder/selection/cursor colours, font family |
| `ScrollView` | indicator style per mode, `keyboardShouldPersistTaps="handled"` |
| `ActivityIndicator` | primary colour |
| `RNSwitch` | track colours |
| `KeyboardAvoidingView` | `behavior="padding"` on iOS |

Non-visual APIs (`Animated`, `Platform`, `Linking`, `StyleSheet`, `I18nManager`,
`AccessibilityInfo`, `Appearance`) and common types are re-exported from the same module.

App code can use the namespace export:

```tsx
import { RNTheme, createThemedComponent } from '@bunyan/design-system';

<RNTheme.View themeStyle={({ theme }) => ({ padding: theme.spacing.lg })} />;

const Surface = createThemedComponent(RNTheme.View, {
  displayName: 'Surface',
  baseStyle: ({ theme }) => ({ backgroundColor: theme.color.surface.primary }),
});
```

Style layers merge as `baseStyle` → `themeStyle` → `style` (explicit `style` wins).
Pressable-style `(state) => style` functions keep working. Explicit `undefined`
props never erase a theme default.

### RTL

`logicalRow`, `logicalText` and `logicalAlignItems` mirror only when the provider
direction differs from the native `I18nManager` direction. React Native already
mirrors layout and swaps `left`/`right` text alignment in native RTL, so
mirroring again would render RTL apps left-to-right.

### Forms

```tsx
<Form
  initialValues={{ direction: '0', period: {} }}
  validationSchema={Yup.object({ period: Yup.mixed().dateRange(true, true) })}
  onSubmit={applyFilter}
  fields={[
    isRajhi && { type: 'ChipsGroup', name: 'direction', data: [{ text: { localeKey: 'tx.all' }, value: '0' }] },
    { type: 'DateRangePicker', name: 'period', fromLabel: { localeKey: 'common.from' }, maximumDate: new Date(), showHijriToggle: true },
  ]}
/>
```

Formik + Yup under the hood (`Yup.mixed().dateRange()` is registered automatically — no setup call), texts accept `{ localeKey }` (pass `translate` to `ThemeProvider`), and projects can register their own field types. Full guide: [docs/FORMS.md](docs/FORMS.md).

### Responsive layout & your own tokens

```tsx
const r = useResponsive();            // r.breakpoint, r.up('medium'), r.select({ compact: 1, medium: 2 }), r.ms(18)
const useStyles = makeStyles((theme, r) => ({ title: { fontSize: r.ms(theme.typography.fontSize.xl) } }));
<List Component={Card} data={items} columns={{ compact: 1, medium: 2, expanded: 4 }} />
```

Bring your own tokens with `createThemes({ shared, light, dark })` + `<ThemeProvider themes={...}>`, and your own breakpoint names / design canvas with `createResponsive({ breakpoints, guidelineWidth })`. Plain JavaScript, no native module, updates on rotation and window resize. Full guide: [docs/RESPONSIVE.md](docs/RESPONSIVE.md).

## 6. Base component implementation

`Text`, `Heading`, `Icon`, `Button`, and `Input` are the base primitives. Higher-level components compose them instead of recreating typography, icons, interaction states, or form chrome.

```tsx
<Button
  variant="primary"
  size="large"
  loading={false}
  disabled={false}
  fullWidth
  trailingIcon="chevron-right"
>
  Continue
</Button>
```

## 7. Components

All component contracts and guidance are in [docs/COMPONENTS.md](docs/COMPONENTS.md).

A full illustrated reference (every component and variant in light, dark and Arabic RTL, plus tokens, hooks and utilities) is in [docs/Bunyan-Design-System-Reference.pdf](docs/Bunyan-Design-System-Reference.pdf). Ready-made prompts for AI assistants are in [docs/AI_PROMPTS.md](docs/AI_PROMPTS.md).

## 8. Tests

```bash
npm install
npm run typecheck
npm test
npm run test:coverage
npm run verify   # typecheck + tests
```

### Packaging

```bash
npm run pack
```

Runs `npm i && npm pack`. `npm pack` triggers `prepack`, which cleans and rebuilds
`dist/` first, so the tarball (`bunyan-design-system-<version>.tgz`) always ships
fresh compiled output. Install it elsewhere with
`npm i ./path/to/bunyan-design-system-<version>.tgz`.

The suite covers tokens, themes, accessibility roles and states, interactions, form errors, loading behavior, and Arabic RTL rendering. Snapshots are intentionally reserved for stable visual structures; behavior assertions are preferred.

## 9. Storybook

React Native Storybook 10 configuration lives in `.rnstorybook`. It includes on-device controls and actions.

Point the host app’s Storybook Metro integration at this directory. The checked-in story index includes a complete component catalog and focused Button state/theme/RTL coverage.

The standalone Expo showcase under `showcase/` can be launched without changing
any consuming application:

```bash
nvm use
npm run storybook:ios
```

Use `storybook:android` or `storybook:web` for the other platforms.

Do not use Node 21 or 23 with Metro. The repository `.nvmrc` selects the
supported Node 22.23.0 installation.

## 10. Usage

```tsx
import {
  Alert,
  Button,
  FormField,
  Input,
  ThemeProvider,
  ToastProvider,
} from '@bunyan/design-system';

export function AccountForm() {
  return (
    <ThemeProvider initialPreference="system" locale="en">
      <ToastProvider>
        <Alert title="Secure form" description="Your information is encrypted." />
        <FormField label="Account name" required>
          {ids => (
            <Input
              accessibilityLabelledBy={ids.labelId}
              accessibilityDescribedBy={ids.descriptionId}
              placeholder="Corporate account"
            />
          )}
        </FormField>
        <Button fullWidth>Continue</Button>
      </ToastProvider>
    </ThemeProvider>
  );
}
```

## Accessibility baseline

- Touch targets use the 44-point medium component height by default.
- Controls expose roles, labels, values, and disabled/selected/busy/expanded states.
- Form errors use live alert semantics and can be connected with `accessibilityDescribedBy`.
- Text scales with system font settings.
- Theme colors are selected for AA contrast at normal text sizes.
- Icon-only controls require an accessibility label.
- Modals use modal accessibility isolation and support platform back dismissal.
- Product teams remain responsible for meaningful labels, logical focus order, localization, and end-to-end screen audits.
