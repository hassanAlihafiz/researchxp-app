/** ISO 3166-1 alpha-2 for Layer 0 (spec). Expand as needed. */
export const LAYER0_COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'ES', name: 'Spain' },
  { code: 'IT', name: 'Italy' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'IN', name: 'India' },
  { code: 'BR', name: 'Brazil' },
  { code: 'MX', name: 'Mexico' },
  { code: 'JP', name: 'Japan' },
  { code: 'KR', name: 'South Korea' },
  { code: 'SG', name: 'Singapore' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'IE', name: 'Ireland' },
  { code: 'SE', name: 'Sweden' },
  { code: 'NO', name: 'Norway' },
  { code: 'DK', name: 'Denmark' },
  { code: 'FI', name: 'Finland' },
  { code: 'PL', name: 'Poland' },
  { code: 'PT', name: 'Portugal' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'AT', name: 'Austria' },
  { code: 'BE', name: 'Belgium' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'KE', name: 'Kenya' },
  { code: 'AE', name: 'United Arab Emirates' },
] as const;

export const LAYER0_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
  { code: 'pt', label: 'Português' },
] as const;

/** Spec §5.4.4: most relevant languages first for each supported country (codes ⊆ LAYER0_LANGUAGES). */
export const LAYER0_LANGUAGE_PRIORITY: Record<string, readonly string[]> = {
  US: ['en', 'es', 'fr', 'de', 'pt'],
  GB: ['en', 'fr', 'es', 'de', 'pt'],
  IE: ['en', 'fr', 'es', 'de', 'pt'],
  NZ: ['en', 'es', 'fr', 'de', 'pt'],
  AU: ['en', 'es', 'fr', 'de', 'pt'],
  CA: ['en', 'fr', 'es', 'de', 'pt'],
  MX: ['es', 'en', 'pt', 'fr', 'de'],
  BR: ['pt', 'es', 'en', 'fr', 'de'],
  PT: ['pt', 'es', 'en', 'fr', 'de'],
  FR: ['fr', 'en', 'de', 'es', 'pt'],
  BE: ['fr', 'en', 'de', 'es', 'pt'],
  DE: ['de', 'en', 'fr', 'es', 'pt'],
  AT: ['de', 'en', 'fr', 'es', 'pt'],
  CH: ['de', 'fr', 'en', 'es', 'pt'],
  ES: ['es', 'en', 'fr', 'de', 'pt'],
  IT: ['en', 'es', 'fr', 'de', 'pt'],
  NL: ['en', 'de', 'fr', 'es', 'pt'],
  IN: ['en', 'es', 'fr', 'de', 'pt'],
  JP: ['en', 'es', 'fr', 'de', 'pt'],
  KR: ['en', 'es', 'fr', 'de', 'pt'],
  SG: ['en', 'es', 'fr', 'de', 'pt'],
  SE: ['en', 'de', 'fr', 'es', 'pt'],
  NO: ['en', 'de', 'fr', 'es', 'pt'],
  DK: ['en', 'de', 'fr', 'es', 'pt'],
  FI: ['en', 'de', 'fr', 'es', 'pt'],
  PL: ['en', 'de', 'fr', 'es', 'pt'],
  ZA: ['en', 'es', 'fr', 'de', 'pt'],
  NG: ['en', 'fr', 'es', 'de', 'pt'],
  KE: ['en', 'fr', 'es', 'de', 'pt'],
  AE: ['en', 'fr', 'es', 'de', 'pt'],
};

const LANG_BY_CODE = new Map(LAYER0_LANGUAGES.map(l => [l.code, l]));

const LAYER0_COUNTRY_CODES = new Set(LAYER0_COUNTRIES.map(c => c.code));

/** True if `code` is an ISO 3166-1 alpha-2 country supported in Layer 0. */
export function isLayer0CountryCode(code: string | null | undefined): boolean {
  if (!code || code.length !== 2) {
    return false;
  }
  return LAYER0_COUNTRY_CODES.has(code.toUpperCase() as (typeof LAYER0_COUNTRIES)[number]['code']);
}

function isLayer0LangCode(code: string): code is (typeof LAYER0_LANGUAGES)[number]['code'] {
  return LANG_BY_CODE.has(code as (typeof LAYER0_LANGUAGES)[number]['code']);
}

/** Ordered language options for a country (defaults to en-first global list). */
export function layer0LanguagesForCountry(countryCode: string | null | undefined) {
  const cc = (countryCode || '').toUpperCase();
  const priority = (cc && LAYER0_LANGUAGE_PRIORITY[cc]) || ['en', 'es', 'fr', 'de', 'pt'];
  const seen = new Set<string>();
  const out: (typeof LAYER0_LANGUAGES)[number][] = [];
  for (const code of priority) {
    if (!isLayer0LangCode(code)) {
      continue;
    }
    const row = LANG_BY_CODE.get(code);
    if (row && !seen.has(code)) {
      seen.add(code);
      out.push(row);
    }
  }
  for (const row of LAYER0_LANGUAGES) {
    if (!seen.has(row.code)) {
      out.push(row);
    }
  }
  return out;
}
