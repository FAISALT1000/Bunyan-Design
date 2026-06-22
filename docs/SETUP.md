# Consumer setup

This guide configures `@bunyan/design-system` in a React Native 0.77+ project.
The fastest path is the generator:

```bash
npm install @bunyan/design-system
npx @bunyan/design-system setup
```

For Wix React Native Navigation:

```bash
npx @bunyan/design-system setup --navigation=rnn
```

The direct script form is also available when a package manager does not run
scoped package binaries as expected:

```bash
node ./node_modules/@bunyan/design-system/scripts/setup.mjs
```

Add `--dry-run` to preview files or `--force` to overwrite confirmed existing
setup files.

## Installation

Registry:

```bash
npm install @bunyan/design-system
yarn add @bunyan/design-system
pnpm add @bunyan/design-system
```

Generated archive:

```bash
npm install ../design-system/package-output/bunyan-design-system-1.2.3.tgz
```

Local package path:

```bash
npm install ../design-system
```

Use the registry for normal development, a `.tgz` to test the exact published
shape, and a local path only for active package development. Linked paths often
need Metro singleton configuration to avoid duplicate React instances.

## Dependencies

The consuming React Native application already supplies `react` and
`react-native`. Install the remaining required peers:

```bash
npm install \
  @react-native-community/datetimepicker \
  react-native-safe-area-context \
  react-native-svg
```

`i18n-js` is a direct package dependency and does not need a separate install.

Optional integrations:

```bash
npm install react-native-navigation
```

Network, clipboard, haptic, and permission libraries are optional because the
design system receives them through `ApplicationAdapterProvider`. Common
choices include `@react-native-community/netinfo`,
`@react-native-clipboard/clipboard`, `react-native-haptic-feedback`, and
`react-native-permissions`; install only adapters the application uses.

Secure-screen, share, logger, and analytics adapters are also optional and do
not prescribe a native library.

Redux, MMKV, Reanimated, gesture handler, analytics, logging, and sharing are
not package requirements.

The generated test helper additionally expects the consumer's normal React
Native testing dependency:

```bash
npm install --save-dev @testing-library/react-native
```

## Native setup

### iOS

After installing native peers:

```bash
cd ios
pod install
cd ..
```

The package has no custom Podfile entries, Swift version, or font linking step.
Installed peer podspecs currently require at least iOS 12.4 for
safe-area-context and SVG. `react-native-svg` owns filter resource bundles that
CocoaPods integrates automatically; no manual resource copy step is required.
The application deployment target must satisfy the selected peer versions.

### Android

The design-system package adds no Maven repository, Gradle plugin, ProGuard
rule, Kotlin version, or manual package registration. Required peers use React
Native autolinking and inherit the application's SDK versions. Use the SDK,
Gradle, Kotlin, and New Architecture settings required by the application's
React Native version.

The currently installed peers read `compileSdkVersion`, `minSdkVersion`,
`targetSdkVersion`, and Kotlin configuration from the host project. Their
internal fallback values are not a recommendation for a modern React Native
application; the React Native template remains authoritative.

### Wix React Native Navigation

React Native Navigation is optional and has native application changes beyond
normal autolinking. Install a version compatible with the application's React
Native version, run:

```bash
npx rnn-link
cd ios && pod install && cd ..
```

Then review and commit the generated AppDelegate, MainActivity, and
MainApplication changes. RNN 8.5 documentation currently targets React Native
greater than 0.77 through 0.78 with the New Architecture; later React Native
versions must use the matching RNN compatibility guidance.

Official installation guide:
https://wix.github.io/react-native-navigation/docs/installing/

## Generated setup

The generator creates:

```text
src/
  design-system/
    DesignSystemSetup.tsx
    designSystemAdapters.ts
    designSystemLocalization.ts
    designSystemTheme.ts
    index.ts
  examples/
    DesignSystemExampleScreen.tsx
  localization/
    en.json
    ar.json
  test-utils/
    renderWithDesignSystem.tsx
scripts/
  validate-design-system-setup.mjs
```

The provider order is:

```text
SafeAreaProvider
  ApplicationAdapterProvider
    DesignSystemProvider
      Localization provider
        Theme provider
          Application
```

Safe-area hooks need the outer native provider. Application adapters are
available to all components. Localization controls locale and logical RTL;
ThemeProvider receives the same locale and resolves semantic tokens.

```tsx
export default function App() {
  return (
    <DesignSystemSetup locale="en" themePreference="system">
      <ApplicationRoot />
    </DesignSystemSetup>
  );
}
```

## Theme

`designSystemTheme.ts` exports the default light, dark, and black themes. The
application may supply a complete typed `Theme` replacement for any mode.

Theme preference can be uncontrolled through `useTheme().setPreference` or
controlled by passing `themePreference` and `onThemePreferenceChange` to
`DesignSystemSetup`. Redux or MMKV may own this value; the package does not
import either library.

## Localization and RTL

Translation JSON belongs in the consuming project. Pass a controlled locale:

```tsx
<DesignSystemSetup locale={currentLocale}>
  <ApplicationRoot />
</DesignSystemSetup>
```

```tsx
<Text localize="common.confirm" value="Confirm" />
<Button title="Confirm" titleLocalize="common.confirm" />
```

