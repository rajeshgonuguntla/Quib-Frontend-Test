/** Strip leading "#1 " / "1." prefixes so UI numbering is applied once. */
export function withoutLessonNumberPrefix(title: string): string {
  let t = (title ?? '').trim();
  for (;;) {
    const next = t.replace(/^(?:#\s*\d+|\d+[.)])\s+/, '');
    if (next === t) return t;
    t = next;
  }
}

export function numberedLessonTitle(indexInModule: number, title: string): string {
  const bare = withoutLessonNumberPrefix(title);
  if (indexInModule < 0) return bare || title;
  return `#${indexInModule + 1} ${bare || title}`;
}
