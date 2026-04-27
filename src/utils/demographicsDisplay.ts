import {
  ETHNICITY_OPTION_VALUES,
  GENDER_OPTION_VALUES,
  MARITAL_OPTION_VALUES,
} from '../constants/demographicSelectOptions';

/**
 * Resolves a stored slug to a localized label; legacy free-text values pass through.
 */
export function displayDemographicLabel(
  value: string | null | undefined,
  group: 'gender' | 'ethnicity' | 'marital',
  known: readonly string[],
  t: (key: string) => string,
  emptyDisplay: string,
): string {
  const s = value?.trim();
  if (!s) {
    return emptyDisplay;
  }
  if (!known.includes(s)) {
    return s;
  }
  return t(`demographics.${group}.${s}`);
}

export function displayGender(
  value: string | null | undefined,
  t: (key: string) => string,
  emptyDisplay: string,
): string {
  return displayDemographicLabel(
    value,
    'gender',
    GENDER_OPTION_VALUES,
    t,
    emptyDisplay,
  );
}

export function displayEthnicity(
  value: string | null | undefined,
  t: (key: string) => string,
  emptyDisplay: string,
): string {
  return displayDemographicLabel(
    value,
    'ethnicity',
    ETHNICITY_OPTION_VALUES,
    t,
    emptyDisplay,
  );
}

export function displayMarital(
  value: string | null | undefined,
  t: (key: string) => string,
  emptyDisplay: string,
): string {
  return displayDemographicLabel(
    value,
    'marital',
    MARITAL_OPTION_VALUES,
    t,
    emptyDisplay,
  );
}
