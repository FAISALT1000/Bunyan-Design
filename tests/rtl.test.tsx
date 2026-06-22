import React from 'react';
import { screen } from '@testing-library/react-native';
import { Heading, ListItem, Text } from '../src';
import { renderWithTheme } from './test-utils';

describe('RTL support', () => {
  it('renders Arabic content using RTL direction', () => {
    renderWithTheme(
      <>
        <Heading title="لوحة التحكم" />
        <Text value="مرحباً بك في بنيان" />
        <ListItem title="الإعدادات" onPress={jest.fn()} />
      </>,
      { locale: 'ar-SA' },
    );

    expect(screen.getByText('لوحة التحكم')).toHaveStyle({ writingDirection: 'rtl' });
    expect(screen.getByText('مرحباً بك في بنيان')).toHaveStyle({ textAlign: 'right' });
    expect(screen.getByRole('button', { name: 'الإعدادات' })).toBeTruthy();
  });
});
