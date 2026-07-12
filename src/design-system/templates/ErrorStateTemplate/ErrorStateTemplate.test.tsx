import React from 'react';
import { screen } from '@testing-library/react-native';
import { renderWithTheme } from '../../../../tests/test-utils';
import { ErrorStateTemplate } from './ErrorStateTemplate';

describe('ErrorStateTemplate', () => {
  it('provides user-friendly network messaging and reference code', () => {
    renderWithTheme(
      <ErrorStateTemplate type="network" referenceCode="NET-2481" variant="compact" />,
    );
    expect(screen.getByText('No internet connection')).toBeTruthy();
    expect(screen.getByText('Reference: NET-2481')).toBeTruthy();
  });
});
