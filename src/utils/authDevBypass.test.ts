import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  clearLocalDevBypassSession,
  isAuthDevBypassEnabled,
  isLocalDevBypassSession,
  markLocalDevBypassSession,
  readLocalDevBypassProfile,
} from './authDevBypass';

describe('authDevBypass', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    clearLocalDevBypassSession();
  });

  it('follows VITE_AUTH_DEV_BYPASS when running under Vite DEV', () => {
    expect(import.meta.env.DEV).toBe(true);

    vi.stubEnv('VITE_AUTH_DEV_BYPASS', undefined);
    expect(isAuthDevBypassEnabled()).toBe(true);

    vi.stubEnv('VITE_AUTH_DEV_BYPASS', 'false');
    expect(isAuthDevBypassEnabled()).toBe(false);

    vi.stubEnv('VITE_AUTH_DEV_BYPASS', 'true');
    expect(isAuthDevBypassEnabled()).toBe(true);
  });

  it('stores and clears a local bypass session', () => {
    expect(isLocalDevBypassSession()).toBe(false);
    markLocalDevBypassSession();
    expect(isLocalDevBypassSession()).toBe(true);
    expect(readLocalDevBypassProfile()?.email).toBe('local.dev@cubit.local');
    clearLocalDevBypassSession();
    expect(isLocalDevBypassSession()).toBe(false);
  });
});
