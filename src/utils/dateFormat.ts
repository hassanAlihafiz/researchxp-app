/** Local calendar date as YYYY-MM-DD (for APIs / forms). */
export function toIsoDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Human-friendly date in the user’s locale (for pickers / display). */
export function formatDateDisplay(d: Date): string {
  try {
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return toIsoDateString(d);
  }
}

/** Display a calendar date stored as YYYY-MM-DD (e.g. API `date_of_birth`). */
/** Parse API `YYYY-MM-DD` to a local calendar `Date` (for pickers). */
export function parseIsoDateToLocal(
  iso: string | null | undefined,
): Date | null {
  if (!iso || !/^\d{4}-\d{2}-\d{2}/.test(iso)) {
    return null;
  }
  const y = Number.parseInt(iso.slice(0, 4), 10);
  const m = Number.parseInt(iso.slice(5, 7), 10) - 1;
  const d = Number.parseInt(iso.slice(8, 10), 10);
  if (Number.isNaN(y) || Number.isNaN(m) || Number.isNaN(d)) {
    return null;
  }
  return new Date(y, m, d);
}

export function formatIsoDateStringForDisplay(
  iso: string | null | undefined,
): string {
  if (!iso || !/^\d{4}-\d{2}-\d{2}/.test(iso)) {
    return '—';
  }
  const y = Number.parseInt(iso.slice(0, 4), 10);
  const m = Number.parseInt(iso.slice(5, 7), 10) - 1;
  const d = Number.parseInt(iso.slice(8, 10), 10);
  if (
    Number.isNaN(y) ||
    Number.isNaN(m) ||
    Number.isNaN(d) ||
    m < 0 ||
    m > 11
  ) {
    return '—';
  }
  return formatDateDisplay(new Date(y, m, d));
}
