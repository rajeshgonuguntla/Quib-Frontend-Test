import { beforeEach, describe, expect, it, vi } from 'vitest';
import { clearLocalSession, clearToken, isTokenValid, setSession } from './auth';

vi.mock('axios', () => ({
  default: { post: vi.fn(() => Promise.resolve()) },
}));

describe('auth', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('isTokenValid returns false when no session is stored', () => {
    expect(isTokenValid()).toBe(false);
  });

  it('isTokenValid returns false for expired session exp', () => {
    localStorage.setItem('cuib_session_exp', '1');
    expect(isTokenValid()).toBe(false);
  });

  it('isTokenValid returns true for future session exp', () => {
    const exp = Math.floor(Date.now() / 1000) + 3600;
    localStorage.setItem('cuib_session_exp', String(exp));
    expect(isTokenValid()).toBe(true);
  });

  it('setSession stores exp and never stores a bearer JWT', () => {
    const exp = Math.floor(Date.now() / 1000) + 3600;
    localStorage.setItem('token', 'leftover-jwt');
    setSession(exp);
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('cuib_session_exp')).toBe(String(exp));
    expect(isTokenValid()).toBe(true);
  });

  it('clearToken removes session flags', () => {
    setSession(Math.floor(Date.now() / 1000) + 3600);
    clearToken();
    expect(localStorage.getItem('cuib_session_exp')).toBeNull();
    expect(isTokenValid()).toBe(false);
  });

  it('clearLocalSession does not keep a leftover JWT', () => {
    localStorage.setItem('token', 'leftover-jwt');
    clearLocalSession();
    expect(localStorage.getItem('token')).toBeNull();
  });
});
