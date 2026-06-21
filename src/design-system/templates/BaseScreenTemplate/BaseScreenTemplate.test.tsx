import React from 'react';
import { KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fireEvent, screen } from '@testing-library/react-native';
import { Text } from '../../components/Text';
import { darkTheme } from '../../themes';
import { renderWithTheme } from '../../../../tests/test-utils';
import { BaseScreenTemplate } from './BaseScreenTemplate';

describe('BaseScreenTemplate', () => {
  it('renders header, safe content, and loading overlay', () => {
    renderWithTheme(
      <BaseScreenTemplate title="Transfer" loading loadingLabel="Loading transfer">
        <Text>Transfer content</Text>
      </BaseScreenTemplate>,
    );
    const title = screen.getByText('Transfer', { includeHiddenElements: true });
    expect(title.props.accessibilityRole).toBe('header');
    expect(title.props.allowFontScaling).toBe(true);
    expect(screen.getByText('Transfer content', { includeHiddenElements: true })).toBeTruthy();
    expect(screen.getByRole('progressbar', { name: 'Loading transfer' })).toBeTruthy();
  });

  it('uses safe-area and keyboard-aware containers by default', () => {
    const view = renderWithTheme(
      <BaseScreenTemplate title="Profile"><Text>Content</Text></BaseScreenTemplate>,
    );
    expect(view.UNSAFE_getByType(SafeAreaView)).toBeTruthy();
    expect(view.UNSAFE_getByType(KeyboardAvoidingView)).toBeTruthy();
  });

  it('renders semantic dark-theme colors', () => {
    renderWithTheme(
      <BaseScreenTemplate title="Dark screen"><Text>Content</Text></BaseScreenTemplate>,
      { initialPreference: 'dark' },
    );
    expect(screen.getByText('Dark screen')).toHaveStyle({ color: darkTheme.color.text.primary });
  });

  it('renders an error state and forwards retry', () => {
    const retry = jest.fn();
    renderWithTheme(
      <BaseScreenTemplate
        state={{
          type: 'error',
          message: 'Unable to load transfer',
          retryAction: { label: 'Try again', onPress: retry },
        }}
      >
        <Text>Hidden content</Text>
      </BaseScreenTemplate>,
    );
    fireEvent.press(screen.getByRole('button', { name: 'Try again' }));
    expect(retry).toHaveBeenCalledTimes(1);
  });

  it('renders Arabic using RTL theme direction', () => {
    renderWithTheme(
      <BaseScreenTemplate title="التحويل"><Text>المحتوى</Text></BaseScreenTemplate>,
      { locale: 'ar-SA' },
    );
    expect(screen.getByText('التحويل')).toHaveStyle({ writingDirection: 'rtl' });
  });
});
