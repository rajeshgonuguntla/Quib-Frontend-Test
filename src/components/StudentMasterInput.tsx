import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { ArrowRight, Upload } from 'lucide-react';
import {
  getYoutubeUrlValidationError,
  isYoutubePlaylistUrl,
  isYoutubeVideoUrl,
} from '../utils/youtubeUrl';
import {
  STUDENT_UPLOAD_ENABLED,
  STUDENT_YOUTUBE_INPUT_ENABLED,
} from '../utils/studentInputModes';
import { cn } from './ui/utils';
import { useUserProfile } from '../context/UserProfileContext';
import { useTheme } from './ThemeContext';
import {
  clickLandingGoogleSignIn,
  completeGoogleSignIn,
  stashLearnerStartState,
  type LearnerStartState,
} from '../utils/completeGoogleSignIn';
import {
  LEARNER_START_TABS,
  isLearnerStartModeReady,
  type LearnerStartMode,
  type SampleExamType,
} from '../utils/learnerStartMode';

export type { LearnerStartMode, SampleExamType } from '../utils/learnerStartMode';
export {
  LEARNER_START_TABS,
  isLearnerStartModeReady,
  studyToolFromStartMode,
} from '../utils/learnerStartMode';

const COURSE_PHRASES = [
  'Paste a YouTube URL to create a course',
  'youtube.com/watch?v=…',
  'Or a playlist URL (list=…)',
];

const NOTES_PHRASES = [
  'Paste a YouTube URL for notes',
  'youtube.com/watch?v=…',
  'Or a playlist URL (list=…)',
];

const FLASHCARD_PHRASES = [
  'Paste a YouTube URL for flashcards',
  'youtube.com/watch?v=…',
  'Or a playlist URL (list=…)',
];

const QUIZ_PHRASES = [
  'SAT math: linear equations',
  'GRE verbal: analogies',
  'Test me on photosynthesis',
  'Or paste a YouTube URL',
];

const EXAM_TYPES: { id: SampleExamType; label: string }[] = [
  { id: 'custom', label: 'Custom' },
  { id: 'sat', label: 'SAT' },
  { id: 'gre', label: 'GRE' },
];

type StudentMasterInputProps = {
  className?: string;
  signedIn?: boolean;
};

function VideoGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M10 9l5 3-5 3z" />
    </svg>
  );
}

