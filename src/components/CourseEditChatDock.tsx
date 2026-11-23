import { useEffect, useId, useRef, useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from './ui/button';
import {
  editableFromDetails,
  runCourseEditTurn,
  type CourseDetailsEditSource,
} from './courseEditChat';
import type { EditableCourse } from '../types/courseGeneration';

type ChatLine = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  tone?: 'pending' | 'error' | 'saved';
};

type CourseEditChatDockProps = {
  courseId: string;
  course: CourseDetailsEditSource;
  onCourseChange: (next: EditableCourse) => void;
  /** `column` docks from 768px. `lesson` docks from 1024px so the lesson list keeps its width. */
  layout: 'column' | 'lesson';
};

function useMaxWidth(maxPx: number): boolean {
  const query = `(max-width: ${maxPx}px)`;
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const media = window.matchMedia(query);
    const onChange = () => setMatches(media.matches);
    onChange();
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

export function CourseEditChatDock({
  courseId,
  course,
  onCourseChange,
  layout,
}: CourseEditChatDockProps) {
  const phone = useMaxWidth(layout === 'lesson' ? 1023 : 767);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [lines, setLines] = useState<ChatLine[]>([]);
  const [busy, setBusy] = useState(false);
  const sessionRef = useRef<string | undefined>(undefined);
  const revisionRef = useRef<string | undefined>(undefined);
  const courseRef = useRef(course);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const titleId = useId();

  useEffect(() => {
    courseRef.current = course;
  }, [course]);

  useEffect(() => {
    if (!phone || !open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phone, open]);

  useEffect(() => {
    if (phone && open) inputRef.current?.focus();
  }, [phone, open]);

  useEffect(() => {
    const node = scrollRef.current;
    if (!node) return;
    node.scrollTop = node.scrollHeight;
  }, [lines, busy]);

  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;
    const pendingId = `a-${Date.now()}`;
    setInput('');
    setLines((current) => [
      ...current,
      { id: `u-${Date.now()}`, role: 'user', text },
      { id: pendingId, role: 'assistant', text: 'Updating the course…', tone: 'pending' },
    ]);
    setBusy(true);
    const turn = await runCourseEditTurn({
      courseId,
      base: editableFromDetails(courseRef.current),
      message: text,
      sessionId: sessionRef.current,
      courseRevision: revisionRef.current,
    });
    if (turn.sessionId) sessionRef.current = turn.sessionId;
    if (turn.courseRevision) revisionRef.current = turn.courseRevision;
    setLines((current) => current.map((line) => (
      line.id === pendingId
        ? {
            ...line,
            text: turn.text,
            tone: turn.ok ? (turn.changed ? 'saved' : undefined) : 'error',
          }
        : line
    )));
    if (turn.ok && turn.changed) onCourseChange(turn.course);
    setBusy(false);
  };

  const frame = layout === 'lesson'
    ? 'max-lg:fixed max-lg:inset-x-0 max-lg:bottom-0 max-lg:z-40 max-lg:h-[min(72dvh,640px)] max-lg:w-full max-lg:border-t lg:h-full lg:w-[400px] lg:shrink-0 lg:border-l'
    : 'max-md:fixed max-md:inset-x-0 max-md:bottom-0 max-md:z-40 max-md:h-[min(72dvh,640px)] max-md:w-full max-md:border-t md:sticky md:top-0 md:h-full md:w-[400px] md:shrink-0 md:border-l';
  const shown = layout === 'lesson'
    ? (open ? 'max-lg:flex' : 'max-lg:hidden') + ' lg:flex'
    : (open ? 'max-md:flex' : 'max-md:hidden') + ' md:flex';
  const phoneOnly = layout === 'lesson' ? 'lg:hidden' : 'md:hidden';

  return (
    <>
      {phone && !open ? (
        <div className={`cuib-app fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border)] bg-[var(--bg)] p-3 ${phoneOnly}`}>
          <Button
            type="button"
            data-testid="course-edit-open"
            className="h-11 w-full text-[15px] font-semibold text-white hover:opacity-90"
            style={{ backgroundColor: 'var(--accent)', color: '#fff' }}
            onClick={() => setOpen(true)}
          >
            Edit with chat
          </Button>
        </div>
      ) : null}
      {phone && open ? (
        <button
          type="button"
          aria-label="Close edit chat"
          className={`fixed inset-0 z-30 bg-black/40 ${phoneOnly}`}
          onClick={() => setOpen(false)}
        />
      ) : null}
      <aside
        data-testid="course-edit-chat"
        aria-labelledby={titleId}
        aria-hidden={phone && !open ? true : undefined}
        className={`cuib-app ${shown} ${frame} min-h-0 flex-col overflow-hidden border-[var(--border)] bg-[var(--bg)] text-[var(--ink)] motion-reduce:transition-none`}
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-[var(--border)] px-4 py-3">
          <div className="min-w-0">
            <p className="text-[11px] font-medium tracking-wide text-[var(--ink-faint)]" style={{ fontFamily: 'var(--mono)' }}>
              Course edits
            </p>
            <h2 id={titleId} className="text-[15px] font-semibold tracking-tight text-[var(--ink)]">
              Edit with chat
            </h2>
          </div>
          <Button
            type="button"
            variant="outline"
            className={`h-11 shrink-0 border-[var(--border)] bg-[var(--bg)] px-3 text-[var(--ink)] hover:bg-[var(--fill)] hover:text-[var(--ink)] ${phoneOnly}`}
            onClick={() => setOpen(false)}
          >
            Close
          </Button>
        </div>

        <div ref={scrollRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
          {lines.length === 0 ? (
            <p className="text-[13px] leading-relaxed text-[var(--ink-soft)]">
              Describe a change. It saves to this course, then the details update.
            </p>
          ) : null}
          {lines.map((line) => (
            <div key={line.id} className={line.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
              <div
                data-testid={
                  line.tone === 'error'
                    ? 'course-edit-error'
                    : line.tone === 'saved'
                      ? 'course-edit-saved'
                      : undefined
                }
                className="max-w-[92%] whitespace-pre-wrap rounded-md border px-3 py-2 text-[13px] leading-relaxed"
                style={{
                  borderColor: line.tone === 'error' ? '#ef4444' : 'var(--border)',
                  background: line.role === 'user' ? 'var(--fill)' : 'var(--bg)',
                  color: line.tone === 'error' ? '#ef4444' : line.tone === 'pending' ? 'var(--ink-soft)' : 'var(--ink)',
                }}
              >
                {line.tone === 'pending' ? (
                  <span className="mr-2 inline-block h-3 w-3 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--accent)] align-[-2px] motion-reduce:animate-none" />
                ) : null}
                {line.text}
              </div>
            </div>
          ))}
        </div>

        <form
          className="flex shrink-0 items-end gap-2 border-t border-[var(--border)] p-3"
          onSubmit={(event) => {
            event.preventDefault();
            void send();
          }}
        >
          <textarea
            ref={inputRef}
            data-testid="course-edit-input"
            value={input}
            rows={2}
            disabled={busy}
            aria-label="Course edit request"
            placeholder="Rename module 2, or add a quiz after lesson 3"
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                void send();
              }
            }}
            className="max-h-28 min-h-11 w-full resize-none rounded-md border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 text-base text-[var(--ink)] outline-none placeholder:text-[var(--ink-faint)] focus-visible:border-[var(--accent)] disabled:opacity-60"
          />
          <Button
            type="submit"
            data-testid="course-edit-send"
            disabled={busy || input.trim().length === 0}
            aria-label="Send edit"
            className="h-11 w-11 shrink-0 bg-[var(--accent)] text-white hover:bg-[var(--accent)] hover:opacity-90"
          >
            <Send size={16} strokeWidth={2.2} />
          </Button>
        </form>
      </aside>
    </>
  );
}
