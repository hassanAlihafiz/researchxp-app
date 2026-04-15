/**
 * Replace with real API calls. Demo accepts any non-empty credentials.
 * Demo MFA code: 123456
 */
export async function loginWithPassword(
  email: string,
  password: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  await delay(600);
  const trimmedEmail = email.trim().toLowerCase();
  if (!trimmedEmail || !password) {
    return { ok: false, message: 'Enter email and password.' };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    return { ok: false, message: 'Enter a valid email address.' };
  }
  return { ok: true };
}

export async function verifySecondFactorCode(code: string): Promise<boolean> {
  await delay(400);
  return /^\d{6}$/.test(code) && code === '123456';
}

function delay(ms: number) {
  return new Promise<void>(resolve => setTimeout(resolve, ms));
}
