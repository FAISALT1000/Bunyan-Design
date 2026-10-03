jest.mock('@react-native-community/datetimepicker', () => {
  const React = require('react');
  const { View } = require('../src/design-system/components/RNTheme/native');
  return function DateTimePickerMock(props: Record<string, unknown>) {
    return React.createElement(View, { ...props, testID: 'native-date-picker' });
  };
});
