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

  it('does not map course, Cubit, or quiz onto study tools', () => {
    expect(studyToolFromStartMode('course')).toBeNull();
    expect(studyToolFromStartMode('cubit')).toBeNull();
    expect(studyToolFromStartMode('quiz')).toBeNull();
    expect(studyToolFromStartMode(undefined)).toBeNull();
  });
});

describe('isLearnerStartModeReady', () => {
  it('enables Cubit, course, notes, and quiz; flashcards stay inert', () => {
    expect(isLearnerStartModeReady('cubit')).toBe(true);
    expect(isLearnerStartModeReady('course')).toBe(true);
    expect(isLearnerStartModeReady('quiz')).toBe(true);
    expect(isLearnerStartModeReady('notes')).toBe(true);
    expect(isLearnerStartModeReady('flashcards')).toBe(false);
    expect(isLearnerStartModeReady('blanks')).toBe(false);
  });
});

describe('LEARNER_START_TABS', () => {
  it('offers course, notes, flashcards, and quiz in the search bar', () => {
    expect(LEARNER_START_TABS.map((tab) => tab.label)).toEqual(['Cubit', 'Create a course', 'Notes', 'Flashcards', 'Quiz']);
    expect(LEARNER_START_TABS.map((tab) => tab.id)).toEqual(['cubit', 'course', 'notes', 'flashcards', 'quiz']);
  });
});
