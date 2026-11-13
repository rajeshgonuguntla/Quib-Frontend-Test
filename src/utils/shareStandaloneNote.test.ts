import { describe, expect, it } from 'vitest';
import { standaloneNoteShareText } from './shareStandaloneNote';

describe('standaloneNoteShareText', () => {
  it('includes title and plain body', () => {
    const text = standaloneNoteShareText({
      id: '1',
      title: 'SAT prep',
      html: '<p>Linear equations</p>',
      updatedAt: 1,
    });
    expect(text).toContain('SAT prep');
    expect(text).toContain('Linear equations');
    expect(text).not.toContain('<p>');
  });
});
