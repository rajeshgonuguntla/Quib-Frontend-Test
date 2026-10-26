import { describe, expect, it } from 'vitest';
import { moduleIndexFromX } from './ModuleKickerNav';

describe('moduleIndexFromX', () => {
  it('stays on the same module for a small drag', () => {
    expect(moduleIndexFromX(90, 100, 0, 300, 3)).toBe(0);
  });

  it('advances when swiping left past the threshold', () => {
    expect(moduleIndexFromX(0, 100, 0, 300, 3)).toBe(1);
  });

  it('goes back when swiping right past the threshold', () => {
    expect(moduleIndexFromX(200, 100, 1, 300, 3)).toBe(0);
  });

  it('clamps at the first and last module', () => {
    expect(moduleIndexFromX(200, 100, 0, 300, 3)).toBe(0);
    expect(moduleIndexFromX(0, 400, 2, 300, 3)).toBe(2);
  });

  it('returns 0 when there is one module', () => {
    expect(moduleIndexFromX(0, 200, 0, 300, 1)).toBe(0);
  });
});
