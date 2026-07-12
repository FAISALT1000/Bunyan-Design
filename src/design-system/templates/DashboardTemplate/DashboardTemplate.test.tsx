import React from 'react';
import { fireEvent, screen } from '@testing-library/react-native';
import { Text } from '../../components/Text';
import { renderWithTheme } from '../../../../tests/test-utils';
import { DashboardTemplate } from './DashboardTemplate';

describe('DashboardTemplate', () => {
  it('renders greeting, balance, and quick actions', () => {
    const transfer = jest.fn();
    renderWithTheme(
      <DashboardTemplate
        greeting="Good morning"
        balanceSummary={<Text value="10,000 SAR" />}
        quickActions={[{ id: 'transfer', label: 'Transfer', onPress: transfer }]}
      />,
    );
    expect(screen.getByText('10,000 SAR')).toBeTruthy();
    fireEvent.press(screen.getByRole('button', { name: 'Transfer' }));
    expect(transfer).toHaveBeenCalledTimes(1);
  });
});
