import { describe, expect, it } from 'vitest';
import { buildQuizHelpMessage, isModuleQuizQuestionWrong } from './quizSecondChance';

describe('quizSecondChance', () => {
  it('builds help prompts that forbid revealing the answer', () => {
    const hint = buildQuizHelpMessage('hint', 'How much more flour?', ['1 cup', '2 cups']);
    expect(hint).toContain('How much more flour?');
    expect(hint).toContain('A. 1 cup');
    expect(hint.toLowerCase()).toContain('without revealing');
  });

  it('detects wrong module-quiz rows', () => {
    expect(isModuleQuizQuestionWrong([{ questionIndex: 0, correct: false }], 0)).toBe(true);
    expect(isModuleQuizQuestionWrong([{ questionIndex: 0, correct: true }], 0)).toBe(false);
    expect(isModuleQuizQuestionWrong(undefined, 0)).toBe(false);
  });
});
