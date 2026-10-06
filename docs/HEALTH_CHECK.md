# Design-system health check

## Summary

The token, theme, semantic API, Line, Card, hook, navigation, and template
foundations are sound. This focused pass strengthened the older interaction
layer without changing existing consumer APIs.

## Fixed in this pass

- Added `ScrollContainer`, `BaseModal`, and `BaseSwitch` primitives.
- Moved IconButton, Accordion, Tabs, ListItem, Modal, BottomSheet, Alert,
  EmptyState, FormField, and Switch onto the base-component boundary.
- Enforced a minimum 44 by 44 touch target through `BasePressable`.
- Added focus and hover states to migrated interactive components.
- Prevented nested loading spinners from producing duplicate announcements.
- Added reusable accessibility-label and accessibility-state helpers.
- Added localized close-label props for Modal, BottomSheet, and Alert.
- Added runtime `validateTheme` and WCAG contrast validation.
- Added behavioral tests for touch targets, loading announcements, disclosure,
  tabs, localized modal controls, and theme validation.

## Migration notes

No existing props were removed.

Applications can localize overlay actions explicitly:

```tsx
<Modal
  visible={visible}
  title="تأكيد التحويل"
  closeAccessibilityLabel="إغلاق النافذة"
  onClose={close}
>
  {content}
</Modal>
```

Custom theme extensions should be validated during development:

```ts
const result = validateTheme(customTheme);

if (!result.valid) {
  console.warn(result.issues);
}
```

Existing deprecated string children for Button, Text, Heading, Link, Badge,
and Chip remain supported until `1.0.0`. Consumers should migrate to
`title`, `text`, and `label` before that release.

## Remaining risks

- Some legacy composites and templates still directly wrap specialized native
  primitives, including animated Toast and Skeleton implementations, Avatar
  image rendering, native list templates, DatePicker, and TextArea.
- Default accessibility strings are English unless consuming applications pass
  localized labels.
- Theme persistence remains application-owned because storage policy differs
  between consuming projects.
- Automated contrast validation currently supports opaque six-digit hex colors.
  Alpha compositing requires a known background and remains a later enhancement.

## Recommended next phase

Audit native list, animation, image, and text-input boundaries together. Add
base `List`, `AnimatedSurface`, and `Image` only where multiple components can
share a clear contract; avoid wrappers created for a single call site.
