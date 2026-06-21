const path = require('node:path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Storybook's checked-in story index uses require.context to load the
// design-system stories from the locally linked package.
config.transformer.unstable_allowRequireContext = true;

// Linked Bunyan source lives above this app. Force singleton runtime packages
// to resolve as if they were imported by the showcase entry point, while
// preserving Expo's normal hierarchical resolution for its internal packages.
const singletonPackages = [
  'react',
  'react-dom',
  'react-native',
  'react-native-reanimated',
  'react-native-gesture-handler',
  'react-native-safe-area-context',
  '@gorhom/bottom-sheet',
];

config.resolver.resolveRequest = (context, moduleName, platform) => {
  const isSingleton = singletonPackages.some(
    packageName =>
      moduleName === packageName || moduleName.startsWith(`${packageName}/`),
  );

  if (isSingleton) {
    return context.resolveRequest(
      {
        ...context,
        originModulePath: path.resolve(__dirname, 'index.ts'),
      },
      moduleName,
      platform,
    );
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
