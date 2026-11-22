import { describe, expect, it } from 'vitest';
import { isStudioV2Account } from './signInIntent';
import type { UserProfile } from '../types/userProfile';

function profile(role: UserProfile['role']): UserProfile {
  return { role };
}

describe('isStudioV2Account', () => {
  it('allows only an admin', () => {
    expect(isStudioV2Account(profile('admin'))).toBe(true);
    expect(isStudioV2Account(profile('educator'))).toBe(false);
    expect(isStudioV2Account(profile('learner'))).toBe(false);
    expect(isStudioV2Account(null)).toBe(false);
    expect(isStudioV2Account(undefined)).toBe(false);
  });
});
