import React from 'react';
import { screen } from '@testing-library/react-native';
import {
  Badge,
  Button,
  Heading,
  Link,
  Text,
} from '../src';
import { resetDeprecationWarningsForTests } from '../src/design-system/utilities/deprecations';
import { renderWithTheme } from './test-utils';

describe('explicit semantic component APIs', () => {
  beforeEach(() => {
    resetDeprecationWarningsForTests();
    jest.restoreAllMocks();
  });

  it('renders explicit title, text, and label props', () => {
    renderWithTheme(
      <>
        <Button title="Confirm" />
        <Text value="Transfer completed" />
        <Heading title="Transfer details" />
        <Link label="View details" />
        <Badge label="Pending" />
      </>,
    );

    expect(screen.getByRole('button', { name: 'Confirm' })).toBeTruthy();
    expect(screen.getByText('Transfer completed')).toBeTruthy();
    expect(screen.getByText('Transfer details')).toBeTruthy();
    expect(screen.getByText('Pending')).toBeTruthy();
  });

  it('supports the temporary string-only fallback and warns once', () => {
    const warning = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    renderWithTheme(
      <>
        <Button>Legacy button</Button>
        <Text>Legacy text</Text>
        <Badge>Legacy badge</Badge>
      </>,
    );

    expect(screen.getByText('Legacy button')).toBeTruthy();
    expect(screen.getByText('Legacy text')).toBeTruthy();
    expect(screen.getByText('Legacy badge')).toBeTruthy();
    expect(warning).toHaveBeenCalledWith(
      expect.stringContaining('Button children is deprecated'),
    );
    expect(warning).toHaveBeenCalledWith(
      expect.stringContaining('Text children is deprecated'),
    );
    expect(warning).toHaveBeenCalledWith(
      expect.stringContaining('Badge children is deprecated'),
    );
  });
});
