/** Persist whether the dashboard Continue learning section is expanded. */

export const CONTINUE_LEARNING_OPEN_KEY = 'cuib_dashboard_continue_open';

export function readContinueLearningOpen(defaultOpen = true): boolean {
  try {
    const stored = localStorage.getItem(CONTINUE_LEARNING_OPEN_KEY);
    return stored == null ? defaultOpen : stored === '1';
  } catch {
    return defaultOpen;
  }
}

export function writeContinueLearningOpen(open: boolean): void {
  try {
    localStorage.setItem(CONTINUE_LEARNING_OPEN_KEY, open ? '1' : '0');
  } catch {
    /* ignore quota / private mode */
  }
}
