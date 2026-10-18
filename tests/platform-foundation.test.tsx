import React from 'react';
import { screen } from '@testing-library/react-native';
import {
  Button,
  Card,
  Text,
  TabBar,
  androidPlatformTokens,
  iosPlatformTokens,
  resolvePlatformToken,
  resolvePlatformTokens,
} from '../src';
import { renderWithTheme } from './test-utils';

describe('cross-platform foundation', () => {
  it('resolves explicit platform values without leaking Platform.OS to components', () => {
    const value = {
      default: 'shared',
      ios: 'cupertino',
      android: 'material',
    } as const;

    expect(resolvePlatformToken(value, 'ios')).toBe('cupertino');
    expect(resolvePlatformToken(value, 'android')).toBe('material');
    expect(resolvePlatformToken(value, 'web')).toBe('shared');
    expect(resolvePlatformTokens('android')).toBe(androidPlatformTokens);
  });

  it('uses an iOS-appropriate minimum interactive target', () => {
    renderWithTheme(
      <Button title="Continue" size="small" testID="action" />,
      { platform: 'ios' },
    );

    expect(screen.getByTestId('action')).toHaveStyle({
      minWidth: iosPlatformTokens.touchTarget.minimum,
      minHeight: iosPlatformTokens.touchTarget.minimum,
    });
  });

  it('uses an Android-appropriate minimum interactive target and state layer', () => {
    renderWithTheme(
      <Button title="Continue" size="small" testID="action" />,
      { platform: 'android' },
    );

    const action = screen.getByTestId('action');
    expect(action).toHaveStyle({
      minWidth: androidPlatformTokens.touchTarget.minimum,
      minHeight: androidPlatformTokens.touchTarget.minimum,
    });
    expect(androidPlatformTokens.interaction.pressFeedback).toBe('stateLayer');
  });

  it('resolves elevated cards to platform-native elevation primitives', () => {
    const androidRender = renderWithTheme(
      <Card variant="elevated" title="Account" testID="card" />,
      { platform: 'android' },
    );

    expect(screen.getByTestId('card')).toHaveStyle({ elevation: 4 });
    androidRender.unmount();

    renderWithTheme(
      <Card variant="elevated" title="Account" testID="card" />,
      { platform: 'ios' },
    );
    expect(screen.getByTestId('card')).toHaveStyle({
      shadowOpacity: 0.12,
      shadowRadius: 8,
    });
  });

  it('adapts button shape while preserving platform touch targets', () => {
    const view = renderWithTheme(<Button title="Continue" testID="button" />, { platform: 'android' });
    expect(screen.getByTestId('button')).toHaveStyle({ borderRadius: 999, minHeight: 48 });
    view.unmount();
    renderWithTheme(<Button title="Continue" testID="button" />, { platform: 'ios' });
    expect(screen.getByTestId('button')).toHaveStyle({ borderRadius: 8, minHeight: 44 });
  });

  it('keeps navigation labels and selection semantics on Android', () => {
    renderWithTheme(<TabBar items={[{ key: 'home', icon: 'home', label: 'Home', testID: 'home' }]} activeKey="home" onChange={jest.fn()} />, { platform: 'android' });
    expect(screen.getByTestId('home').props.accessibilityState.selected).toBe(true);
    expect(screen.getByText('Home')).toHaveStyle({ fontSize: 12 });
  });

  it('does not impose a design-system ceiling on system text scaling', () => {
    renderWithTheme(<Text value="Accessible text" testID="text" />);

    const text = screen.getByTestId('text');
    expect(text.props.allowFontScaling).toBe(true);
    expect(text.props.maxFontSizeMultiplier).toBeUndefined();
  });
});
