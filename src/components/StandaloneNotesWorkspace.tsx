import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronLeft, ChevronRight, Plus, Share2, Trash2 } from 'lucide-react';
import { RichNotesEditor, SHELL_NOTES_THEME } from './RichNotesEditor';
import {
  createStandaloneNote,
  isNotesHtmlEmpty,
  readStandaloneNotesLibrary,
  removeStandaloneNote,
  renameStandaloneNote,
  upsertStandaloneNote,
  writeStandaloneNotesLibrary,
  type StandaloneNote,
  type StandaloneNotesLibrary,
} from '../utils/standaloneNotes';
import { shareStandaloneNote } from '../utils/shareStandaloneNote';
import { cn } from './ui/utils';

function loadLibrary(): StandaloneNotesLibrary {
  const lib = readStandaloneNotesLibrary();
  if (lib.notes.length > 0) return lib;
  const blank = createStandaloneNote();
  const next = { notes: [blank], activeId: blank.id };
  writeStandaloneNotesLibrary(next);
  return next;
}

export function StandaloneNotesWorkspace() {
  const [library, setLibrary] = useState<StandaloneNotesLibrary>(() => loadLibrary());
  const [panelOpen, setPanelOpen] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameSurface, setRenameSurface] = useState<'list' | 'tab' | null>(null);
  const [renameDraft, setRenameDraft] = useState('');
  const [shareFeedbackId, setShareFeedbackId] = useState<string | null>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);
  const shareFeedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [openTabIds, setOpenTabIds] = useState<string[]>(() => {
    const lib = loadLibrary();
    return lib.activeId ? [lib.activeId] : [];
  });

  useEffect(() => {
    if (!renamingId) return;
    const input = renameInputRef.current;
    if (!input) return;
    input.focus();
    input.select();
  }, [renamingId]);

  const activeId = library.activeId;
  const activeNote = useMemo(
    () => library.notes.find((n) => n.id === activeId) ?? library.notes[0] ?? null,
    [library, activeId],
  );

  const openTabs = useMemo(
    () => openTabIds.map((id) => library.notes.find((n) => n.id === id)).filter(Boolean) as StandaloneNote[],
    [openTabIds, library.notes],
  );

  const showTabs = openTabs.length > 1;

  const persistLibrary = useCallback((next: StandaloneNotesLibrary) => {
    writeStandaloneNotesLibrary(next);
    setLibrary(next);
  }, []);

  const selectNote = useCallback(
    (note: StandaloneNote) => {
      const current = library.notes.find((n) => n.id === library.activeId);
      const currentHasContent = current ? !isNotesHtmlEmpty(current.html) : false;
      const switchingAway = Boolean(current && current.id !== note.id);

      setOpenTabIds((tabs) => {
        if (!switchingAway) {
          return tabs.includes(note.id) ? tabs : [...tabs, note.id];
        }
        // Empty editor: replace with the selected note (no tab strip yet).
        if (!currentHasContent) {
          return [note.id];
        }
        // Keep the in-progress note open as a tab so the user can switch back.
        const next = [...tabs];
        if (current && !next.includes(current.id)) next.push(current.id);
        if (!next.includes(note.id)) next.push(note.id);
        return [...new Set(next)];
      });

      persistLibrary({ ...library, activeId: note.id });
      setPanelOpen(true);
    },
    [library, persistLibrary],
  );

  const startNewNote = useCallback(() => {
    const current = library.notes.find((n) => n.id === library.activeId);
    const currentHasContent = current ? !isNotesHtmlEmpty(current.html) : false;

    const blank = createStandaloneNote();
    let nextLib = upsertStandaloneNote(library, blank);

    setOpenTabIds((tabs) => {
      let next = [...tabs];
      if (current && currentHasContent && !next.includes(current.id)) {
        next = [...next, current.id];
      }
      next = [...next, blank.id];
      return [...new Set(next)];
    });

    nextLib = { ...nextLib, activeId: blank.id };
    persistLibrary(nextLib);
    setPanelOpen(true);
  }, [library, persistLibrary]);

  const closeTab = useCallback(
    (id: string) => {
      setOpenTabIds((tabs) => {
        const next = tabs.filter((t) => t !== id);
        if (library.activeId === id) {
          const fallback = next[next.length - 1] ?? library.notes.find((n) => n.id !== id)?.id ?? null;
          persistLibrary({ ...library, activeId: fallback });
        }
        return next;
      });
    },
    [library, persistLibrary],
  );

  const deleteNote = useCallback(
    (id: string) => {
      const nextLib = removeStandaloneNote(library, id);
      if (nextLib.notes.length === 0) {
        const blank = createStandaloneNote();
        const seeded = { notes: [blank], activeId: blank.id };
        persistLibrary(seeded);
        setOpenTabIds([blank.id]);
        return;
      }
      persistLibrary(nextLib);
      setOpenTabIds((tabs) => {
        const filtered = tabs.filter((t) => t !== id);
        if (filtered.length === 0 && nextLib.activeId) return [nextLib.activeId];
        return filtered;
      });
    },
    [library, persistLibrary],
  );

  const onPersist = useCallback(
    (html: string) => {
      if (!activeNote) return;
      const next = upsertStandaloneNote(library, { ...activeNote, html });
      persistLibrary(next);
    },
    [activeNote, library, persistLibrary],
  );

  const beginRename = useCallback((note: StandaloneNote, surface: 'list' | 'tab') => {
    setRenamingId(note.id);
    setRenameSurface(surface);
    setRenameDraft(note.title === 'Untitled note' ? '' : note.title);
  }, []);

  const commitRename = useCallback(() => {
    if (!renamingId) return;
    const next = renameStandaloneNote(library, renamingId, renameDraft);
    persistLibrary(next);
    setRenamingId(null);
    setRenameSurface(null);
    setRenameDraft('');
  }, [library, persistLibrary, renameDraft, renamingId]);

  const cancelRename = useCallback(() => {
    setRenamingId(null);
    setRenameSurface(null);
    setRenameDraft('');
  }, []);

  const shareNote = useCallback(async (note: StandaloneNote) => {
    try {
      const result = await shareStandaloneNote(note);
      if (result === 'copied') {
        if (shareFeedbackTimer.current) clearTimeout(shareFeedbackTimer.current);
        setShareFeedbackId(note.id);
        shareFeedbackTimer.current = setTimeout(() => setShareFeedbackId(null), 1600);
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
    }
  }, []);

  if (!activeNote) return null;

  return (
    <div className="relative z-[1]">
      {showTabs ? (
        <div
          className="mb-0 flex items-end gap-0.5 overflow-x-auto rounded-t-2xl border border-b-0 border-[var(--border)] bg-[var(--fill)] px-1.5 pt-1 [scrollbar-width:none]"
          role="tablist"
          aria-label="Open notes"
        >
          {openTabs.map((tab) => {
            const active = tab.id === activeNote.id;
            const renaming = renamingId === tab.id && renameSurface === 'tab';
            return (
              <div key={tab.id} className="flex shrink-0 items-center">
                {renaming ? (
                  <input
                    ref={renameInputRef}
                    value={renameDraft}
                    onChange={(e) => setRenameDraft(e.target.value)}
                    onBlur={commitRename}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        commitRename();
                      }
                      if (e.key === 'Escape') {
                        e.preventDefault();
                        cancelRename();
                      }
                    }}
                    aria-label="Rename note"
                    className="h-8 max-w-[160px] rounded-t-md border border-[var(--border)] bg-[var(--surface)] px-2 text-[var(--ink)] outline-none"
                    style={{ fontFamily: 'var(--display)', caretColor: 'var(--accent)', fontSize: 16 }}
                    placeholder="Untitled note"
                  />
                ) : (
                  <button
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => selectNote(tab)}
                    onDoubleClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      beginRename(tab, 'tab');
                    }}
                    className="flex h-8 max-w-[140px] items-center truncate rounded-t-md px-2.5 text-[11px] tracking-[-0.01em] transition-colors"
                    style={{
                      fontWeight: active ? 600 : 500,
                      color: active ? 'var(--ink)' : 'var(--ink-soft)',
                      background: active ? 'var(--surface)' : 'transparent',
                      boxShadow: active ? 'inset 0 0 0 1px var(--border)' : 'none',
                    }}
                    title={`${tab.title} — double-click to rename`}
                  >
                    {tab.title}
                  </button>
                )}
                {openTabs.length > 1 && !renaming ? (
                  <button
                    type="button"
                    aria-label={`Close ${tab.title}`}
                    onClick={() => closeTab(tab.id)}
                    className="flex size-8 items-center justify-center text-[var(--ink-faint)] transition-colors hover:text-[var(--ink)]"
                  >
                    ×
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : null}

      <div
        className={cn(
          'grid gap-0',
          panelOpen ? 'md:grid-cols-[minmax(0,1fr)_220px]' : 'grid-cols-1',
        )}
      >
        <RichNotesEditor
          theme={SHELL_NOTES_THEME}
          initialHtml={activeNote.html}
          reloadKey={activeNote.id}
          myNotesLabel="My notes"
          onMyNotesClick={() => setPanelOpen((open) => !open)}
          ariaLabel="Notes"
          className={cn(
            'overflow-hidden shadow-[var(--shadow)]',
            showTabs ? 'rounded-b-2xl rounded-t-none md:rounded-tr-none' : 'rounded-2xl',
            panelOpen && 'md:rounded-r-none',
          )}
          minHeightClassName="min-h-[200px] max-h-[420px]"
          onPersist={onPersist}
        />

        {panelOpen ? (
          <aside
            className={cn(
              'flex flex-col border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow)]',
              'mt-2 rounded-2xl md:mt-0 md:border-l-0 md:rounded-l-none md:rounded-r-2xl md:shadow-none',
              showTabs && 'md:rounded-tr-2xl',
            )}
            aria-label="My notes library"
          >
            {/* Same h-11 + border as RichNotesEditor toolbar so the divider lines up across both panes */}
            <div
              className="flex h-11 shrink-0 items-center justify-between gap-2 px-3"
              style={{ borderBottom: '1px solid var(--border)' }}
              data-notes-chrome="library"
            >
              <p
                className="text-[12px] font-semibold text-[var(--ink)]"
                style={{ letterSpacing: '-0.01em' }}
              >
                My notes
              </p>
              <div className="flex h-11 items-center gap-0.5">
                <button
                  type="button"
                  onClick={startNewNote}
                  className="inline-flex size-11 items-center justify-center rounded-md text-[var(--ink-soft)] transition-colors hover:bg-[var(--fill)] hover:text-[var(--ink)]"
                  aria-label="New note"
                  title="New note"
                >
                  <Plus size={16} strokeWidth={2} />
                </button>
                <button
                  type="button"
                  onClick={() => setPanelOpen(false)}
                  className="inline-flex size-11 items-center justify-center rounded-md text-[var(--ink-faint)] transition-colors hover:bg-[var(--fill)] hover:text-[var(--ink)]"
                  aria-expanded={true}
                  aria-label="Collapse my notes"
                  title="Collapse"
                >
                  <ChevronRight size={16} strokeWidth={2.2} className="hidden md:inline" />
                  <ChevronLeft size={16} strokeWidth={2.2} className="md:hidden" />
                </button>
              </div>
            </div>

            <ul className="max-h-[360px] flex-1 overflow-y-auto p-1.5">
              {library.notes.length === 0 ? (
                <li className="px-2 py-4 text-center text-[12px] text-[var(--ink-faint)]">
                  No notes yet
                </li>
              ) : (
                library.notes.map((note) => {
                  const active = note.id === activeNote.id;
                  const renaming = renamingId === note.id && renameSurface === 'list';
                  return (
                    <li key={note.id} className="flex items-stretch gap-0.5">
                      {renaming ? (
                        <div className="min-h-11 flex-1 rounded-md bg-[var(--fill)] px-2.5 py-1.5">
                          <input
                            ref={renameInputRef}
                            value={renameDraft}
                            onChange={(e) => setRenameDraft(e.target.value)}
                            onBlur={commitRename}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                commitRename();
                              }
                              if (e.key === 'Escape') {
                                e.preventDefault();
                                cancelRename();
                              }
                            }}
                            aria-label="Rename note"
                            className="h-8 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 text-[12.5px] font-medium text-[var(--ink)] outline-none"
                            style={{ caretColor: 'var(--accent)', fontSize: 16 }}
                            placeholder="Untitled note"
                          />
                          <p className="mt-0.5 text-[10px] text-[var(--ink-faint)]" style={{ fontFamily: 'var(--mono)' }}>
                            Enter to save · Esc to cancel
                          </p>
                        </div>
                      ) : (
                        <div
                          className={cn(
                            'flex min-h-11 min-w-0 flex-1 items-start gap-0.5 rounded-md',
                            active ? 'bg-[var(--fill)]' : '',
                          )}
                        >
                          <button
                            type="button"
                            onClick={() => selectNote(note)}
                            onDoubleClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              beginRename(note, 'list');
                            }}
                            className={cn(
                              'min-h-11 min-w-0 flex-1 rounded-md px-2.5 py-2 text-left transition-colors',
                              active
                                ? 'text-[var(--ink)]'
                                : 'text-[var(--ink-soft)] hover:bg-[var(--fill)] hover:text-[var(--ink)]',
                            )}
                            title={`${note.title} — double-click to rename`}
                          >
                            <span className="block truncate text-[12.5px] font-medium">{note.title}</span>
                            <span
                              className="mt-0.5 block text-[10px] text-[var(--ink-faint)]"
                              style={{ fontFamily: 'var(--mono)' }}
                            >
                              {new Date(note.updatedAt).toLocaleString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit',
                              })}
                            </span>
                          </button>
                          <button
                            type="button"
                            aria-label={
                              shareFeedbackId === note.id
                                ? `Copied ${note.title}`
                                : `Share ${note.title}`
                            }
                            title={shareFeedbackId === note.id ? 'Copied' : 'Share note'}
                            onClick={(e) => {
                              e.stopPropagation();
                              void shareNote(note);
                            }}
                            className="mt-0.5 inline-flex size-11 shrink-0 items-center justify-center rounded-md text-[var(--ink-faint)] transition-colors hover:bg-[var(--fill)] hover:text-[var(--ink)]"
                          >
                            {shareFeedbackId === note.id ? (
                              <Check size={14} strokeWidth={2.2} className="text-[var(--accent)]" />
                            ) : (
                              <Share2 size={14} strokeWidth={2} />
                            )}
                          </button>
                        </div>
                      )}
                      {!renaming ? (
                        <button
                          type="button"
                          aria-label={`Delete ${note.title}`}
                          onClick={() => deleteNote(note.id)}
                          className="inline-flex size-11 shrink-0 items-center justify-center rounded-md text-[var(--ink-faint)] transition-colors hover:bg-[var(--fill)] hover:text-[var(--ink)]"
                        >
                          <Trash2 size={14} strokeWidth={2} />
                        </button>
                      ) : null}
                    </li>
                  );
                })
              )}
            </ul>
          </aside>
        ) : null}
      </div>
    </div>
  );
}
