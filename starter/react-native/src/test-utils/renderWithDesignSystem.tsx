import React from 'react';
import {
  render,
  type RenderOptions,
} from '@testing-library/react-native';
import {
  DesignSystemSetup,
  type DesignSystemSetupProps,
} from '../design-system';

export function renderWithDesignSystem(
  ui: React.ReactElement,
  setupProps: Omit<DesignSystemSetupProps, 'children'> = {},
  options?: RenderOptions,
) {
  return render(
    <DesignSystemSetup {...setupProps}>{ui}</DesignSystemSetup>,
    options,
  );
}
