import { describe, expect, it } from 'vitest';
import { getAvatarLetter, getDisplayName, getFirstName } from './userDisplay';

describe('userDisplay', () => {
  it('does not invent a Learner / there identity before profile loads', () => {
    expect(getDisplayName(null)).toBe('');
    expect(getFirstName(null)).toBe('');
    expect(getAvatarLetter(null)).toBe('');
  });

  it('uses the real profile name when loaded', () => {
    const profile = { displayName: 'Vamsi Rao', email: '18.vamsi@gmail.com' };
    expect(getDisplayName(profile)).toBe('Vamsi Rao');
    expect(getFirstName(profile)).toBe('Vamsi');
    expect(getAvatarLetter(profile)).toBe('V');
  });
});
