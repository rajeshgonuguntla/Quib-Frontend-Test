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
  ChevronRight,
} from 'lucide-react';
import { parseNoteTimestampHref } from '../utils/noteTimestamps';

export type RichNotesTheme = {
  text: string;
  text2: string;
  text3: string;
  border: string;
  bg1: string;
  bg2: string;
  accent: string;
};

export type RichNotesPlayerClock = {
  getCurrentTime: () => number;
  seekTo: (sec: number) => void;
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
  if (command === 'formatBlock' && value) {
    const tag = value.replace(/[<>]/g, '');
    if (!document.execCommand('formatBlock', false, `<${tag}>`)) {
      document.execCommand('formatBlock', false, tag);
    }
    return;
  }
  document.execCommand(command, false, value);
}

export type RichNotesEditorProps = {
  theme: RichNotesTheme;
  /** Initial HTML once on mount (and when `reloadKey` changes). */
  initialHtml?: string;
  reloadKey?: string;
  /** Debounced persist; omit for read-only-ish local-only callers that pass their own handler. */
  onPersist?: (html: string) => void | Promise<void>;
  persistDebounceMs?: number;
  /** Clickable trailing control (sentence case). Defaults to focusing the editor. */
  myNotesLabel?: string;
  onMyNotesClick?: () => void;
  ariaLabel?: string;
  player?: RichNotesPlayerClock | null;
  className?: string;
  minHeightClassName?: string;
};

