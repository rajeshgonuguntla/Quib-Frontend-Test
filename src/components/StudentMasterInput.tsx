import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
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

const PHRASES = [
  'Paste a YouTube URL to create a course',
  'youtube.com/watch?v=…',
  'Or a playlist URL (list=…)',
];

const QUIZ_PHRASES = [
  'SAT math: linear equations',
  'GRE verbal: analogies',
  'Test me on photosynthesis',
  'Or paste a YouTube URL',
];

export type LearnerStartMode = 'course' | 'notes' | 'flashcards' | 'blanks' | 'quiz';
export type SampleExamType = 'custom' | 'sat' | 'gre';

/** Maps dashboard tool tabs onto lesson study-tool APIs. Quiz is a separate generate path. */
export function studyToolFromStartMode(mode: string | undefined): 'notes' | 'flashcards' | 'blanks' | null {
  if (mode === 'notes' || mode === 'flashcards' || mode === 'blanks') return mode;
  return null;
}

const TABS: { id: LearnerStartMode; label: string }[] = [
  { id: 'course', label: 'Create a course' },
  { id: 'quiz', label: 'Take a sample test' },
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
  const [mode, setMode] = useState<LearnerStartMode>('course');
  const [examType, setExamType] = useState<SampleExamType>('custom');
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);
  const [phText, setPhText] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const phraseIdx = useRef(0);
  const activeRef = useRef(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isQuizMode = mode === 'quiz';
  const showTypewriter = !focused && !inputValue.trim();
  const phrases = isQuizMode ? QUIZ_PHRASES : PHRASES;

  useEffect(() => {
    phraseIdx.current = 0;
  }, [isQuizMode]);

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

  const submitInput = (e?: FormEvent) => {
    e?.preventDefault();
    const trimmed = inputValue.trim();

    if (isQuizMode) {
      const isYt = isYoutubePlaylistUrl(trimmed) || isYoutubeVideoUrl(trimmed);
      if (isYt) {
        setError(null);
        if (!signedIn) {
          navigate('/signin', {
            state: isYoutubePlaylistUrl(trimmed)
              ? { playlistUrl: trimmed, startTool: mode }
              : { youtubeUrl: trimmed, startTool: mode },
          });
          return;
        }
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
      const promptState = { prompt: trimmed, examType, startTool: 'quiz' as const };
      if (!signedIn) {
        navigate('/signin', { state: promptState });
        return;
      }
      navigate('/quiz-setup', { state: promptState });
      return;
    }

    const validationError = getYoutubeUrlValidationError(inputValue);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    if (!signedIn) {
      navigate('/signin', {
        state: isYoutubePlaylistUrl(trimmed)
          ? { playlistUrl: trimmed, startTool: mode }
          : { youtubeUrl: trimmed, startTool: mode },
      });
      return;
    }
    navigate('/course-builder', { state: { youtubeUrl: trimmed, startTool: mode } });
  };

  if (!STUDENT_YOUTUBE_INPUT_ENABLED) return null;

  return (
    <div className={className}>
      <form
        onSubmit={submitInput}
        className={cn(
          'flex flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]',
          'shadow-[var(--shadow)] transition-[border-color,box-shadow] duration-150',
          'focus-within:border-[var(--ink-faint)] focus-within:shadow-[0_0_0_3px_var(--accent-soft)]',
        )}
      >
        {signedIn && (
          <div className="flex items-center gap-1 overflow-x-auto px-3 pb-2 pt-2.5 [scrollbar-width:none]">
            {TABS.map((tab) => {
              const active = mode === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setMode(tab.id)}
                  className="shrink-0 rounded-full px-3 py-1.5 text-[11px] transition-colors"
                  style={{
                    fontWeight: active ? 700 : 600,
                    color: active ? 'var(--ink)' : 'var(--ink-faint)',
                    background: active ? 'var(--fill)' : 'transparent',
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        )}

        {signedIn && isQuizMode && (
          <div className="flex items-center gap-1 overflow-x-auto px-3 pb-1 [scrollbar-width:none]">
            {EXAM_TYPES.map((opt) => {
              const active = examType === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setExamType(opt.id)}
                  className="shrink-0 rounded-full px-2.5 py-1 text-[10px] transition-colors"
                  style={{
                    fontWeight: active ? 700 : 600,
                    color: active ? 'var(--ink)' : 'var(--ink-faint)',
                    background: active ? 'var(--accent-soft)' : 'transparent',
                    border: active ? '1px solid var(--border)' : '1px solid transparent',
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        )}

        <div className="flex items-center">
          <div className="flex shrink-0 items-center justify-center px-3.5 py-0 pl-3.5 text-[var(--ink-faint)]">
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
              aria-label={isQuizMode ? 'Test topic or YouTube URL' : 'YouTube URL to create a course'}
              autoComplete="off"
              inputMode="url"
              enterKeyHint="go"
            />
            {showTypewriter && (
              <div className="pointer-events-none absolute inset-y-0 left-0 z-0 flex items-center gap-0.5 overflow-hidden whitespace-nowrap" aria-hidden>
                <span className="truncate text-[13px] text-[var(--ink-faint)]" style={{ fontFamily: 'var(--mono)' }}>{phText}</span>
                <span className="inline-block h-[13px] w-[1.5px] shrink-0 animate-pulse bg-[var(--ink-faint)]" />
              </div>
            )}
          </div>

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

          <button
            type="submit"
            className="mx-1.5 inline-flex h-10 min-w-10 shrink-0 items-center justify-center gap-1.5 rounded-full bg-[var(--ink)] px-3 text-[var(--bg)] transition-opacity hover:opacity-[0.82] active:scale-95 sm:size-[34px] sm:min-w-0 sm:px-0"
            aria-label={isQuizMode ? 'Start sample test' : 'Create course'}
          >
            <span className="text-[12px] font-bold sm:hidden">{isQuizMode ? 'Go' : 'Create'}</span>
            <ArrowRight size={15} strokeWidth={2.2} />
          </button>
        </div>
      </form>

      {!error && !isQuizMode && (
        <p className="mt-2 text-[11px] leading-snug text-[var(--ink-faint)]">
          Paste a YouTube video or playlist URL, then tap Create.
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
