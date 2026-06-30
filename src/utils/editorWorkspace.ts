/** Full-bleed educator course editor — chat left, structure right. */
export function isCourseEditorRoute(pathname: string): boolean {
  return /\/educator-courses\/[^/]+\/edit$/.test(pathname);
}

/** Studio + editor — collapse app sidebar for more workspace. */
export function isEducatorWorkspaceRoute(pathname: string): boolean {
  return pathname.startsWith('/educator-studio') || isCourseEditorRoute(pathname);
}
