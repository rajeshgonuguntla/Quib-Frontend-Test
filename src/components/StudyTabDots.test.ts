import { describe, expect, it } from 'vitest';
import { studyIndexFromY } from './StudyTabDots';

describe('studyIndexFromY', () => {
  it('maps the top of the rail to Overview', () => {
    expect(studyIndexFromY(10, 10, 80, 5)).toBe(0);
  });

  it('maps the bottom of the rail to Create exam', () => {
    expect(studyIndexFromY(90, 10, 80, 5)).toBe(4);
  });

  it('maps the middle to Flashcards', () => {
    expect(studyIndexFromY(50, 10, 80, 5)).toBe(2);
  });

  it('clamps outside the rail', () => {
    expect(studyIndexFromY(-20, 10, 80, 5)).toBe(0);
    expect(studyIndexFromY(400, 10, 80, 5)).toBe(4);
  });
});
