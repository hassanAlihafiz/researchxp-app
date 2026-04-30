import { createNavigationContainerRef } from '@react-navigation/native';
import type { RootStackParamList } from './types';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

function tryResetToWelcome(): boolean {
  if (!navigationRef.isReady()) {
    return false;
  }
  navigationRef.reset({
    index: 0,
    routes: [{ name: 'Welcome' }],
  });
  return true;
}

/** Clears the stack and shows Welcome (e.g. after sign-out or account deletion). */
export function resetToLogin() {
  if (tryResetToWelcome()) {
    return;
  }
  requestAnimationFrame(() => {
    if (tryResetToWelcome()) {
      return;
    }
    setTimeout(() => {
      tryResetToWelcome();
    }, 50);
  });
}
