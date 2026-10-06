# Bunyan — AI prompts

Paste the context prompt first, then a task prompt. Replace `{placeholders}`.

## 0. Context prompt

```text
You are working with **Bunyan** (`@bunyan/design-system`), a strongly typed React Native design system for iOS, Android and web (React 19, React Native ≥ 0.74, TypeScript strict with `exactOptionalPropertyTypes`).

## Non-negotiable rules
1. Build UI only from Bunyan exports. Import everything from `@bunyan/design-system`.
2. Never import from `react-native` in design-system code. Use `RNTheme` primitives (`RNTheme.View`, `RNTheme.Pressable`, `RNTheme.ScrollView`, `RNTheme.TextInput`, `RNTheme.RNText`, `RNTheme.Platform`, ...). Inside `src/design-system`, only `components/RNTheme/native.ts` may import `react-native`.
3. No raw colours, font sizes, spacing or radii. Read them from `useTheme().theme` (`theme.color.*`, `theme.spacing.*`, `theme.radius.*`, `theme.typography.*`), or use `themeStyle={({ theme }) => ({ ... })}` on RNTheme primitives.
4. Wrap the app once in `<ThemeProvider initialPreference="system" locale={locale}>` and, if toasts are used, `<ToastProvider>`.
5. Support light, dark and black themes and Arabic RTL. Use `logicalRow(direction)`, `logicalText(direction, align)` and `logicalAlignItems(...)` instead of hard-coding `row-reverse` or `left`/`right`. Number entry (OTP, NumPad) stays left-to-right.
6. Accessibility: every icon-only control has an `accessibilityLabel`; every input sits inside a `FormField` (or has a label); never use colour alone to convey state; keep touch targets ≥ 44 pt.
7. Use semantic props (`variant`, `tone`, `size`, `status`) instead of style overrides. The only public style escape hatch is `containerStyle` on `Input` (layout only).
8. All user-facing strings must be passable as props so they can be localised (labels like `clearLabel`, `confirmLabel`, `closeLabel`, `dismissLabel`, `retryLabel`).
9. Responsive: keep token sizes fixed and change layout per breakpoint with `useResponsive()` (`r.up('medium')`, `r.select({ compact, medium, expanded })`) or breakpoint maps on `List` (`columns={{ compact: 1, medium: 2 }}`). Use `r.ms()` only for fonts/radii that should grow a little; never scale everything. Use `makeStyles((theme, r) => ({...}))` for styles that depend on theme and size.
10. Brand tokens come from `createThemes({ shared, light, dark })` passed to `<ThemeProvider themes={...}>`; custom breakpoint names / design canvas come from the app's own `createResponsive({...})` module — import responsive helpers from there if the project has one.

## Building blocks
- Providers/hooks: `ThemeProvider`, `useTheme()` → `{ theme, mode, preference, setPreference, direction, isRTL, locale }`; `ToastProvider`, `useToast()` → `{ showToast, dismissToast, dismissAll }`.
- Typography & icons: `Text` (variant/tone/weight/align), `Heading` (level 1–6), `Icon` (16 names, sizes xs–xxl, tones).
- Actions: `Button` (primary|secondary|outline|ghost|danger|link; small|medium|large; loading; fullWidth; leading/trailing icons; `href`/`external` to navigate), `IconButton` (filled|outline|ghost; required accessibilityLabel). `Link` is an alias of `<Button variant="link">`.
- Forms: `FormField` (label/description/error/success/required; render-prop ids), `Input`, `PasswordInput`, `SearchInput`, `TextArea`, `Checkbox`, `Radio`, `Switch`, `Select` (options, searchable), `DatePicker`.
- Display: `Badge`, `Chip`, `Avatar`, `Divider`, `Card` (elevated|outlined|filled; pressable), `ListItem`.
- Collections: `List<T, D>` renders any component per data item — `Component`, `data`, `formatItem(item, index) => props`, `shareProps` (common props; item props win), `keyExtractor`, `flexDirection`, `flexWrap`, `columns`, `spacing` (points or token), `withDivider`, `cardVariant`, `isScrolling`, `loading` + `loadingConfig`, `emptyForm` (EmptyState props), `ListHeaderComponent`, `ListFooterComponent`. Use it instead of `data.map(...)` in screens.
- Feedback: `Alert`, toast via `useToast`, `Spinner`, `Skeleton`, `EmptyState`, `ErrorState`.
- Disclosure/navigation: `Accordion`, `Tabs` (line|pill), `Tooltip`.
- Overlays: `Modal` (primary/secondary actions), `BottomSheet`.
- Templates: `NumPad`, `OTPTemplate` (bottomSheet|overlay|fullScreen).
- Forms: `<Form initialValues validationSchema onSubmit fields formProps submitButton resetButton>` (Formik + Yup). Field `type`s: Input/TextInput, PasswordInput, SearchInput, TextArea, Select/Picker, DatePicker, DateRangePicker, Checkbox, Switch/Toggle, RadioGroup, ChipsGroup, CheckboxGroup, RadioImageGroup, BoxGroup, SwatchGroup, Slider, AmountInput, AmountWithCurrencyInput, PhoneWithCountryInput, AmountField, FileInput, OTP, RepeatedControls, Progress, ActionText, plus React elements and custom types via `registerFormFieldType`. Falsy entries are skipped (`cond && {...}`); `visibleWhen(values)` hides fields; texts accept `{ localeKey }` (ThemeProvider `translate`); Yup messages may be locale keys; `addBunyanYupMethods(Yup)` adds `Yup.mixed().dateRange(requireFrom, requireTo)`.
- Theming: `RNTheme.*` themed primitives, `createThemedComponent(Component, { displayName, baseStyle, defaultProps })`.
- Responsive: `useResponsive()` → `{ breakpoint, up, down, between, is, select, resolve, s, vs, ms, mvs, isPortrait, isLandscape }`; `useBreakpoint()`, `useResponsiveValue()`, `makeStyles()`, static `s/vs/ms/mvs`, `getResponsive(size)`, `createResponsive(config)`; own tokens via `createTheme` / `createThemes`.

## How to answer
- Output complete, compiling TypeScript (`.tsx`) with typed props and no `any`.
- Keep state in the screen; components are controlled where possible.
- Show loading (`Skeleton`/`Spinner`), empty (`EmptyState`), and error (`ErrorState`) states for async data.
- If something is not possible with the existing components, say so and propose a new component that follows the "add a component" checklist instead of hand-rolling raw React Native.
```

