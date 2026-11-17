import { AxiosError } from 'axios';
import { describe, expect, it } from 'vitest';
import {
  isRecoverableGenerateFailure,
  pickRecoveredQuizId,
} from './recoverGeneratedQuiz';

describe('pickRecoveredQuizId', () => {
  const started = Date.parse('2026-11-17T15:53:43.000Z');

  it('picks the newest matching prompt quiz created after generate start', () => {
    const id = pickRecoveredQuizId(
      [
        {
          id: 'old',
          examType: 'gre',
          sourceType: 'prompt',
          questionCount: 54,
          createdAt: '2026-11-17T15:00:00.000Z',
        },
        {
          id: 'sat-new',
          examType: 'sat',
          sourceType: 'prompt',
          questionCount: 98,
          createdAt: '2026-11-17T15:56:00.000Z',
        },
        {
          id: 'youtube',
          examType: 'gre',
          sourceType: 'youtube',
          questionCount: 10,
          createdAt: '2026-11-17T15:56:40.000Z',
        },
        {
          id: 'gre-new',
          examType: 'gre',
          sourceType: 'prompt',
          questionCount: 54,
          createdAt: '2026-11-17T15:56:30.000Z',
        },
      ],
      started,
      'gre',
    );
    expect(id).toBe('gre-new');
  });

  it('returns null when nothing recent matches', () => {
    expect(
      pickRecoveredQuizId(
        [
          {
            id: 'x',
            examType: 'gre',
            sourceType: 'prompt',
            questionCount: 54,
            createdAt: '2026-11-17T12:00:00.000Z',
          },
        ],
        started,
        'gre',
      ),
    ).toBeNull();
  });
});

describe('isRecoverableGenerateFailure', () => {
  it('treats Network Error and gateway timeouts as recoverable', () => {
    expect(isRecoverableGenerateFailure(new AxiosError('Network Error'))).toBe(true);
    expect(
      isRecoverableGenerateFailure(
        new AxiosError('Bad Gateway', 'ERR', undefined, undefined, {
          status: 502,
          statusText: 'Bad Gateway',
          headers: {},
          config: {} as never,
          data: {},
        }),
      ),
    ).toBe(true);
  });

  it('does not recover real 4xx API errors', () => {
    expect(
      isRecoverableGenerateFailure(
        new AxiosError('Nope', 'ERR', undefined, undefined, {
          status: 400,
          statusText: 'Bad Request',
          headers: {},
          config: {} as never,
          data: { message: 'prompt too short' },
        }),
      ),
    ).toBe(false);
  });
});
