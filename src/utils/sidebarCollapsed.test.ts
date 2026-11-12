import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  SIDEBAR_COLLAPSED_KEY,
  readSidebarCollapsed,
  writeSidebarCollapsed,
} from './sidebarCollapsed';

describe('sidebarCollapsed', () => {
  afterEach(() => {
    localStorage.removeItem(SIDEBAR_COLLAPSED_KEY);
    vi.restoreAllMocks();
  });

  it('defaults to expanded when nothing is stored', () => {
    expect(readSidebarCollapsed()).toBe(false);
  });

  it('reads stored collapsed values', () => {
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, '1');
    expect(readSidebarCollapsed()).toBe(true);
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, '0');
    expect(readSidebarCollapsed()).toBe(false);
  });

  it('persists collapsed state', () => {
    writeSidebarCollapsed(true);
    expect(localStorage.getItem(SIDEBAR_COLLAPSED_KEY)).toBe('1');
    writeSidebarCollapsed(false);
    expect(localStorage.getItem(SIDEBAR_COLLAPSED_KEY)).toBe('0');
  });

  it('falls back when storage throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(readSidebarCollapsed()).toBe(false);

    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(() => writeSidebarCollapsed(true)).not.toThrow();
  });
});
