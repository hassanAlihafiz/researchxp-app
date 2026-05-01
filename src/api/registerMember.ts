import { API_BASE_URL } from '../config/api';
import { appLog } from '../utils/appLog';

export type RegisterMemberPayload = {
  name: string;
  email: string;
  password: string;
  /** YYYY-MM-DD or omit / empty for null */
  dob?: string | null;
  education?: string | null;
  skills?: string[];
  hobbies?: string[];
  gender: string;
  ethnicity: string;
  country: string;
  state: string;
  city: string;
  /** Postal / ZIP code */
  zip_code: string;
  marital_status: string;
};

export type RegisteredAppUser = {
  id: string | number;
  name: string;
  email: string;
  /** Present once DB migration `003_app_users_verification` is applied. */
  verified?: boolean;
  date_of_birth: string | null;
  education: string | null;
  skills: unknown;
  hobbies: unknown;
  gender: string | null;
  ethnicity: string | null;
  country: string | null;
  state: string | null;
  city: string | null;
  zip_code: string | null;
  marital_status: string | null;
  created_at: string;
  /** Set when Layer 0 onboarding is finished (spec). */
  layer0_completed_at?: string | null;
  /** Set after POST claim-welcome-moment (value primer / suggested first study). */
  welcome_moment_claimed_at?: string | null;
  /** Set when the configured first survey is completed and the one-time bonus is credited. */
  welcome_bonus_credited_at?: string | null;
  first_study_completed_at?: string | null;
  impact_card_dismissed_at?: string | null;
  archetype?: string | null;
  primary_language?: string | null;
  consent_version?: string | null;
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
    gender: payload.gender.trim(),
    ethnicity: payload.ethnicity.trim(),
    country: payload.country.trim(),
    state: payload.state.trim(),
    city: payload.city.trim(),
    zip_code: payload.zip_code.trim(),
    marital_status: payload.marital_status.trim(),
  };

  const dob = payload.dob?.trim();
  if (dob) {
    body.dob = dob;
  }

  const education = payload.education?.trim();
  if (education) {
    body.education = education;
  }

  appLog('api', 'POST /api/members (password omitted)', {
    email: body.email,
    name: body.name,
  });
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
      const u = obj.user as RegisteredAppUser;
      appLog('api', 'register OK', { status: res.status, email: u.email, verified: u.verified });
      return { ok: true, user: u };
    }

    const errMsg =
      obj && typeof obj.error === 'string'
        ? obj.error
        : `Request failed (${res.status}).`;
    appLog('api', 'register failed', { status: res.status, error: errMsg });
    return { ok: false, message: errMsg };
  } catch (e) {
    const message =
      e instanceof Error ? e.message : 'Network error. Check your connection and API URL.';
    appLog('api', 'register network error', { error: message });
    return { ok: false, message };
  }
}

/** Layer 0 spec: email + password + display name only; demographics come later. */
export async function registerMemberMinimal(payload: {
  name: string;
  email: string;
  password: string;
}): Promise<RegisterMemberResult> {
  const body = {
    name: payload.name.trim(),
    email: payload.email.trim().toLowerCase(),
    password: payload.password,
    minimal: true,
  };
  appLog('api', 'POST /api/members minimal (password omitted)', {
    email: body.email,
    name: body.name,
  });
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
      const u = obj.user as RegisteredAppUser;
      appLog('api', 'register minimal OK', {
        status: res.status,
        email: u.email,
        verified: u.verified,
      });
      return { ok: true, user: u };
    }

    const errMsg =
      obj && typeof obj.error === 'string'
        ? obj.error
        : `Request failed (${res.status}).`;
    appLog('api', 'register minimal failed', { status: res.status, error: errMsg });
    return { ok: false, message: errMsg };
  } catch (e) {
    const message =
      e instanceof Error ? e.message : 'Network error. Check your connection and API URL.';
    appLog('api', 'register minimal network error', { error: message });
    return { ok: false, message };
  }
}
