import type { UserProfile } from '../types/userProfile';
import { isAdminAccount } from './signInIntent';

/** Full-bleed educator course editor — chat left, structure right. */
export function isCourseEditorRoute(pathname: string): boolean {
  return /\/educator-courses\/[^/]+\/edit$/.test(pathname);
}

export function isStudioPath(pathname: string): boolean {
  return pathname === '/educator-studio' || pathname.startsWith('/educator-studio/');
}

/** Admins get the studio frame. Everyone else keeps the existing studio chrome. */
export function isStudioV2Route(pathname: string, profile?: UserProfile | null): boolean {
  return isAdminAccount(profile) && isStudioPath(pathname);
}

/** Studio and the course editor hide the app sidebar. */
export function isEducatorWorkspaceRoute(pathname: string): boolean {
  return isCourseEditorRoute(pathname) || isStudioPath(pathname);
}
