import React from 'react';
import { fireEvent, screen } from '@testing-library/react-native';
import { Checkbox, FormField, Input, PasswordInput, SearchInput } from '../src';
import { renderWithTheme } from './test-utils';

describe('form controls', () => {
  it('connects field labels and errors to an input', () => {
    renderWithTheme(
      <FormField label="Email" error="Enter a valid email" required>
        {ids => (
          <Input
            accessibilityLabelledBy={ids.labelId}
            aria-describedby={ids.errorId}
            status="error"
          />
        )}
      </FormField>,
    );
    expect(screen.getByText('Email *')).toBeTruthy();
    expect(screen.getByRole('alert')).toHaveTextContent('Enter a valid email');
  });

  it('toggles password visibility accessibly', () => {
    renderWithTheme(<PasswordInput accessibilityLabel="Password" />);
    fireEvent.press(screen.getByRole('button', { name: 'Show password' }));
    expect(screen.getByRole('button', { name: 'Hide password' })).toBeTruthy();
  });

  it('clears a controlled search input', () => {
    const onClear = jest.fn();
    renderWithTheme(<SearchInput value="report" onClear={onClear} />);
    fireEvent.press(screen.getByRole('button', { name: 'Clear search' }));
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it('reports checkbox state and changes it', () => {
    const onChange = jest.fn();
    renderWithTheme(<Checkbox checked={false} onChange={onChange} label="Accept terms" />);
    const checkbox = screen.getByRole('checkbox', { name: 'Accept terms' });
    fireEvent.press(checkbox);
    expect(onChange).toHaveBeenCalledWith(true);
    expect(checkbox).toHaveAccessibilityState({ checked: false, disabled: false });
  });
});
