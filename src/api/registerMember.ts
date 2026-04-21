import { API_BASE_URL } from '../config/api';

export type RegisterMemberPayload = {
  name: string;
  email: string;
  password: string;
  /** YYYY-MM-DD or omit / empty for null */
  dob?: string | null;
  education?: string | null;
  skills?: string[];
  hobbies?: string[];
};

export type RegisteredAppUser = {
  id: string | number;
  name: string;
  email: string;
  date_of_birth: string | null;
  education: string | null;
  skills: unknown;
  hobbies: unknown;
  created_at: string;
};

export type RegisterMemberResult =
  | { ok: true; user: RegisteredAppUser }
  | { ok: false; message: string };

export async function registerMember(
  payload: RegisterMemberPayload,
): Promise<RegisterMemberResult> {
  const body: Record<string, unknown> = {
    name: payload.name.trim(),
    email: payload.email.trim().toLowerCase(),
    password: payload.password,
    skills: payload.skills ?? [],
    hobbies: payload.hobbies ?? [],
  };

  const dob = payload.dob?.trim();
  if (dob) {
    body.dob = dob;
  }

  const education = payload.education?.trim();
  if (education) {
    body.education = education;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/members`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const text = await res.text();
    let data: unknown = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      return {
        ok: false,
        message: 'Invalid response from server.',
      };
    }

    const obj = data && typeof data === 'object' ? (data as Record<string, unknown>) : null;

    if (res.ok && obj && 'user' in obj && obj.user && typeof obj.user === 'object') {
      return { ok: true, user: obj.user as RegisteredAppUser };
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
