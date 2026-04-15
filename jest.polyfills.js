/** Runs before tests so Reanimated / Drawer can load in Jest. */
jest.mock('react-native-worklets', () =>
  require('react-native-worklets/lib/module/mock.js'),
);
