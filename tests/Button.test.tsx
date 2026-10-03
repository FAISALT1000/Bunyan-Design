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
    expect(button.props.accessibilityState).toEqual(
      expect.objectContaining({ disabled: false, busy: false }),
    );
  });

  it('prevents interaction while loading', () => {
    const onPress = jest.fn();
    renderWithTheme(<Button loading onPress={onPress}>Continue</Button>);

    const button = screen.getByRole('button');
    fireEvent.press(button);

    expect(onPress).not.toHaveBeenCalled();
    expect(button.props.accessibilityState).toEqual(
      expect.objectContaining({ disabled: true, busy: true }),
    );
  });

  it('renders in all theme modes', () => {
    for (const mode of ['light', 'dark', 'black'] as const) {
      const view = renderWithTheme(<Button>Save</Button>, { initialPreference: mode });
      expect(view.getByText('Save')).toBeTruthy();
      view.unmount();
    }
  });
});

describe('Button variant="link" and Link', () => {
  const { Linking } = require('../src/design-system/components/RNTheme/native');

  it('renders a link with the link role and opens href after onPress', async () => {
    const openURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
    const onPress = jest.fn();
    renderWithTheme(<Button variant="link" href="https://bunyan.sa" external onPress={onPress}>Help</Button>);
    const link = screen.getByRole('link', { name: 'Help ↗' });
    expect(link.props.accessibilityHint).toBe('Opens in another app');
    fireEvent.press(link, { defaultPrevented: false });
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(openURL).toHaveBeenCalledWith('https://bunyan.sa');
    openURL.mockRestore();
  });

  it('reports openURL failures instead of throwing', async () => {
    const error = new Error('unsupported');
    const openURL = jest.spyOn(Linking, 'openURL').mockRejectedValue(error);
    const onOpenError = jest.fn();
    renderWithTheme(<Button variant="link" href="bad://x" onOpenError={onOpenError}>Open</Button>);
    fireEvent.press(screen.getByRole('link'), { defaultPrevented: false });
    await Promise.resolve();
    await Promise.resolve();
    expect(onOpenError).toHaveBeenCalledWith(error);
    openURL.mockRestore();
  });

  it('keeps Link as an alias of the link variant', () => {
    const { Link } = require('../src');
    renderWithTheme(<Link onPress={jest.fn()}>Terms</Link>);
    expect(screen.getByRole('link', { name: 'Terms' })).toBeTruthy();
  });
});
