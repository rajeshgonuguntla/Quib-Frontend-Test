import { describe, expect, it } from 'vitest';
import { defaultQuizTimeLimitSeconds } from '../api/quizApi';
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
    expect(html).toContain('Results available after the quiz');
    expect(html).toContain('Copy link');
    expect(html).toContain('Share with students');
    expect(html).toContain('Open on Cubit');
    expect(html).not.toContain('How it works');
    expect(html).not.toContain('No sign-in needed to start.');
    expect(html).not.toContain('ready-card');
    expect(html).toContain('id="quiz-shell"');
    expect(html).toContain('question-panel');
    expect(html).toContain('Multiple choice');
    expect(html).toContain('opt-btn');
    expect(html).toContain('Submit quiz');
    expect(html).toContain('quiz-timer');
    expect(html).toContain('startTimer');
    expect(html).toContain('mycubit.app/#ask');
    expect(html).toContain('goToSignIn');
    expect(html).not.toContain('cubit-quiz-bank');
    expect(html.split('<script>')[0] ?? '').not.toContain('Correct answer');
  });

  it('uses the in-app exam overview for GRE stats and sections', () => {
    const html = buildInteractiveQuizHtml({
      quizTitle: 'GRE practice exam: verbal & quantitative reasoning',
      examType: 'gre',
      practiceLabel: 'GRE practice',
      difficulty: 'medium',
      readinessLabel: 'Answer keys validated',
      questionCount: 54,
      minutes: 118,
      sections: [
        {
          title: 'Analytical writing',
          subtitle: 'Analyze an Issue',
          questionsLabel: 'Essay · self-score',
          minutes: 30,
        },
        { title: 'Verbal reasoning', subtitle: 'Section 1', questionsLabel: '12', minutes: 18 },
      ],
      questions: [
        { question: 'Pick one', type: 'mcq', options: ['A', 'B'], correctAnswer: 'B' },
      ],
    });
    expect(html).toContain('>54<');
    expect(html).toContain('>118<');
    expect(html).toContain('questions</span>');
    expect(html).toContain('min</span>');
    expect(html).toContain('sections</span>');
    expect(html).toContain('Analytical writing');
    expect(html).toContain('Essay · self-score');
    expect(html).toContain('GRE practice');
    expect(html).not.toContain('70%');
  });

  it('jsonForHtmlScript escapes script-breaking sequences', () => {
    expect(jsonForHtmlScript({ x: '</script>' })).not.toContain('</script>');
  });

  it('defaultQuizTimeLimitSeconds matches in-app taking (90s per question, 5 min floor)', () => {
    expect(defaultQuizTimeLimitSeconds(1)).toBe(300);
    expect(defaultQuizTimeLimitSeconds(10)).toBe(900);
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