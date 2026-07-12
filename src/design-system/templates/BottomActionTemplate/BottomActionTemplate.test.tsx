import React from 'react';
import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithTheme } from '../../../../tests/test-utils';
import { BottomActionTemplate } from './BottomActionTemplate';

describe('BottomActionTemplate', () => {
  it('forwards primary and secondary actions', () => {
    const primary = jest.fn();
    const secondary = jest.fn();
    renderWithTheme(
      <BottomActionTemplate
        primaryAction={{ label: 'Continue', onPress: primary }}
        secondaryAction={{ label: 'Back', onPress: secondary }}
      />,
    );
    fireEvent.press(screen.getByRole('button', { name: 'Continue' }));
    fireEvent.press(screen.getByRole('button', { name: 'Back' }));
    expect(primary).toHaveBeenCalledTimes(1);
    expect(secondary).toHaveBeenCalledTimes(1);
  });

  it('keeps a disabled primary action disabled', () => {
    renderWithTheme(
      <BottomActionTemplate
        primaryAction={{ label: 'Continue', onPress: jest.fn(), disabled: true }}
      />,
    );
    expect(screen.getByRole('button', { name: 'Continue' }).props.accessibilityState.disabled).toBe(true);
  });
});
