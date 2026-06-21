const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Storybook's checked-in story index uses require.context to load the
// design-system stories from the locally linked package.
config.transformer.unstable_allowRequireContext = true;

module.exports = config;