## Building app screens

### B1. Build a new screen

```text
Using the Bunyan rules above, build a `{ScreenName}` screen for a React Native app.

Purpose: {what the screen does}
Data: {shape of the data / API}
Actions: {primary action}, {secondary actions}

Requirements:
- Use only `@bunyan/design-system` components and `RNTheme` primitives; no raw colours or spacing.
- Include loading (Skeleton), empty (EmptyState) and error (ErrorState with onRetry) states.
- Must look correct in light, dark and black themes and in Arabic (`locale="ar-SA"`).
- Every interactive element has an accessible label; one primary Button per region.

Return the full `.tsx` file plus a short note on which components you used and why.
```

### B2. Build a form with <Form>

```text
Build `{FormName}` with Bunyan's declarative `<Form>`.

Fields: {name: type, required?, rules} …
Submit: `{submitFn}`; show a success Toast after it resolves and an Alert on failure.

Rules:
- One `<Form>` with `initialValues`, a Yup `validationSchema` (messages as locale keys) and a `fields` array — no hand-wired inputs.
- Pick field types from the catalogue (TextInput, Picker, AmountInput, PhoneWithCountryInput, DateRangePicker, ChipsGroup, CheckboxGroup, FileInput, OTP, RepeatedControls…). Use `cond && {...}` for conditional fields known up front and `visibleWhen` for fields that depend on other values.
- All labels/placeholders as `{ localeKey }`.
- Use `formProps={{ enableReinitialize: true }}` when `initialValues` come from saved state.
- If a field type is missing, write it with `registerFormFieldType` (typed via `FormFieldTypes` augmentation) instead of rendering raw inputs.

Return the screen, the schema and the locale keys you introduced.
```

### B3. Build an OTP / PIN verification flow

```text
Implement sign-in verification using `OTPTemplate`.

Variant: {fullScreen | overlay | bottomSheet}
Code length: {4 | 6}; delivery: {SMS to +966…}
Behaviour: autoSubmit when complete; show `error` text from the API; resend is disabled for {30} seconds with a countdown in `resendLabel`; `loading` while verifying.
Use `useNumPad` on {phones without hardware keyboards}.

Keep verification logic in a hook (`useVerifyCode`) outside the template. Return the screen + hook.
```

### B4. Render a collection with List

