/** Hide the dashboard greeting after the learner opens chat, until the next login. */

export const DASHBOARD_WELCOME_KEY = 'cuib_dashboard_welcome_session';

export function isWelcomeDismissed(sessionKey: string): boolean {
  try {
    return sessionStorage.getItem(DASHBOARD_WELCOME_KEY) === sessionKey;
  } catch {
    return false;
  }
}

export function dismissDashboardWelcome(sessionKey: string): void {
  try {
    sessionStorage.setItem(DASHBOARD_WELCOME_KEY, sessionKey);
  } catch {
    /* ignore quota / private mode */
  }
}
