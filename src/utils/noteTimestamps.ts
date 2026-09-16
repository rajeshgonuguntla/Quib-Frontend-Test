/** Format seconds as m:ss / h:mm:ss for note timestamp chips. */
export function formatNoteTimestamp(totalSec: number): string {
  const sec = Math.max(0, Math.floor(totalSec));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${m}:${String(s).padStart(2, '0')}`;
}

/** Parse #t=123 or data-t="123" style note timestamp links. */
export function parseNoteTimestampHref(href: string | null | undefined): number | null {
  if (!href) return null;
  const hash = href.match(/[#?&]t=(\d+)/i);
  if (hash) return Number(hash[1]);
  const data = href.match(/^t:(\d+)$/i);
  if (data) return Number(data[1]);
  return null;
}

export function noteTimestampHtml(sec: number): string {
  const label = formatNoteTimestamp(sec);
  return `<a href="#t=${sec}" data-note-ts="${sec}" contenteditable="false" style="color:#e10600;text-decoration:underline;font-family:var(--mono);font-size:0.85em;">[${label}]</a>&nbsp;`;
}
