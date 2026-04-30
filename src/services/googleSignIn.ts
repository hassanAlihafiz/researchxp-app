import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { GOOGLE_WEB_CLIENT_ID } from '../config/oauth';

let configured = false;

export function isGoogleSignInConfigured(): boolean {
  return GOOGLE_WEB_CLIENT_ID.length > 0;
}

export function ensureGoogleSignInConfigured(): void {
  if (configured || !GOOGLE_WEB_CLIENT_ID) {
    return;
  }
  GoogleSignin.configure({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    offlineAccess: false,
  });
  configured = true;
}
