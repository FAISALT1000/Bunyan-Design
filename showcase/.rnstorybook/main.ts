import type { StorybookConfig } from '@storybook/react-native';

const main: StorybookConfig = {
  stories: [
    '../node_modules/@bunyan/design-system/src/**/*.stories.?(ts|tsx|js|jsx)',
  ],
  deviceAddons: [],
};

export default main;