```text
Render `{data description}` with Bunyan's generic `List`.

- Pick the item component: `ListItem` for rows, `Card` for tiles (`columns={2}`), `Chip` for tags (`flexDirection="row" flexWrap="wrap"`), `Button` for an action bar (`flexDirection="row"`), or a small custom component.
- Map API objects to props in `formatItem` (return `null` to skip an item) and put props common to all items (handlers, variant, size) in `shareProps`.
- Use `keyExtractor` if items have no `id`.
- Handle states with `loading` + `loadingConfig` and `emptyForm`; add `withDivider`, `cardVariant`, `ListHeaderComponent` as the design needs.
- Do not write `data.map(...)` by hand.

Return the typed component and explain the chosen layout props.
```

### B5. Build a settings screen

```text
Build a Settings screen with Bunyan: sections rendered with `Heading level={5}` and `ListItem` rows; toggles with `Switch`; a theme picker using `Radio` that calls `useTheme().setPreference('system' | 'light' | 'dark' | 'black')`; a language row that switches between `en` and `ar-SA`; a destructive "Delete account" row that opens a `Modal` with a `danger` primary action. Persist choices with {storage}. Make it fully RTL-correct.
```

### B6. Build a dashboard / list screen

```text
Build a `{Name}` dashboard: a `Tabs` (line) header, summary `Card`s (elevated) with `Badge` status tones, and a list of `ListItem`s with `Avatar` leading and trailing `Badge`. Pull-to-refresh via `RNTheme.ScrollView` `refreshControl`. Show `Skeleton lines={3}` per card while loading, `EmptyState` with a create action when empty, `ErrorState` on failure, and `useToast().showToast` after mutations.
```

### B7. Make an existing screen theme- and RTL-ready

```text
Here is an existing React Native screen:
```tsx
{paste code}
```
Refactor it to Bunyan:
- Replace every `react-native` import with Bunyan components or `RNTheme` primitives.
- Replace hard-coded colours/sizes with theme tokens; replace `flexDirection: 'row'` + manual RTL code with `logicalRow(direction)`.
- Replace custom buttons/inputs with `Button`, `IconButton`, `Input`, `FormField`.
- Keep behaviour identical. List every replacement you made in a table (before → after).
```

### B8. Choose the right feedback pattern

```text
For each of these situations, choose between `Toast`, `Alert`, `Modal`, `BottomSheet`, `EmptyState`, `ErrorState`, `Skeleton` and `Spinner`, explain why in one sentence, and show the Bunyan code:
{list of situations, e.g. "payment saved", "session about to expire", "no invoices yet", "server error loading list", "confirm delete"}
```

## Extending & maintaining the design system

### E1. Add a new component

```text
Add a `{ComponentName}` component to Bunyan (`src/design-system/components/{ComponentName}/`).

Purpose: {purpose}
Props: {props with types, defaults}
Variants/states: {variants}

Follow the project checklist exactly:
1. `{ComponentName}.tsx` + `index.ts`; export from `components/index.ts`.
2. Import primitives only from `../RNTheme` (never `react-native`); use `useTheme()` and tokens — no raw values.
3. `memo` + `forwardRef` when it wraps a native element; ref types from RNTheme (`ViewRef`, `TextInputRef`).
4. RTL via `logicalRow` / `logicalText`; directional icons mirror automatically.
5. Accessibility: role, label, state (`disabled`, `selected`, `checked`, `expanded`, `busy`), ≥ 44 pt target (hitSlop for compact sizes), localisable label props.
6. Respect `exactOptionalPropertyTypes` (spread optional props conditionally).
7. Add a story to `AllComponents.stories.tsx`, a behaviour test in `tests/`, and a section in `docs/COMPONENTS.md` (Purpose, Props, Variants, Accessibility, Example, Do/Don’t, Edge cases).
8. `npm run verify` must pass (typecheck + jest, including the react-native import-boundary test).
```

### E2. Add a custom Form field type

```text
Add a `{TypeName}` field type for Bunyan's `<Form>`.

Value shape: {value type}
Props: {extra config props}

1. Build the control as a normal component first (`components/{TypeName}/`), following the add-a-component checklist.
2. Augment the types: `declare module '@bunyan/design-system' { interface FormFieldTypes { {TypeName}: {props} } }`.
3. Register it once: `registerFormFieldType('{TypeName}', ({ field, value, setValue, setTouched, invalid, disabled, error, t, form }) => ...)`; pass `{ wrap: false }` only if the control renders its own label and error.
4. Map `invalid` to the control's error status, call `setTouched` on blur/selection, translate texts with `t`.
5. Add a typecheck test (field accepted, wrong props rejected) and a runtime test with Formik + Yup.
6. Document it in docs/FORMS.md (value shape + props).
```

### E3. Create a themed primitive with createThemedComponent

