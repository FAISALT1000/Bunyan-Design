import React from 'react';
import { act, fireEvent, screen } from '@testing-library/react-native';
import { I18nManager } from '../src/design-system/components/RNTheme/native';
import {
  Checkbox,
  Radio,
  SearchInput,
  Text,
  ToastProvider,
  logicalRow,
  logicalTextAlign,
  useToast,
  type ToastContextValue,
} from '../src';
import { renderWithTheme } from './test-utils';

describe('regressions', () => {
  it('honours Text align instead of always aligning to start', () => {
    renderWithTheme(<Text align="center">Centered</Text>);
    expect(screen.getByText('Centered')).toHaveStyle({ textAlign: 'center' });
  });

  it('does not double-mirror rows when the native layout is already RTL', () => {
    const original = I18nManager.isRTL;
    Object.defineProperty(I18nManager, 'isRTL', { value: true, configurable: true });
    try {
      expect(logicalRow('rtl')).toEqual({ flexDirection: 'row' });
      expect(logicalRow('ltr')).toEqual({ flexDirection: 'row-reverse' });
      expect(logicalTextAlign('rtl')).toBe('left');
    } finally {
      Object.defineProperty(I18nManager, 'isRTL', { value: original, configurable: true });
    }
    expect(logicalRow('rtl')).toEqual({ flexDirection: 'row-reverse' });
    expect(logicalTextAlign('rtl')).toBe('right');
  });

  it('evicts toasts when maxVisible is 1', () => {
    jest.useFakeTimers();
    let api: ToastContextValue | undefined;
    function Capture() {
      api = useToast();
      return null;
    }
    renderWithTheme(<ToastProvider maxVisible={1}><Capture /></ToastProvider>);
    act(() => {
      api?.showToast({ message: 'First' });
      api?.showToast({ message: 'Second' });
    });
    expect(screen.queryByText('First')).toBeNull();
    expect(screen.getByText('Second')).toBeTruthy();
    act(() => jest.runAllTimers());
    expect(screen.queryByText('Second')).toBeNull();
    jest.useRealTimers();
  });

  it('clears an uncontrolled search input', () => {
    const onChangeText = jest.fn();
    renderWithTheme(<SearchInput accessibilityLabel="Search" onChangeText={onChangeText} />);
    fireEvent.changeText(screen.getByLabelText('Search'), 'report');
    fireEvent.press(screen.getByRole('button', { name: 'Clear search' }));
    expect(onChangeText).toHaveBeenLastCalledWith('');
    expect(screen.queryByRole('button', { name: 'Clear search' })).toBeNull();
  });

  it('checks an indeterminate checkbox on press', () => {
    const onChange = jest.fn();
    renderWithTheme(<Checkbox checked indeterminate onChange={onChange} label="All" />);
    fireEvent.press(screen.getByRole('checkbox'));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('does not re-fire selection for the active radio', () => {
    const onSelect = jest.fn();
    renderWithTheme(<Radio selected onSelect={onSelect} label="Standard" />);
    fireEvent.press(screen.getByRole('radio'));
    expect(onSelect).not.toHaveBeenCalled();
  });
});
