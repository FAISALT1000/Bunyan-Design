import React from 'react';
import {
  act,
  renderHook,
  waitFor,
} from '@testing-library/react-native';
import {
  ApplicationAdapterProvider,
  ThemeProvider,
  useAsyncAction,
  useClipboard,
  useDebounce,
  useDisclosure,
  useHaptics,
  useNetworkStatus,
  usePermissions,
  usePrevious,
  useRTL,
  useTheme,
  useToggle,
  type ApplicationAdapters,
  type NetworkState,
} from '../src';

describe('portable hooks', () => {
  it('debounces values and tracks the previous value', () => {
    jest.useFakeTimers();
    const { result } = renderHook(() => {
      const [value, setValue] = React.useState('first');
      return {
        debounced: useDebounce(value, 200),
        previous: usePrevious(value),
        setValue,
      };
    });

    act(() => result.current.setValue('second'));
    expect(result.current.debounced).toBe('first');
    expect(result.current.previous).toBe('first');
    act(() => jest.advanceTimersByTime(200));
    expect(result.current.debounced).toBe('second');
    jest.useRealTimers();
  });

  it('provides stable toggle and disclosure controls', () => {
    const { result } = renderHook(() => ({
      toggle: useToggle(),
      disclosure: useDisclosure(),
    }));

    act(() => {
      result.current.toggle.toggle();
      result.current.disclosure.open();
    });
    expect(result.current.toggle.value).toBe(true);
    expect(result.current.disclosure.isOpen).toBe(true);

    act(() => {
      result.current.toggle.setFalse();
      result.current.disclosure.close();
    });
    expect(result.current.toggle.value).toBe(false);
    expect(result.current.disclosure.isOpen).toBe(false);
  });

  it('tracks async success, error, and reset without throwing into the screen', async () => {
    const success = jest.fn(async (value: number) => value * 2);
    const failure = jest.fn(async () => {
      throw new Error('Failed');
    });
    const successHook = renderHook(() => useAsyncAction(success));
    const failureHook = renderHook(() => useAsyncAction(failure));

    await act(async () => {
      await successHook.result.current.execute(4);
      await failureHook.result.current.execute();
    });
    expect(successHook.result.current.data).toBe(8);
    expect(successHook.result.current.status).toBe('success');
    expect(failureHook.result.current.status).toBe('error');

    act(() => failureHook.result.current.reset());
    expect(failureHook.result.current.status).toBe('idle');
    expect(failureHook.result.current.error).toBeUndefined();
  });

  it('derives logical RTL values from the theme provider', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider locale="ar-SA">{children}</ThemeProvider>
    );
    const { result } = renderHook(() => useRTL(), { wrapper });

    expect(result.current).toEqual(expect.objectContaining({
      direction: 'rtl',
      isRTL: true,
      start: 'right',
      end: 'left',
      rowDirection: 'row-reverse',
    }));
  });

  it('keeps controlled theme preference owned by the application', () => {
    const onPreferenceChange = jest.fn();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider
        preference="dark"
        onPreferenceChange={onPreferenceChange}
      >
        {children}
      </ThemeProvider>
    );
    const { result } = renderHook(() => useTheme(), { wrapper });

    act(() => result.current.setPreference('light'));

    expect(onPreferenceChange).toHaveBeenCalledWith('light');
    expect(result.current.preference).toBe('dark');
    expect(result.current.mode).toBe('dark');
  });
});

describe('application adapter hooks', () => {
  type Permission = 'camera' | 'notifications';

  function createAdapters() {
    let networkListener: ((state: NetworkState) => void) | undefined;
    const adapters: ApplicationAdapters<Permission> = {
      network: {
        getCurrentState: jest.fn(async () => ({
          isConnected: true,
          isInternetReachable: true,
          type: 'wifi',
        })),
        subscribe: jest.fn(listener => {
          networkListener = listener;
          return jest.fn();
        }),
      },
      clipboard: {
        getString: jest.fn(async () => 'copied value'),
        setString: jest.fn(async () => undefined),
      },
      haptics: {
        impact: jest.fn(),
        notification: jest.fn(),
        selection: jest.fn(),
      },
      permissions: {
        check: jest.fn(async () => 'denied'),
        request: jest.fn(async () => 'granted'),
        openSettings: jest.fn(async () => undefined),
      },
    };

    return {
      adapters,
      emitNetwork: (state: NetworkState) => networkListener?.(state),
    };
  }

  it('subscribes to network state and derives offline status', async () => {
    const services = createAdapters();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ApplicationAdapterProvider adapters={services.adapters}>
        {children}
      </ApplicationAdapterProvider>
    );
    const { result } = renderHook(() => useNetworkStatus(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.type).toBe('wifi');

    act(() => services.emitNetwork({
      isConnected: false,
      isInternetReachable: false,
      type: 'none',
    }));
    expect(result.current.isOffline).toBe(true);
  });

  it('delegates clipboard, haptics, and permission operations', async () => {
    const services = createAdapters();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ApplicationAdapterProvider adapters={services.adapters}>
        {children}
      </ApplicationAdapterProvider>
    );
    const clipboardHook = renderHook(() => useClipboard(), { wrapper });
    const hapticsHook = renderHook(() => useHaptics(), { wrapper });
    const permissionHook = renderHook(() => usePermissions<Permission>('camera'), { wrapper });

    await waitFor(() => expect(permissionHook.result.current.status).toBe('denied'));
    await act(async () => {
      await clipboardHook.result.current.copy('account number');
      await clipboardHook.result.current.paste();
      await hapticsHook.result.current.notification('success');
      await permissionHook.result.current.request();
    });

    expect(services.adapters.clipboard?.setString).toHaveBeenCalledWith('account number');
    expect(clipboardHook.result.current.value).toBe('copied value');
    expect(services.adapters.haptics?.notification).toHaveBeenCalledWith('success');
    expect(permissionHook.result.current.status).toBe('granted');
  });
});
