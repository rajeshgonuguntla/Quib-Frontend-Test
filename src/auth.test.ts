import { beforeEach, describe, expect, it, vi } from 'vitest';
import { clearLocalSession, clearToken, isTokenValid, setSession } from './auth';

vi.mock('axios', () => ({
  default: { post: vi.fn(() => Promise.resolve()) },
}));

function buildToken(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}.signature`;
}

describe('auth', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('isTokenValid returns false when no session is stored', () => {
    expect(isTokenValid()).toBe(false);
  });

  it('isTokenValid returns false for malformed leftover token', () => {
    localStorage.setItem('token', 'not-a-jwt');
    expect(isTokenValid()).toBe(false);
  });

  it('isTokenValid returns false for expired leftover token', () => {
    localStorage.setItem('token', buildToken({ exp: 1 }));
    expect(isTokenValid()).toBe(false);
  });

  it('isTokenValid returns false when leftover exp claim is missing', () => {
    localStorage.setItem('token', buildToken({ sub: 'user@test.com' }));
    expect(isTokenValid()).toBe(false);
  });

  it('isTokenValid returns true for leftover token with future exp', () => {
    const exp = Math.floor(Date.now() / 1000) + 3600;
    localStorage.setItem('token', buildToken({ exp }));
    expect(isTokenValid()).toBe(true);
  });

  it('setSession stores exp and drops leftover JWT', () => {
    const exp = Math.floor(Date.now() / 1000) + 3600;
    localStorage.setItem('token', buildToken({ exp }));
    setSession(exp);
    expect(localStorage.getItem('token')).toBeNull();
    expect(isTokenValid()).toBe(true);
  });

  it('clearToken removes session flags', () => {
    setSession(Math.floor(Date.now() / 1000) + 3600);
    clearToken();
    expect(localStorage.getItem('cuib_session_exp')).toBeNull();
    expect(isTokenValid()).toBe(false);
  });

  it('clearLocalSession does not keep a leftover JWT', () => {
    localStorage.setItem('token', buildToken({ exp: Math.floor(Date.now() / 1000) + 3600 }));
    clearLocalSession();
    expect(localStorage.getItem('token')).toBeNull();
  });
});
