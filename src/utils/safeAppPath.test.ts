import { describe, expect, it } from 'vitest';
import { safeAppPath } from './safeAppPath';

describe('safeAppPath', () => {
  it('allows in-app paths and rejects off-origin', () => {
    expect(safeAppPath('/dashboard')).toBe('/dashboard');
    expect(safeAppPath('/course-details/abc?x=1#y')).toBe('/course-details/abc?x=1#y');
    expect(safeAppPath('//evil.example/phish')).toBeUndefined();
    expect(safeAppPath('https://evil.example')).toBeUndefined();
    expect(safeAppPath('dashboard')).toBeUndefined();
  });
});
