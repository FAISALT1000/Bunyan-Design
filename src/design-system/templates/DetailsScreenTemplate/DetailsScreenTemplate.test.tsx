import React from 'react';
import { screen } from '@testing-library/react-native';
import { renderWithTheme } from '../../../../tests/test-utils';
import { DetailsScreenTemplate } from './DetailsScreenTemplate';

describe('DetailsScreenTemplate', () => {
  it('renders status and key-value rows', () => {
    renderWithTheme(
      <DetailsScreenTemplate
        title="Account details"
        status={{ label: 'Active', tone: 'success' }}
        sections={[
          {
            id: 'account',
            rows: [{ id: 'iban', label: 'IBAN', value: 'SA00 2481' }],
          },
        ]}
      />,
    );
    expect(screen.getByText('Active')).toBeTruthy();
    expect(screen.getByText('IBAN')).toBeTruthy();
    expect(screen.getByText('SA00 2481')).toBeTruthy();
  });
});
