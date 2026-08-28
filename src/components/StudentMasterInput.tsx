import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { ArrowRight, Upload } from 'lucide-react';
import { getYoutubeUrlValidationError, isYoutubePlaylistUrl } from '../utils/youtubeUrl';
import {
  STUDENT_UPLOAD_ENABLED,
  STUDENT_YOUTUBE_INPUT_ENABLED,
} from '../utils/studentInputModes';
import { cn } from './ui/utils';

const PHRASES = [
  'What do you want to master?',
  'Ask a question',
  'Drop a document',
  'Paste a YouTube URL',
];

export type LearnerStartMode = 'course' | 'notes' | 'flashcards' | 'blanks' | 'quiz';

const TABS: { id: LearnerStartMode; label: string }[] = [
  { id: 'course', label: 'Start learning' },
  { id: 'notes', label: 'Get notes' },
  { id: 'flashcards', label: 'Flashcards' },
  { id: 'blanks', label: 'Fill in the blanks' },
  { id: 'quiz', label: 'Take a sample test' },
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
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);
  const [phText, setPhText] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const phraseIdx = useRef(0);
  const activeRef = useRef(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showTypewriter = !focused && !youtubeUrl.trim();

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
        const phrase = PHRASES[phraseIdx.current % PHRASES.length]!;
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
        phraseIdx.current = (phraseIdx.current + 1) % PHRASES.length;
      }
    };

    void loop();
    return () => {
      activeRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [showTypewriter]);

  const submitYoutube = (e?: FormEvent) => {
    e?.preventDefault();
    const validationError = getYoutubeUrlValidationError(youtubeUrl);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    const trimmed = youtubeUrl.trim();
    if (!signedIn) {
      navigate('/signin', {
        state: isYoutubePlaylistUrl(trimmed)
          ? { playlistUrl: trimmed, startTool: mode }
          : { youtubeUrl: trimmed, startTool: mode },
      });
      return;
    }
    if (mode === 'quiz') {
      navigate('/quiz-setup', { state: { youtubeUrl: trimmed } });
      return;
    }
    navigate('/course-builder', { state: { youtubeUrl: trimmed, startTool: mode } });
  };

  if (!STUDENT_YOUTUBE_INPUT_ENABLED) return null;

  return (
    <div className={className}>
      <form
        onSubmit={submitYoutube}
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

        <div className="flex items-center">
          <div className="flex shrink-0 items-center justify-center px-3.5 py-0 pl-3.5 text-[var(--ink-faint)]">
            <VideoGlyph />
          </div>

          <div className="relative flex min-w-0 flex-1 items-center overflow-hidden">
            <input
              type="url"
              value={youtubeUrl}
              onChange={(e) => {
                setYoutubeUrl(e.target.value);
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
              aria-label="YouTube URL or topic"
              autoComplete="off"
            />
            {showTypewriter && (
              <div className="pointer-events-none absolute inset-y-0 left-0 z-0 flex items-center gap-0.5 whitespace-nowrap" aria-hidden>
                <span className="text-[13px] text-[var(--ink-faint)]" style={{ fontFamily: 'var(--mono)' }}>{phText}</span>
                <span className="inline-block h-[13px] w-[1.5px] animate-pulse bg-[var(--ink-faint)]" />
              </div>
            )}
          </div>

          <div className="h-[22px] w-px shrink-0 bg-[var(--border)]" aria-hidden />

          <button
            type="button"
            title={STUDENT_UPLOAD_ENABLED ? 'Upload' : 'Upload coming soon'}
            disabled={!STUDENT_UPLOAD_ENABLED}
            onClick={() => STUDENT_UPLOAD_ENABLED && fileRef.current?.click()}
            className="flex size-[46px] shrink-0 items-center justify-center text-[var(--ink-faint)] transition-colors hover:bg-[var(--border)] hover:text-[var(--ink)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Upload size={16} strokeWidth={1.8} />
          </button>
          {STUDENT_UPLOAD_ENABLED && (
            <input ref={fileRef} type="file" className="hidden" accept="image/*,audio/*,video/*,.pdf,.txt,.md" />
          )}

          <button
            type="submit"
            className="mx-1.5 inline-flex size-[34px] shrink-0 items-center justify-center rounded-full bg-[var(--ink)] text-[var(--bg)] transition-opacity hover:opacity-[0.82] active:scale-95"
            aria-label="Start"
          >
            <ArrowRight size={15} strokeWidth={2.2} />
          </button>
        </div>
      </form>

      {error && (
        <p className="mt-2 text-xs text-[var(--accent)]" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
