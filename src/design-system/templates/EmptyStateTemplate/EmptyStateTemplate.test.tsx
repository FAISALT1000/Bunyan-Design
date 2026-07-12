import React from 'react';
import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithTheme } from '../../../../tests/test-utils';
import { EmptyStateTemplate } from './EmptyStateTemplate';

describe('EmptyStateTemplate', () => {
  it('renders compact state and action', () => {
    const action = jest.fn();
    renderWithTheme(
      <EmptyStateTemplate
        variant="compact"
        title="No items"
        primaryAction={{ label: 'Add item', onPress: action }}
      />,
    );
    fireEvent.press(screen.getByRole('button', { name: 'Add item' }));
    expect(action).toHaveBeenCalledTimes(1);
  });
});
