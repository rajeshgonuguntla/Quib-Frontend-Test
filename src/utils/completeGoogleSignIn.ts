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

export const PENDING_LEARNER_START_KEY = 'cuib_pending_learner_start';
export const PENDING_LEARNER_STATE_KEY = 'cuib_pending_learner_state';

type GoogleAuthResponse = {
  expiresAt?: number;
  profile?: UserProfile | null;
  onboarding?: OnboardingState | null;
};

export type LearnerStartState = {
  youtubeUrl?: string;
  playlistUrl?: string;
  prompt?: string;
  examType?: string;
  startTool?: string;
  signInIntent?: SignInIntent;
  returnTo?: string;
  [key: string]: unknown;
};

/** Stash raw learner intent so the existing GoogleLoginButton can continue after sign-in. */
export function stashLearnerStartState(state: LearnerStartState | null | undefined): void {
  if (!state || Object.keys(state).length === 0) {
    sessionStorage.removeItem(PENDING_LEARNER_STATE_KEY);
    return;
  }
  sessionStorage.setItem(PENDING_LEARNER_STATE_KEY, JSON.stringify(state));
}

export function takeLearnerStartState(): LearnerStartState | null {
  const raw = sessionStorage.getItem(PENDING_LEARNER_STATE_KEY);
  if (!raw) return null;
  sessionStorage.removeItem(PENDING_LEARNER_STATE_KEY);
  try {
    return JSON.parse(raw) as LearnerStartState;
  } catch {
    return null;
  }
}

/** Clicks the existing hero Google Sign-In control (same account-chooser as the visible button). */
export function clickLandingGoogleSignIn(): boolean {
  const host = document.querySelector('[data-landing-google-signin]');
  if (!host) return false;

  const candidates = [
    host.querySelector<HTMLElement>('div[role="button"]'),
    host.querySelector<HTMLElement>('button'),
    host.querySelector<HTMLElement>('[tabindex="0"]'),
    host.querySelector<HTMLIFrameElement>('iframe')?.parentElement ?? null,
  ];

  for (const el of candidates) {
    if (!el) continue;
    el.click();
    return true;
  }

  (host as HTMLElement).click();
  return true;
}

export function resolveLearnerStartDestination(
  state: LearnerStartState | null | undefined,
): { path: string; state: LearnerStartState } | null {
  if (!state) return null;

  if (typeof state.prompt === 'string' && state.prompt.trim()) {
    return { path: '/quiz-setup', state };
  }

  if (typeof state.playlistUrl === 'string' && state.playlistUrl.trim()) {
    if (state.startTool === 'quiz') {
      return { path: '/playlist-setup/new', state: { playlistUrl: state.playlistUrl } };
    }
    return {
      path: '/course-builder',
      state: { youtubeUrl: state.playlistUrl, startTool: state.startTool },
    };
  }

  if (typeof state.youtubeUrl === 'string' && state.youtubeUrl.trim()) {
    if (state.startTool === 'quiz') {
      return { path: '/quiz-setup', state: { youtubeUrl: state.youtubeUrl } };
    }
    return {
      path: '/course-builder',
      state: { youtubeUrl: state.youtubeUrl, startTool: state.startTool },
    };
  }

  return null;
}

export function stashPendingLearnerStart(state: LearnerStartState | null | undefined): void {
  const pending = resolveLearnerStartDestination(state);
  if (!pending) {
    sessionStorage.removeItem(PENDING_LEARNER_START_KEY);
    return;
  }
  sessionStorage.setItem(PENDING_LEARNER_START_KEY, JSON.stringify(pending));
}

export function consumePendingLearnerStart(): { path: string; state: LearnerStartState } | null {
  const raw = sessionStorage.getItem(PENDING_LEARNER_START_KEY);
  if (!raw) return null;
  sessionStorage.removeItem(PENDING_LEARNER_START_KEY);
  try {
    return JSON.parse(raw) as { path: string; state: LearnerStartState };
  } catch {
    return null;
  }
}

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

export type CompleteGoogleSignInResult =
  | { ok: true }
  | { ok: false; error: string };

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

    const expiresAt = res.data.expiresAt;
    if (typeof expiresAt !== 'number') {
      throw new Error('Login response missing expiresAt');
    }
    setSession(expiresAt);

    let profile = res.data.profile ?? null;
    let onboarding = res.data.onboarding ?? null;

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
  } catch (error) {
    logClientError('Login failed', error);
    clearToken();
    return { ok: false, error: 'Sign-in failed. Please try again.' };
  }
}
