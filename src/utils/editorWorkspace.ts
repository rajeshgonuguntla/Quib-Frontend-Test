import { STUDIO_V2_ENABLED } from '../config/features';

/** Full-bleed educator course editor — chat left, structure right. */
export function isCourseEditorRoute(pathname: string): boolean {
  return /\/educator-courses\/[^/]+\/edit$/.test(pathname);
}

export function isStudioPath(pathname: string): boolean {
  return pathname === '/educator-studio' || pathname.startsWith('/educator-studio/');
}

/** Studio v2 replaces the app chrome with the studio frame on every studio route. */
export function isStudioV2Route(pathname: string): boolean {
  return STUDIO_V2_ENABLED && isStudioPath(pathname);
}

/** Studio and the course editor hide the app sidebar. */
export function isEducatorWorkspaceRoute(pathname: string): boolean {
  return isCourseEditorRoute(pathname) || isStudioPath(pathname);
}
