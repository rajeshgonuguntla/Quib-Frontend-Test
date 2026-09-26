import { useCallback, useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react';
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
} from 'lucide-react';
import { fetchMyLessonNotes, saveMyLessonNotes } from '../api/studentNotesApi';
import { parseNoteTimestampHref } from '../utils/noteTimestamps';

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

type ToolbarState = {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikeThrough: boolean;
  unorderedList: boolean;
  orderedList: boolean;
  heading: boolean;
  quote: boolean;
  code: boolean;
  font: string;
};

const DEFAULT_TOOLBAR: ToolbarState = {
  bold: false,
  italic: false,
  underline: false,
  strikeThrough: false,
  unorderedList: false,
  orderedList: false,
  heading: false,
  quote: false,
  code: false,
  font: 'sans-serif',
};

function normalizeFont(raw: string | null | undefined): string {
  const v = (raw ?? '').replace(/['"]/g, '').trim().toLowerCase();
  if (!v) return 'sans-serif';
  if (v.includes('mono') || v.includes('courier') || v.includes('consolas')) return 'monospace';
  if (v.includes('serif') && !v.includes('sans')) return 'serif';
  if (v.includes('sans') || v.includes('arial') || v.includes('helvetica') || v.includes('system')) {
    return 'sans-serif';
  }
  return 'sans-serif';
}

function blockTagAtSelection(editor: HTMLElement | null): string {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0 || !editor) return '';
  let node: Node | null = sel.anchorNode;
  if (node?.nodeType === Node.TEXT_NODE) node = node.parentElement;
  while (node && node !== editor) {
    if (node instanceof HTMLElement) {
      const tag = node.tagName.toLowerCase();
      if (tag === 'h2' || tag === 'blockquote' || tag === 'pre' || tag === 'p' || tag === 'li' || tag === 'div') {
        return tag;
      }
    }
    node = node.parentNode;
  }
  return '';
}

/** Apply a contentEditable command; formatBlock needs <tag> for cross-browser support. */
function runCmd(command: string, value?: string) {
  // ponytail: browser execCommand covers the QA toolbar without a TipTap dependency.
  if (command === 'formatBlock' && value) {
    const tag = value.replace(/[<>]/g, '');
    if (!document.execCommand('formatBlock', false, `<${tag}>`)) {
      document.execCommand('formatBlock', false, tag);
    }
    return;
  }
  document.execCommand(command, false, value);
}

export function StudentLessonNotesEditor({ courseId, lessonId, C, player }: Props) {
  const editorRef = useRef<HTMLDivElement>(null);
  const savedRange = useRef<Range | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'saving' | 'saved' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [toolbar, setToolbar] = useState<ToolbarState>(DEFAULT_TOOLBAR);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadedFor = useRef<string>('');

  const syncToolbar = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || !editor.contains(sel.anchorNode)) {
      return;
    }
    const block = blockTagAtSelection(editor);
    let font = 'sans-serif';
    try {
      font = normalizeFont(document.queryCommandValue('fontName'));
    } catch {
      /* ignore */
    }
    setToolbar({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      strikeThrough: document.queryCommandState('strikeThrough'),
      unorderedList: document.queryCommandState('insertUnorderedList'),
      orderedList: document.queryCommandState('insertOrderedList'),
      heading: block === 'h2',
      quote: block === 'blockquote',
      code: block === 'pre',
      font,
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    const key = `${courseId}:${lessonId}`;
    loadedFor.current = key;
    setStatus('loading');
    setError(null);
    setToolbar(DEFAULT_TOOLBAR);
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

  useEffect(() => {
    const onSelectionChange = () => syncToolbar();
    document.addEventListener('selectionchange', onSelectionChange);
    return () => document.removeEventListener('selectionchange', onSelectionChange);
  }, [syncToolbar]);

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

  const saveSelection = () => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    if (!editorRef.current?.contains(range.commonAncestorContainer)) return;
    savedRange.current = range.cloneRange();
  };

  const restoreSelection = () => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();
    const range = savedRange.current;
    const sel = window.getSelection();
    if (!sel) return;
    if (range && editor.contains(range.commonAncestorContainer)) {
      sel.removeAllRanges();
      sel.addRange(range);
      return;
    }
    const fallback = document.createRange();
    fallback.selectNodeContents(editor);
    fallback.collapse(false);
    sel.removeAllRanges();
    sel.addRange(fallback);
  };

  const withEditorSelection = (fn: () => void) => {
    restoreSelection();
    fn();
    saveSelection();
    syncToolbar();
    scheduleSave();
  };

  const insertMath = () => {
    saveSelection();
    const latex = window.prompt('Equation (LaTeX or plain math)', 'x^2');
    if (latex == null) return;
    const safe = latex.replace(/</g, '').trim();
    if (!safe) return;
    withEditorSelection(() => {
      runCmd('insertHTML', `<code style="font-family:var(--mono)">$${safe}$</code>&nbsp;`);
    });
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

  const btn = (label: string, active: boolean, onClick: () => void, icon?: ReactNode) => (
    <button
      key={label}
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      onMouseDown={(e) => {
        e.preventDefault();
        saveSelection();
      }}
      onClick={() => {
        withEditorSelection(onClick);
      }}
      className="h-8 min-w-8 px-2 rounded-md inline-flex items-center justify-center text-[0.72rem] cursor-pointer"
      style={{
        background: active ? 'rgba(225,6,0,0.12)' : C.bg2,
        border: `1px solid ${active ? C.red : C.border}`,
        color: active ? C.red : C.text2,
      }}
    >
      {icon ?? label}
    </button>
  );

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: C.bg1, border: `1px solid ${C.border}` }}>
      <div className="flex flex-wrap items-center gap-1.5 px-3 py-2" style={{ borderBottom: `1px solid ${C.border}` }}>
        {btn('Undo', false, () => runCmd('undo'), <Undo2 className="w-3.5 h-3.5" />)}
        {btn('Redo', false, () => runCmd('redo'), <Redo2 className="w-3.5 h-3.5" />)}
        <select
          aria-label="Font"
          className="h-8 rounded-md px-2 text-[0.72rem] cursor-pointer"
          style={{
            background: C.bg2,
            border: `1px solid ${C.border}`,
            color: C.text2,
            fontFamily: toolbar.font,
          }}
          value={toolbar.font}
          onMouseDown={() => saveSelection()}
          onFocus={() => saveSelection()}
          onChange={(e) => {
            const next = e.target.value;
            withEditorSelection(() => runCmd('fontName', next));
          }}
        >
          <option value="sans-serif" style={{ fontFamily: 'sans-serif' }}>Sans Serif</option>
          <option value="serif" style={{ fontFamily: 'serif' }}>Serif</option>
          <option value="monospace" style={{ fontFamily: 'monospace' }}>Mono</option>
        </select>
        {btn('Bold', toolbar.bold, () => runCmd('bold'), <Bold className="w-3.5 h-3.5" />)}
        {btn('Italic', toolbar.italic, () => runCmd('italic'), <Italic className="w-3.5 h-3.5" />)}
        {btn('Underline', toolbar.underline, () => runCmd('underline'), <Underline className="w-3.5 h-3.5" />)}
        {btn('Strikethrough', toolbar.strikeThrough, () => runCmd('strikeThrough'), <Strikethrough className="w-3.5 h-3.5" />)}
        {btn('Heading', toolbar.heading, () => runCmd('formatBlock', toolbar.heading ? 'p' : 'h2'), <Heading2 className="w-3.5 h-3.5" />)}
        {btn('Bulleted list', toolbar.unorderedList, () => runCmd('insertUnorderedList'), <List className="w-3.5 h-3.5" />)}
        {btn('Numbered list', toolbar.orderedList, () => runCmd('insertOrderedList'), <ListOrdered className="w-3.5 h-3.5" />)}
        {btn('Quote', toolbar.quote, () => runCmd('formatBlock', toolbar.quote ? 'p' : 'blockquote'), <Quote className="w-3.5 h-3.5" />)}
        {btn('Code block', toolbar.code, () => runCmd('formatBlock', toolbar.code ? 'p' : 'pre'), <Code2 className="w-3.5 h-3.5" />)}
        {btn('Equation', false, insertMath, <Sigma className="w-3.5 h-3.5" />)}
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
        className="min-h-[220px] max-h-[480px] overflow-y-auto px-4 py-3 text-[0.875rem] leading-relaxed outline-none [&_h2]:text-[1.15rem] [&_h2]:font-bold [&_blockquote]:border-l-2 [&_blockquote]:border-current [&_blockquote]:pl-3 [&_blockquote]:opacity-90 [&_blockquote]:italic [&_pre]:rounded-md [&_pre]:bg-black/5 [&_pre]:px-3 [&_pre]:py-2 [&_pre]:font-mono [&_pre]:text-[0.8rem] dark:[&_pre]:bg-white/5"
        style={{ color: C.text2 }}
        onInput={() => {
          saveSelection();
          syncToolbar();
          scheduleSave();
        }}
        onKeyUp={() => {
          saveSelection();
          syncToolbar();
        }}
        onMouseUp={() => {
          saveSelection();
          syncToolbar();
        }}
        onClick={onEditorClick}
      />
    </div>
  );
}