export function RichNotesEditor({
  theme: C,
  initialHtml,
  reloadKey = 'default',
  onPersist,
  persistDebounceMs = 700,
  myNotesLabel = 'My notes',
  onMyNotesClick,
  ariaLabel = 'Notes editor',
  player,
  className,
  minHeightClassName = 'min-h-[220px] max-h-[480px]',
}: RichNotesEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const savedRange = useRef<Range | null>(null);
  const insertMathRef = useRef<() => void>(() => {});
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
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
    loadedFor.current = reloadKey;
    setToolbar(DEFAULT_TOOLBAR);
    setStatus('idle');
    setError(null);
    if (editorRef.current) {
      const html = initialHtml?.trim() ? initialHtml : '<p><br></p>';
      editorRef.current.innerHTML = html;
    }
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
    // Only re-seed when the identity key changes — not on every parent re-render.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: initialHtml paired with reloadKey
  }, [reloadKey]);

  useEffect(() => {
    const onSelectionChange = () => syncToolbar();
    document.addEventListener('selectionchange', onSelectionChange);
    return () => document.removeEventListener('selectionchange', onSelectionChange);
  }, [syncToolbar]);

  const scheduleSave = () => {
    if (!onPersist) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      void (async () => {
        const html = editorRef.current?.innerHTML ?? '';
        setStatus('saving');
        try {
          await onPersist(html);
          setStatus('saved');
          setError(null);
        } catch {
          setStatus('error');
          setError('Could not save notes. Try again.');
        }
      })();
    }, persistDebounceMs);
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

  useEffect(() => {
    insertMathRef.current = () => {
      saveSelection();
      const latex = window.prompt('Equation (LaTeX or plain math)', 'x^2');
      if (latex == null) return;
      const safe = latex.replace(/</g, '').trim();
      if (!safe) return;
      withEditorSelection(() => {
        runCmd('insertHTML', `<code style="font-family:var(--mono)">$${safe}$</code>&nbsp;`);
      });
    };
  });

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
      className="inline-flex h-8 min-w-8 cursor-pointer items-center justify-center rounded-md px-2 text-[0.72rem]"
      style={{
        background: active ? `color-mix(in srgb, ${C.accent} 14%, transparent)` : C.bg2,
        border: `1px solid ${active ? C.accent : C.border}`,
        color: active ? C.accent : C.text2,
      }}
    >
      {icon ?? label}
    </button>
  );

  return (
    <div
      className={className ?? 'overflow-hidden rounded-2xl'}
      style={{ background: C.bg1, border: `1px solid ${C.border}` }}
    >
      <div
        className="flex h-11 shrink-0 flex-nowrap items-center gap-1.5 overflow-x-auto px-3 [scrollbar-width:none]"
        style={{ borderBottom: `1px solid ${C.border}` }}
        data-notes-chrome="toolbar"
      >
        {btn('Undo', false, () => runCmd('undo'), <Undo2 className="h-3.5 w-3.5" />)}
        {btn('Redo', false, () => runCmd('redo'), <Redo2 className="h-3.5 w-3.5" />)}
        <select
          aria-label="Font"
          className="h-8 cursor-pointer rounded-md px-2 text-[0.72rem]"
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
          <option value="sans-serif" style={{ fontFamily: 'sans-serif' }}>
            Sans Serif
          </option>
          <option value="serif" style={{ fontFamily: 'serif' }}>
            Serif
          </option>
          <option value="monospace" style={{ fontFamily: 'monospace' }}>
            Mono
          </option>
        </select>
        {btn('Bold', toolbar.bold, () => runCmd('bold'), <Bold className="h-3.5 w-3.5" />)}
        {btn('Italic', toolbar.italic, () => runCmd('italic'), <Italic className="h-3.5 w-3.5" />)}
        {btn('Underline', toolbar.underline, () => runCmd('underline'), <Underline className="h-3.5 w-3.5" />)}
        {btn(
          'Strikethrough',
          toolbar.strikeThrough,
          () => runCmd('strikeThrough'),
          <Strikethrough className="h-3.5 w-3.5" />,
        )}
        {btn(
          'Heading',
          toolbar.heading,
          () => runCmd('formatBlock', toolbar.heading ? 'p' : 'h2'),
          <Heading2 className="h-3.5 w-3.5" />,
        )}
        {btn('Bulleted list', toolbar.unorderedList, () => runCmd('insertUnorderedList'), <List className="h-3.5 w-3.5" />)}
        {btn(
          'Numbered list',
          toolbar.orderedList,
          () => runCmd('insertOrderedList'),
          <ListOrdered className="h-3.5 w-3.5" />,
        )}
        {btn(
          'Quote',
          toolbar.quote,
          () => runCmd('formatBlock', toolbar.quote ? 'p' : 'blockquote'),
          <Quote className="h-3.5 w-3.5" />,
        )}
        {btn(
          'Code block',
          toolbar.code,
          () => runCmd('formatBlock', toolbar.code ? 'p' : 'pre'),
          <Code2 className="h-3.5 w-3.5" />,
        )}
        <button
          type="button"
          title="Equation"
          aria-label="Equation"
          onMouseDown={(e) => {
            e.preventDefault();
            saveSelection();
          }}
          onClick={() => insertMathRef.current()}
          className="inline-flex h-8 min-w-8 cursor-pointer items-center justify-center rounded-md px-2 text-[0.72rem]"
          style={{
            background: C.bg2,
            border: `1px solid ${C.border}`,
            color: C.text2,
          }}
        >
          <Sigma className="h-3.5 w-3.5" />
        </button>
        <div className="ml-auto flex items-center gap-2">
          {(status === 'saving' || status === 'saved' || status === 'error') && (
            <span className="text-[0.7rem]" style={{ color: C.text3 }} aria-live="polite">
              {status === 'saving' && 'Saving…'}
              {status === 'saved' && 'Saved'}
              {status === 'error' && (error ?? 'Error')}
            </span>
          )}
          <button
            type="button"
            onClick={() => {
              if (onMyNotesClick) {
                onMyNotesClick();
                return;
              }
              editorRef.current?.focus();
            }}
            className="inline-flex h-11 min-w-[44px] cursor-pointer items-center gap-1 rounded-md px-1.5 text-[12px] font-medium underline decoration-current/35 underline-offset-2 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{
              fontFamily: 'var(--mono)',
              color: C.text3,
              outlineColor: C.accent,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = C.accent;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = C.text3;
            }}
            onFocus={(e) => {
              e.currentTarget.style.color = C.accent;
            }}
            onBlur={(e) => {
              e.currentTarget.style.color = C.text3;
            }}
            aria-label={`${myNotesLabel} — open editor`}
            title={`Open ${myNotesLabel}`}
          >
            {myNotesLabel}
            <ChevronRight size={12} strokeWidth={2.5} aria-hidden />
          </button>
        </div>
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-label={ariaLabel}
        className={`${minHeightClassName} overflow-y-auto px-4 py-3 text-[0.875rem] leading-relaxed outline-none [&_blockquote]:border-l-2 [&_blockquote]:border-current [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:opacity-90 [&_h2]:text-[1.15rem] [&_h2]:font-bold [&_pre]:rounded-md [&_pre]:bg-black/5 [&_pre]:px-3 [&_pre]:py-2 [&_pre]:font-mono [&_pre]:text-[0.8rem] dark:[&_pre]:bg-white/5`}
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

/** Shell-token theme for dashboard / landing notes (matches `.cuib-app`). */
export const SHELL_NOTES_THEME: RichNotesTheme = {
  text: 'var(--ink)',
  text2: 'var(--ink-soft)',
  text3: 'var(--ink-faint)',
  border: 'var(--border)',
  bg1: 'var(--surface)',
  bg2: 'var(--fill)',
  accent: 'var(--accent)',
};
