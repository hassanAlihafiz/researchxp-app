import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RegisteredAppUser } from '../api/registerMember';
import type { RootStackParamList } from './types';
import {
  userNeedsLayer0,
  userNeedsPostLayer0Welcome,
} from '../onboarding/userNeedsLayer0';

/** After login or email verification: Main vs Layer 0 stack (spec). */
export function replaceStackAfterAuth(
  navigation: {
    reset: NativeStackNavigationProp<RootStackParamList>['reset'];
  },
  user: RegisteredAppUser,
) {
  if (userNeedsLayer0(user)) {
    navigation.reset({ index: 0, routes: [{ name: 'OnboardingLayer0' }] });
    return;
  }
  if (userNeedsPostLayer0Welcome(user)) {
    navigation.reset({ index: 0, routes: [{ name: 'OnboardingValuePrimer' }] });
    return;
  }
  navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
}
