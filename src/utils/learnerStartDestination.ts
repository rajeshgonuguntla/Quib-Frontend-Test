import type { SignInIntent } from './signInIntent';

export const PENDING_LEARNER_START_KEY = 'cuib_pending_learner_start';
export const PENDING_LEARNER_STATE_KEY = 'cuib_pending_learner_state';

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
