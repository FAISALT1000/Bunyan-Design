import React from 'react';
import { fireEvent, screen } from '@testing-library/react-native';
import { Button } from '../src';
import { renderWithTheme } from './test-utils';

describe('Button', () => {
  it('announces its role and triggers interaction', () => {
    const onPress = jest.fn();
    renderWithTheme(<Button title="Continue" onPress={onPress} />);

    const button = screen.getByRole('button', { name: 'Continue' });
    fireEvent.press(button);

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(button.props.accessibilityState).toEqual(
      expect.objectContaining({ disabled: false, busy: false }),
    );
  });

  it('prevents interaction while loading', () => {
    const onPress = jest.fn();
    renderWithTheme(<Button title="Continue" loading onPress={onPress} />);

    const button = screen.getByRole('button');
    fireEvent.press(button);

    expect(onPress).not.toHaveBeenCalled();
    expect(button.props.accessibilityState).toEqual(
      expect.objectContaining({ disabled: true, busy: true }),
    );
  });

  it('renders in all theme modes', () => {
    for (const mode of ['light', 'dark', 'black'] as const) {
      const view = renderWithTheme(
        <Button title="Save" />,
        { initialPreference: mode },
      );
      expect(view.getByText('Save')).toBeTruthy();
      view.unmount();
    }
  });

  it('renders link actions with semantic roles and touch targets', () => {
    const view = renderWithTheme(
      <Button
        title="View details"
        variant="link"
        onPress={() => undefined}
        testID="link-action"
      />,
      { platform: 'ios' },
    );
    expect(screen.getByRole('button', { name: 'View details' })).toBeTruthy();
    expect(screen.getByText('View details')).toHaveStyle({
      textDecorationLine: 'underline',
    });
    expect(screen.getByTestId('link-action')).toHaveStyle({
      minWidth: 44,
      minHeight: 44,
    });
    view.unmount();

    renderWithTheme(
      <Button
        title="Open website"
        variant="link"
        actionType="externalLink"
        leftIcon="info"
        onPress={() => undefined}
      />,
    );
    expect(screen.getByRole('link', { name: 'Open website' })).toBeTruthy();
  });

  it('keeps disabled link actions inert', () => {
    const onPress = jest.fn();
    renderWithTheme(
      <Button
        title="Unavailable"
        variant="link"
        disabled
        onPress={onPress}
      />,
    );
    fireEvent.press(screen.getByRole('button', { name: 'Unavailable' }));
    expect(onPress).not.toHaveBeenCalled();
  });
});
