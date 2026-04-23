import { createNavigationContainerRef } from '@react-navigation/native';
import type { RootStackParamList } from './types';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

function tryResetToLogin(): boolean {
  if (!navigationRef.isReady()) {
    return false;
  }
  navigationRef.reset({
    index: 0,
    routes: [{ name: 'Login' }],
  });
  return true;
}

/** Clears the stack and shows Login (e.g. after sign-out or account deletion). */
export function resetToLogin() {
  if (tryResetToLogin()) {
    return;
  }
  requestAnimationFrame(() => {
    if (tryResetToLogin()) {
      return;
    }
    setTimeout(() => {
      tryResetToLogin();
    }, 50);
  });
}
