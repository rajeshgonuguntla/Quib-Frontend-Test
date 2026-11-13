import type { StandaloneNote } from './standaloneNotes';

function htmlToPlainText(html: string): string {
  if (typeof document !== 'undefined') {
    const el = document.createElement('div');
    el.innerHTML = html;
    return (el.textContent ?? '').replace(/\n{3,}/g, '\n\n').trim();
  }
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function standaloneNoteShareText(note: StandaloneNote): string {
  const body = htmlToPlainText(note.html);
  if (!body) return note.title;
  return `${note.title}\n\n${body}`;
}

/** Copy note text, or open the OS share sheet when available. */
export async function shareStandaloneNote(note: StandaloneNote): Promise<'shared' | 'copied'> {
  const text = standaloneNoteShareText(note);
  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      await navigator.share({ title: note.title, text });
      return 'shared';
    } catch (err) {
      // User cancel — don't fall through to clipboard noise.
      if (err instanceof DOMException && err.name === 'AbortError') {
        throw err;
      }
    }
  }
  await navigator.clipboard.writeText(text);
  return 'copied';
}
