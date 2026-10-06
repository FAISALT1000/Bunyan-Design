import React from 'react';
import { fireEvent, screen } from '@testing-library/react-native';
import { InputField } from '../../components/InputField';
import { renderWithTheme } from '../../../../tests/test-utils';
import { AuthenticationTemplate } from './AuthenticationTemplate';

describe('AuthenticationTemplate', () => {
  it('renders secure form slot and actions', () => {
    const submit = jest.fn();
    renderWithTheme(
      <AuthenticationTemplate
        mode="login"
        title="Sign in"
        form={(
          <InputField
            label="Username"
            value=""
            onChangeText={() => undefined}
          />
        )}
        primaryAction={{ label: 'Sign in', onPress: submit }}
      />,
    );
    expect(screen.getByLabelText('Username')).toBeTruthy();
    fireEvent.press(screen.getByRole('button', { name: 'Sign in' }));
    expect(submit).toHaveBeenCalledTimes(1);
  });
});
