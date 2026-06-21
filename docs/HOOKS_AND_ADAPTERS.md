# Hooks and application adapters

The hooks layer separates reusable UI behavior from application infrastructure.
Hooks that depend only on React or React Native use platform APIs directly.
Hooks that depend on project-selected libraries use adapters supplied by the
consuming application.

## Architecture

```text
Application screen
  -> Bunyan hook API
    -> framework-neutral contract
      -> application-supplied adapter
        -> Wix Navigation / NetInfo / Clipboard / Haptics / Permissions
```

This boundary means Bunyan contains no screen names, stack IDs, tab IDs, root
layouts, navigation registration, API calls, Redux state, or application
configuration.

## Typed navigation

### 1. Define application-owned types

```ts
import type { Layout, Options } from 'react-native-navigation';

export type AppScreenParams = {
  Login: undefined;
  Home: undefined;
  AccountDetails: {
    accountId: string;
  };
  Transfer: {
    beneficiaryId?: string;
  };
  TransferResult: {
    referenceNumber: string;
    status: 'success' | 'pending' | 'failed';
  };
};

export type AppComponentId =
  | 'auth-stack'
  | 'main-stack'
  | 'main-tabs'
  | 'transfer-modal'
  | 'notification-overlay';

export type AppNavigationLayout = Layout<Record<string, unknown>>;
export type AppNavigationOptions = Options;
```

Use `string` for `AppComponentId` if Wix generates component IDs dynamically.
Use a literal union when the application assigns stable IDs.

### 2. Create the Wix adapter

The adapter accepts the Wix `Navigation` command object structurally. Bunyan
does not import `react-native-navigation`, so projects remain responsible for
choosing and upgrading their navigation version.

```ts
import { Navigation } from 'react-native-navigation';
import {
  createNavigation,
  createReactNativeNavigationAdapter,
} from '@bunyan/design-system';
import type {
  AppComponentId,
  AppNavigationLayout,
  AppNavigationOptions,
  AppScreenParams,
} from './navigation.types';

export const navigationAdapter =
  createReactNativeNavigationAdapter<
    AppScreenParams,
    AppNavigationLayout,
    AppNavigationOptions,
    AppComponentId
  >({
    navigation: Navigation,
  });

export const appNavigation = createNavigation<
  AppScreenParams,
  AppNavigationLayout,
  AppNavigationOptions,
  AppComponentId
>();

export const {
  NavigationProvider,
  NavigationScope,
  NavigationScreenProvider,
  useNavigation,
} = appNavigation;
```

If an application needs to wrap every component layout, attach generated IDs,
or normalize options, provide `createComponentLayout`:

```ts
export const navigationAdapter =
  createReactNativeNavigationAdapter<
    AppScreenParams,
    AppNavigationLayout,
    AppNavigationOptions,
    AppComponentId
  >({
    navigation: Navigation,
    createComponentLayout: target => ({
      component: {
        name: target.name,
        id: target.id,
        passProps: target.passProps,
        options: target.options,
      },
    }),
  });
```

### 3. Wrap every registered Wix screen

React Native Navigation renders registered screens as separate React roots. A
single provider around an application bootstrap function does not automatically
wrap every screen. Use `NavigationScreenProvider` in the registration wrapper:

```tsx
import { Navigation } from 'react-native-navigation';
import { HomeScreen } from './HomeScreen';
import {
  NavigationScreenProvider,
  navigationAdapter,
} from './navigation';

Navigation.registerComponent('Home', () => {
  return function RegisteredHome(props: { componentId: AppComponentId }) {
    return (
      <NavigationScreenProvider
        adapter={navigationAdapter}
        componentId={props.componentId}
      >
        <HomeScreen />
      </NavigationScreenProvider>
    );
  };
});
```

Alternatively, use `NavigationProvider` and `NavigationScope` separately when
other providers must sit between them.

### 4. Use typed navigation in screens

```tsx
import { Button } from '@bunyan/design-system';
import { useNavigation } from './navigation';

export function AccountScreen() {
  const navigation = useNavigation();

  return (
    <Button
      onPress={() =>
        navigation.push(
          'AccountDetails',
          { accountId: 'ACC-2481' },
          {
            options: {
              topBar: { title: { text: 'Account details' } },
            },
          },
        )
      }
    >
      View account
    </Button>
  );
}
```

TypeScript requires params for screens that declare them and prevents params
for screens whose value is `undefined`.

### Navigation commands

```ts
navigation.push('AccountDetails', { accountId: 'ACC-2481' });
navigation.pop();
navigation.popTo('main-stack');
navigation.popToRoot();

navigation.showModal(
  'Transfer',
  { beneficiaryId: 'BEN-9' },
  { id: 'transfer-modal' },
);
navigation.dismissModal('transfer-modal');
navigation.dismissAllModals();

navigation.showOverlay(
  'Home',
  undefined,
  { id: 'notification-overlay' },
);
navigation.dismissOverlay('notification-overlay');

navigation.mergeOptions({
  topBar: { title: { text: 'Updated title' } },
});

navigation.setStackRoot([
  { name: 'Home' },
  {
    name: 'AccountDetails',
    passProps: { accountId: 'ACC-2481' },
  },
]);
```

Root layouts remain fully application-owned:

