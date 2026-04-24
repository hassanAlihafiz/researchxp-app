/**
 * @format
 */

import 'react-native-gesture-handler';
import 'react-native-worklets';
import 'react-native-reanimated';
import { AppRegistry } from 'react-native';
import App from './App';

/** Must match `getMainComponentName()` (Android) and `withModuleName` (iOS). */
AppRegistry.registerComponent('researchxp', () => App);
