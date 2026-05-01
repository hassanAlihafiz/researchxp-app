import { API_BASE_URL } from '../config/api';
import { appLog, tokenPreview } from '../utils/appLog';
import { authedFetch } from './authedFetch';

export type SurveyScreenFieldOption = { label: string; value: string };

export type SurveyScreenField = {
  id: number;
  screen_id: number;
  field_order: number;
  step_key: string | null;
  attribute_key: string | null;
  input_type: string;
  field_label: string | null;
  placeholder: string | null;
  options: SurveyScreenFieldOption[];
  widget: string | null;
  config: Record<string, unknown>;
  is_active: boolean;
};

export type SurveyScreen = {
  id: number;
  survey_key: string;
  project_id: number;
  screen_order: number;
  headline: string;
  subhead: string | null;
  why_this: string | null;
  widget: string | null;
  skippable: boolean;
  is_active: boolean;
  fields: SurveyScreenField[];
};

export type SurveyStartPayload = {
  assignment_id: number;
  project_id: number;
  project_code: string;
  unique_id: string;
  internal_questions: boolean;
  survey_url: string | null;
  screens: SurveyScreen[] | null;
};

function parseFieldOption(raw: unknown): SurveyScreenFieldOption | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }
  const o = raw as Record<string, unknown>;
  const label = typeof o.label === 'string' ? o.label : null;
  const value = typeof o.value === 'string' ? o.value : null;
  if (label == null || value == null) {
    return null;
  }
  return { label, value };
}

function parseField(raw: unknown): SurveyScreenField | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }
  const o = raw as Record<string, unknown>;
  const id = Number(o.id);
  const screenId = Number(o.screen_id);
  if (!Number.isFinite(id) || !Number.isFinite(screenId)) {
    return null;
  }
  const optsRaw = o.options;
  const options: SurveyScreenFieldOption[] = Array.isArray(optsRaw)
    ? optsRaw.map(parseFieldOption).filter((x): x is SurveyScreenFieldOption => x != null)
    : [];
  const config =
    o.config && typeof o.config === 'object' && !Array.isArray(o.config)
      ? (o.config as Record<string, unknown>)
      : {};
  return {
    id,
    screen_id: screenId,
    field_order: Number(o.field_order) || 0,
    step_key: typeof o.step_key === 'string' ? o.step_key : null,
    attribute_key: typeof o.attribute_key === 'string' ? o.attribute_key : null,
    input_type: typeof o.input_type === 'string' ? o.input_type : 'text',
    field_label: typeof o.field_label === 'string' ? o.field_label : null,
    placeholder: typeof o.placeholder === 'string' ? o.placeholder : null,
    options,
    widget: typeof o.widget === 'string' ? o.widget : null,
    config,
    is_active: o.is_active !== false,
  };
}

function parseScreen(raw: unknown): SurveyScreen | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }
  const o = raw as Record<string, unknown>;
  const id = Number(o.id);
  const projectId = Number(o.project_id);
  if (!Number.isFinite(id) || !Number.isFinite(projectId)) {
    return null;
  }
  const fieldsRaw = o.fields;
  const fields: SurveyScreenField[] = Array.isArray(fieldsRaw)
    ? fieldsRaw.map(parseField).filter((x): x is SurveyScreenField => x != null)
    : [];
  return {
    id,
    survey_key: typeof o.survey_key === 'string' ? o.survey_key : '',
    project_id: projectId,
    screen_order: Number(o.screen_order) || 0,
    headline: typeof o.headline === 'string' ? o.headline : '',
    subhead: typeof o.subhead === 'string' ? o.subhead : null,
    why_this: typeof o.why_this === 'string' ? o.why_this : null,
    widget: typeof o.widget === 'string' ? o.widget : null,
    skippable: o.skippable !== false,
    is_active: o.is_active !== false,
    fields,
  };
}

function parseSurveyStartPayload(raw: Record<string, unknown>): SurveyStartPayload | null {
  const assignmentId = Number(raw.assignment_id);
  const projectId = Number(raw.project_id);
  if (!Number.isFinite(assignmentId) || !Number.isFinite(projectId)) {
    return null;
  }
  const screensRaw = raw.screens;
  const screens: SurveyScreen[] | null = Array.isArray(screensRaw)
    ? screensRaw.map(parseScreen).filter((x): x is SurveyScreen => x != null)
    : null;
  const uniqueId = typeof raw.unique_id === 'string' ? raw.unique_id.trim() : '';
  if (!uniqueId) {
    return null;
  }
  return {
    assignment_id: assignmentId,
    project_id: projectId,
    project_code: typeof raw.project_code === 'string' ? raw.project_code : '',
    unique_id: uniqueId,
    internal_questions: raw.internal_questions === true,
    survey_url:
      typeof raw.survey_url === 'string' && raw.survey_url.trim()
        ? raw.survey_url.trim()
        : null,
    screens: screens && screens.length ? screens : null,
  };
}

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

export type SurveyStartResult =
  | { ok: true; data: SurveyStartPayload }
  | { ok: false; message: string; status: number; accountDisabled?: boolean };

/**
 * Authenticated: reserves participant id, returns native schema or external `survey_url`.
 */
export async function fetchSurveyStart(
  token: string,
  assignmentId: number,
): Promise<SurveyStartResult> {
  appLog('api', 'GET /survey/start/:id', {
    token: tokenPreview(token),
    assignmentId,
  });
  try {
    const res = await authedFetch(
      `${API_BASE_URL}/survey/start/${assignmentId}`,
      token,
      { method: 'GET' },
    );
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
    if (!res.ok) {
      const errMsg =
        obj && typeof obj.error === 'string'
          ? obj.error
          : `Request failed (${res.status})`;
      return { ok: false, message: errMsg, status: res.status };
    }
    if (!obj) {
      return { ok: false, message: 'Invalid response from server.', status: res.status };
    }
    const data = parseSurveyStartPayload(obj);
    if (!data) {
      return { ok: false, message: 'Invalid survey start payload.', status: res.status };
    }
    return { ok: true, data };
  } catch (e) {
    const message =
      e instanceof Error ? e.message : 'Network error. Check your connection and API URL.';
    return { ok: false, message, status: 0 };
  }
}

/**
 * Public GET — marks internal participant complete and triggers rewards (same as vendor callback).
 */
export async function requestSurveyCompleteSuccess(
  projectId: number,
  uniqueId: string,
): Promise<{ ok: true; json: unknown } | { ok: false; message: string; status: number }> {
  const q = new URLSearchParams({
    project_id: String(projectId),
    status: 'success',
    unique_id: uniqueId,
  });
  const url = `${API_BASE_URL}/survey/complete?${q.toString()}`;
  appLog('api', 'GET /survey/complete (success)', { projectId, uniqueIdPreview: uniqueId.slice(0, 4) });
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json', 'Cache-Control': 'no-cache' },
    });
    const text = await res.text();
    let json: unknown = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      json = null;
    }
    if (!res.ok) {
      const msg =
        json &&
        typeof json === 'object' &&
        typeof (json as Record<string, unknown>).message === 'string'
          ? String((json as Record<string, unknown>).message)
          : `Complete failed (${res.status})`;
      return { ok: false, message: msg, status: res.status };
    }
    return { ok: true, json };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Network error';
    return { ok: false, message, status: 0 };
  }
}
