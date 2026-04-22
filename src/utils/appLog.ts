/** Logs only when Metro `__DEV__` is true (default when running the app in development). */
const LOG_IN_DEV = typeof __DEV__ !== 'undefined' && __DEV__;

function timestamp() {
  return new Date().toISOString();
}

export function appLog(
  area: 'api' | 'auth' | 'nav' | 'ui',
  message: string,
  details?: Record<string, unknown>,
): void {
  if (!LOG_IN_DEV) {
    return;
  }
  const prefix = `[ResearchXP] ${timestamp()} [${area}]`;
  if (details && Object.keys(details).length) {
    console.log(prefix, message, details);
  } else {
    console.log(prefix, message);
  }
}

/** Short preview for debugging without leaking a full JWT. */
export function tokenPreview(token: string | null | undefined): string {
  if (!token) {
    return '(none)';
  }
  if (token.length <= 16) {
    return '[short]';
  }
  return `${token.slice(0, 8)}…${token.slice(-6)} (len ${token.length})`;
}
