# Consumer troubleshooting

## Package cannot be resolved

Verify the installed version:

```bash
npm ls @bunyan/design-system
```

For a `.tgz`, reinstall the new filename after every package version change.

## Invalid hook call or duplicate React

This usually means a linked package resolved its own React installation. Prefer
a `.tgz` for package-shape testing. For active linking, use the Metro singleton
configuration in `SETUP.md` and verify:

```bash
npm ls react react-native
```

## Metro still shows an old package

First verify the installed version and import path. Then restart Metro:

```bash
npx react-native start --reset-cache
```

Avoid deleting all project caches as the first response.

## iOS pod not found

Install dependencies first, then:

```bash
cd ios
pod install
cd ..
```

Open the `.xcworkspace`, not the `.xcodeproj`.

## Android native module missing

Rebuild the native app after installing peers. Confirm the package appears in
React Native autolinking output and that the application's SDK versions satisfy
its React Native release.

## Fonts are not loading

Bunyan currently uses platform System fonts and ships no font assets. A missing
custom font comes from an application theme override and must be linked by that
application.

## Icons do not display

Confirm `react-native-svg` is installed, pods are updated on iOS, and the native
application was rebuilt.

## Translation key not found

Provide a fallback `value`, verify the key in the current locale JSON, run
`validate-translations.mjs`, and inspect `onMissingTranslation`. Translation
resources belong to the application, not the package.

## Arabic text or layout is not aligned

Pass the same controlled locale into `DesignSystemSetup`. Text and logical
layout update without a reload. If the application changes native root
direction with `I18nManager.forceRTL`, recreate Wix roots or restart according
to the application's lifecycle policy.

## Theme appears unchanged

Confirm components are inside `DesignSystemSetup` and that a controlled
`themePreference` is updated by the parent. A controlled prop intentionally
overrides `useTheme().setPreference` until the parent changes it.

## Navigation provider is missing

Wrap Wix screens with the generated `NavigationScreenProvider`. Global
commands such as modal display can run without a component ID; stack-bound
commands require the current screen's `componentId`.

## Wix screen cannot access component ID

The registered component props must include `componentId`, and the registration
helper must pass it to `NavigationScreenProvider`.

## Local package path does not update

Package managers may cache local paths. Generate a versioned `.tgz`, install the
new filename, verify with `npm ls`, then reset Metro only if the installed
version is correct but the bundle is stale.
