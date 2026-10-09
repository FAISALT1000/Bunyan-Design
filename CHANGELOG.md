# Changelog

All notable changes to `@bunyan/design-system`. Versions follow semantic
versioning; until 1.0.0, minor changes may still add props but never rename or
remove public ones without a deprecation.

## 0.0.3

Fixes for issues found by StreamSpy on Android (Samsung, gesture and 3-button
navigation, edge-to-edge) and iOS. Every public prop name and type stays backward compatible.

### Fixed

- **InputField / BaseFloatingField: floated label shifted inwards.** The label
  now scales from the edge where the text starts (`transformOrigin`
  `'left top'` in LTR, `'right top'` in RTL), so it lines up with the value
  text and caret. The `leftIcon` inset is applied on the reading-start side,
  also when the provider direction differs from the native one.
- **InputField: resting label not vertically centred.** The empty, unfocused
  label is centred on the measured content row, so it shares one centre line
  with `leftIcon`, the search icon and the password eye. It still animates to
  the floating position. The `labelRestingTop` token is kept but no longer
  used (deprecated).
- **Chip: label at the top.** The chip container centres its content on both
  axes for any height (minimum touch target, Latin and Arabic glyphs).
- **Badge: forced `alignSelf: 'flex-start'`.** The badge now defaults to
  `alignSelf: 'auto'` with `flexGrow: 0` / `flexShrink: 0`, so it keeps its
  intrinsic size and follows the parent's `alignItems` (for example centred
  next to a user name). New optional `alignSelf` prop. Behaviour change: inside
  a column that stretches its children, pass `alignSelf="flex-start"` to keep
  the old placement.
- **OTPInput: keyboard did not open inside a BottomSheet/Modal on Android.**
  - Tapping the slots always opens the keyboard. When React Native already
    considers the input focused without a visible keyboard, it is blurred and
    focused again.
  - `autoFocus` is deferred until the surrounding modal has finished showing
    (`Modal.onShow`, with a 600 ms fallback) and running interactions.
  - The native input now lies transparently over the slots, so long-press
    offers Paste. A pasted code with separators (`Code: 123-456`) fills every
    slot (`maxLength` no longer truncates a paste before the digits are
    extracted).
  - New ref handle `OTPInputHandle` with `focus()`, `blur()` and `clear()`.
- **OTPInput: slots flipped in RTL.** The slot row and the NumPad use
  `direction: 'ltr'`, so slot 1 is always on the left.
- **BottomSheet: content under the navigation bar and the keyboard.**
  - The bottom padding adds the safe-area bottom inset (dropped while the
    keyboard is open).
  - The modal passes `navigationBarTranslucent` next to `statusBarTranslucent`.
  - The panel sits in a `KeyboardAvoidingView` (`padding` on both platforms),
    so focused inputs stay visible.
- **Toast: drawn under the navigation bar / tab bar.**
  - Bottom toasts sit at the safe-area bottom inset + `spacing.xxl`.
  - While the keyboard is open, they sit above it.
  - New `ToastProvider` props: `bottomOffset` (extra space, for example the tab
    bar height), `placement` (`'bottom'` default or `'top'`) and `testID`.

### Added

- **Theme modes `dim` and `sepia`.**
  - `ThemeMode` is now `'light' | 'dark' | 'black' | 'dim' | 'sepia'`.
  - `dim` is a soft dark theme (slate 800/900 surfaces, softer text than
    `dark`). `sepia` is a warm reading theme (cream paper, brown ink).
  - Both are exported (`dimTheme`, `sepiaTheme`), included in `themes` and
    built by `createThemes`. Every component token is defined for both, and
    text and primary buttons meet WCAG AA (covered by tests).
- **`isDark`.**
  - `useTheme().isDark` is `true` for `dark`, `black` and `dim`.
  - New exports: `isDarkMode(mode)` and `DARK_THEME_MODES`.
  - Scroll indicators and `BaseScreenTemplate`'s status bar treat `dim` as
    dark and `sepia` as light.
- **Palette.** Full 50–900 scales for `teal`, `amber` and `green`, and new
  `purple`, `rose` and `sepia` scales on the exported `palette`.
- **Icons:** `monitor`, `sun`, `moon`, `contrast`, `bell`, `globe`, `layers`,
  `grid`. `Icon` also sets `color` on the SVG so `currentColor` fills work.
- **`useOverlayShown()`** (from `base/Modal`): `true` once the surrounding
  `BaseModal` has finished showing. Use it to defer focus in your own inputs.
- **Storybook:** `QA/Device fixes 0.0.3` covers InputField (LTR/RTL, with
  icons), Chip and Badge in a centred row, OTPInput in a BottomSheet, Toast
  with a tab bar, and all five theme modes. The foundation story and the
  showcase theme toggle include `dim` and `sepia`.

### Changed

- `useSafeArea()` no longer throws outside a `SafeAreaProvider`. It falls back
  to the initial window metrics, or zero.
- The generated starter registers the `dim` and `sepia` themes.

### App follow-up (StreamSpy)

After upgrading, remove these workarounds:

- `src/components/badge/Badge.tsx` (View wrapper).
- `src/components/otp-input/OtpInput.tsx` (LTR wrapper, Android `autoFocus`
  workaround).
- The spacer in `src/components/bottom-sheet/BottomSheet.tsx`.

Then pass the tab bar height as `<ToastProvider bottomOffset={…}>`.

## 0.0.2

- Merge of the RNTheme boundary, Form + Yup, List and responsive work into
  `mainv2` (templates, InputField, i18n-js localization).
