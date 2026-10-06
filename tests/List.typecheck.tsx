/* Compile-time checks for the generic List API (run by `npm run typecheck`). */
import React from 'react';
import { Button, Card, Chip, List, ListItem, Text } from '../src';

interface User { id: string; name: string; email: string }
const users: User[] = [{ id: '1', name: 'Faisal', email: 'f@x.sa' }];

export const checks = (
  <>
    {/* data already matches the component props: formatItem optional */}
    <List Component={ListItem} data={[{ title: 'A' }, { title: 'B', description: 'b' }]} />

    {/* raw data + formatItem: `user` is inferred as User */}
    <List
      Component={ListItem}
      data={users}
      formatItem={user => ({ title: user.name, description: user.email })}
      shareProps={{ showChevron: false }}
    />

    {/* shareProps completes required props */}
    <List Component={Button} data={[{ children: 'One' }, { children: 'Two' }]} shareProps={{ variant: 'outline', size: 'small' }} flexDirection="row" />

    {/* any component, including custom ones */}
    <List Component={({ label }: { label: string }) => <Text>{label}</Text>} data={[{ label: 'x' }]} />
    <List Component={Chip} data={['a', 'b']} formatItem={label => ({ label })} flexDirection="row" flexWrap="wrap" />
    <List Component={Card} data={users} formatItem={u => ({ children: <Text>{u.name}</Text> })} columns={2} />

    {/* @ts-expect-error raw data that does not match the component needs formatItem */}
    <List Component={ListItem} data={users} />

    {/* @ts-expect-error formatItem must return the component's props */}
    <List Component={ListItem} data={users} formatItem={user => ({ heading: user.name })} />

    {/* @ts-expect-error unknown spacing token */}
    <List Component={ListItem} data={[{ title: 'A' }]} spacing="huger" />
  </>
);
