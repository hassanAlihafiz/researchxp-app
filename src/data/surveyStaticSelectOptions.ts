import type { SelectOption } from '../components/SelectField';
import { LAYER0_COUNTRIES } from '../constants/layer0Countries';

/** ISO2 `value`, English `label` — used when `country_code` field has empty `options`. */
export function countryCodeSelectOptions(): SelectOption[] {
  return LAYER0_COUNTRIES.map(c => ({ value: c.code, label: c.name }));
}

/** Used when `income_band` has empty `options`. */
export const INCOME_BAND_OPTIONS: SelectOption[] = [
  { value: 'under_25k', label: 'Under $25,000' },
  { value: '25k_49k', label: '$25,000 – $49,999' },
  { value: '50k_74k', label: '$50,000 – $74,999' },
  { value: '75k_99k', label: '$75,000 – $99,999' },
  { value: '100k_149k', label: '$100,000 – $149,999' },
  { value: '150k_plus', label: '$150,000+' },
  { value: 'prefer_not_say', label: 'Prefer not to say' },
];
