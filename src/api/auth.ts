import { API_BASE_URL } from '../config/api';
import type { RegisteredAppUser } from './registerMember';

export type LoginResult =
  | { ok: true; user: RegisteredAppUser; token: string }
  | { ok: false; message: string; needsVerification?: boolean };

export type VerifyEmailResult =
  | { ok: true; user: RegisteredAppUser; token: string }
  | { ok: false; message: string };

export type ResendVerificationResult =
  | { ok: true }
  | { ok: false; message: string };

async function parseJsonResponse(res: Response): Promise<Record<string, unknown> | null> {
  const text = await res.text();
  if (!text) {
    return null;
  }
  try {
    const data = JSON.parse(text);
    return data && typeof data === 'object' ? (data as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

export async function loginWithPassword(
  email: string,
  password: string,
): Promise<LoginResult> {
  const trimmed = email.trim().toLowerCase();
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: trimmed, password }),
    });
    const obj = await parseJsonResponse(res);
    if (res.ok && obj && typeof obj.token === 'string' && obj.user && typeof obj.user === 'object') {
      return {
        ok: true,
        user: obj.user as RegisteredAppUser,
        token: obj.token,
      };
    }
    if (res.status === 403 && obj?.error === 'email_not_verified') {
      return {
        ok: false,
        message:
          typeof obj.message === 'string'
            ? obj.message
            : 'Please verify your email first.',
        needsVerification: true,
      };
    }
    const errMsg =
      obj && typeof obj.error === 'string'
        ? obj.error
        : `Sign in failed (${res.status}).`;
    return { ok: false, message: errMsg };
  } catch (e) {
    const message =
      e instanceof Error ? e.message : 'Network error. Check your connection and API URL.';
    return { ok: false, message };
  }
}

export async function verifyEmailWithCode(
  email: string,
  code: string,
): Promise<VerifyEmailResult> {
  const trimmed = email.trim().toLowerCase();
  const digits = code.replace(/\D/g, '');
  try {
    const res = await fetch(`${API_BASE_URL}/api/members/verify-email`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: trimmed, code: digits }),
    });
    const obj = await parseJsonResponse(res);
    if (res.ok && obj && typeof obj.token === 'string' && obj.user && typeof obj.user === 'object') {
      return {
        ok: true,
        user: obj.user as RegisteredAppUser,
        token: obj.token,
      };
    }
    const errMsg =
      obj && typeof obj.error === 'string'
        ? obj.error
        : `Verification failed (${res.status}).`;
    return { ok: false, message: errMsg };
  } catch (e) {
    const message =
      e instanceof Error ? e.message : 'Network error. Check your connection and API URL.';
    return { ok: false, message };
  }
}

export async function resendVerificationEmail(email: string): Promise<ResendVerificationResult> {
  const trimmed = email.trim().toLowerCase();
  try {
    const res = await fetch(`${API_BASE_URL}/api/members/resend-verification`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: trimmed }),
    });
    const obj = await parseJsonResponse(res);
    if (res.ok) {
      return { ok: true };
    }
    const errMsg =
      obj && typeof obj.error === 'string'
        ? obj.error
        : `Request failed (${res.status}).`;
    return { ok: false, message: errMsg };
  } catch (e) {
    const message =
      e instanceof Error ? e.message : 'Network error. Check your connection and API URL.';
    return { ok: false, message };
  }
}
