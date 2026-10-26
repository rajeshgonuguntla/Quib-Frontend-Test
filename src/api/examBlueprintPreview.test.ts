import { describe, expect, it } from 'vitest';
import { examBlueprintPreview } from './quizApi';

describe('examBlueprintPreview', () => {
  it('matches Sept 2023 GRE objective form (+ AWA note)', () => {
    const gre = examBlueprintPreview('gre');
    expect(gre.questions).toBe(54);
    expect(gre.minutes).toBe(118);
    expect(gre.sections[0]).toMatch(/Analytical Writing/);
    expect(gre.sections.some((s) => s.includes('12 / 18'))).toBe(true);
    expect(gre.sections.some((s) => s.includes('15 / 26'))).toBe(true);
  });

  it('keeps SAT digital shape', () => {
    const sat = examBlueprintPreview('sat');
    expect(sat.questions).toBe(98);
  });
});
