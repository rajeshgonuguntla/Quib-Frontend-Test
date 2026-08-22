import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { Upload } from 'lucide-react';
import { getYoutubeUrlValidationError, isYoutubePlaylistUrl } from '../utils/youtubeUrl';
import {
  STUDENT_UPLOAD_ENABLED,
  STUDENT_YOUTUBE_INPUT_ENABLED,
} from '../utils/studentInputModes';
import { Card } from './ui/card';
import { cn } from './ui/utils';

const PHRASES = [
  'What do you want to master?',
  'Ask a question',
  'Drop a document',
  'Paste a YouTube URL',
];

type StudentMasterInputProps = {
  className?: string;
  /** Where to send the learner after submit when already signed in. */
  signedIn?: boolean;
};

function YoutubeGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="currentColor" stroke="none" />
    </svg>
  );
}

/**
 * Compact master input — YouTube icon, typewriter placeholder, upload, Start.
 */
export function StudentMasterInput({ className, signedIn = true }: StudentMasterInputProps) {
  const navigate = useNavigate();
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
          ? { playlistUrl: trimmed }
          : { youtubeUrl: trimmed },
      });
      return;
    }
    navigate('/course-builder', { state: { youtubeUrl: trimmed } });
  };

  if (!STUDENT_YOUTUBE_INPUT_ENABLED) return null;

  return (
    <Card className={cn('overflow-hidden p-4 sm:p-5', className)}>
      <form
        onSubmit={submitYoutube}
        className={cn(
          'flex h-11 w-full items-stretch overflow-hidden rounded-[10px] border border-border bg-background',
          'transition-[border-color,box-shadow] focus-within:border-border/80',
          'focus-within:shadow-[0_0_0_3px_rgba(0,0,0,0.06)] dark:focus-within:shadow-[0_0_0_3px_rgba(255,255,255,0.04)]',
        )}
      >
        <div className="flex shrink-0 items-center px-3.5 text-muted-foreground/70" aria-hidden>
          <YoutubeGlyph className="size-[15px]" />
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
            className="relative z-[1] w-full bg-transparent py-3 text-[13px] text-foreground outline-none caret-foreground placeholder:text-transparent"
            aria-label="YouTube URL or topic"
            autoComplete="off"
          />
          {showTypewriter && (
            <div
              className="pointer-events-none absolute inset-y-0 left-0 z-0 flex items-center gap-0.5 whitespace-nowrap"
              aria-hidden
            >
              <span className="text-[13px] text-muted-foreground/55">{phText}</span>
              <span className="inline-block h-3.5 w-[1.5px] animate-pulse rounded-sm bg-muted-foreground/55" />
            </div>
          )}
        </div>

        <div className="my-auto h-[22px] w-px shrink-0 bg-border" aria-hidden />

        <button
          type="button"
          title={STUDENT_UPLOAD_ENABLED ? 'Upload' : 'Upload coming soon'}
          disabled={!STUDENT_UPLOAD_ENABLED}
          onClick={() => STUDENT_UPLOAD_ENABLED && fileRef.current?.click()}
          className={cn(
            'flex size-11 shrink-0 items-center justify-center text-muted-foreground/70 transition-colors',
            'hover:bg-accent/50 hover:text-foreground',
            'disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-muted-foreground/70',
          )}
        >
          <Upload size={15} strokeWidth={1.8} />
        </button>
        {STUDENT_UPLOAD_ENABLED && (
          <input ref={fileRef} type="file" className="hidden" accept="image/*,audio/*,video/*,.pdf,.txt,.md" />
        )}

        <div className="my-auto h-[22px] w-px shrink-0 bg-border" aria-hidden />

        <button
          type="submit"
          className="inline-flex h-11 shrink-0 items-center gap-1.5 bg-foreground px-[18px] text-[13px] font-semibold text-background transition-opacity hover:opacity-85"
        >
          Start
          <kbd className="inline-flex size-5 items-center justify-center rounded bg-black/14 text-[11px] font-medium text-background dark:bg-white/20">
            ↵
          </kbd>
        </button>
      </form>

      {error && (
        <p className="mt-2 text-xs text-[var(--brand)]" role="alert">
          {error}
        </p>
      )}
    </Card>
  );
}
