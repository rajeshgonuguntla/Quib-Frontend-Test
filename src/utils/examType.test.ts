import { describe, expect, it } from 'vitest';
import { inferExamTypeFromText, resolveExamType } from './examType';

describe('examType', () => {
  it('infers GRE from a GRE-flavored prompt', () => {
    expect(inferExamTypeFromText('GRE verbal: analogies')).toBe('gre');
    expect(inferExamTypeFromText('Graduate Record exam quant')).toBe('gre');
  });

  it('infers SAT from SAT wording', () => {
    expect(inferExamTypeFromText('SAT math: linear equations')).toBe('sat');
  });

  it('keeps custom when the prompt is not an exam name', () => {
    expect(inferExamTypeFromText('photosynthesis and cell respiration')).toBe('custom');
  });

  it('lets an explicit SAT/GRE chip override the prompt', () => {
    expect(resolveExamType('sat', 'GRE verbal')).toBe('sat');
    expect(resolveExamType('gre', 'SAT math')).toBe('gre');
  });

  it('infers from the prompt when the chip is custom', () => {
    expect(resolveExamType('custom', 'GRE practice exam verbal focus')).toBe('gre');
    expect(resolveExamType(undefined, 'SAT reading')).toBe('sat');
  });
});
