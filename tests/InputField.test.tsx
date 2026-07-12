import React from 'react';
import {
  act,
  fireEvent,
  screen,
} from '@testing-library/react-native';
import {
  Animated,
} from 'react-native';
import {
  InputField,
  getInputFieldTypeDefaults,
} from '../src';
import { renderWithTheme } from './test-utils';

describe('InputField', () => {
  const onChangeText = jest.fn();

  beforeEach(() => {
    onChangeText.mockClear();
  });

  it.each([
    ['text', 'default', 'text', false],
    ['email', 'email-address', 'email', false],
    ['phone', 'phone-pad', 'tel', false],
    ['number', 'number-pad', 'numeric', false],
    ['decimal', 'decimal-pad', 'decimal', false],
    ['search', 'web-search', 'search', false],
    ['url', 'url', 'url', false],
    ['otp', 'number-pad', 'numeric', false],
    ['pin', 'number-pad', 'numeric', true],
  ] as const)(
    'configures %s input defaults',
    (type, keyboardType, inputMode, secureTextEntry) => {
      const defaults = getInputFieldTypeDefaults(type);
      expect(defaults).toEqual(expect.objectContaining({
        keyboardType,
        inputMode,
        secureTextEntry,
      }));
    },
  );

  it('uses the floating label state for focus, value, and blur', () => {
    const view = renderWithTheme(
      <InputField
        type="text"
        label="Name"
        placeholder="Enter name"
        value=""
        onChangeText={onChangeText}
        testID="name"
      />,
    );
    const input = screen.getByTestId('name');
    expect(input.props.placeholder).toBeUndefined();

    fireEvent(input, 'focus', {});
    expect(screen.getByTestId('name').props.placeholder).toBe('Enter name');

    view.rerender(
      <InputField
        type="text"
        label="Name"
        placeholder="Enter name"
        value="Faisal"
        onChangeText={onChangeText}
        testID="name"
      />,
    );
    expect(view.getByTestId('name').props.placeholder).toBe('Enter name');

    view.rerender(
      <InputField
        type="text"
        label="Name"
        placeholder="Enter name"
        value=""
        onChangeText={onChangeText}
        testID="name"
      />,
    );
    fireEvent(view.getByTestId('name'), 'blur', {});
    expect(view.getByTestId('name').props.placeholder).toBeUndefined();
  });

  it('announces error and success supporting states', () => {
    const view = renderWithTheme(
      <InputField
        type="email"
        label="Email"
        value="invalid"
        onChangeText={onChangeText}
        errorText="Enter a valid email"
        testID="email"
      />,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Enter a valid email');
    expect(screen.getByTestId('email').props['aria-invalid']).toBe(true);

    view.rerender(
      <InputField
        type="email"
        label="Email"
        value="name@example.com"
        onChangeText={onChangeText}
        successText="Email is valid"
        testID="email"
      />,
    );
    expect(view.getByText('Email is valid')).toBeTruthy();
    expect(view.getByTestId('email').props['aria-invalid']).toBe(false);
  });

  it('toggles password visibility', () => {
    renderWithTheme(
      <InputField
        type="password"
        label="Password"
        value="secret"
        onChangeText={onChangeText}
        testID="password"
      />,
    );
    expect(screen.getByTestId('password').props.secureTextEntry).toBe(true);
    fireEvent.press(screen.getByRole('button', { name: 'Show password' }));
    expect(screen.getByTestId('password').props.secureTextEntry).toBe(false);
    expect(screen.getByRole('button', { name: 'Hide password' })).toBeTruthy();
  });

  it('clears search and submits its current value', () => {
    const onSearch = jest.fn();
    renderWithTheme(
      <InputField
        type="search"
        label="Search"
        value="accounts"
        onChangeText={onChangeText}
        onSearch={onSearch}
        testID="search"
      />,
    );
    fireEvent.press(screen.getByRole('button', { name: 'Clear search' }));
    expect(onChangeText).toHaveBeenCalledWith('');
    fireEvent(screen.getByTestId('search'), 'submitEditing', {});
    expect(onSearch).toHaveBeenCalledWith('accounts');
  });

  it('completes OTP and PIN values once per completed value', () => {
    const onComplete = jest.fn();
    const view = renderWithTheme(
      <InputField
        type="otp"
        label="Verification code"
        value="123456"
        length={6}
        onChangeText={onChangeText}
        onComplete={onComplete}
        testID="code"
      />,
    );
    expect(screen.getByTestId('code').props.maxLength).toBe(6);
    expect(screen.getByTestId('code').props.textContentType).toBe('oneTimeCode');
    expect(onComplete).toHaveBeenCalledWith('123456');

    view.rerender(
      <InputField
        type="pin"
        label="PIN"
        value="1234"
        length={4}
        onChangeText={onChangeText}
        onComplete={onComplete}
        testID="code"
      />,
    );
    expect(view.getByTestId('code').props.secureTextEntry).toBe(true);
  });

  it('preserves Arabic label alignment and uncapped text scaling', () => {
    renderWithTheme(
      <InputField
        type="text"
        label="الاسم"
        value=""
        onChangeText={onChangeText}
        testID="arabic"
      />,
      { locale: 'ar-SA' },
    );
    expect(screen.getByTestId('arabic-label', {
      includeHiddenElements: true,
    })).toHaveStyle({
      textAlign: 'right',
    });
    expect(screen.getByTestId('arabic').props.allowFontScaling).toBe(true);
    expect(screen.getByTestId('arabic').props.maxFontSizeMultiplier)
      .toBeUndefined();
  });

  it('uses the reduced-motion duration while preserving focus state', async () => {
    const timing = jest.spyOn(Animated, 'timing');
    renderWithTheme(
      <InputField
        type="text"
        label="Name"
        value=""
        onChangeText={onChangeText}
        reduceMotion
        testID="reduced-motion"
      />,
    );
    act(() => {
      fireEvent(screen.getByTestId('reduced-motion'), 'focus', {});
    });
    expect(timing).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ duration: 0 }),
    );
    timing.mockRestore();
  });

  it('exposes disabled and required accessibility information', () => {
    renderWithTheme(
      <InputField
        type="text"
        label="Account number"
        value=""
        onChangeText={onChangeText}
        disabled
        required
        testID="account"
      />,
    );
    expect(screen.getByLabelText('Account number, Required').props
      .accessibilityState).toEqual(expect.objectContaining({ disabled: true }));
  });
});
