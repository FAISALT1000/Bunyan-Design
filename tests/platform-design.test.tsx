import React from 'react';
import Svg from 'react-native-svg';
import { fireEvent, screen } from '@testing-library/react-native';
import { ActivityIndicator } from '../src/design-system/components/RNTheme/native';
import { Button, InputField, TabBar, Text, createTheme, themes, getContrastRatio, validateTheme } from '../src';
import { renderWithTheme } from './test-utils';

it.each([
  ['ios', 17, 22], ['android', 14, 20], ['web', 16, 24],
] as const)('maps body typography for %s', (platform, fontSize, lineHeight) => {
  renderWithTheme(<Text value="Body" />, { platform });
  expect(screen.getByText('Body')).toHaveStyle({ fontSize, lineHeight });
});

it('preserves brand font sizing and supports explicit platform role overrides', () => {
  const theme = createTheme({ typography: { fontSize: { md: 32 } } });
  const view = renderWithTheme(<Text value="Body" />, { platform: 'ios', themes: { light: theme } });
  expect(screen.getByText('Body')).toHaveStyle({ fontSize: 34 });
  view.unmount();
  const custom = createTheme({ typography: { platformStyles: { ios: { bodyMedium: { fontSize: 19, lineHeight: 27 } } } } });
  renderWithTheme(<Text value="Body" />, { platform: 'ios', themes: { light: custom }, direction: 'rtl' });
  expect(screen.getByText('Body')).toHaveStyle({ fontSize: 19, lineHeight: 27, textAlign: 'right' });
});

it('uses legible platform form typography', () => {
  renderWithTheme(<InputField label="Name" value="Faisal" onChangeText={jest.fn()} />, { platform: 'ios' });
  expect(screen.getByDisplayValue('Faisal')).toHaveStyle({ fontSize: 17, lineHeight: 22 });
});

it.each(['primary', 'secondary'] as const)('uses the %s foreground for labels and icons, including press state', variant => {
  const theme = createTheme({ color: { [variant]: { contrast: '#123456' }, text: { inverse: '#ABCDEF' } } });
  renderWithTheme(<Button title="Continue" variant={variant} leftIcon="check" testID="action" />, { platform: 'ios', themes: { light: theme } });
  expect(screen.getByText('Continue')).toHaveStyle({ color: '#123456' });
  expect(screen.UNSAFE_getAllByType(Svg)[0]?.props.color).toBe('#123456');
  fireEvent(screen.getByTestId('action'), 'pressIn');
  expect(screen.getByText('Continue')).toHaveStyle({ color: '#123456' });
});

it.each(Object.keys(themes) as (keyof typeof themes)[])('keeps tonal secondary content legible in %s', mode => {
  const color = themes[mode].color.secondary;
  expect(getContrastRatio(color.onSubtle ?? themes[mode].color.text.primary, color.subtle)).toBeGreaterThanOrEqual(4.5);
  renderWithTheme(<Button title="Cancel" variant="secondary" testID="action" />, { platform: 'android', initialPreference: mode });
  expect(screen.getByTestId('action')).toHaveStyle({ backgroundColor: color.subtle });
  expect(screen.getByText('Cancel')).toHaveStyle({ color: color.onSubtle ?? themes[mode].color.text.primary, fontSize: 14 });
});

it('uses the disabled foreground for the loading indicator and icons', () => {
  renderWithTheme(<Button title="Continue" loading rightIcon="check" />);
  expect(screen.UNSAFE_getByType(ActivityIndicator).props.color).toBe(themes.light.color.disabled.text);
});

it('uses the tonal foreground on the Android selected navigation indicator', () => {
  renderWithTheme(<TabBar items={[{ key: 'home', icon: 'home', label: 'Home' }]} activeKey="home" onChange={jest.fn()} />, { platform: 'android' });
  expect(screen.UNSAFE_getAllByType(Svg)[0]?.props.color).toBe(themes.light.color.primary.onSubtle);
});

it.each(Object.keys(themes) as (keyof typeof themes)[])('keeps navigation labels legible in %s', mode => {
  const color = themes[mode].color;
  expect(getContrastRatio(color.text.link, color.surface.elevated)).toBeGreaterThanOrEqual(4.5);
  expect(getContrastRatio(color.text.secondary, color.surface.elevated)).toBeGreaterThanOrEqual(4.5);
});

it.each(Object.keys(themes) as (keyof typeof themes)[])('validates all built-in action foreground pairs in %s', mode => {
  expect(validateTheme(themes[mode]).issues.filter(issue => issue.severity === 'error')).toEqual([]);
});

it('reports unreadable custom tonal foregrounds', () => {
  const theme = createTheme({ color: { secondary: { onSubtle: '#FFFFFF', subtle: '#FFFFFF' } } });
  expect(validateTheme(theme).issues).toContainEqual(expect.objectContaining({
    severity: 'error', path: 'color.secondary.onSubtle / color.secondary.subtle',
  }));
});
