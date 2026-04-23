import { API_BASE_URL } from '../config/api';
import { appLog, tokenPreview } from '../utils/appLog';
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
  appLog('api', 'POST /api/auth/login (password omitted)', { email: trimmed });
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
      appLog('api', 'login OK', {
        status: res.status,
        email: (obj.user as RegisteredAppUser).email,
        token: tokenPreview(obj.token as string),
      });
      return {
        ok: true,
        user: obj.user as RegisteredAppUser,
        token: obj.token,
      };
    }
    if (res.status === 403 && obj?.error === 'email_not_verified') {
      appLog('api', 'login needs email verification', { status: res.status, email: trimmed });
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
    appLog('api', 'login failed', { status: res.status, error: errMsg });
    return { ok: false, message: errMsg };
  } catch (e) {
    const message =
      e instanceof Error ? e.message : 'Network error. Check your connection and API URL.';
    appLog('api', 'login network error', { error: message });
    return { ok: false, message };
  }
}

export async function verifyEmailWithCode(
  email: string,
  code: string,
): Promise<VerifyEmailResult> {
  const trimmed = email.trim().toLowerCase();
  const digits = code.replace(/\D/g, '');
  appLog('api', 'POST /api/members/verify-email', {
    email: trimmed,
    codeLength: digits.length,
  });
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
      appLog('api', 'verify-email OK', {
        status: res.status,
        email: (obj.user as RegisteredAppUser).email,
        token: tokenPreview(obj.token as string),
      });
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
    appLog('api', 'verify-email failed', { status: res.status, error: errMsg });
    return { ok: false, message: errMsg };
  } catch (e) {
    const message =
      e instanceof Error ? e.message : 'Network error. Check your connection and API URL.';
    appLog('api', 'verify-email network error', { error: message });
    return { ok: false, message };
  }
}

export type ForgotPasswordRequestResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

export type ResetPasswordResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

export async function requestForgotPassword(email: string): Promise<ForgotPasswordRequestResult> {
  const trimmed = email.trim().toLowerCase();
  appLog('api', 'POST /api/auth/forgot-password', { email: trimmed });
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: trimmed }),
    });
    const obj = await parseJsonResponse(res);
    if (res.ok && obj?.ok === true && typeof obj.message === 'string') {
      return { ok: true, message: obj.message };
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

export async function resendForgotPasswordCode(email: string): Promise<ForgotPasswordRequestResult> {
  const trimmed = email.trim().toLowerCase();
  appLog('api', 'POST /api/auth/resend-reset-code', { email: trimmed });
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/resend-reset-code`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: trimmed }),
    });
    const obj = await parseJsonResponse(res);
    if (res.ok && obj?.ok === true && typeof obj.message === 'string') {
      return { ok: true, message: obj.message };
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

export async function resetPasswordWithCode(
  email: string,
  code: string,
  password: string,
): Promise<ResetPasswordResult> {
  const trimmed = email.trim().toLowerCase();
  const digits = code.replace(/\D/g, '');
  appLog('api', 'POST /api/auth/reset-password', { email: trimmed, codeLength: digits.length });
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: trimmed, code: digits, password }),
    });
    const obj = await parseJsonResponse(res);
    if (res.ok && obj?.ok === true) {
      const msg =
        typeof obj.message === 'string' ? obj.message : 'Password updated. You can sign in.';
      return { ok: true, message: msg };
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

export async function resendVerificationEmail(email: string): Promise<ResendVerificationResult> {
  const trimmed = email.trim().toLowerCase();
  appLog('api', 'POST /api/members/resend-verification', { email: trimmed });
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
      appLog('api', 'resend-verification OK', { status: res.status, email: trimmed });
      return { ok: true };
    }
    const errMsg =
      obj && typeof obj.error === 'string'
        ? obj.error
        : `Request failed (${res.status}).`;
    appLog('api', 'resend-verification failed', { status: res.status, error: errMsg });
    return { ok: false, message: errMsg };
  } catch (e) {
    const message =
      e instanceof Error ? e.message : 'Network error. Check your connection and API URL.';
    appLog('api', 'resend-verification network error', { error: message });
    return { ok: false, message };
  }
}
