import { API_BASE_URL } from '../config/api';
import { appLog, tokenPreview } from '../utils/appLog';
import { authedFetch } from './authedFetch';
import type { RegisteredAppUser } from './registerMember';

async function readJson(
  res: Response,
): Promise<Record<string, unknown> | null> {
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

/**
 * Fetches the current member profile. Requires a valid Bearer token.
 * Returns `'account_disabled'` if the server suspended the member (403).
 */
export async function fetchMyProfile(
  token: string,
): Promise<RegisteredAppUser | 'account_disabled' | null> {
  appLog('api', 'GET /api/members/me', { token: tokenPreview(token) });
  try {
    const res = await authedFetch(`${API_BASE_URL}/api/members/me`, token, {
      method: 'GET',
    });
    const obj = await readJson(res);
    if (res.status === 403 && obj && obj.error === 'account_disabled') {
      return 'account_disabled';
    }
    if (
      res.ok &&
      obj &&
      obj.user &&
      typeof obj.user === 'object' &&
      obj.user
    ) {
      return obj.user as RegisteredAppUser;
    }
    return null;
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Network error';
    appLog('api', 'GET /api/members/me failed', { error: message });
    return null;
  }
}

export type UpdateMyProfileInput = {
  name: string;
  dob: string | null;
  education: string | null;
  skills: string[];
  hobbies: string[];
  gender: string | null;
  ethnicity: string | null;
  country: string | null;
  state: string | null;
  city: string | null;
  zip_code: string | null;
  marital_status: string | null;
};

/**
 * Updates profile (name, DOB, education, skills, hobbies). Email is not
 * accepted by the server; use a verified session only.
 */
export async function updateMyProfile(
  token: string,
  body: UpdateMyProfileInput,
): Promise<
  | { ok: true; user: RegisteredAppUser }
  | { ok: false; message: string; status: number; accountDisabled?: boolean }
> {
  appLog('api', 'PATCH /api/members/me (password omitted)', {
    token: tokenPreview(token),
    name: body.name,
  });
  try {
    const res = await authedFetch(`${API_BASE_URL}/api/members/me`, token, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: body.name,
        dob: body.dob,
        education: body.education,
        skills: body.skills,
        hobbies: body.hobbies,
        gender: body.gender,
        ethnicity: body.ethnicity,
        country: body.country,
        state: body.state,
        city: body.city,
        zip_code: body.zip_code,
        marital_status: body.marital_status,
      }),
    });
    const obj = await readJson(res);
    if (res.status === 403 && obj && obj.error === 'account_disabled') {
      return {
        ok: false,
        message:
          typeof obj.message === 'string'
            ? obj.message
            : 'Your account has been suspended.',
        status: 403,
        accountDisabled: true,
      };
    }
    if (res.ok && obj?.user && typeof obj.user === 'object') {
      return { ok: true, user: obj.user as RegisteredAppUser };
    }
    const errMsg =
      obj && typeof obj.error === 'string'
        ? obj.error
        : `Update failed (${res.status})`;
    return { ok: false, message: errMsg, status: res.status };
  } catch (e) {
    const message =
      e instanceof Error ? e.message : 'Network error. Check your connection.';
    return { ok: false, message, status: 0 };
  }
}

export async function updateMyPassword(
  token: string,
  body: { currentPassword: string; newPassword: string },
): Promise<{ ok: true } | { ok: false; message: string; status: number }> {
  appLog('api', 'PATCH /api/members/me/password (passwords omitted)', {
    token: tokenPreview(token),
  });
  try {
    const res = await authedFetch(`${API_BASE_URL}/api/members/me/password`, token, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        currentPassword: body.currentPassword,
        newPassword: body.newPassword,
      }),
    });
    const obj = await readJson(res);
    if (res.ok && obj && obj.ok === true) {
      return { ok: true };
    }
    const errMsg =
      obj && typeof obj.error === 'string'
        ? obj.error
        : `Request failed (${res.status})`;
    return { ok: false, message: errMsg, status: res.status };
  } catch (e) {
    const message =
      e instanceof Error ? e.message : 'Network error. Check your connection.';
    return { ok: false, message, status: 0 };
  }
}

/**
 * Permanently deletes the signed-in account on the server (right to erasure).
 */
export async function deleteMyAccount(
  token: string,
): Promise<{ ok: true } | { ok: false; message: string; status: number }> {
  appLog('api', 'DELETE /api/members/me', { token: tokenPreview(token) });
  try {
    const res = await authedFetch(`${API_BASE_URL}/api/members/me`, token, {
      method: 'DELETE',
    });
    const obj = await readJson(res);
    if (res.ok && obj && obj.ok === true) {
      return { ok: true };
    }
    const errMsg =
      obj && typeof obj.error === 'string'
        ? obj.error
        : `Request failed (${res.status})`;
    return { ok: false, message: errMsg, status: res.status };
  } catch (e) {
    const message =
      e instanceof Error ? e.message : 'Network error. Check your connection.';
    return { ok: false, message, status: 0 };
  }
}
