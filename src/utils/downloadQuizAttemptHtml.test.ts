import { describe, expect, it } from 'vitest';
import {
  buildInteractiveQuizHtml,
  buildQuizAttemptHtml,
  escapeHtmlForExport,
  jsonForHtmlScript,
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
    expect(html).toContain('cubit-quiz-bank');
    expect(html).toContain('"correctAnswer":"B"');
    expect(html).toContain('Start quiz');
    expect(html).toContain('id="intro"');
    expect(html).toContain('cubit-mark');
    expect(html).toContain('id="form-wrap" class="hide"');
    expect(html).toContain('Submit and see score');
    const formOnly = html.split('<script id="cubit-quiz-bank"')[0] ?? '';
    expect(formOnly).not.toContain('Correct answer');
  });

  it('jsonForHtmlScript escapes script-breaking sequences', () => {
    expect(jsonForHtmlScript({ x: '</script>' })).not.toContain('</script>');
  });
});