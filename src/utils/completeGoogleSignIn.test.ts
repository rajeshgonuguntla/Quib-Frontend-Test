import { describe, expect, it } from 'vitest';
import { resolveLearnerStartDestination } from './learnerStartDestination';

describe('resolveLearnerStartDestination', () => {
  it('routes course YouTube URLs to course-builder', () => {
    expect(
      resolveLearnerStartDestination({
        youtubeUrl: 'https://www.youtube.com/watch?v=abc',
        startTool: 'course',
      }),
    ).toEqual({
      path: '/course-builder',
      state: {
        youtubeUrl: 'https://www.youtube.com/watch?v=abc',
        startTool: 'course',
      },
    });
  });

  it('routes quiz prompts to quiz-setup', () => {
    expect(
      resolveLearnerStartDestination({
        prompt: 'SAT math: linear equations',
        examType: 'sat',
        startTool: 'quiz',
      }),
    ).toEqual({
      path: '/quiz-setup',
      state: {
        prompt: 'SAT math: linear equations',
        examType: 'sat',
        startTool: 'quiz',
      },
    });
  });

  it('returns null when there is no learner start payload', () => {
    expect(resolveLearnerStartDestination({ signInIntent: 'student' })).toBeNull();
  });
});
