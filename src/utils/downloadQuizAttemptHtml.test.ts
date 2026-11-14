import { describe, expect, it } from 'vitest';
import {
  buildInteractiveQuizHtml,
  buildQuizAttemptHtml,
  cubitPublicSignInUrl,
  escapeHtmlForExport,
  jsonForHtmlScript,
  mapGeneratedQuestionsToInteractiveItems,
} from './downloadQuizAttemptHtml';

describe('downloadQuizAttemptHtml', () => {
  it('escapes HTML in questions and answers', () => {
    const html = buildQuizAttemptHtml({
      quizTitle: 'Test <b>quiz</b>',
      scorePercent: 80,
      correctCount: 4,
      totalCount: 5,
      passed: true,
      sectionScores: [],
      questions: [
        {
          index: 1,
          question: '<script>alert(1)</script>',
          userAnswer: 'A & B',
          correctAnswer: 'C',
          isCorrect: false,
          explanation: 'Because <math>',
        },
      ],
    });
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
    expect(html).toContain('A &amp; B');
    expect(html).toContain('80%');
    expect(html).toContain('Correct answer');
    expect(html).toContain('Your answer');
  });

  it('includes section scores when provided', () => {
    const html = buildQuizAttemptHtml({
      quizTitle: 'GRE',
      scorePercent: 72,
      correctCount: 39,
      totalCount: 54,
      passed: true,
      sectionScores: [{ topic: 'Verbal 1', scorePercent: 75, totalCount: 12 }],
      questions: [],
    });
    expect(html).toContain('Section scores');
    expect(html).toContain('Verbal 1');
    expect(html).toContain('75%');
  });

  it('escapeHtmlForExport handles quotes', () => {
    expect(escapeHtmlForExport(`"x"`)).toBe('&quot;x&quot;');
  });

  it('interactive quiz embeds answer bank but not visible correct labels in the form', () => {
    const html = buildInteractiveQuizHtml({
      quizTitle: 'Sample',
      questions: [
        {
          question: 'Pick one',
          type: 'mcq',
          options: ['A', 'B'],
          correctAnswer: 'B',
          explanation: 'Because',
        },
      ],
    });
    expect(html).toContain('Start quiz');
    expect(html).toContain('Quiz ready');
    expect(html).toContain('How it works');
    expect(html).toContain('No sign-in needed to start.');
    expect(html).toContain('ready-card');
    expect(html).toContain('id="quiz-shell"');
    expect(html).toContain('question-panel');
    expect(html).toContain('Multiple choice');
    expect(html).toContain('opt-btn');
    expect(html).toContain('Submit quiz');
    expect(html).toContain('mycubit.app/#ask');
    expect(html).toContain('goToSignIn');
    expect(html).not.toContain('cubit-quiz-bank');
    expect(html.split('<script>')[0] ?? '').not.toContain('Correct answer');
  });

  it('jsonForHtmlScript escapes script-breaking sequences', () => {
    expect(jsonForHtmlScript({ x: '</script>' })).not.toContain('</script>');
  });

  it('cubitPublicSignInUrl is the live landing sign-in', () => {
    expect(cubitPublicSignInUrl()).toBe('https://mycubit.app/#ask');
  });

  it('mapGeneratedQuestionsToInteractiveItems includes questions without answer keys', () => {
    const items = mapGeneratedQuestionsToInteractiveItems([
      { type: 'mcq', question: 'Q1', options: ['A', 'B'], answer: 'B' },
      { type: 'shortAnswer', question: 'Q2', answer: '' },
    ]);
    expect(items).toHaveLength(2);
    expect(items[0]?.correctAnswer).toBe('B');
    expect(items[1]?.correctAnswer).toBe('');
  });
});