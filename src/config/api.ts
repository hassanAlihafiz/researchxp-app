import { Platform } from 'react-native';

/**
 * Dev: iOS simulator uses the host machine; Android emulator maps `10.0.2.2` to that host.
 * Release: set `PRODUCTION_API_BASE_URL` before shipping.
 */
const PRODUCTION_API_BASE_URL = 'https://your-api.example.com';

const devHost = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';

export const API_BASE_URL = __DEV__
  ? `http://${devHost}:4000`
  : PRODUCTION_API_BASE_URL;
