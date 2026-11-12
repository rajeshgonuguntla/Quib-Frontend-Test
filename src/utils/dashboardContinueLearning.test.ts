import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  CONTINUE_LEARNING_OPEN_KEY,
  readContinueLearningOpen,
  writeContinueLearningOpen,
} from './dashboardContinueLearning';

describe('dashboardContinueLearning', () => {
  afterEach(() => {
    localStorage.removeItem(CONTINUE_LEARNING_OPEN_KEY);
    vi.restoreAllMocks();
  });

  it('defaults to open when nothing is stored', () => {
    expect(readContinueLearningOpen()).toBe(true);
  });

  it('reads stored open and closed values', () => {
    localStorage.setItem(CONTINUE_LEARNING_OPEN_KEY, '1');
    expect(readContinueLearningOpen()).toBe(true);
    localStorage.setItem(CONTINUE_LEARNING_OPEN_KEY, '0');
    expect(readContinueLearningOpen()).toBe(false);
  });

  it('persists open state', () => {
    writeContinueLearningOpen(false);
    expect(localStorage.getItem(CONTINUE_LEARNING_OPEN_KEY)).toBe('0');
    writeContinueLearningOpen(true);
    expect(localStorage.getItem(CONTINUE_LEARNING_OPEN_KEY)).toBe('1');
  });

  it('falls back when storage throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(readContinueLearningOpen()).toBe(true);

    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(() => writeContinueLearningOpen(false)).not.toThrow();
  });
});
