/**
 * Bearer-authenticated fetch; applies `X-New-Access-Token` from responses when present.
 * Register the handler once from `AuthProvider`.
 */
type RotationHandler = (newToken: string) => void;
type UnauthorizedHandler = () => void;

let onAccessTokenRotated: RotationHandler | null = null;
let onUnauthorized: UnauthorizedHandler | null = null;

/** 401 `error` values that mean the session is dead (not e.g. wrong current password). */
const SESSION_END_401_ERRORS = new Set([
  'token_expired',
  'token_invalid',
  'Authentication required',
]);

export function registerAccessTokenRotation(handler: RotationHandler | null): void {
  onAccessTokenRotated = handler;
}

export function registerUnauthorizedHandler(handler: UnauthorizedHandler | null): void {
  onUnauthorized = handler;
}

async function readErrorFrom401Clone(res: Response): Promise<string | null> {
  try {
    const text = await res.text();
    if (!text) {
      return null;
    }
    const data = JSON.parse(text) as unknown;
    if (data && typeof data === 'object' && 'error' in data) {
      const e = (data as Record<string, unknown>).error;
      return typeof e === 'string' ? e : null;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Like `fetch`, but sets `Authorization: Bearer <token>` and persists rotated tokens.
 */
export async function authedFetch(
  input: string,
  token: string,
  init: RequestInit = {},
): Promise<Response> {
  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${token}`);
  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }
  if (!headers.has('Cache-Control')) {
    headers.set('Cache-Control', 'no-cache');
  }
  const res = await fetch(input, { ...init, headers });
  const next = res.headers.get('x-new-access-token');
  if (next?.trim() && onAccessTokenRotated) {
    onAccessTokenRotated(next.trim());
  }
  if (res.status === 401 && onUnauthorized) {
    const err = await readErrorFrom401Clone(res.clone());
    if (err != null && SESSION_END_401_ERRORS.has(err)) {
      onUnauthorized();
    }
  }
  return res;
}
