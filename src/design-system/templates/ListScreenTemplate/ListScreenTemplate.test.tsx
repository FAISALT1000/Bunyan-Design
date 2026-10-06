import React from 'react';
import { screen } from '@testing-library/react-native';
import { ListItem } from '../../components/ListItem';
import { renderWithTheme } from '../../../../tests/test-utils';
import { ListScreenTemplate } from './ListScreenTemplate';

describe('ListScreenTemplate', () => {
  it('renders flat list items', () => {
    renderWithTheme(
      <ListScreenTemplate
        title="Accounts"
        data={{ mode: 'flat', data: [{ id: '1', name: 'Current account' }] }}
        keyExtractor={item => item.id}
        renderItem={item => <ListItem title={item.name} />}
      />,
    );
    expect(screen.getByText('Current account')).toBeTruthy();
  });

  it('renders the empty state', () => {
    renderWithTheme(
      <ListScreenTemplate<{ id: string }>
        title="Accounts"
        data={{ mode: 'flat', data: [] }}
        keyExtractor={item => item.id}
        renderItem={() => <ListItem title="Unused" />}
        emptyTitle="No accounts"
      />,
    );
    expect(screen.getByText('No accounts')).toBeTruthy();
  });
});
