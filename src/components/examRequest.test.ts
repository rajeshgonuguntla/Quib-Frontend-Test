import { describe, expect, it } from 'vitest';
import { examDisplayTitle, isStandardizedExamRequest, promptForExamGeneration, resolveExamType } from './examRequest';

describe('exam requests', () => {
  it('treats a generate-a-GRE-test ask as a GRE exam', () => {
    expect(isStandardizedExamRequest('generate a gre test')).toBe(true);
    expect(resolveExamType('generate a gre test', 'custom')).toBe('gre');
  });

  it('does not treat a general mention as an exam request', () => {
    expect(isStandardizedExamRequest('What is the GRE?')).toBe(false);
    expect(isStandardizedExamRequest('How does Python handle lists?')).toBe(false);
  });

  it('builds a GRE generation prompt instead of a generic topic', () => {
    const prompt = promptForExamGeneration('generate a gre test', 'gre');
    expect(prompt).toContain('GRE General Test');
    expect(prompt).toContain('quantitative comparison');
    expect(prompt).toContain('Learner request: generate a gre test');
    expect(examDisplayTitle('Practice quiz', 'gre')).toBe('GRE practice test');
    expect(examDisplayTitle('GRE Verbal Set', 'gre')).toBe('GRE Verbal Set');
  });
});
