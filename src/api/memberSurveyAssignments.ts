import { API_BASE_URL } from '../config/api';
import { appLog, tokenPreview } from '../utils/appLog';
import { authedFetch } from './authedFetch';

export type MemberSurveyAssignment = {
  id: string | number;
  project_id: number;
  status: string | null;
  reward_points: number | null;
  reward_amount: string | number | null;
  completed_at: string | null;
  project_code: string | null;
  project_name: string | null;
  project_survey_name: string | null;
  survey_url: string | null;
};

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

export function parseAssignmentRow(
  row: unknown,
): MemberSurveyAssignment | null {
  if (!row || typeof row !== 'object') {
    return null;
  }
  const o = row as Record<string, unknown>;
  if (o.id == null || o.project_id == null) {
    return null;
  }
  const projectId = Number(o.project_id);
  if (!Number.isFinite(projectId)) {
    return null;
  }
  return {
    id: o.id as string | number,
    project_id: projectId,
    status:
      typeof o.status === 'string'
        ? o.status
        : o.status == null
          ? null
          : String(o.status),
    reward_points:
      o.reward_points == null || o.reward_points === ''
        ? null
        : Number(o.reward_points),
    reward_amount: (o.reward_amount ?? null) as string | number | null,
    completed_at: typeof o.completed_at === 'string' ? o.completed_at : null,
    project_code:
      o.project_code == null || o.project_code === ''
        ? null
        : String(o.project_code),
    project_name: typeof o.project_name === 'string' ? o.project_name : null,
    project_survey_name:
      typeof o.project_survey_name === 'string' ? o.project_survey_name : null,
    survey_url: typeof o.survey_url === 'string' ? o.survey_url : null,
  };
}

function parseAssignments(raw: unknown): MemberSurveyAssignment[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  const out: MemberSurveyAssignment[] = [];
  for (const row of raw) {
    const a = parseAssignmentRow(row);
    if (a) {
      out.push(a);
    }
  }
  return out;
}

/**
 * Loads `app_member_survey_assignments` for the signed-in member.
 */
export async function fetchMySurveyAssignments(
  token: string,
): Promise<MemberSurveyAssignment[] | 'account_disabled' | null> {
  appLog('api', 'GET /api/members/me/survey-assignments', {
    token: tokenPreview(token),
  });
  try {
    const res = await authedFetch(
      `${API_BASE_URL}/api/members/me/survey-assignments`,
      token,
      { method: 'GET' },
    );
    const obj = await readJson(res);
    if (res.status === 403 && obj && obj.error === 'account_disabled') {
      return 'account_disabled';
    }
    if (res.ok && obj && Array.isArray(obj.assignments)) {
      return parseAssignments(obj.assignments);
    }
    return null;
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Network error';
    appLog('api', 'GET /api/members/me/survey-assignments failed', {
      error: message,
    });
    return null;
  }
}
