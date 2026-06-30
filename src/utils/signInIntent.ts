import type { UserProfile } from '../types/userProfile';
import type { NavGroup } from '../shell/navConfig';

export const SIGN_IN_INTENT_KEY = 'quib_sign_in_intent';
export const CREATOR_HOME_PATH = '/educator-studio?tab=url';

export type SignInIntent = 'creator' | 'student';

export const EDUCATOR_USE_CREATOR_LOGIN_MESSAGE =
  'This Google account is registered as an educator. Please sign in using the creator option (left card).';

const EDUCATOR_NAV_IDS = new Set(['studio', 'my-courses-educator']);

export function setSignInIntent(intent: SignInIntent): void {
  localStorage.setItem(SIGN_IN_INTENT_KEY, intent);
}

export function getSignInIntent(): SignInIntent | null {
  const value = localStorage.getItem(SIGN_IN_INTENT_KEY);
  return value === 'creator' || value === 'student' ? value : null;
}

export function clearSignInIntent(): void {
  localStorage.removeItem(SIGN_IN_INTENT_KEY);
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
  if (isEducatorAccount(profile)) {
    return true;
  }
  return getSignInIntent() === 'creator';
}

export function isEducatorRoute(path: string): boolean {
  return path.startsWith('/educator-studio') || path.startsWith('/educator-courses');
}

export function filterNavGroups(groups: NavGroup[], showEducatorNav: boolean): NavGroup[] {
  if (showEducatorNav) return groups;
  return groups.map((group) => ({
    ...group,
    items: group.items.filter((item) => !EDUCATOR_NAV_IDS.has(item.id)),
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
  if (isEducatorAccount(profile)) {
    return '/dashboard';
  }
  if (intent === 'creator') {
    return CREATOR_HOME_PATH;
  }
  return '/dashboard';
}