`value` is the visible fallback. The localization provider changes text and
logical alignment without reloading the application. The application decides
whether to call `I18nManager.allowRTL` or `forceRTL` for native root-direction
changes. `forceRTL` may require recreating or restarting native navigation
roots; never call it inside components.

Locale and theme persistence can live in Redux or MMKV:

```tsx
const locale = useAppSelector(state => state.settings.locale);
const colorMode = useAppSelector(state => state.settings.colorMode);

return (
  <DesignSystemSetup locale={locale} themePreference={colorMode}>
    {children}
  </DesignSystemSetup>
);
```

## Navigation

Applications own screen names, parameter maps, component IDs, roots, tabs,
modals, and overlays. The optional generator creates a broad compile-safe map;
replace it with the application contract:

```ts
export type AppScreenParams = {
  Login: undefined;
  Home: undefined;
  AccountDetails: { accountId: string };
};
```

The generated adapter passes Wix's `Navigation` commands into
`createReactNativeNavigationAdapter`, and exports typed bindings from
`createNavigation`.

```tsx
const navigation = useNavigation();
await navigation.push('AccountDetails', { accountId: '123' });
```

Wix screens are separate React roots. `registerAppScreen` therefore applies the
providers and component-ID scope to every registered screen. Theme and locale
must come from shared application state so roots do not diverge:

```tsx
registerAppScreen(Screens.AccountDetails, AccountDetailsScreen, () => ({
  locale: settingsStore.locale,
  themePreference: settingsStore.themePreference,
}));
```

The helper and screen constants stay in the application.

An optional fourth argument wraps each registered root with application-owned
providers such as Redux and an error boundary:

```tsx
registerAppScreen(
  Screens.AccountDetails,
  AccountDetailsScreen,
  getDesignSystemSetupProps,
  ApplicationProviders,
);
```

The design system remains independent of those providers. Keep locale and
theme preference in shared application state because Wix screens are separate
React roots.

## Adapters

`designSystemAdapters.ts` starts with an empty adapter map. Optional hooks report
unsupported adapters; clipboard operations throw a clear configuration error
when called without one. Configure only capabilities used by the app:

```ts
export const designSystemAdapters = createApplicationAdapters({
  haptics: hapticsAdapter,
  clipboard: clipboardAdapter,
  network: networkAdapter,
  permissions: permissionsAdapter,
  secureScreen: secureScreenAdapter,
  share: shareAdapter,
  logger: loggerAdapter,
  analytics: analyticsAdapter,
});
```

All implementations stay application-owned. The package defines only the
portable contracts and provider.

## Verification status

The package release pipeline verifies strict TypeScript, lint rules, behavior
tests, build output, public entry files, and archive contents. The generated
standard and Wix RNN starters are also type-checked in an isolated consumer
fixture installed from the generated `.tgz`.

This repository does not contain checked-in standalone `ios/` or `android/`
consumer hosts, so Xcode and Gradle application builds cannot be truthfully
certified here. Run the generated setup in the target application, install
pods, and include both native builds in that application's CI. Wix native
bootstrap compatibility must additionally match the selected React Native
Navigation release.

## Fonts and assets

The current tokens use the platform `System` font and `Courier` for monospace.
There are no package fonts, images, Lottie files, or resource bundles to link.
Icons are code-based SVG paths and require `react-native-svg`.

## Babel, Metro, and TypeScript

Normal registry and `.tgz` installs require no Babel or Metro changes. Keep the
React Native template configuration.

For a linked local package or monorepo, start with the default Metro config. If
duplicate React appears, add the package directory to `watchFolders` and force
`react` and `react-native` to resolve from the application:

```js
const path = require('node:path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const projectRoot = __dirname;
const designSystemRoot = path.resolve(projectRoot, '../design-system');

module.exports = mergeConfig(getDefaultConfig(projectRoot), {
  watchFolders: [designSystemRoot],
  resolver: {
    extraNodeModules: {
      react: path.resolve(projectRoot, 'node_modules/react'),
      'react-native': path.resolve(projectRoot, 'node_modules/react-native'),
    },
  },
});
```

Translation JSON imports require `resolveJsonModule`. Keep strict mode:

```json
{
  "compilerOptions": {
    "strict": true,
    "jsx": "react-jsx",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "esModuleInterop": true
  }
}
```

## Testing

The generated helper centralizes Safe Area, theme, localization, and adapters:

```tsx
const result = renderWithDesignSystem(
  <Button title="Confirm" />,
  { locale: 'ar', themePreference: 'dark' },
);
```

Install `@testing-library/react-native` as a development dependency. Components
using navigation should additionally use the application's typed
`NavigationScreenProvider` wrapper.

## Validation

```bash
npm run validate:design-system
```

For Wix integration, the generated command includes `--navigation=rnn`. The
validator checks package resolution, peer dependencies, public build entries,
provider/configuration files, translation JSON, optional navigation setup, and
detectable CocoaPods state. It reports actionable errors and never modifies the
project.

## Architecture boundary

The package owns tokens, themes, components, generic hooks, localization
engine, navigation abstraction, and accessibility behavior.

The application owns translation JSON, locale and theme state, persistence,
Redux, MMKV, screens, IDs, roots, API calls, business logic, and feature flags.
