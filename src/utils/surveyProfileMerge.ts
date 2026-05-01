import type { RegisteredAppUser } from '../api/registerMember';
import type { UpdateMyProfileInput } from '../api/memberProfile';
import { normalizeSurveyAttributeKey } from './surveyAttributeKey';

function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) {
    return [];
  }
  return v
    .filter((x): x is string => typeof x === 'string')
    .map(s => s.trim())
    .filter(Boolean);
}

/**
 * Maps internal survey answers into the member profile PATCH shape.
 * Unknown keys are stored as `canonicalKey:value` in `skills` (deduped).
 */
export function buildProfilePatchFromSurveyAnswers(
  user: RegisteredAppUser,
  answers: Record<string, string | string[]>,
): UpdateMyProfileInput {
  const skills = new Set(asStringArray(user.skills));
  const hobbies = new Set(asStringArray(user.hobbies));

  let dob: string | null =
    typeof user.date_of_birth === 'string' ? user.date_of_birth : null;
  let gender: string | null = user.gender ?? null;
  let country: string | null = user.country ?? null;
  let zip_code: string | null = user.zip_code ?? null;

  for (const [rawKey, val] of Object.entries(answers)) {
    const key = normalizeSurveyAttributeKey(rawKey);
    if (!key) {
      continue;
    }

    if (key === 'dob' || key === 'date_of_birth') {
      const s = Array.isArray(val) ? val[0] : val;
      if (typeof s === 'string' && s.trim()) {
        dob = s.trim();
      }
      continue;
    }
    if (key === 'gender') {
      const s = Array.isArray(val) ? val[0] : val;
      if (typeof s === 'string' && s.trim()) {
        gender = s.trim();
      }
      continue;
    }
    if (key === 'country_code' || key === 'country') {
      const s = Array.isArray(val) ? val[0] : val;
      if (typeof s === 'string' && s.trim()) {
        country = s.trim().toUpperCase();
      }
      continue;
    }
    if (key === 'zip_code' || key === 'postal_code') {
      const s = Array.isArray(val) ? val[0] : val;
      if (typeof s === 'string' && s.trim()) {
        zip_code = s.trim();
      }
      continue;
    }
    if (key === 'influence_interests' || key === 'interests') {
      const list = Array.isArray(val) ? val : typeof val === 'string' ? [val] : [];
      for (const x of list) {
        if (typeof x === 'string' && x.trim()) {
          hobbies.add(x.trim());
        }
      }
      continue;
    }

    if (Array.isArray(val)) {
      const joined = val.filter(x => typeof x === 'string' && x.trim()).join(', ');
      if (joined) {
        skills.add(`${key}:${joined}`);
      }
    } else if (typeof val === 'string' && val.trim()) {
      skills.add(`${key}:${val.trim()}`);
    }
  }

  return {
    name: user.name,
    dob,
    education: user.education ?? null,
    skills: Array.from(skills),
    hobbies: Array.from(hobbies),
    gender,
    ethnicity: user.ethnicity ?? null,
    country,
    state: user.state ?? null,
    city: user.city ?? null,
    zip_code,
    marital_status: user.marital_status ?? null,
  };
}
