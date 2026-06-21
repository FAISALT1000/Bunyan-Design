module.exports = {
  preset: 'react-native',
  watchman: false,
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  testMatch: ['<rootDir>/**/*.test.ts?(x)'],
  transformIgnorePatterns: [
    'node_modules/(?!((@)?react-native|@react-native-community|react-native-svg)/)',
  ],
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/index.ts'],
};
