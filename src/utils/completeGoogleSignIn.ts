import axios from 'axios';
import type { NavigateFunction } from 'react-router';
import type { CredentialResponse } from '@react-oauth/google';
import { fetchUserProfile } from '../api/userApi';
import { fetchOnboarding } from '../api/catalogApi';
import { clearLocalSession, clearToken, setSession } from '../auth';
import { logClientError } from './logClientError';
import { INTERESTS_KEY, EDUCATORS_KEY } from '../components/Onboarding';
import type { UserProfile } from '../types/userProfile';
import type { OnboardingState } from '../types/catalog';
import {
  CREATOR_FLOW_ENABLED,
  EDUCATOR_USE_CREATOR_LOGIN_MESSAGE,
  isEducatorAccount,
  isEducatorRoute,
  resolveDefaultDestination,
  setSignInIntent,
  type SignInIntent,
} from './signInIntent';
import { peekReferralCode, rememberReferralCode } from './referralCode';
import { safeAppPath } from './safeAppPath';
import {
  PENDING_LEARNER_START_KEY,
  resolveLearnerStartDestination,
  stashPendingLearnerStart,
  type LearnerStartState,
} from './learnerStartDestination';

export {
  PENDING_LEARNER_START_KEY,
  PENDING_LEARNER_STATE_KEY,
  clickLandingGoogleSignIn,
  consumePendingLearnerStart,
  resolveLearnerStartDestination,
  stashLearnerStartState,
  stashPendingLearnerStart,
  takeLearnerStartState,
  type LearnerStartState,
} from './learnerStartDestination';

type GoogleAuthResponse = {
  expiresAt?: number;
  profile?: UserProfile | null;
  onboarding?: OnboardingState | null;
};

type FinishSessionArgs = {
  auth: GoogleAuthResponse;
  navigate: NavigateFunction;
  setProfile: (profile: UserProfile | null) => void;
  signInIntent?: SignInIntent;
  pendingState?: LearnerStartState | null;
  onBlocked?: (message: string) => void;
};

export type CompleteGoogleSignInResult =
  | { ok: true }
  | { ok: false; error: string };

type CompleteGoogleSignInArgs = {
  credentialResponse: CredentialResponse;
  navigate: NavigateFunction;
  setProfile: (profile: UserProfile | null) => void;
  signInIntent?: SignInIntent;
  /** Pending learner action + any location state to preserve. */
  pendingState?: LearnerStartState | null;
  search?: string;
  onBlocked?: (message: string) => void;
};

async function finishAuthenticatedSession({
  auth,
  navigate,
  setProfile,
  signInIntent,
  pendingState,
  onBlocked,
}: FinishSessionArgs): Promise<CompleteGoogleSignInResult> {
  const expiresAt = auth.expiresAt;
  if (typeof expiresAt !== 'number') {
    throw new Error('Login response missing expiresAt');
  }
  setSession(expiresAt);

  let profile = auth.profile ?? null;
  let onboarding = auth.onboarding ?? null;

  if (!profile || !onboarding) {
    const [fallbackProfile, fallbackOnboarding] = await Promise.all([
      profile ? Promise.resolve(profile) : fetchUserProfile(),
      onboarding ? Promise.resolve(onboarding) : fetchOnboarding().catch(() => null),
    ]);
    profile = fallbackProfile;
    onboarding = fallbackOnboarding;
  }

  const requestedIntent: SignInIntent = signInIntent ?? pendingState?.signInIntent ?? 'student';
  const intent: SignInIntent = CREATOR_FLOW_ENABLED ? requestedIntent : 'student';

  if (CREATOR_FLOW_ENABLED && intent === 'student' && isEducatorAccount(profile)) {
    clearToken();
    onBlocked?.(EDUCATOR_USE_CREATOR_LOGIN_MESSAGE);
    return { ok: false, error: EDUCATOR_USE_CREATOR_LOGIN_MESSAGE };
  }

  setProfile(profile);

  const effectiveIntent: SignInIntent =
    CREATOR_FLOW_ENABLED && isEducatorAccount(profile) ? 'creator' : intent;
  setSignInIntent(effectiveIntent);

  let destination = safeAppPath(
    typeof pendingState?.returnTo === 'string' ? pendingState.returnTo : undefined,
  );

  if (effectiveIntent === 'student' && destination && isEducatorRoute(destination)) {
    destination = undefined;
  }

  const learnerStart = resolveLearnerStartDestination(pendingState);
  let navState: LearnerStartState = {
    ...(pendingState ?? {}),
    signInIntent: effectiveIntent,
  };

  if (onboarding?.completed) {
    localStorage.setItem(INTERESTS_KEY, JSON.stringify(onboarding.interestIds ?? []));
    localStorage.setItem(EDUCATORS_KEY, JSON.stringify(onboarding.followedCreatorIds ?? []));
    if (learnerStart) {
      destination = learnerStart.path;
      navState = { ...navState, ...learnerStart.state };
      sessionStorage.removeItem(PENDING_LEARNER_START_KEY);
    } else if (!destination) {
      destination = resolveDefaultDestination(profile, effectiveIntent, true);
    }
  } else {
    if (learnerStart) {
      stashPendingLearnerStart(learnerStart.state);
    }
    if (!destination) {
      const hasInterests = !!localStorage.getItem(INTERESTS_KEY);
      destination = resolveDefaultDestination(
        profile,
        effectiveIntent,
        onboarding ? onboarding.completed : hasInterests,
      );
    }
  }

  navigate(destination, { state: navState });
  return { ok: true };
}

export async function completeGoogleSignIn({
  credentialResponse,
  navigate,
  setProfile,
  signInIntent,
  pendingState,
  search = '',
  onBlocked,
}: CompleteGoogleSignInArgs): Promise<CompleteGoogleSignInResult> {
  if (!credentialResponse.credential) {
    return { ok: false, error: 'Login failed — missing Google credential.' };
  }

  try {
    clearLocalSession();

    const referralCode = peekReferralCode()
      ?? new URLSearchParams(search.startsWith('?') ? search.slice(1) : search).get('ref')
      ?? undefined;
    rememberReferralCode(referralCode);

    const res = await axios.post<GoogleAuthResponse>('/api/auth/google', {
      token: credentialResponse.credential,
      referralCode,
    });

    return await finishAuthenticatedSession({
      auth: res.data,
      navigate,
      setProfile,
      signInIntent,
      pendingState,
      onBlocked,
    });
  } catch (error) {
    logClientError('Login failed', error);
    clearToken();
    return { ok: false, error: 'Sign-in failed. Please try again.' };
  }
}
