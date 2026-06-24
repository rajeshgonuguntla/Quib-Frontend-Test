import type { UserProfile } from '../types/userProfile';
import type { NavGroup } from '../shell/navConfig';

export const SIGN_IN_INTENT_KEY = 'quib_sign_in_intent';
export const CREATOR_HOME_PATH = '/educator-studio?tab=url';

export type SignInIntent = 'creator' | 'student';

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

export function isEducatorExperience(_profile?: UserProfile | null): boolean {
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
