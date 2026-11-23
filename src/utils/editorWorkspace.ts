import { STUDIO_V2_ENABLED } from '../config/features';

/** Full-bleed educator course editor — chat left, structure right. */
export function isCourseEditorRoute(pathname: string): boolean {
  return /\/educator-courses\/[^/]+\/edit$/.test(pathname);
}

/** Course thread and the legacy studio page hide the sidebar. Studio v2 keeps `/educator-studio` in the shell. */
export function isEducatorWorkspaceRoute(pathname: string): boolean {
  if (isCourseEditorRoute(pathname)) return true;
  if (/^\/educator-studio\/[^/]+/.test(pathname)) return true;
  if (!STUDIO_V2_ENABLED && pathname.startsWith('/educator-studio')) return true;
  return false;
}
