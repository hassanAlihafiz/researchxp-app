import { API_BASE_URL } from '../config/api';
import { appLog, tokenPreview } from '../utils/appLog';
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
 */
export async function fetchMyProfile(
  token: string,
): Promise<RegisteredAppUser | null> {
  appLog('api', 'GET /api/members/me', { token: tokenPreview(token) });
  try {
    const res = await fetch(`${API_BASE_URL}/api/members/me`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    const obj = await readJson(res);
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
};

/**
 * Updates profile (name, DOB, education, skills, hobbies). Email is not
 * accepted by the server; use a verified session only.
 */
export async function updateMyProfile(
  token: string,
  body: UpdateMyProfileInput,
): Promise<
  { ok: true; user: RegisteredAppUser } | { ok: false; message: string; status: number }
> {
  appLog('api', 'PATCH /api/members/me (password omitted)', {
    token: tokenPreview(token),
    name: body.name,
  });
  try {
    const res = await fetch(`${API_BASE_URL}/api/members/me`, {
      method: 'PATCH',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: body.name,
        dob: body.dob,
        education: body.education,
        skills: body.skills,
        hobbies: body.hobbies,
      }),
    });
    const obj = await readJson(res);
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