```ts
const authenticatedRoot: AppNavigationLayout = {
  bottomTabs: {
    id: 'main-tabs',
    children: [
      {
        stack: {
          id: 'main-stack',
          children: [{ component: { name: 'Home' } }],
        },
      },
    ],
  },
};

await navigation.setAppRoot(authenticatedRoot);
```

`push`, `pop`, `popToRoot`, `mergeOptions`, and `setStackRoot` require a current
component ID. The scoped provider supplies it. `showModal`, `showOverlay`,
`dismissAllModals`, and `setAppRoot` do not require a current screen.

## Application adapters

Install and configure infrastructure libraries in each consuming project, then
adapt them to Bunyan’s small interfaces.

```tsx
import NetInfo from '@react-native-community/netinfo';
import Clipboard from '@react-native-clipboard/clipboard';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import {
  ApplicationAdapterProvider,
  createApplicationAdapters,
  type ApplicationAdapters,
} from '@bunyan/design-system';
import {
  check,
  openSettings,
  request,
  type Permission,
} from 'react-native-permissions';

const adapters = createApplicationAdapters<Permission>({
  network: {
    getCurrentState: async () => {
      const state = await NetInfo.fetch();
      return {
        isConnected: state.isConnected,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
      };
    },
    subscribe: listener =>
      NetInfo.addEventListener(state =>
        listener({
          isConnected: state.isConnected,
          isInternetReachable: state.isInternetReachable,
          type: state.type,
        }),
      ),
  },
  clipboard: {
    getString: () => Clipboard.getString(),
    setString: async value => Clipboard.setString(value),
  },
  haptics: {
    impact: style =>
      ReactNativeHapticFeedback.trigger(
        style === 'light' ? 'impactLight' : 'impactMedium',
      ),
    notification: type =>
      ReactNativeHapticFeedback.trigger(
        type === 'success'
          ? 'notificationSuccess'
          : type === 'warning'
            ? 'notificationWarning'
            : 'notificationError',
      ),
    selection: () => ReactNativeHapticFeedback.trigger('selection'),
  },
  permissions: {
    check,
    request,
    openSettings: async () => openSettings(),
  },
});

export function ApplicationProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ApplicationAdapterProvider adapters={adapters}>
      {children}
    </ApplicationAdapterProvider>
  );
}
```

Adapters should be stable objects created outside render or memoized. Changing
an adapter object intentionally causes dependent hooks to resubscribe.

## Hook reference

### `useAppState`

Returns `appState`, `isActive`, `isBackground`, and `isInactive`. It subscribes
to React Native `AppState` and removes the listener on unmount.

### `useKeyboard`

Returns `isVisible`, keyboard `height`, and `dismiss`. It selects will/did events
appropriately for iOS and Android.

### `useSafeArea`

Returns raw `insets`, physical `top`, `bottom`, `left`, `right`, and RTL-aware
`start` and `end` values. It requires the application’s `SafeAreaProvider`.

### `useDebounce`

```ts
const debouncedQuery = useDebounce(query, 300);
```

Updates after the configured delay and cancels stale timers.

### `usePrevious`

Returns the value from the previous committed render, or `undefined` initially.

### `useToggle`

Returns `value`, `toggle`, `setTrue`, `setFalse`, and `setValue`.

### `useDisclosure`

Returns `isOpen`, `open`, `close`, `toggle`, and `setOpen` for modal, accordion,
drawer, and tooltip visibility.

### `useAsyncAction`

```ts
const save = useAsyncAction(saveProfile, {
  onSuccess: profile => showSuccess(profile),
  onError: error => report(error),
});

await save.execute(values);
```

Returns `execute`, `reset`, `status`, `loading`, `data`, and `error`. Only the
latest invocation updates state, and unmounted consumers are not updated.
Errors are exposed in state instead of being thrown into event handlers.

### `useNetworkStatus`

Returns `isConnected`, `isInternetReachable`, `type`, `loading`, `isSupported`,
and the derived `isOffline` value. It uses the configured network adapter.

### `useAccessibility`

Returns live screen-reader, reduced-motion, and bold-text preferences using
React Native `AccessibilityInfo`.

### `useRTL`

Returns `direction`, `isRTL`, `locale`, logical `start`/`end`, and
`rowDirection` from `ThemeProvider`.

### `useClipboard`

Returns `copy`, `paste`, the last local `value`, and `isSupported`. Calling
clipboard operations without an adapter throws a clear configuration error.

### `useHaptics`

Returns `impact`, `notification`, `selection`, and `isSupported`. Missing
haptics are treated as a safe no-op, allowing web and unsupported devices to
share the same screen code.

### `usePermissions`

```ts
const camera = usePermissions<Permission>(PERMISSIONS.IOS.CAMERA);
```

Checks on mount and returns `status`, `loading`, `check`, `request`,
`openSettings`, `isGranted`, `isBlocked`, and `isSupported`. Permission policy
and platform permission constants remain application-owned.

## Testing

Provide in-memory adapters in unit tests. No native navigation, network, clipboard,
haptics, or permissions modules are required:

```tsx
const adapters: ApplicationAdapters<'camera'> = {
  permissions: {
    check: async () => 'denied',
    request: async () => 'granted',
  },
};

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ApplicationAdapterProvider adapters={adapters}>
    {children}
  </ApplicationAdapterProvider>
);
```

For navigation tests, pass a mocked command object to
`createReactNativeNavigationAdapter` and assert the generated component layouts.
