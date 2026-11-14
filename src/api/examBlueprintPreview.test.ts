import { describe, expect, it } from 'vitest';
import { examBlueprintPreview, examSectionRowsFromApi } from './quizApi';

describe('examBlueprintPreview', () => {
  it('matches Sept 2023 GRE objective form (+ AWA note)', () => {
    const gre = examBlueprintPreview('gre');
    expect(gre.questions).toBe(54);
    expect(gre.minutes).toBe(118);
    expect(gre.displayTitle).toMatch(/verbal & quantitative/i);
    expect(gre.sectionRows).toHaveLength(5);
    expect(gre.sections[0]).toMatch(/Analytical writing/i);
    expect(gre.sections.some((s) => s.includes('12') && s.includes('18'))).toBe(true);
    expect(gre.sectionRows.some((s) => s.minutes === 26 && s.questionsLabel === '15')).toBe(true);
    expect(gre.sectionRows[0]?.subtitle).toBe('Analyze an Issue');
    expect(gre.practiceLabel).toBe('GRE practice');
  });

  it('keeps SAT digital shape', () => {
    const sat = examBlueprintPreview('sat');
    expect(sat.questions).toBe(98);
  });

  it('maps API sections onto Quiz ready rows', () => {
    const rows = examSectionRowsFromApi([
      { sectionKey: 's2', title: 'Verbal — Section 2', questionCount: 20, timeLimitSeconds: 1800, sortOrder: 2 },
      { sectionKey: 's1', title: 'Verbal — Section 1', questionCount: 20, timeLimitSeconds: 1800, sortOrder: 1 },
    ]);
    expect(rows).toEqual([
      { title: 'Verbal', subtitle: 'Section 1', questionsLabel: '20', minutes: 30 },
      { title: 'Verbal', subtitle: 'Section 2', questionsLabel: '20', minutes: 30 },
    ]);
  });
});
