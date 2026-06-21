import React from 'react';
import { fireEvent, screen } from '@testing-library/react-native';
import { Button } from '../src';
import { renderWithTheme } from './test-utils';

describe('Button', () => {
  it('announces its role and triggers interaction', () => {
    const onPress = jest.fn();
    renderWithTheme(<Button onPress={onPress}>Continue</Button>);

    const button = screen.getByRole('button', { name: 'Continue' });
    fireEvent.press(button);

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(button).toHaveAccessibilityState({ disabled: false, busy: false });
  });

  it('prevents interaction while loading', () => {
    const onPress = jest.fn();
    renderWithTheme(<Button loading onPress={onPress}>Continue</Button>);

    const button = screen.getByRole('button');
    fireEvent.press(button);

    expect(onPress).not.toHaveBeenCalled();
    expect(button).toHaveAccessibilityState({ disabled: true, busy: true });
  });

  it('renders in all theme modes', () => {
    for (const mode of ['light', 'dark', 'black'] as const) {
      const view = renderWithTheme(<Button>Save</Button>, { initialPreference: mode });
      expect(view.getByText('Save')).toBeTruthy();
      view.unmount();
    }
  });
});
