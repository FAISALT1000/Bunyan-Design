# InputField and link-button migration

## Cross-platform decision report

### Component: InputField

Purpose: provide one controlled field API for text, email, password, phone,
number, decimal, search, URL, OTP, and PIN entry.

Shared requirements:

- Persistent visual and accessibility labels
- Controlled value and callback
- Outlined, filled, and underlined variants
- Error, success, disabled, focused, and filled states
- Type-driven keyboard, AutoFill, capitalization, correction, and masking
- English, Arabic, LTR, RTL, Dynamic Type, and reduced motion

Apple considerations:

- Labels remain clear after text entry and do not rely on placeholders.
- Email, telephone, password, URL, and one-time-code fields provide appropriate
  content types for AutoFill.
- Focus motion is restrained and respects Reduce Motion.
- The field keeps VoiceOver labels separate from its decorative floating label.

Material 3 considerations:

- The field uses floating-label and supporting-text anatomy.
- Outlined, filled, and underlined presentations share semantic states.
- Focus, error, and success indicators use semantic theme colors.
- The field does not copy Material token names into Bunyan's public API.

Cross-platform decision:

- Shared implementation: label behavior, validation states, type configuration,
  supporting text, localization, and accessibility.
- Platform token differences: motion duration, focus behavior, and touch
  targets inherited from the cross-platform foundation.
- Platform-specific implementation: none required. Native `TextInput` handles
  keyboard and AutoFill differences behind `BaseTextInput`.
- Application-controlled behavior: validation rules, persistence, submission,
  formatting, and business-specific masking.

Accessibility:

- `label` is required even when a placeholder exists.
- Error text uses an alert role and assertive live region.
- Required and disabled states are exposed independently of visual styling.
- Text scaling is enabled without a design-system multiplier ceiling.
- Password visibility and search clearing remain independent accessible actions.

RTL:

- Label and content use logical alignment.
- Decorative leading/trailing icons follow logical order.
- Email, phone, URL, number, OTP, and PIN values remain LTR while Arabic labels
  remain RTL.

### Component: Button link variant

Purpose: replace the separate semantic `Link` leaf with a single action API.

Shared requirements:

- Explicit title, icons, loading, disabled, focus, localization, and minimum
  target behavior
- Underline by default so interactivity is not conveyed by color alone
- `button` role for actions and `link` role for navigation/external content

Cross-platform decision:

- One `Button` implementation and API
- Transparent visual container
- Existing platform press feedback and touch-target tokens
- URL opening remains application-controlled; the deprecated `Link` wrapper
  retains `href` support during migration

## InputField API

```tsx
<InputField
  type="email"
  variant="outlined"
  label="Email address"
  placeholder="name@example.com"
  value={email}
  onChangeText={setEmail}
  errorText={emailError}
/>
```

Specialized props are discriminated by `type`:

```tsx
<InputField
  type="password"
  label="Password"
  value={password}
  onChangeText={setPassword}
  showPasswordToggle
/>

<InputField
  type="search"
  label="Search accounts"
  value={query}
  onChangeText={setQuery}
  onSearch={submitSearch}
/>

<InputField
  type="otp"
  label="Verification code"
  value={code}
  onChangeText={setCode}
  length={6}
  onComplete={verifyCode}
/>
```

The default visual variant is `outlined`.

## Animation behavior

Empty and unfocused fields show the label in the input area. Focused and filled
fields keep it floated above the value. Label position, scale, border width,
border color, duration, and easing use component tokens.

When Reduce Motion is enabled, the same state transition uses the platform
token's zero-duration path. Focus and validation indicators remain visible.

## Migration

Password:

```tsx
// Before
<PasswordInput
  label="Password"
  value={password}
  onChangeText={setPassword}
/>

// After
<InputField
  type="password"
  label="Password"
  value={password}
  onChangeText={setPassword}
/>
```

Email:

```tsx
// Before
<Input
  label="Email"
  keyboardType="email-address"
  value={email}
  onChangeText={setEmail}
/>

// After
<InputField
  type="email"
  label="Email"
  value={email}
  onChangeText={setEmail}
/>
```

Search:

```tsx
// Before
<SearchInput
  value={query}
  onChangeText={setQuery}
/>

// After
<InputField
  type="search"
  label="Search"
  value={query}
  onChangeText={setQuery}
/>
```

Link:

```tsx
// Before
<Link label="View details" onPress={openDetails} />

// After
<Button
  title="View details"
  variant="link"
  onPress={openDetails}
/>
```

External navigation:

```tsx
<Button
  title="Open website"
  variant="link"
  actionType="externalLink"
  onPress={openWebsite}
/>
```

`Input`, `PasswordInput`, `SearchInput`, and `Link` remain deprecated
compatibility exports until `1.0.0`. New design-system code must use
`InputField` and `Button`.

## Testing notes

Behavioral tests cover:

- Type configuration and explicit overrides
- Floating-label focus and filled behavior
- Password visibility and search clearing
- OTP/PIN completion
- Error, success, required, and disabled accessibility states
- Arabic alignment and uncapped text scaling
- Reduced-motion duration
- Link action roles, disabled behavior, icons, underline, and target size

## References

- Apple Human Interface Guidelines — Text fields:
  https://developer.apple.com/design/human-interface-guidelines/text-fields
- Apple Human Interface Guidelines — Motion:
  https://developer.apple.com/design/human-interface-guidelines/motion
- Apple `UITextContentType`:
  https://developer.apple.com/documentation/uikit/uitextcontenttype
- Material Design 3 — Text fields:
  https://m3.material.io/components/text-fields/overview
- Android input method configuration:
  https://developer.android.com/develop/ui/views/touch-and-input/keyboard-input/style
