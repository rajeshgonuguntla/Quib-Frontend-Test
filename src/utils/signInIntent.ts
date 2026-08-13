import type { UserProfile } from '../types/userProfile';
import type { NavGroup } from '../shell/navConfig';

export const SIGN_IN_INTENT_KEY = 'quib_sign_in_intent';
export const CREATOR_HOME_PATH = '/educator-studio?tab=url';

/**
 * Master switch for creator / educator product surface (sign-in card, studio nav, educator routes).
 * ponytail: set true to restore creator flow without digging through call sites.
 */
export const CREATOR_FLOW_ENABLED = false;

export type SignInIntent = 'creator' | 'student';

export const EDUCATOR_USE_CREATOR_LOGIN_MESSAGE =
  'This Google account is registered as an educator. Please sign in using the creator option (left card).';

const EDUCATOR_NAV_IDS = new Set(['studio', 'my-courses-educator', 'educator-analytics']);
const ADMIN_NAV_IDS = new Set(['admin-insights']);

export function setSignInIntent(intent: SignInIntent): void {
  localStorage.setItem(SIGN_IN_INTENT_KEY, CREATOR_FLOW_ENABLED ? intent : 'student');
}

export function getSignInIntent(): SignInIntent | null {
  if (!CREATOR_FLOW_ENABLED) return 'student';
  const value = localStorage.getItem(SIGN_IN_INTENT_KEY);
  return value === 'creator' || value === 'student' ? value : null;
}

export function clearSignInIntent(): void {
  localStorage.removeItem(SIGN_IN_INTENT_KEY);
}

/** Cuib platform administrators only — not educators. */
export function isAdminAccount(profile?: UserProfile | null): boolean {
  return profile?.role === 'admin';
}

/** Backend role — educator accounts always get creator tooling in the app. */
export function isEducatorAccount(profile?: UserProfile | null): boolean {
  return profile?.role === 'educator' || profile?.role === 'admin';
}

/**
 * Show educator nav and allow educator routes when the user is an educator/admin,
 * or when a learner signed in via the creator path to build their first course.
 */
export function isEducatorExperience(profile?: UserProfile | null): boolean {
  if (!CREATOR_FLOW_ENABLED) return false;
  if (isEducatorAccount(profile)) {
    return true;
  }
  return getSignInIntent() === 'creator';
}

export function isEducatorRoute(path: string): boolean {
  return path.startsWith('/educator-studio')
    || path.startsWith('/educator-courses')
    || path.startsWith('/educator-analytics');
}

export function filterNavGroups(groups: NavGroup[], showEducatorNav: boolean, profile?: UserProfile | null): NavGroup[] {
  return groups.map((group) => ({
    ...group,
    items: group.items.filter((item) => {
      if (ADMIN_NAV_IDS.has(item.id)) {
        return isAdminAccount(profile);
      }
      if (EDUCATOR_NAV_IDS.has(item.id)) {
        return showEducatorNav;
      }
      return true;
    }),
  }));
}

export function resolveDefaultDestination(
  profile: UserProfile | null | undefined,
  intent: SignInIntent,
  onboardingCompleted: boolean,
): string {
  if (!onboardingCompleted) {
    return '/onboarding';
  }
  if (!CREATOR_FLOW_ENABLED) {
    return '/dashboard';
  }
  if (isEducatorAccount(profile)) {
    return '/dashboard';
  }
  if (intent === 'creator') {
    return CREATOR_HOME_PATH;
  }
  return '/dashboard';
}
