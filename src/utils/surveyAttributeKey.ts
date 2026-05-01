/** Strip trailing qualifiers like ` (date, ISO 8601)` from server `attribute_key`. */
export function normalizeSurveyAttributeKey(raw: string | null | undefined): string {
  if (!raw) {
    return '';
  }
  const s = raw.trim();
  const paren = s.indexOf(' (');
  return (paren >= 0 ? s.slice(0, paren) : s).trim().toLowerCase();
}
