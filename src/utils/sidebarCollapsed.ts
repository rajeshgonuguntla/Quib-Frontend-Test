/** Persist whether the signed-in app sidebar is collapsed to an icon rail. */

export const SIDEBAR_COLLAPSED_KEY = 'cuib_sidebar_collapsed';

export function readSidebarCollapsed(defaultCollapsed = false): boolean {
  try {
    const stored = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    return stored == null ? defaultCollapsed : stored === '1';
  } catch {
    return defaultCollapsed;
  }
}

export function writeSidebarCollapsed(collapsed: boolean): void {
  try {
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, collapsed ? '1' : '0');
  } catch {
    /* ignore quota / private mode */
  }
}
