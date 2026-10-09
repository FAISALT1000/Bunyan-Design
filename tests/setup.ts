jest.mock('@react-native-community/datetimepicker', () => {
  const React = require('react');
  const { View } = require('../src/design-system/components/RNTheme/native');
  return function DateTimePickerMock(props: Record<string, unknown>) {
    return React.createElement(View, { ...props, testID: 'native-date-picker' });
  };
});

jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const { View } = require('react-native');
  const zero = { top: 0, right: 0, bottom: 0, left: 0 };
  const SafeAreaInsetsContext = React.createContext(null);

  return {
    SafeAreaInsetsContext,
    // Tests can pass `initialMetrics={{ insets }}` to simulate a device.
    SafeAreaProvider: ({ children, initialMetrics }: { children?: React.ReactNode; initialMetrics?: { insets: typeof zero } }) =>
      React.createElement(
        SafeAreaInsetsContext.Provider,
        { value: initialMetrics?.insets ?? zero },
        React.createElement(View, null, children),
      ),
    SafeAreaView: ({ children, ...props }: { children?: React.ReactNode }) =>
      React.createElement(View, props, children),
    useSafeAreaInsets: () => React.useContext(SafeAreaInsetsContext) ?? zero,
    initialWindowMetrics: {
      frame: { x: 0, y: 0, width: 0, height: 0 },
      insets: { top: 0, right: 0, bottom: 0, left: 0 },
    },
  };
});

jest.mock('react-native/Libraries/Modal/Modal', () => {
  const React = require('react');
  const View = require('react-native/Libraries/Components/View/View').default;

  function ModalMock({
    children,
    visible = true,
    ...props
  }: {
    children?: React.ReactNode;
    visible?: boolean;
    [key: string]: unknown;
  }) {
    return visible ? React.createElement(View, props, children) : null;
  }

  return {
    __esModule: true,
    default: ModalMock,
  };
});
