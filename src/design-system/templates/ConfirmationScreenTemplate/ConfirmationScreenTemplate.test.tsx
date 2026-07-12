import React, { useState } from 'react';
import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithTheme } from '../../../../tests/test-utils';
import { ConfirmationScreenTemplate } from './ConfirmationScreenTemplate';

function ConfirmationHarness() {
  const [confirmed, setConfirmed] = useState(false);
  return (
    <ConfirmationScreenTemplate
      title="Review"
      sections={[]}
      confirmationRequired
      confirmed={confirmed}
      onConfirmedChange={setConfirmed}
      primaryAction={{ label: 'Confirm', onPress: jest.fn() }}
    />
  );
}

describe('ConfirmationScreenTemplate', () => {
  it('guards the primary action until consent is checked', () => {
    renderWithTheme(<ConfirmationHarness />);
    expect(screen.getByRole('button', { name: 'Confirm' }).props.accessibilityState.disabled).toBe(true);
    fireEvent.press(screen.getByRole('checkbox'));
    expect(screen.getByRole('button', { name: 'Confirm' }).props.accessibilityState.disabled).toBe(false);
  });
});
