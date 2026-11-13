import { afterEach, describe, expect, it } from 'vitest';
import {
  STANDALONE_NOTES_KEY,
  STANDALONE_NOTES_LIBRARY_KEY,
  createStandaloneNote,
  isNotesHtmlEmpty,
  readStandaloneNotesLibrary,
  renameStandaloneNote,
  titleFromNotesHtml,
  upsertStandaloneNote,
  writeStandaloneNotesLibrary,
} from './standaloneNotes';

describe('standaloneNotes', () => {
  afterEach(() => {
    localStorage.removeItem(STANDALONE_NOTES_KEY);
    localStorage.removeItem(STANDALONE_NOTES_LIBRARY_KEY);
  });

  it('treats blank editor html as empty', () => {
    expect(isNotesHtmlEmpty('')).toBe(true);
    expect(isNotesHtmlEmpty('<p><br></p>')).toBe(true);
    expect(isNotesHtmlEmpty('<p>Hello</p>')).toBe(false);
  });

  it('builds a title from html text', () => {
    expect(titleFromNotesHtml('<h2>SAT math</h2><p>Linear equations</p>')).toMatch(/SAT math/);
  });

  it('migrates legacy single-html drafts into the library', () => {
    localStorage.setItem(STANDALONE_NOTES_KEY, '<p>Legacy draft</p>');
    const lib = readStandaloneNotesLibrary();
    expect(lib.notes).toHaveLength(1);
    expect(lib.notes[0]?.html).toContain('Legacy draft');
    expect(lib.activeId).toBe(lib.notes[0]?.id);
    expect(localStorage.getItem(STANDALONE_NOTES_KEY)).toBeNull();
  });

  it('upserts and sorts by updatedAt', () => {
    const a = createStandaloneNote('<p>First</p>');
    const b = createStandaloneNote('<p>Second</p>');
    let lib = { notes: [a], activeId: a.id };
    lib = upsertStandaloneNote(lib, b);
    writeStandaloneNotesLibrary(lib);
    const read = readStandaloneNotesLibrary();
    expect(read.notes[0]?.id).toBe(b.id);
    expect(read.activeId).toBe(b.id);
  });

  it('keeps a custom rename when content is saved again', () => {
    const note = createStandaloneNote('<p>Body text</p>');
    let lib = { notes: [note], activeId: note.id };
    lib = renameStandaloneNote(lib, note.id, 'SAT prep');
    expect(lib.notes[0]?.title).toBe('SAT prep');
    expect(lib.notes[0]?.titleCustom).toBe(true);

    lib = upsertStandaloneNote(lib, { ...lib.notes[0]!, html: '<p>Updated body</p>' });
    expect(lib.notes[0]?.title).toBe('SAT prep');
  });
});
