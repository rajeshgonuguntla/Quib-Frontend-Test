import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { ArrowRight, Link2, Mic, Upload } from 'lucide-react';
import { getYoutubeUrlValidationError, isYoutubePlaylistUrl } from '../utils/youtubeUrl';
import {
  STUDENT_RECORD_ENABLED,
  STUDENT_UPLOAD_ENABLED,
  STUDENT_YOUTUBE_INPUT_ENABLED,
} from '../utils/studentInputModes';
import { Card } from './ui/card';
import { cn } from './ui/utils';

type StudentMasterInputProps = {
  className?: string;
  /** Where to send the learner after submit when already signed in. */
  signedIn?: boolean;
};

/**
 * Student "What do you wanna master?" entry.
 * Upload / Record cards are kept below the flag gate for later — only YouTube paste is live.
 */
export function StudentMasterInput({ className, signedIn = true }: StudentMasterInputProps) {
  const navigate = useNavigate();
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

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

  return (
    <Card className={cn('p-5 sm:p-6', className)}>
      <div className="mb-4">
        <h2 className="text-heading text-xl sm:text-2xl">What do you wanna master?</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Paste a YouTube link to get interactive notes, quizzes, and more.
        </p>
      </div>

      {/* ponytail: Upload / Paste / Record card row — restore when flags flip */}
      {(STUDENT_UPLOAD_ENABLED || STUDENT_RECORD_ENABLED) && (
        <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {STUDENT_UPLOAD_ENABLED && (
            <button
              type="button"
              className="rounded-lg border border-border bg-background p-4 text-left transition-colors hover:border-[var(--brand)]"
            >
              <Upload size={18} className="mb-2 text-[var(--brand)]" />
              <p className="text-sm font-medium">Upload</p>
              <p className="mt-1 text-xs text-muted-foreground">Image, file, audio, video</p>
            </button>
          )}
          {STUDENT_YOUTUBE_INPUT_ENABLED && (
            <button
              type="button"
              className="rounded-lg border border-[var(--brand)] bg-[rgba(225,6,0,0.06)] p-4 text-left"
            >
              <Link2 size={18} className="mb-2 text-[var(--brand)]" />
              <p className="text-sm font-medium">Paste</p>
              <p className="mt-1 text-xs text-muted-foreground">YouTube, website, text</p>
            </button>
          )}
          {STUDENT_RECORD_ENABLED && (
            <button
              type="button"
              className="rounded-lg border border-border bg-background p-4 text-left transition-colors hover:border-[var(--brand)]"
            >
              <Mic size={18} className="mb-2 text-[var(--brand)]" />
              <p className="text-sm font-medium">Record</p>
              <p className="mt-1 text-xs text-muted-foreground">Record live lecture</p>
            </button>
          )}
        </div>
      )}

      {STUDENT_YOUTUBE_INPUT_ENABLED && (
        <form
          onSubmit={submitYoutube}
          className="flex h-12 w-full items-stretch overflow-hidden rounded-lg border border-border bg-background"
        >
          <input
            type="url"
            value={youtubeUrl}
            onChange={(e) => {
              setYoutubeUrl(e.target.value);
              if (error) setError(null);
            }}
            placeholder="Paste a YouTube URL…"
            className="min-w-0 flex-1 bg-transparent px-4 text-sm outline-none placeholder:text-muted-foreground"
            aria-label="YouTube URL"
          />
          <button
            type="submit"
            className="inline-flex h-full shrink-0 items-center justify-center gap-1.5 border-l border-border bg-primary px-5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Start <ArrowRight size={14} />
          </button>
        </form>
      )}

      {error && (
        <p className="mt-2 text-xs text-[var(--brand)]" role="alert">
          {error}
        </p>
      )}
    </Card>
  );
}
