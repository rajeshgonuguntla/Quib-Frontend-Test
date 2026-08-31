import { describe, expect, it } from 'vitest';
import { studyToolFromStartMode } from './StudentMasterInput';

describe('studyToolFromStartMode', () => {
  it('maps dashboard tabs onto lesson study-tool APIs', () => {
    expect(studyToolFromStartMode('notes')).toBe('notes');
    expect(studyToolFromStartMode('flashcards')).toBe('flashcards');
    expect(studyToolFromStartMode('blanks')).toBe('blanks');
  });

  it('does not map course or quiz onto study tools', () => {
    expect(studyToolFromStartMode('course')).toBeNull();
    expect(studyToolFromStartMode('quiz')).toBeNull();
    expect(studyToolFromStartMode(undefined)).toBeNull();
  });
});
