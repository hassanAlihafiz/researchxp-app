import type { MessageBranch } from './types';

export function getStringAtPath(
  branch: MessageBranch | undefined,
  path: string,
): string | undefined {
  if (!branch) {
    return undefined;
  }
  const parts = path.split('.');
  let cur: string | MessageBranch | undefined = branch;
  for (const p of parts) {
    if (cur === undefined || typeof cur === 'string') {
      return undefined;
    }
    cur = cur[p];
  }
  return typeof cur === 'string' ? cur : undefined;
}

export function interpolate(
  template: string,
  vars?: Record<string, string | number>,
): string {
  if (!vars) {
    return template;
  }
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    vars[key] !== undefined ? String(vars[key]) : `{${key}}`,
  );
}
