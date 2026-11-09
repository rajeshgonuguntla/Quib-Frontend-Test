import type { NavigateFunction } from 'react-router';
import { isTokenValid } from '../auth';
import { CREATOR_FLOW_ENABLED } from './signInIntent';

/** Guest auth destination. Student Google CTA lives on the landing hero below search. */
export const SIGN_IN_PATH = CREATOR_FLOW_ENABLED ? '/signin' : '/';

/** Landing hero anchor that holds the Google sign-in button. */
export const SIGN_IN_HASH_PATH = CREATOR_FLOW_ENABLED ? '/signin' : '/#ask';

export function goToSignIn(
  navigate: NavigateFunction,
  state?: Record<string, unknown>,
) {
  if (CREATOR_FLOW_ENABLED) {
    navigate('/signin', { state });
    return;
  }
  navigate({ pathname: '/', hash: 'ask' }, { state });
}

export function goToEducatorStudio(navigate: NavigateFunction, tab?: 'url' | 'channel') {
  const path = tab === 'url' ? '/educator-studio?tab=url' : '/educator-studio';
  if (isTokenValid()) {
    navigate(path);
  } else {
    goToSignIn(navigate, { returnTo: path });
  }
}

export function goToProtectedPath(navigate: NavigateFunction, path: string) {
  if (isTokenValid()) {
    navigate(path);
  } else {
    goToSignIn(navigate, { returnTo: path });
  }
}

export function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
