/**
 * OAuth client configuration (native SDKs + server validation).
 *
 * Apple: `APPLE_CLIENT_ID` on the API defaults to the iOS bundle id
 * `com.exact-insight.researchxp` — keep in sync if you change the bundle id.
 *
 * Google: create an OAuth **Web application** client in Google Cloud Console and paste
 * its client ID here so `GoogleSignin.configure({ webClientId })` returns an ID token.
 * Add the same client id to the API env `GOOGLE_CLIENT_ID` (comma-separated if you use several).
 */
export const GOOGLE_WEB_CLIENT_ID = '';
