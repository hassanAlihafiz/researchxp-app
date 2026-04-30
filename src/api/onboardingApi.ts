import { API_BASE_URL } from '../config/api';
import { authedFetch } from './authedFetch';
import type { RegisteredAppUser } from './registerMember';
import { parseAssignmentRow, type MemberSurveyAssignment } from './memberSurveyAssignments';
import { appLog } from '../utils/appLog';

export type CompleteLayer0Payload = {
  phone: string;
  smsCode: string;
  archetype: string;
  country: string;
  primaryLanguage: string;
  consentVersion: string;
};

export async function completeLayer0(
  token: string,
  payload: CompleteLayer0Payload,
): Promise<
  { ok: true; user: RegisteredAppUser } | { ok: false; message: string; status: number }
> {
  appLog('api', 'POST /api/members/me/onboarding/complete-layer0', {});
  try {
    const res = await authedFetch(
      `${API_BASE_URL}/api/members/me/onboarding/complete-layer0`,
      token,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      },
    );
    const text = await res.text();
    let data: unknown = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      return { ok: false, message: 'Invalid response from server.', status: res.status };
    }
    const obj = data && typeof data === 'object' ? (data as Record<string, unknown>) : null;
    if (res.ok && obj?.user && typeof obj.user === 'object') {
      return { ok: true, user: obj.user as RegisteredAppUser };
    }
    const errMsg =
      obj && typeof obj.error === 'string' ? obj.error : `Request failed (${res.status})`;
    return { ok: false, message: errMsg, status: res.status };
  } catch (e) {
    const message =
      e instanceof Error ? e.message : 'Network error. Check your connection and API URL.';
    return { ok: false, message, status: 0 };
  }
}

/** Twilio Verify when configured on server; otherwise server returns mock mode (no SMS). */
export async function startPhoneVerification(
  token: string,
  phone: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  try {
    const res = await authedFetch(
      `${API_BASE_URL}/api/members/me/onboarding/start-phone-verification`,
      token,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      },
    );
    const text = await res.text();
    let data: unknown = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      return { ok: false, message: 'Invalid response from server.' };
    }
    const obj = data && typeof data === 'object' ? (data as Record<string, unknown>) : null;
    if (res.ok && obj?.ok === true) {
      return { ok: true };
    }
    const errMsg =
      obj && typeof obj.error === 'string' ? obj.error : `Request failed (${res.status})`;
    return { ok: false, message: errMsg };
  } catch (e) {
    const message =
      e instanceof Error ? e.message : 'Network error. Check your connection and API URL.';
    return { ok: false, message };
  }
}

async function readJsonObj(res: Response): Promise<Record<string, unknown> | null> {
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

/** GeoIP default country (ISO2) when server has Ipdata configured; else null. */
export async function fetchOnboardingGeoHint(token: string): Promise<string | null> {
  try {
    const res = await authedFetch(
      `${API_BASE_URL}/api/members/me/onboarding/geo-hint`,
      token,
      { method: 'GET' },
    );
    const obj = await readJsonObj(res);
    if (!res.ok || !obj) {
      return null;
    }
    const raw = obj.countryCode;
    if (typeof raw !== 'string' || raw.length !== 2) {
      return null;
    }
    return raw.toUpperCase();
  } catch {
    return null;
  }
}

export type ClaimWelcomeMomentResult =
  | {
      ok: true;
      user: RegisteredAppUser;
      walletCredited: boolean;
      welcomeBonusCents: number;
      assignment: MemberSurveyAssignment | null;
    }
  | { ok: false; message: string; status: number };

/** §5.4.7: one-time wallet credit + best assignment (idempotent). */
export async function claimWelcomeMoment(token: string): Promise<ClaimWelcomeMomentResult> {
  appLog('api', 'POST /api/members/me/onboarding/claim-welcome-moment', {});
  try {
    const res = await authedFetch(
      `${API_BASE_URL}/api/members/me/onboarding/claim-welcome-moment`,
      token,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' },
    );
    const obj = await readJsonObj(res);
    if (res.ok && obj?.user && typeof obj.user === 'object') {
      const assignmentRaw = obj.assignment;
      const assignment =
        assignmentRaw && typeof assignmentRaw === 'object'
          ? parseAssignmentRow(assignmentRaw as Record<string, unknown>)
          : null;
      return {
        ok: true,
        user: obj.user as RegisteredAppUser,
        walletCredited: obj.walletCredited === true,
        welcomeBonusCents:
          typeof obj.welcomeBonusCents === 'number' && Number.isFinite(obj.welcomeBonusCents)
            ? obj.welcomeBonusCents
            : 0,
        assignment,
      };
    }
    const errMsg =
      obj && typeof obj.error === 'string' ? obj.error : `Request failed (${res.status})`;
    return { ok: false, message: errMsg, status: res.status };
  } catch (e) {
    const message =
      e instanceof Error ? e.message : 'Network error. Check your connection and API URL.';
    return { ok: false, message, status: 0 };
  }
}

export type ImpactCardApiPayload =
  | { show: false }
  | { show: true; estimated_value_cents: number; earnings_today_cents: number };

export async function fetchImpactCard(token: string): Promise<ImpactCardApiPayload | null> {
  try {
    const res = await authedFetch(
      `${API_BASE_URL}/api/members/me/onboarding/impact-card`,
      token,
      { method: 'GET' },
    );
    const obj = await readJsonObj(res);
    if (!res.ok || !obj || typeof obj.show !== 'boolean') {
      return null;
    }
    if (!obj.show) {
      return { show: false };
    }
    const ev = Number(obj.estimated_value_cents);
    const et = Number(obj.earnings_today_cents);
    return {
      show: true,
      estimated_value_cents: Number.isFinite(ev) ? ev : 0,
      earnings_today_cents: Number.isFinite(et) ? et : 0,
    };
  } catch {
    return null;
  }
}

export async function dismissImpactCardRequest(
  token: string,
): Promise<RegisteredAppUser | null> {
  try {
    const res = await authedFetch(
      `${API_BASE_URL}/api/members/me/onboarding/dismiss-impact-card`,
      token,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' },
    );
    const obj = await readJsonObj(res);
    if (res.ok && obj?.user && typeof obj.user === 'object') {
      return obj.user as RegisteredAppUser;
    }
    return null;
  } catch {
    return null;
  }
}
