import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-native';
import { Avatar } from '../../components/Avatar';
import { Badge } from '../../components/Badge';
import { ListItem } from '../../components/ListItem';
import { ListScreenTemplate } from './ListScreenTemplate';

interface Account {
  id: string;
  name: string;
  number: string;
}

const accounts: Account[] = [
  { id: '1', name: 'Current account', number: '•• 2481' },
  { id: '2', name: 'Savings account', number: '•• 9034' },
  { id: '3', name: 'Business account', number: '•• 1288' },
];

function ListDemo({ state = 'content' }: { state?: 'content' | 'loading' | 'empty' | 'error' }) {
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState('all');
  const filtered = accounts.filter(account =>
    account.name.toLocaleLowerCase().includes(query.toLocaleLowerCase()),
  );
  return (
    <ListScreenTemplate
      title="Accounts"
      data={{ mode: 'flat', data: state === 'empty' ? [] : filtered }}
      keyExtractor={item => item.id}
      renderItem={item => (
        <ListItem
          title={item.name}
          description={item.number}
          leading={<Avatar name={item.name} />}
          trailing={<Badge label="Active" tone="success" />}
          onPress={() => undefined}
        />
      )}
      search={{ value: query, onChangeText: setQuery, onClear: () => setQuery('') }}
      tabs={{
        items: [{ value: 'all', label: 'All' }, { value: 'favorites', label: 'Favorites' }],
        value: tab,
        onValueChange: setTab,
      }}
      state={
        state === 'loading'
          ? { type: 'loading' }
          : state === 'error'
          ? { type: 'error', message: 'Unable to load accounts' }
          : { type: 'content' }
      }
      floatingAction={{ label: 'Add account', onPress: () => undefined }}
      emptyTitle="No accounts"
      emptyDescription="Accounts matching your filters will appear here."
    />
  );
}

const meta = {
  title: 'Templates/ListScreen',
  component: ListScreenTemplate,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof ListScreenTemplate<Account>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { render: () => <ListDemo /> };
export const Loading: Story = { render: () => <ListDemo state="loading" /> };
export const Empty: Story = { render: () => <ListDemo state="empty" /> };
export const Error: Story = { render: () => <ListDemo state="error" /> };
export const Sectioned: Story = {
  render: () => (
    <ListScreenTemplate
      title="Transactions"
      data={{
        mode: 'sectioned',
        sections: [
          { id: 'today', title: 'Today', data: accounts.slice(0, 2) },
          { id: 'earlier', title: 'Earlier', data: accounts.slice(2) },
        ],
      }}
      keyExtractor={item => item.id}
      renderItem={item => <ListItem title={item.name} description={item.number} />}
    />
  ),
};
