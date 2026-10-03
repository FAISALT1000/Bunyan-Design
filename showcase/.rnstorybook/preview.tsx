import React from 'react';

import type { Preview } from '@storybook/react-native';
import {
  RNTheme,
  ThemeProvider,
  useTheme,
} from '@bunyan/design-system';

function StorySurface({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();

  return (
    <RNTheme.ScrollView
      style={{
        flex: 1,
        backgroundColor: theme.color.background.primary,
      }}
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <RNTheme.View
        style={{
          flex: 1,
          padding: theme.spacing.xxl,
          gap: theme.spacing.lg,
        }}
      >
        {children}
      </RNTheme.View>
    </RNTheme.ScrollView>
  );
}

const preview: Preview = {
  decorators: [
    Story => (
      <ThemeProvider>
        <StorySurface>
          <Story />
        </StorySurface>
      </ThemeProvider>
    ),
  ],
  parameters: {
    controls: { expanded: true },
  },
};

export default preview;
