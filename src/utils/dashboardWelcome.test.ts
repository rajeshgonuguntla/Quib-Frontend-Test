import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  DASHBOARD_WELCOME_KEY,
  dismissDashboardWelcome,
  isWelcomeDismissed,
} from './dashboardWelcome';

describe('dashboardWelcome', () => {
  afterEach(() => {
    sessionStorage.removeItem(DASHBOARD_WELCOME_KEY);
    vi.restoreAllMocks();
  });

  it('shows the greeting until this login dismisses it', () => {
    expect(isWelcomeDismissed('session-a')).toBe(false);
    dismissDashboardWelcome('session-a');
    expect(isWelcomeDismissed('session-a')).toBe(true);
  });

  it('shows the greeting again after a new login', () => {
    dismissDashboardWelcome('session-a');
    expect(isWelcomeDismissed('session-b')).toBe(false);
  });

  it('keeps the greeting when storage is blocked', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(isWelcomeDismissed('session-a')).toBe(false);

    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(() => dismissDashboardWelcome('session-a')).not.toThrow();
  });
});
