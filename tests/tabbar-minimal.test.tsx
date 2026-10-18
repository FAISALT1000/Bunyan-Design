import React from 'react';
import Svg, { Path, Polygon } from 'react-native-svg';
import { fireEvent, screen } from '@testing-library/react-native';
import { TabBar, themes } from '../src';
import { renderWithTheme } from './test-utils';

const items = [
  { key: 'home', icon: 'home' as const, label: 'Home', testID: 'home' },
  { key: 'alerts', icon: 'bell' as const, label: 'Notifications', badge: 1, testID: 'alerts' },
];

it('hides labels visually while preserving tab names, counts, and interaction', () => {
  const onChange = jest.fn();
  const onLongPress = jest.fn();
  renderWithTheme(<TabBar variant="minimal" items={items} activeKey="home" onChange={onChange} onLongPress={onLongPress} />, { platform: 'android' });
  expect(screen.queryByText('Home')).toBeNull();
  expect(screen.getByRole('tab', { name: 'Home' }).props.accessibilityState.selected).toBe(true);
  fireEvent.press(screen.getByRole('tab', { name: 'Notifications, 1' }));
  fireEvent(screen.getByTestId('alerts'), 'longPress');
  expect(onChange).toHaveBeenCalledWith('alerts');
  expect(onLongPress).toHaveBeenCalledWith('alerts');
  expect(screen.getByTestId('home')).toHaveStyle({ minWidth: 48, minHeight: 48 });
});

it.each(['light', 'dark', 'black'] as const)('uses the %s theme and a filled home without an Android selection pill', mode => {
  renderWithTheme(<TabBar variant="minimal" items={items} activeKey="home" onChange={jest.fn()} testID="bar" />, { platform: 'android', initialPreference: mode });
  expect(screen.getByTestId('bar')).toHaveStyle({ backgroundColor: themes[mode].color.background.primary });
  expect(screen.UNSAFE_getAllByType(Svg)[0]?.findAllByType(Path)[0]?.props.fill).toBe('currentColor');
  expect(screen.UNSAFE_getAllByType(Svg)[0]?.props).toMatchObject({ width: 28, color: themes[mode].color.text.primary });
});

it('allows labels and custom active glyphs without changing RTL tab callbacks', () => {
  const onChange = jest.fn();
  renderWithTheme(<TabBar variant="minimal" showLabels items={[{ ...items[0]!, activeIcon: 'star' }, items[1]!]} activeKey="home" onChange={onChange} />, { direction: 'rtl' });
  expect(screen.getByText('Home')).toBeTruthy();
  expect(screen.UNSAFE_getAllByType(Svg)[0]?.findAllByType(Polygon)).toHaveLength(1);
  fireEvent.press(screen.getByTestId('alerts'));
  expect(onChange).toHaveBeenCalledWith('alerts');
});
