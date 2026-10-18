import React from 'react';
import { screen } from '@testing-library/react-native';
import { BottomSheet, Text } from '../src';
import { Modal } from '../src/design-system/components/RNTheme/native';
import { useAccessibility } from '../src/design-system/hooks/useAccessibility';
import { renderWithTheme } from './test-utils';

jest.mock('../src/design-system/hooks/useAccessibility', () => ({
  useAccessibility: jest.fn(),
}));

it.each([true, false])('respects Reduce Motion (%s) when presenting a sheet', reduceMotionEnabled => {
  jest.mocked(useAccessibility).mockReturnValue({
    reduceMotionEnabled, screenReaderEnabled: false, boldTextEnabled: false,
  });
  renderWithTheme(
    <BottomSheet visible onClose={jest.fn()} title="Details">
      <Text value="Sheet content" />
    </BottomSheet>,
  );
  expect(screen.UNSAFE_getByType(Modal).props.animationType).toBe(reduceMotionEnabled ? 'none' : 'slide');
});
