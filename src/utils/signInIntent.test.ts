import { describe, expect, it } from 'vitest';
import { isAdminAccount, isEducatorAccount, resolveDefaultDestination } from './signInIntent';
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
    expect(isEducatorAccount(profile('student'))).toBe(false);
    expect(isEducatorAccount(null)).toBe(false);
    expect(isEducatorAccount(undefined)).toBe(false);
  });
});

describe('resolveDefaultDestination', () => {
  it('sends a finished learner home and a creator to Cubit Studio', () => {
    expect(resolveDefaultDestination(profile('learner'), 'student', true)).toBe('/dashboard');
    expect(resolveDefaultDestination(profile('educator'), 'student', true)).toBe('/educator-studio');
    expect(resolveDefaultDestination(profile('admin'), 'student', true)).toBe('/educator-studio');
    expect(resolveDefaultDestination(null, 'student', true)).toBe('/dashboard');
  });
});
