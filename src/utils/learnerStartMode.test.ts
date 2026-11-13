import { describe, expect, it } from 'vitest';
import {
  LEARNER_START_TABS,
  isLearnerStartModeReady,
  studyToolFromStartMode,
} from './learnerStartMode';

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

describe('isLearnerStartModeReady', () => {
  it('enables course, notes, and quiz; flashcards stay inert', () => {
    expect(isLearnerStartModeReady('course')).toBe(true);
    expect(isLearnerStartModeReady('quiz')).toBe(true);
    expect(isLearnerStartModeReady('notes')).toBe(true);
    expect(isLearnerStartModeReady('flashcards')).toBe(false);
    expect(isLearnerStartModeReady('blanks')).toBe(false);
  });
});

describe('LEARNER_START_TABS', () => {
  it('offers course, notes, flashcards, and quiz in the search bar', () => {
    expect(LEARNER_START_TABS.map((tab) => tab.id)).toEqual(['course', 'notes', 'flashcards', 'quiz']);
  });
});
