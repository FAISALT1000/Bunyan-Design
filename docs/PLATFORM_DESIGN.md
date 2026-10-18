# Platform design in React Native

Bunyan uses one component API across iOS, Android, and web. ThemeProvider detects
the runtime platform; its optional `platform` prop supports previews and tests.
Brand colors, semantic variants, localization, and RTL remain shared.

Platform component tokens currently adapt:

- Buttons: rounded corners on iOS/web; full corners and tonal secondary actions
  on Android. Android actions use the Material label-large type role.
- Tab bars: shared/iOS minimum height 56; Android minimum height 80, 24-unit
  icons, 12-unit labels, and a rounded selected indicator.
- Touch targets: minimum 44 on iOS and 48 on Android, including small buttons.

Tab bar height excludes the bottom safe area and can grow with text scaling.
For platform-aware bottom offsets, read
`platformTokens.components.tabBar.minimumHeight` from `useTheme()`.
`TAB_BAR_HEIGHT` remains the legacy shared/iOS baseline (56).

Bottom sheets respect the system Reduce Motion preference for presentation and
snap springs. Shared native text wrappers allow system font scaling without a
design-system multiplier cap.

These adaptations are a starting point, not a claim of complete Apple HIG or
Material 3 conformity. Validate screens on physical devices in English and Arabic,
in light and dark themes, with large text, VoiceOver/TalkBack, and Reduce Motion.
Broader Material color roles, responsive navigation rails, additional component
styles, and device visual verification remain future work.

## Typography and brand overrides

Text variants resolve to platform metrics. iOS body text is 17/22, while Android
body-medium is 14/20 and body-large (used for form values) is 16/24. Android
navigation uses label-medium (12/16). The web/default scale remains unchanged.
These are Bunyan role mappings, not a native UIFont text-style binding. Font
families, semantic weights, language direction, and system scaling remain shared.

Existing primitive font-size and line-height overrides scale the mapped metrics
proportionally. For example, doubling `fontSize.md` doubles body-medium's mapped
font size on each platform. Override a specific role with `createTheme` when you
need exact brand metrics:

```tsx
const brand = createTheme({
  typography: {
    platformStyles: {
      ios: { bodyMedium: { fontSize: 18, lineHeight: 25 } },
      android: { bodyMedium: { fontSize: 16, lineHeight: 24 } },
    },
  },
});
```

## Foregrounds and tonal surfaces

Filled primary/secondary actions use their own `contrast` foreground instead of
`text.inverse`. The optional `primary.onSubtle` and `secondary.onSubtle` tokens
pair foregrounds with subtle containers. Built-in themes define these roles;
legacy themes fall back to `text.primary`. Destructive actions accept an optional
`error.contrast` (fallback: `text.inverse`). Update paired colors together when
customizing a theme.

Labels and icons share the action foreground, including its pressed and disabled
states. Loading buttons retain the existing disabled appearance; their indicator
uses the matching disabled foreground. Navigation labels use `text.link` for
selection and `text.secondary` otherwise. Android's selected icon uses
`primary.onSubtle` on the active indicator. `validateTheme` checks these pairings,
including filled-action pressed colors, for 4.5:1 contrast when colors use
six-digit hex notation.

References: [Apple typography](https://developer.apple.com/design/human-interface-guidelines/typography),
[Material typography](https://m3.material.io/styles/typography/applying-type), and
[Material color roles](https://m3.material.io/styles/color/the-color-system).
