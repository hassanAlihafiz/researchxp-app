const worklets = require.resolve('react-native-worklets/plugin');

/**
 * Worklets must run after @react-native/babel-preset transforms.
 * Root `plugins` run *before* a preset's plugins, which breaks `'worklet'`
 * in react-native-drawer-layout → "Failed to create a worklet".
 * Presets are applied last-to-first, so this mini-preset is listed first.
 * @see https://babeljs.io/docs/plugins#plugin-preset-ordering
 */
module.exports = {
  presets: ['module:@react-native/babel-preset'],
  // Reanimated 4 uses Worklets; RN CLI must include this plugin (must be last).
  // See https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/getting-started/
  plugins: ['react-native-worklets/plugin'],
};
