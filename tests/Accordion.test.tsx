import React from 'react';
import { fireEvent, screen } from '@testing-library/react-native';
import { Accordion, Text } from '../src';
import { renderWithTheme } from './test-utils';

describe('Accordion', () => {
  it('supports controlled disclosure interaction', () => {
    renderWithTheme(
      <Accordion title="Account details">
        <Text value="Account number 1234" />
      </Accordion>,
    );
    expect(screen.queryByText('Account number 1234')).toBeNull();
    fireEvent.press(screen.getByRole('button', { name: 'Account details' }));
    expect(screen.getByText('Account number 1234')).toBeTruthy();
  });
});
