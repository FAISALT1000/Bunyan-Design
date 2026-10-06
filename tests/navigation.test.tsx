import React from 'react';
import { act, renderHook } from '@testing-library/react-native';
import {
  NavigationProvider,
  NavigationScope,
  createReactNativeNavigationAdapter,
  useNavigation,
  type WixComponentLayout,
  type WixNavigationCommands,
} from '../src';

type AppScreenParams = {
  Login: undefined;
  Home: undefined;
  AccountDetails: { accountId: string };
  Transfer: { beneficiaryId?: string };
  TransferResult: {
    referenceNumber: string;
    status: 'success' | 'pending' | 'failed';
  };
};

type ComponentId =
  | 'auth-stack'
  | 'main-stack'
  | 'login-component'
  | 'account-component'
  | 'transfer-modal'
  | 'toast-overlay';

type Options = {
  topBar?: { title?: { text: string } };
};

type Layout = WixComponentLayout<Options> | {
  stack: {
    id: ComponentId;
    children: readonly WixComponentLayout<Options>[];
  };
};

function createCommands() {
  return {
    push: jest.fn(async () => 'pushed'),
    pop: jest.fn(async () => 'popped'),
    popTo: jest.fn(async () => 'popped-to'),
    popToRoot: jest.fn(async () => 'root'),
    setRoot: jest.fn(async () => 'app-root'),
    showModal: jest.fn(async () => 'modal'),
    dismissModal: jest.fn(async () => 'dismissed-modal'),
    dismissAllModals: jest.fn(async () => undefined),
    showOverlay: jest.fn(async () => 'overlay'),
    dismissOverlay: jest.fn(async () => 'dismissed-overlay'),
    mergeOptions: jest.fn(),
    setStackRoot: jest.fn(async () => 'stack-root'),
  } satisfies WixNavigationCommands<Layout, Options>;
}

describe('React Native Navigation adapter', () => {
  it('maps typed screens and params to Wix component layouts', async () => {
    const commands = createCommands();
    const adapter = createReactNativeNavigationAdapter<
      AppScreenParams,
      Layout,
      Options,
      ComponentId
    >({ navigation: commands });

    await adapter.push('main-stack', {
      name: 'AccountDetails',
      id: 'account-component',
      passProps: { accountId: 'ACC-2481' },
      options: { topBar: { title: { text: 'Account' } } },
    });
    await adapter.showModal({
      name: 'Transfer',
      id: 'transfer-modal',
      passProps: { beneficiaryId: 'BEN-9' },
    });
    await adapter.showOverlay({
      name: 'Home',
      id: 'toast-overlay',
    });

    expect(commands.push).toHaveBeenCalledWith('main-stack', {
      component: {
        name: 'AccountDetails',
        id: 'account-component',
        passProps: { accountId: 'ACC-2481' },
        options: { topBar: { title: { text: 'Account' } } },
      },
    });
    expect(commands.showModal).toHaveBeenCalledWith({
      component: {
        name: 'Transfer',
        id: 'transfer-modal',
        passProps: { beneficiaryId: 'BEN-9' },
      },
    });
    expect(commands.showOverlay).toHaveBeenCalledWith({
      component: { name: 'Home', id: 'toast-overlay' },
    });
  });

  it('passes application-owned roots and stack roots through unchanged', async () => {
    const commands = createCommands();
    const adapter = createReactNativeNavigationAdapter<
      AppScreenParams,
      Layout,
      Options,
      ComponentId
    >({ navigation: commands });
    const root: Layout = {
      stack: {
        id: 'main-stack',
        children: [{ component: { name: 'Home' } }],
      },
    };

    await adapter.setAppRoot(root);
    await adapter.setStackRoot('main-stack', [
      { name: 'Home' },
      { name: 'AccountDetails', passProps: { accountId: 'ACC-1' } },
    ]);

    expect(commands.setRoot).toHaveBeenCalledWith({ root });
    expect(commands.setStackRoot).toHaveBeenCalledWith('main-stack', [
      { component: { name: 'Home' } },
      {
        component: {
          name: 'AccountDetails',
          passProps: { accountId: 'ACC-1' },
        },
      },
    ]);
  });

  it('forwards stack, modal, overlay, and option commands', async () => {
    const commands = createCommands();
    const adapter = createReactNativeNavigationAdapter<
      AppScreenParams,
      Layout,
      Options,
      ComponentId
    >({ navigation: commands });
    const options: Options = { topBar: { title: { text: 'Updated' } } };

    await adapter.pop('account-component', options);
    await adapter.popTo('login-component', options);
    await adapter.popToRoot('main-stack', options);
    await adapter.dismissModal('transfer-modal', options);
    await adapter.dismissAllModals(options);
    await adapter.dismissOverlay('toast-overlay');
    adapter.mergeOptions('account-component', options);

    expect(commands.pop).toHaveBeenCalledWith('account-component', options);
    expect(commands.popTo).toHaveBeenCalledWith('login-component', options);
    expect(commands.popToRoot).toHaveBeenCalledWith('main-stack', options);
    expect(commands.dismissModal).toHaveBeenCalledWith('transfer-modal', options);
    expect(commands.dismissAllModals).toHaveBeenCalledWith(options);
    expect(commands.dismissOverlay).toHaveBeenCalledWith('toast-overlay');
    expect(commands.mergeOptions).toHaveBeenCalledWith('account-component', options);
  });
});

describe('useNavigation', () => {
  it('uses the scoped component ID and forwards typed commands', async () => {
    const commands = createCommands();
    const adapter = createReactNativeNavigationAdapter<
      AppScreenParams,
      Layout,
      Options,
      ComponentId
    >({ navigation: commands });
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <NavigationProvider adapter={adapter}>
        <NavigationScope componentId="main-stack">{children}</NavigationScope>
      </NavigationProvider>
    );
    const { result } = renderHook(
      () => useNavigation<AppScreenParams, Layout, Options, ComponentId>(),
      { wrapper },
    );

    await act(async () => {
      await result.current.push('AccountDetails', { accountId: 'ACC-77' });
      await result.current.pop();
      result.current.mergeOptions({ topBar: { title: { text: 'Updated' } } });
    });

    expect(commands.push).toHaveBeenCalledWith('main-stack', {
      component: {
        name: 'AccountDetails',
        passProps: { accountId: 'ACC-77' },
      },
    });
    expect(commands.pop).toHaveBeenCalledWith('main-stack', undefined);
    expect(commands.mergeOptions).toHaveBeenCalledWith(
      'main-stack',
      { topBar: { title: { text: 'Updated' } } },
    );
  });

  it('requires a component ID only for component-bound commands', async () => {
    const commands = createCommands();
    const adapter = createReactNativeNavigationAdapter<
      AppScreenParams,
      Layout,
      Options,
      ComponentId
    >({ navigation: commands });
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <NavigationProvider adapter={adapter}>{children}</NavigationProvider>
    );
    const { result } = renderHook(
      () => useNavigation<AppScreenParams, Layout, Options, ComponentId>(),
      { wrapper },
    );

    await act(async () => {
      await result.current.showModal('Login');
    });
    expect(commands.showModal).toHaveBeenCalledWith({
      component: { name: 'Login' },
    });
    expect(() => result.current.pop()).toThrow('pop requires a componentId');
  });
});
