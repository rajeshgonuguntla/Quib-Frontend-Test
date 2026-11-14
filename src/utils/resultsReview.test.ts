import { describe, expect, it } from 'vitest';
import {
  classifyAttemptAnswer,
  formatExamMetaLine,
  formatQuestionSectionKicker,
  formatResultsSectionLabel,
  kickerForQuestionIndex,
  resultsSummaryCopy,
} from './resultsReview';

describe('resultsReview', () => {
  it('classifies skipped before wrong', () => {
    expect(classifyAttemptAnswer('', false)).toBe('skipped');
    expect(classifyAttemptAnswer('  ', false)).toBe('skipped');
    expect(classifyAttemptAnswer('Not answered', false)).toBe('skipped');
    expect(classifyAttemptAnswer('B', false)).toBe('wrong');
    expect(classifyAttemptAnswer('', true)).toBe('correct');
  });

  it('formats section labels like the results screenshot', () => {
    expect(formatResultsSectionLabel('Verbal Reasoning — Section 1')).toBe(
      'Verbal reasoning, section 1',
    );
    expect(formatQuestionSectionKicker('Verbal Reasoning — Section 1')).toBe(
      'Verbal reasoning · section 1',
    );
  });

  it('builds exam meta and fail copy', () => {
    expect(formatExamMetaLine('GRE practice', undefined)).toBe('GRE practice exam');
    expect(resultsSummaryCopy(0, 54, false)).toMatch(/try again/i);
    expect(resultsSummaryCopy(50, 54, true)).not.toMatch(/try again/i);
  });

  it('assigns kickers from section totals when questions lack titles', () => {
    const sections = [
      { title: 'Analytical Writing', totalCount: 0 },
      { title: 'Verbal Reasoning — Section 1', totalCount: 12 },
      { title: 'Verbal Reasoning — Section 2', totalCount: 15 },
    ];
    expect(kickerForQuestionIndex(0, [], sections)).toBe('Verbal reasoning · section 1');
    expect(kickerForQuestionIndex(12, [], sections)).toBe('Verbal reasoning · section 2');
  });
});
