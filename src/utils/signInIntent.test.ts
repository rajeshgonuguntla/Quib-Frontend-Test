import { describe, expect, it } from 'vitest';
import { isAdminAccount, isEducatorAccount } from './signInIntent';
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

describe('isEducatorAccount', () => {
  it('gives educators the same studio access as admins', () => {
    expect(isEducatorAccount(profile('admin'))).toBe(true);
    expect(isEducatorAccount(profile('educator'))).toBe(true);
    expect(isEducatorAccount(profile('learner'))).toBe(false);
    expect(isEducatorAccount(null)).toBe(false);
    expect(isEducatorAccount(undefined)).toBe(false);
  });
});
