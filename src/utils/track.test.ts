import { describe, expect, it, vi } from 'vitest';
import { track } from './track';

describe('track', () => {
  it('does not throw', () => {
    const debug = vi.spyOn(console, 'debug').mockImplementation(() => {});
    expect(() => track('studio_opened', { courseId: 'abc' })).not.toThrow();
    debug.mockRestore();
  });
});
