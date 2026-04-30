import type { RegisteredAppUser } from '../api/registerMember';

/**
 * Whether the user must complete Layer 0 in the app (spec onboarding) before Main.
 * Legacy accounts (demographics captured at signup) skip this when `gender` is set.
 */
export function userNeedsLayer0(
  user: RegisteredAppUser | null | undefined,
): boolean {
  if (!user) {
    return false;
  }
  if (user.layer0_completed_at) {
    return false;
  }
  if (user.gender || user.ethnicity || user.zip_code) {
    return false;
  }
  return true;
}

/**
 * Value primer + welcome moment (§5.4.7): after Layer 0, before Main, until welcome credit is claimed.
 */
export function userNeedsPostLayer0Welcome(
  user: RegisteredAppUser | null | undefined,
): boolean {
  if (!user?.layer0_completed_at) {
    return false;
  }
  if (user.welcome_bonus_credited_at) {
    return false;
  }
  return true;
}
