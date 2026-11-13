/** Local draft notes from the dashboard / landing Notes start mode (no course lesson yet). */

export const STANDALONE_NOTES_KEY = 'cuib_standalone_notes';
export const STANDALONE_NOTES_LIBRARY_KEY = 'cuib_standalone_notes_library';

export type StandaloneNote = {
  id: string;
  title: string;
  html: string;
  updatedAt: number;
  /** When true, auto title-from-body is skipped so a user rename sticks. */
  titleCustom?: boolean;
};

export type StandaloneNotesLibrary = {
  notes: StandaloneNote[];
  activeId: string | null;
};

const EMPTY_HTML = '<p><br></p>';

export function isNotesHtmlEmpty(html: string | null | undefined): boolean {
  if (!html) return true;
  const text = html
    .replace(/<br\s*\/?>/gi, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, '')
    .trim();
  return text.length === 0;
}

export function titleFromNotesHtml(html: string): string {
  if (typeof document !== 'undefined') {
    const el = document.createElement('div');
    el.innerHTML = html;
    const text = (el.textContent ?? '').replace(/\s+/g, ' ').trim();
    if (text) return text.slice(0, 48) + (text.length > 48 ? '…' : '');
  }
  const stripped = html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!stripped) return 'Untitled note';
  return stripped.slice(0, 48) + (stripped.length > 48 ? '…' : '');
}

function createId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `note-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createStandaloneNote(html = EMPTY_HTML): StandaloneNote {
  const now = Date.now();
  return {
    id: createId(),
    title: isNotesHtmlEmpty(html) ? 'Untitled note' : titleFromNotesHtml(html),
    html: html.trim() ? html : EMPTY_HTML,
    updatedAt: now,
  };
}

function migrateLegacyHtml(): StandaloneNotesLibrary | null {
  try {
    const legacy = localStorage.getItem(STANDALONE_NOTES_KEY);
    if (!legacy || !legacy.trim()) return null;
    // New library JSON should not be in the legacy key, but guard anyway.
    if (legacy.trim().startsWith('{')) return null;
    const note = createStandaloneNote(legacy);
    const library: StandaloneNotesLibrary = { notes: [note], activeId: note.id };
    writeStandaloneNotesLibrary(library);
    localStorage.removeItem(STANDALONE_NOTES_KEY);
    return library;
  } catch {
    return null;
  }
}

export function readStandaloneNotesLibrary(): StandaloneNotesLibrary {
  try {
    const raw = localStorage.getItem(STANDALONE_NOTES_LIBRARY_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as StandaloneNotesLibrary;
      if (parsed && Array.isArray(parsed.notes)) {
        return {
          notes: parsed.notes,
          activeId: parsed.activeId ?? parsed.notes[0]?.id ?? null,
        };
      }
    }
  } catch {
    /* fall through */
  }
  const migrated = migrateLegacyHtml();
  if (migrated) return migrated;
  return { notes: [], activeId: null };
}

export function writeStandaloneNotesLibrary(library: StandaloneNotesLibrary): void {
  localStorage.setItem(STANDALONE_NOTES_LIBRARY_KEY, JSON.stringify(library));
}

export function normalizeNoteTitle(raw: string): string {
  const trimmed = raw.replace(/\s+/g, ' ').trim();
  if (!trimmed) return 'Untitled note';
  return trimmed.slice(0, 80);
}

export function upsertStandaloneNote(
  library: StandaloneNotesLibrary,
  note: StandaloneNote,
): StandaloneNotesLibrary {
  const idx = library.notes.findIndex((n) => n.id === note.id);
  const notes = [...library.notes];
  const titleCustom = Boolean(note.titleCustom);
  const next: StandaloneNote = {
    ...note,
    titleCustom,
    title: titleCustom
      ? normalizeNoteTitle(note.title)
      : isNotesHtmlEmpty(note.html)
        ? 'Untitled note'
        : titleFromNotesHtml(note.html),
    updatedAt: Date.now(),
  };
  if (idx >= 0) notes[idx] = next;
  else notes.unshift(next);
  notes.sort((a, b) => b.updatedAt - a.updatedAt);
  return { notes, activeId: next.id };
}

export function renameStandaloneNote(
  library: StandaloneNotesLibrary,
  id: string,
  title: string,
): StandaloneNotesLibrary {
  const existing = library.notes.find((n) => n.id === id);
  if (!existing) return library;
  return upsertStandaloneNote(library, {
    ...existing,
    title: normalizeNoteTitle(title),
    titleCustom: true,
  });
}

export function removeStandaloneNote(
  library: StandaloneNotesLibrary,
  id: string,
): StandaloneNotesLibrary {
  const notes = library.notes.filter((n) => n.id !== id);
  const activeId =
    library.activeId === id ? (notes[0]?.id ?? null) : library.activeId;
  return { notes, activeId };
}

/** @deprecated Prefer library helpers — kept for older call sites during migration. */
export function readStandaloneNotes(): string {
  const lib = readStandaloneNotesLibrary();
  const active = lib.notes.find((n) => n.id === lib.activeId) ?? lib.notes[0];
  return active?.html ?? '';
}

/** @deprecated Prefer library helpers. */
export function writeStandaloneNotes(html: string): void {
  const lib = readStandaloneNotesLibrary();
  const active = lib.notes.find((n) => n.id === lib.activeId);
  if (active) {
    writeStandaloneNotesLibrary(upsertStandaloneNote(lib, { ...active, html }));
    return;
  }
  const note = createStandaloneNote(html);
  writeStandaloneNotesLibrary({ notes: [note], activeId: note.id });
}
