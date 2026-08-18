import { beforeEach, describe, expect, it } from 'vitest';
import {
  clearStudyToolCache,
  readCachedStudyTool,
  resolveStudyToolData,
  seedStudyToolFromLesson,
  writeCachedStudyTool,
} from './studyToolCache';
import type { LessonStudyToolResponse } from '../api/studyRailApi';

const cards: LessonStudyToolResponse = {
  type: 'flashcards',
  source: 'lesson',
  flashcards: [{ front: 'Q', back: 'A' }],
};

const blanks: LessonStudyToolResponse = {
  type: 'blanks',
  source: 'lesson',
  blanks: [{ sentence: 'The ___ is red', answer: 'sky' }],
};

describe('studyToolCache', () => {
  beforeEach(() => {
    clearStudyToolCache();
  });

  it('restores a tool after switching away and back', () => {
    writeCachedStudyTool('c1', 'l1', 'flashcards', cards);
    writeCachedStudyTool('c1', 'l1', 'blanks', blanks);

    expect(readCachedStudyTool('c1', 'l1', 'flashcards')).toEqual(cards);
    expect(readCachedStudyTool('c1', 'l1', 'blanks')).toEqual(blanks);
    expect(readCachedStudyTool('c1', 'l1', 'exam')).toBeNull();
    expect(readCachedStudyTool('c1', 'l2', 'flashcards')).toBeNull();
  });

  it('seeds flashcards and blanks from the course lesson until regenerate', () => {
    const seededCards = [{ front: 'Prompt', back: 'Answer' }];
    const seededBlanks = [{ sentence: 'The ____ is red', answer: 'sky' }];

    expect(seedStudyToolFromLesson('flashcards', seededCards, seededBlanks)).toEqual({
      type: 'flashcards',
      source: 'course',
      flashcards: seededCards,
    });
    expect(seedStudyToolFromLesson('blanks', seededCards, seededBlanks)).toEqual({
      type: 'blanks',
      source: 'course',
      blanks: seededBlanks,
    });
    expect(seedStudyToolFromLesson('exam', seededCards, seededBlanks)).toBeNull();
    expect(seedStudyToolFromLesson('flashcards', [], seededBlanks)).toBeNull();

    expect(resolveStudyToolData('c1', 'l1', 'flashcards', seededCards, seededBlanks)?.source).toBe('course');
    writeCachedStudyTool('c1', 'l1', 'flashcards', cards);
    expect(resolveStudyToolData('c1', 'l1', 'flashcards', seededCards, seededBlanks)).toEqual(cards);
  });
});
