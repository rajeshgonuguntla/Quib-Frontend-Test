import { describe, expect, it } from 'vitest';
import { isAdminAccount } from './signInIntent';
import type { UserProfile } from '../types/userProfile';

function profile(role: UserProfile['role']): UserProfile {
  return { role };
}

describe('isAdminAccount', () => {
  it('matches the postgres admin role only', () => {
    expect(isAdminAccount(profile('admin'))).toBe(true);
    expect(isAdminAccount(profile('educator'))).toBe(false);
    expect(isAdminAccount(profile('learner'))).toBe(false);
    expect(isAdminAccount(null)).toBe(false);
    expect(isAdminAccount(undefined)).toBe(false);
  });
});
