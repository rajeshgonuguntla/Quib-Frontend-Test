import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react';
import {
  Bold,
  Code2,
  Heading2,
  Italic,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Strikethrough,
  Underline,
  Undo2,
  Sigma,
  Clock,
} from 'lucide-react';
import { fetchMyLessonNotes, saveMyLessonNotes } from '../api/studentNotesApi';
import { noteTimestampHtml, parseNoteTimestampHref } from '../utils/noteTimestamps';

type Theme = {
  text: string;
  text2: string;
  text3: string;
  border: string;
  bg1: string;
  bg2: string;
  red: string;
};

export type LessonPlayerClock = {
  getCurrentTime: () => number;
  seekTo: (sec: number) => void;
};

type Props = {
  courseId: string;
  lessonId: string;
  C: Theme;
  player?: LessonPlayerClock | null;
};

function runCmd(command: string, value?: string) {
  // ponytail: browser execCommand covers the QA toolbar without a TipTap dependency.
  document.execCommand(command, false, value);
}

export function StudentLessonNotesEditor({ courseId, lessonId, C, player }: Props) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'saving' | 'saved' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadedFor = useRef<string>('');

  useEffect(() => {
    let cancelled = false;
    const key = `${courseId}:${lessonId}`;
    loadedFor.current = key;
    setStatus('loading');
    setError(null);
    void fetchMyLessonNotes(courseId, lessonId)
      .then((note) => {
        if (cancelled || loadedFor.current !== key) return;
        if (editorRef.current) {
          editorRef.current.innerHTML = note.content?.trim() ? note.content : '<p><br></p>';
        }
        setStatus('idle');
      })
      .catch(() => {
        if (cancelled || loadedFor.current !== key) return;
        if (editorRef.current) editorRef.current.innerHTML = '<p><br></p>';
        setStatus('idle');
      });
    return () => {
      cancelled = true;
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [courseId, lessonId]);

  const scheduleSave = () => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      void (async () => {
        const html = editorRef.current?.innerHTML ?? '';
        setStatus('saving');
        try {
          await saveMyLessonNotes(courseId, lessonId, html);
          setStatus('saved');
          setError(null);
        } catch {
          setStatus('error');
          setError('Could not save notes. Try again.');
        }
      })();
    }, 700);
  };

  const focusEditor = () => editorRef.current?.focus();

  const insertTimestamp = () => {
    focusEditor();
    const sec = Math.floor(player?.getCurrentTime?.() ?? 0);
    runCmd('insertHTML', noteTimestampHtml(sec));
    scheduleSave();
  };

  const insertMath = () => {
    focusEditor();
    const latex = window.prompt('Equation (LaTeX or plain math)', 'x^2');
    if (latex == null) return;
    const safe = latex.replace(/</g, '').trim();
    if (!safe) return;
    runCmd('insertHTML', `<code style="font-family:var(--mono)">$${safe}$</code>&nbsp;`);
    scheduleSave();
  };

  const onEditorClick = (e: MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement | null;
    const anchor = target?.closest?.('a[href^="#t="], a[data-note-ts]') as HTMLAnchorElement | null;
    if (!anchor) return;
    e.preventDefault();
    const fromData = anchor.getAttribute('data-note-ts');
    const sec = fromData != null ? Number(fromData) : parseNoteTimestampHref(anchor.getAttribute('href'));
    if (sec != null && Number.isFinite(sec)) {
      player?.seekTo?.(sec);
    }
  };

  const btn = (label: string, onClick: () => void, icon?: ReactNode) => (
    <button
      key={label}
      type="button"
      title={label}
      aria-label={label}
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => {
        focusEditor();
        onClick();
        scheduleSave();
      }}
      className="h-8 min-w-8 px-2 rounded-md inline-flex items-center justify-center text-[0.72rem] cursor-pointer"
      style={{ background: C.bg2, border: `1px solid ${C.border}`, color: C.text2 }}
    >
      {icon ?? label}
    </button>
  );

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: C.bg1, border: `1px solid ${C.border}` }}>
      <div className="flex flex-wrap items-center gap-1.5 px-3 py-2" style={{ borderBottom: `1px solid ${C.border}` }}>
        {btn('Undo', () => runCmd('undo'), <Undo2 className="w-3.5 h-3.5" />)}
        {btn('Redo', () => runCmd('redo'), <Redo2 className="w-3.5 h-3.5" />)}
        <select
          aria-label="Font"
          className="h-8 rounded-md px-2 text-[0.72rem] cursor-pointer"
          style={{ background: C.bg2, border: `1px solid ${C.border}`, color: C.text2 }}
          defaultValue="sans-serif"
          onMouseDown={(e) => e.preventDefault()}
          onChange={(e) => {
            focusEditor();
            runCmd('fontName', e.target.value);
            scheduleSave();
          }}
        >
          <option value="sans-serif">Sans Serif</option>
          <option value="serif">Serif</option>
          <option value="monospace">Mono</option>
        </select>
        {btn('Bold', () => runCmd('bold'), <Bold className="w-3.5 h-3.5" />)}
        {btn('Italic', () => runCmd('italic'), <Italic className="w-3.5 h-3.5" />)}
        {btn('Underline', () => runCmd('underline'), <Underline className="w-3.5 h-3.5" />)}
        {btn('Strikethrough', () => runCmd('strikeThrough'), <Strikethrough className="w-3.5 h-3.5" />)}
        {btn('Heading', () => runCmd('formatBlock', 'h2'), <Heading2 className="w-3.5 h-3.5" />)}
        {btn('Bulleted list', () => runCmd('insertUnorderedList'), <List className="w-3.5 h-3.5" />)}
        {btn('Numbered list', () => runCmd('insertOrderedList'), <ListOrdered className="w-3.5 h-3.5" />)}
        {btn('Quote', () => runCmd('formatBlock', 'blockquote'), <Quote className="w-3.5 h-3.5" />)}
        {btn('Code block', () => runCmd('formatBlock', 'pre'), <Code2 className="w-3.5 h-3.5" />)}
        {btn('Equation', insertMath, <Sigma className="w-3.5 h-3.5" />)}
        {btn('Insert timestamp', insertTimestamp, <Clock className="w-3.5 h-3.5" />)}
        <span className="ml-auto text-[0.7rem]" style={{ color: C.text3 }}>
          {status === 'loading' && 'Loading…'}
          {status === 'saving' && 'Saving…'}
          {status === 'saved' && 'Saved'}
          {status === 'error' && (error ?? 'Error')}
          {status === 'idle' && 'My notes'}
        </span>
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-label="Lesson notes editor"
        className="min-h-[220px] max-h-[480px] overflow-y-auto px-4 py-3 text-[0.875rem] leading-relaxed outline-none"
        style={{ color: C.text2 }}
        onInput={scheduleSave}
        onClick={onEditorClick}
      />
    </div>
  );
}
