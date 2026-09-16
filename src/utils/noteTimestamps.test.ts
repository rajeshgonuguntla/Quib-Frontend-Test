import { describe, expect, it } from 'vitest';
import { formatNoteTimestamp, noteTimestampHtml, parseNoteTimestampHref } from './noteTimestamps';

describe('noteTimestamps', () => {
  it('formats and parses timestamp chips', () => {
    expect(formatNoteTimestamp(222)).toBe('3:42');
    expect(parseNoteTimestampHref('#t=222')).toBe(222);
    expect(noteTimestampHtml(65)).toContain('#t=65');
    expect(noteTimestampHtml(65)).toContain('[1:05]');
  });
});