```text
Create `{Name}` using `createThemedComponent(RNTheme.{View|Pressable|...}, { displayName: '{Name}', baseStyle: ({ theme, direction }) => ({...}), defaultProps: ({ theme }) => ({...}) })`. Base style must use tokens only. Show usage with `themeStyle` and an explicit `style` override, and add a test asserting the theme style in dark mode (`renderWithTheme(ui, { initialPreference: 'dark' })`).
```

### E4. Apply a brand's own tokens

```text
Apply the `{Brand}` design tokens to Bunyan without forking it.

Tokens: {paste colours, font families, spacing, radii, breakpoints, Figma frame size}

1. Create `src/theme/brand.ts` with `createThemes({ shared, light, dark, black })` — shared for typography/spacing/radius/breakpoints, per mode for colours. Only override what differs.
2. Pass it to `<ThemeProvider themes={brandThemes}>` at the app root (module-level constant).
3. If the brand uses different breakpoint names or a different design canvas, create `src/theme/responsive.ts` with `createResponsive({ breakpoints, guidelineWidth, guidelineHeight })` and export `useResponsive`, `makeStyles`, `s`, `ms` from it.
4. Check contrast (WCAG AA) of the new colours on their surfaces in every mode and list the ratios.
5. Show one screen before/after using only tokens (no raw values).
```

### E5. Make a screen responsive

```text
Make `{ScreenName}` work on phones, tablets and web/desktop with Bunyan's responsive API.
- Layout changes per breakpoint: use `useResponsive()` (`r.up('medium')`, `r.select({...})`) and `List` breakpoint maps for columns/spacing; cap content width on wide screens.
- Only use `r.ms()` for headline sizes/illustrations that should grow slightly; keep body text and spacing tokens unscaled.
- Put size-dependent styles in `makeStyles((theme, r) => ({...}))`.
- Verify rotation and split-screen (the hook re-renders) and that touch targets stay ≥ 44 pt.
Return the updated file and a table of what changes at each breakpoint.
```

### E6. Add or change a design token / semantic colour

```text
Add the semantic colour `{group}.{name}` (purpose: {purpose}).
- Add any new raw value to `tokens/primitives.ts` palette only.
- Map it in `themes/themes.ts` for light, dark and black, and extend `SemanticColors` in `themes/types.ts`.
- Check WCAG AA contrast (≥ 4.5:1 text, ≥ 3:1 UI) against the surfaces it will sit on in every theme and report the ratios.
- Update `tests/tokens.test.ts` if the contract changes.
```

### E7. Add an icon

```text
Add the `{icon-name}` icon to `components/Icon/Icon.tsx`: extend the `IconName` union, add 24×24 stroke-only SVG children using `react-native-svg` primitives (round caps/joins, no fills), and add it to `DIRECTIONAL_ICONS` if its meaning depends on reading direction. Update the Icon story and the docs list.
```

### E8. Write tests for a component

```text
Write `@testing-library/react-native` tests for `{Component}` using `renderWithTheme` from `tests/test-utils`. Cover: role and accessible name, each interactive callback, disabled/loading blocking interaction, controlled vs uncontrolled behaviour, RTL (`locale: 'ar-SA'`) styles, and dark-mode rendering. Prefer behaviour assertions over snapshots. Use `act` + fake timers for anything time-based.
```

### E9. Review a change against Bunyan rules

```text
Review this diff as a Bunyan maintainer:
```diff
{paste diff}
```
Check and report (file:line, severity, fix): direct `react-native` imports; raw colours/spacing; missing a11y roles/labels/states; RTL mistakes (hard-coded `row-reverse`, `left`/`right`); un-localisable strings; `exactOptionalPropertyTypes` violations; missing story/test/docs; behaviour regressions. Finish with a merge recommendation.
```

### E10. Audit the design system for bugs

```text
Audit `src/design-system` for bugs. For each component consider: stale state when props change, timers/animations/promises not cleaned up on unmount, controlled vs uncontrolled mismatches, nested pressables, double RTL mirroring, accessibility state errors, and theme values that are invisible in dark/black mode. Output a table (component, bug, reproduction, fix) and then the patches with tests.
```

### E11. Package and release

```text
Prepare release `{version}`: bump `package.json`, run `npm run verify`, then `npm run pack` (runs `npm i && npm pack`; `prepack` cleans and rebuilds `dist/`). Inspect the tarball file list (`tar tzf bunyan-design-system-{version}.tgz`) to confirm `dist/`, `src/`, `docs/` and `README.md` are present and no tests or stories leak into `dist/`. Write release notes grouped as Added / Fixed / Changed.
```
