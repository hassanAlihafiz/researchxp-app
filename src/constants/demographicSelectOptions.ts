/** Stored in API as these English slugs (stable for matching). */

export const GENDER_OPTION_VALUES = [
  'woman',
  'man',
  'non_binary',
  'transgender',
  'intersex',
  'prefer_not',
] as const;

export const ETHNICITY_OPTION_VALUES = [
  'asian',
  'black_or_african_american',
  'hispanic_or_latino',
  'middle_eastern_or_north_african',
  'american_indian_or_alaska_native',
  'native_hawaiian_or_pacific_islander',
  'white',
  'two_or_more_races',
  'other',
  'prefer_not',
] as const;

export const MARITAL_OPTION_VALUES = [
  'single',
  'married',
  'domestic_partnership',
  'divorced',
  'widowed',
  'separated',
  'prefer_not',
] as const;

export type GenderValue = (typeof GENDER_OPTION_VALUES)[number];
export type EthnicityValue = (typeof ETHNICITY_OPTION_VALUES)[number];
export type MaritalValue = (typeof MARITAL_OPTION_VALUES)[number];
