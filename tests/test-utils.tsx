import React from 'react';
import { render, type RenderOptions } from '@testing-library/react-native';
import { ThemeProvider, type ThemeProviderProps } from '../src';

export const renderWithTheme = (
  ui: React.ReactElement,
  providerProps: Omit<ThemeProviderProps, 'children'> = {},
  options?: RenderOptions,
) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <ThemeProvider {...providerProps}>{children}</ThemeProvider>
  );
  return render(ui, {
    ...options,
    wrapper: Wrapper,
  });
};
