import React from 'react';
import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithTheme } from '../../../../tests/test-utils';
import { ResultScreenTemplate } from './ResultScreenTemplate';

describe('ResultScreenTemplate', () => {
  it('renders result metadata and action', () => {
    const done = jest.fn();
    renderWithTheme(
      <ResultScreenTemplate
        status={{ type: 'success' }}
        title="Transfer completed"
        referenceNumber="TRX-123"
        primaryAction={{ label: 'Done', onPress: done }}
      />,
    );
    expect(screen.getByText('Success')).toBeTruthy();
    expect(screen.getByText('TRX-123')).toBeTruthy();
    fireEvent.press(screen.getByRole('button', { name: 'Done' }));
    expect(done).toHaveBeenCalledTimes(1);
  });
});
