import React from 'react';
import { fireEvent, screen } from '@testing-library/react-native';
import { NumPad, OTPTemplate } from '../src';
import { renderWithTheme } from './test-utils';

describe('NumPad', () => {
  it('enters and deletes digits', () => {
    const onChange = jest.fn();
    const view = renderWithTheme(<NumPad value="12" onChange={onChange} />);

    fireEvent.press(view.getByText('3'));
    expect(onChange).toHaveBeenCalledWith('123');

    fireEvent.press(view.getByLabelText('Delete last digit'));
    expect(onChange).toHaveBeenCalledWith('1');
  });
});

describe('OTPTemplate', () => {
  it('enables verification only when the code is complete', () => {
    const onSubmit = jest.fn();
    const view = renderWithTheme(
      <OTPTemplate
        variant="fullScreen"
        value="1234"
        onChange={jest.fn()}
        onSubmit={onSubmit}
      />,
    );

    fireEvent.press(view.getByText('Verify'));
    expect(onSubmit).toHaveBeenCalledWith('1234');
    expect(screen.getByLabelText('Verification code, 4 of 4 digits entered')).toBeTruthy();
  });

  it('filters pasted content to the configured numeric length', () => {
    const onChange = jest.fn();
    const view = renderWithTheme(
      <OTPTemplate
        variant="fullScreen"
        value=""
        onChange={onChange}
        onSubmit={jest.fn()}
        length={4}
        useNumPad={false}
      />,
    );

    fireEvent.changeText(view.getByLabelText('Verification code input'), '1a2345');
    expect(onChange).toHaveBeenCalledWith('1234');
  });
});
