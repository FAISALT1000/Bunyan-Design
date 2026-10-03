import React from 'react';
import { fireEvent, screen } from '@testing-library/react-native';
import { Button, Chip, List, ListItem, Text, darkTheme } from '../src';
import { renderWithTheme } from './test-utils';

interface User { id: string; name: string; role: string | null }
const users: (User | null)[] = [
  { id: 'u1', name: 'Faisal', role: 'Owner' },
  null,
  { id: 'u2', name: 'Sara', role: 'Admin' },
  { id: 'u3', name: 'Omar', role: null },
];

describe('List', () => {
  it('renders the given component once per item using formatItem and shareProps', () => {
    const onPress = jest.fn();
    renderWithTheme(
      <List
        Component={ListItem}
        data={users}
        formatItem={user => ({ title: user.name, ...(user.role ? { description: user.role } : {}) })}
        shareProps={{ onPress, showChevron: false }}
      />,
    );
    expect(screen.getAllByRole('button')).toHaveLength(3); // null entry filtered
    fireEvent.press(screen.getByRole('button', { name: 'Sara' }));
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Owner')).toBeTruthy();
  });

  it('lets item props override shareProps', () => {
    renderWithTheme(
      <List
        Component={Button}
        data={[{ children: 'Save' }, { children: 'Delete', variant: 'danger' as const, disabled: true }]}
        shareProps={{ variant: 'outline' }}
        flexDirection="row"
      />,
    );
    expect(screen.getByRole('button', { name: 'Delete' }).props.accessibilityState).toEqual(expect.objectContaining({ disabled: true }));
    expect(screen.getByRole('button', { name: 'Save' }).props.accessibilityState).toEqual(expect.objectContaining({ disabled: false }));
  });

  it('skips items when formatItem returns null and filterNull is on', () => {
    renderWithTheme(
      <List Component={Chip} data={['a', 'b', 'c']} formatItem={label => (label === 'b' ? null : { label })} flexDirection="row" flexWrap="wrap" />,
    );
    expect(screen.queryByText('b')).toBeNull();
    expect(screen.getByText('a')).toBeTruthy();
    expect(screen.getByText('c')).toBeTruthy();
  });

  it('lays items out in a grid and pads the last row', () => {
    renderWithTheme(
      <List Component={Text} data={[{ children: '1' }, { children: '2' }, { children: '3' }]} columns={2} testID="grid" />,
    );
    // 3 items + 1 padding cell
    expect(JSON.stringify(screen.toJSON()).match(/"role":"listitem"/g)).toHaveLength(4);
  });

  it('draws dividers only between rows', () => {
    const { toJSON } = renderWithTheme(
      <List Component={Text} data={[{ children: 'a' }, { children: 'b' }, { children: 'c' }]} withDivider />,
    );
    const json = JSON.stringify(toJSON());
    // Divider height comes from theme.borderWidth.thin (1) — count horizontal divider views
    expect(json.match(/"height":1,"alignSelf":"stretch"/g)).toHaveLength(2);
  });

  it('shows the empty form when there is nothing to render', () => {
    renderWithTheme(<List Component={ListItem} data={[]} emptyForm={{ title: 'No members yet' }} />);
    expect(screen.getByText('No members yet')).toBeTruthy();
  });

  it('shows a single loading region instead of data while loading', () => {
    renderWithTheme(
      <List Component={ListItem} data={[{ title: 'Hidden' }]} loading loadingConfig={{ count: 4, accessibilityLabel: 'Loading members' }} />,
    );
    expect(screen.queryByText('Hidden')).toBeNull();
    expect(screen.getByLabelText('Loading members')).toBeTruthy();
  });

  it('renders header and footer components and wraps in a themed Card', () => {
    renderWithTheme(
      <List
        Component={ListItem}
        data={[{ title: 'Row' }]}
        ListHeaderComponent={<Text>Header</Text>}
        ListFooterComponent={() => <Text>Footer</Text>}
        cardVariant="filled"
        testID="card-list"
      />,
      { initialPreference: 'dark' },
    );
    expect(screen.getByText('Header')).toBeTruthy();
    expect(screen.getByText('Footer')).toBeTruthy();
    expect(JSON.stringify(screen.toJSON())).toContain(darkTheme.color.surface.secondary);
  });

  it('uses id as the default key and keyExtractor when given', () => {
    const keyExtractor = jest.fn((user: { id: string; name: string }) => `user-${user.id}`);
    renderWithTheme(
      <List Component={ListItem} data={[{ id: '7', name: 'A' }]} formatItem={u => ({ title: u.name })} keyExtractor={keyExtractor} />,
    );
    expect(keyExtractor).toHaveBeenCalledWith({ id: '7', name: 'A' }, 0);
  });
});
