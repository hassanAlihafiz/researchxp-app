const presetSetup = require.resolve('@react-native/jest-preset/jest/setup.js');

module.exports = {
  preset: '@react-native/jest-preset',
  setupFiles: [presetSetup, '<rootDir>/jest.polyfills.js'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@react-navigation|react-native-screens|react-native-gesture-handler|react-native-biometrics|react-native-reanimated|react-native-worklets|react-native-drawer-layout)/)',
  ],
};