export function StudentMasterInput({ className, signedIn = true }: StudentMasterInputProps) {
  const navigate = useNavigate();
  const { setProfile } = useUserProfile();
  const { isDark } = useTheme();
  const [mode, setMode] = useState<LearnerStartMode>('course');
  const [examType, setExamType] = useState<SampleExamType>('custom');
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);
  const [phText, setPhText] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const pendingRef = useRef<LearnerStartState | null>(null);
  const phraseIdx = useRef(0);
  const activeRef = useRef(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isQuizMode = mode === 'quiz';
  const isNotesMode = mode === 'notes';
  const isFlashcardsMode = mode === 'flashcards';
  const showTypewriter = !focused && !inputValue.trim();
  const phrases = isQuizMode
    ? QUIZ_PHRASES
    : isNotesMode
      ? NOTES_PHRASES
      : isFlashcardsMode
        ? FLASHCARD_PHRASES
        : COURSE_PHRASES;

  useEffect(() => {
    phraseIdx.current = 0;
  }, [mode]);

  useEffect(() => {
    if (!showTypewriter) {
      activeRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
      setPhText('');
      return;
    }

    activeRef.current = true;
    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        timerRef.current = setTimeout(resolve, ms);
      });

    const loop = async () => {
      while (activeRef.current) {
        const phrase = phrases[phraseIdx.current % phrases.length]!;
        for (let i = 0; i <= phrase.length; i++) {
          if (!activeRef.current) return;
          setPhText(phrase.slice(0, i));
          await wait(55);
        }
        await wait(1800);
        if (!activeRef.current) return;
        for (let i = phrase.length; i >= 0; i--) {
          if (!activeRef.current) return;
          setPhText(phrase.slice(0, i));
          await wait(30);
        }
        await wait(200);
        phraseIdx.current = (phraseIdx.current + 1) % phrases.length;
      }
    };

    void loop();
    return () => {
      activeRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [showTypewriter, phrases]);

  const buildGuestPending = (): { ok: true; pending: LearnerStartState } | { ok: false; error: string } => {
    const trimmed = inputValue.trim();
    if (!trimmed) {
      return { ok: true, pending: { signInIntent: 'student' } };
    }

    if (isQuizMode) {
      const isYt = isYoutubePlaylistUrl(trimmed) || isYoutubeVideoUrl(trimmed);
      if (isYt) {
        return {
          ok: true,
          pending: isYoutubePlaylistUrl(trimmed)
            ? { playlistUrl: trimmed, startTool: mode, signInIntent: 'student' }
            : { youtubeUrl: trimmed, startTool: mode, signInIntent: 'student' },
        };
      }
      if (trimmed.length < 8) {
        return { ok: false, error: 'Describe what you want to be tested on (or paste a YouTube URL).' };
      }
      return {
        ok: true,
        pending: { prompt: trimmed, examType, startTool: 'quiz', signInIntent: 'student' },
      };
    }

    const validationError = getYoutubeUrlValidationError(inputValue);
    if (validationError) {
      return { ok: false, error: validationError };
    }
    return {
      ok: true,
      pending: isYoutubePlaylistUrl(trimmed)
        ? { playlistUrl: trimmed, startTool: mode, signInIntent: 'student' }
        : { youtubeUrl: trimmed, startTool: mode, signInIntent: 'student' },
    };
  };

  const rememberGuestPending = () => {
    const built = buildGuestPending();
    if (!built.ok) {
      setError(built.error);
      return false;
    }
    setError(null);
    pendingRef.current = built.pending;
    stashLearnerStartState(built.pending);
    return true;
  };

  const finishGoogleCredential = async (credentialResponse: CredentialResponse) => {
    setIsSigningIn(true);
    setError(null);
    const result = await completeGoogleSignIn({
      credentialResponse,
      navigate,
      setProfile,
      signInIntent: 'student',
      pendingState: pendingRef.current,
    });
    if (!result.ok) {
      setError(result.error);
    }
    setIsSigningIn(false);
  };

  /** Landing hero: open the same Google account chooser as the Continue with Google control. */
  const openLandingGoogleChooser = () => {
    if (!rememberGuestPending()) return;
    requestAnimationFrame(() => {
      clickLandingGoogleSignIn();
    });
  };

  const submitInput = (e?: FormEvent) => {
    e?.preventDefault();
    if (!isLearnerStartModeReady(mode)) return;

    const trimmed = inputValue.trim();

    if (!signedIn) {
      openLandingGoogleChooser();
      return;
    }

    if (isQuizMode) {
      const isYt = isYoutubePlaylistUrl(trimmed) || isYoutubeVideoUrl(trimmed);
      if (isYt) {
        setError(null);
        if (isYoutubePlaylistUrl(trimmed)) {
          navigate('/playlist-setup/new', { state: { playlistUrl: trimmed } });
          return;
        }
        navigate('/quiz-setup', { state: { youtubeUrl: trimmed } });
        return;
      }

      if (trimmed.length < 8) {
        setError('Describe what you want to be tested on (or paste a YouTube URL).');
        return;
      }
      setError(null);
      navigate('/quiz-setup', { state: { prompt: trimmed, examType, startTool: 'quiz' as const } });
      return;
    }

    const validationError = getYoutubeUrlValidationError(inputValue);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    navigate('/course-builder', { state: { youtubeUrl: trimmed, startTool: mode } });
  };

  if (!STUDENT_YOUTUBE_INPUT_ENABLED) return null;

  return (
    <div className={className}>
      {isSigningIn && (
        <div
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center gap-4"
          style={{ background: 'rgba(8,8,11,0.85)', backdropFilter: 'blur(8px)' }}
        >
          <div
            className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: 'rgba(255,122,26,0.35)', borderTopColor: '#ff7a1a' }}
          />
          <p className="text-sm font-medium text-white/80">Signing you in…</p>
          <p className="text-xs text-white/45">Almost there</p>
        </div>
      )}

      <div className="relative pt-5">
        <div
          className="absolute inset-x-2 top-0 z-0 flex h-8 items-start gap-0.5 overflow-x-auto rounded-t-[14px] border border-b-0 border-[var(--border)] bg-[var(--fill)] px-1.5 pt-1 [scrollbar-width:none]"
          role="tablist"
          aria-label="What do you want to create"
        >
          {LEARNER_START_TABS.map((tab) => {
            const active = mode === tab.id;
            const ready = isLearnerStartModeReady(tab.id);
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                aria-disabled={!ready}
                disabled={!ready}
                title={ready ? undefined : 'Coming soon'}
                onClick={() => {
                  if (!ready) return;
                  setMode(tab.id);
                }}
                className="flex h-[18px] shrink-0 items-center rounded-md px-2 text-[10.5px] tracking-[-0.01em] transition-colors disabled:cursor-default disabled:opacity-45"
                style={{
                  fontWeight: active ? 600 : 500,
                  color: active ? 'var(--ink)' : 'var(--ink-soft)',
                  background: active ? 'var(--surface)' : 'transparent',
                  boxShadow: active ? 'inset 0 0 0 1px var(--border)' : 'none',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <form
          onSubmit={submitInput}
          className={cn(
            'relative z-[1] flex min-h-12 items-center overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]',
            'shadow-[var(--shadow)]',
          )}
        >
          <div className="flex shrink-0 items-center justify-center pl-3 pr-2 text-[var(--ink-faint)]">
            <VideoGlyph />
          </div>

          <div className="relative flex min-w-0 flex-1 items-center overflow-hidden">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                if (error) setError(null);
              }}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder=" "
              className="relative z-[1] w-full bg-transparent py-[13px] text-[13px] outline-none"
              style={{
                fontFamily: 'var(--mono)',
                color: 'var(--ink)',
                caretColor: 'var(--accent)',
              }}
              aria-label={
                isQuizMode
                  ? 'Test topic or YouTube URL'
                  : isNotesMode
                    ? 'YouTube URL for notes'
                    : isFlashcardsMode
                      ? 'YouTube URL for flashcards'
                      : 'YouTube URL to create a course'
              }
              autoComplete="off"
              // Never use inputMode=url — iOS URL keyboard has no space bar (blocks prompt text).
              inputMode="text"
              enterKeyHint="go"
            />
            {showTypewriter && (
              <div className="pointer-events-none absolute inset-y-0 left-0 z-0 flex items-center gap-0.5 overflow-hidden whitespace-nowrap" aria-hidden>
                <span className="truncate text-[13px] text-[var(--ink-faint)]" style={{ fontFamily: 'var(--mono)' }}>{phText}</span>
                <span className="inline-block h-[13px] w-[1.5px] shrink-0 animate-pulse bg-[var(--ink-faint)]" />
              </div>
            )}
          </div>

          {isQuizMode ? (
            <div className="mr-1 flex shrink-0 items-center gap-0.5">
              {EXAM_TYPES.map((opt) => {
                const active = examType === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setExamType(opt.id)}
                    className="flex h-6 shrink-0 items-center rounded-full px-2 text-[10px] transition-colors"
                    style={{
                      fontWeight: active ? 700 : 600,
                      color: active ? 'var(--accent)' : 'var(--ink-soft)',
                      background: 'transparent',
                      border: active ? '1px solid var(--accent)' : '1px solid transparent',
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          ) : null}

          {STUDENT_UPLOAD_ENABLED && (
            <>
              <div className="h-[22px] w-px shrink-0 bg-[var(--border)]" aria-hidden />
              <button
                type="button"
                title="Upload"
                onClick={() => fileRef.current?.click()}
                className="flex size-11 shrink-0 items-center justify-center text-[var(--ink-faint)] transition-colors hover:bg-[var(--border)] hover:text-[var(--ink)]"
              >
                <Upload size={16} strokeWidth={1.8} />
              </button>
              <input ref={fileRef} type="file" className="hidden" accept="image/*,audio/*,video/*,.pdf,.txt,.md" />
            </>
          )}

          {/*
            Landing guests: keep the same black arrow visually, but place the real Google
            Sign-In control on top so the click opens the same account-chooser page.
          */}
          <div className="relative mx-1.5 size-[34px] shrink-0 sm:size-[34px]">
            <div
              className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center rounded-full bg-[var(--ink)] text-[var(--bg)]"
              aria-hidden
            >
              <ArrowRight size={15} strokeWidth={2.2} />
            </div>
            {!signedIn ? (
              <div
                className="absolute inset-0 z-10 overflow-hidden rounded-full opacity-[0.02] [&_div]:!h-full [&_div]:!w-full [&_iframe]:!h-full [&_iframe]:!min-h-0 [&_iframe]:!w-full"
                onMouseDown={() => {
                  rememberGuestPending();
                }}
                title="Continue with Google"
              >
                <GoogleLogin
                  onSuccess={(cred) => {
                    void finishGoogleCredential(cred);
                  }}
                  onError={() => setError('Google sign-in was cancelled or failed.')}
                  type="icon"
                  theme={isDark ? 'filled_black' : 'outline'}
                  size="large"
                  shape="circle"
                  text="continue_with"
                />
              </div>
            ) : (
              <button
                type="submit"
                className="absolute inset-0 z-10 rounded-full"
                aria-label={
                  isQuizMode
                    ? 'Start quiz'
                    : isNotesMode
                      ? 'Create notes'
                      : isFlashcardsMode
                        ? 'Create flashcards'
                        : 'Create course'
                }
              />
            )}
          </div>
        </form>
      </div>

      {!error && !isQuizMode && (
        <p className="mt-2 text-[11px] leading-snug text-[var(--ink-faint)]">
          {signedIn
            ? isNotesMode
              ? 'Paste a YouTube video or playlist URL, then tap to make notes.'
              : isFlashcardsMode
                ? 'Paste a YouTube video or playlist URL, then tap to make flashcards.'
                : 'Paste a YouTube video or playlist URL, then tap Create.'
            : 'Paste a YouTube URL or tap the arrow to choose a Google account.'}
        </p>
      )}

      {error && (
        <p className="mt-2 text-xs text-[var(--accent)]" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
