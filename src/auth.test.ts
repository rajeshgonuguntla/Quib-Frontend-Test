import { beforeEach, describe, expect, it } from 'vitest';
import { clearToken, isTokenValid } from './auth';

function buildToken(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}.signature`;
}

describe('auth', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('isTokenValid returns false when no token is stored', () => {
    expect(isTokenValid()).toBe(false);
  });

  it('isTokenValid returns false for malformed token', () => {
    localStorage.setItem('token', 'not-a-jwt');
    expect(isTokenValid()).toBe(false);
  });

  it('isTokenValid returns false for expired token', () => {
    localStorage.setItem('token', buildToken({ exp: 1 }));
    expect(isTokenValid()).toBe(false);
  });

  it('isTokenValid returns false when exp claim is missing', () => {
    localStorage.setItem('token', buildToken({ sub: 'user@test.com' }));
    expect(isTokenValid()).toBe(false);
  });

  it('isTokenValid returns true for token with future exp', () => {
    const exp = Math.floor(Date.now() / 1000) + 3600;
    localStorage.setItem('token', buildToken({ exp }));
    expect(isTokenValid()).toBe(true);
  });

  it('clearToken removes stored token', () => {
    localStorage.setItem('token', buildToken({ exp: Math.floor(Date.now() / 1000) + 3600 }));
    clearToken();
    expect(localStorage.getItem('token')).toBeNull();
  });
});
