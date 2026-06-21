import React from 'react';
import { ScrollView, View } from 'react-native';
import type { Preview } from '@storybook/react-native';
import { ThemeProvider, useTheme } from '../src';

function StorySurface({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.color.background.primary }}>
      <View style={{ padding: theme.spacing.xxl, gap: theme.spacing.lg }}>{children}</View>
    </ScrollView>
  );
}

const preview: Preview = {
  decorators: [
    Story => (
      <ThemeProvider>
        <StorySurface><Story /></StorySurface>
      </ThemeProvider>
    ),
  ],
  parameters: {
    controls: { expanded: true },
  },
};

export default preview;
