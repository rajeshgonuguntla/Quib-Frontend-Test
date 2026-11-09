import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../auth', () => ({
  isTokenValid: vi.fn(() => false),
}));

import { CREATOR_FLOW_ENABLED } from './signInIntent';
import { goToSignIn, SIGN_IN_HASH_PATH, SIGN_IN_PATH } from './navigation';

describe('sign-in navigation helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('points guests at the landing hero when creator flow is off', () => {
    expect(CREATOR_FLOW_ENABLED).toBe(false);
    expect(SIGN_IN_PATH).toBe('/');
    expect(SIGN_IN_HASH_PATH).toBe('/#ask');
  });

  it('goToSignIn navigates home with ask hash and state', () => {
    const navigate = vi.fn();
    goToSignIn(navigate, { returnTo: '/dashboard' });
    expect(navigate).toHaveBeenCalledWith(
      { pathname: '/', hash: 'ask' },
      { state: { returnTo: '/dashboard' } },
    );
  });
});
