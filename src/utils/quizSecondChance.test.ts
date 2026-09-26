import { describe, expect, it } from 'vitest';
import {
  buildQuizHelpMessage,
  isModuleQuizQuestionWrong,
  parseSimilarPracticeQuestion,
} from './quizSecondChance';

describe('quizSecondChance', () => {
  it('builds help prompts that forbid revealing the answer', () => {
    const hint = buildQuizHelpMessage('hint', 'How much more flour?', ['1 cup', '2 cups']);
    expect(hint).toContain('How much more flour?');
    expect(hint).toContain('A. 1 cup');
    expect(hint.toLowerCase()).toContain('without revealing');
  });

  it('asks similar questions for JSON the UI can render', () => {
    const similar = buildQuizHelpMessage('similar', 'What is 2+2?', ['3', '4', '5', '6']);
    expect(similar).toContain('"question"');
    expect(similar).toContain('"options"');
    expect(similar).toContain('correctIndex');
  });

  it('parses JSON similar-question replies into quiz fields', () => {
    const parsed = parseSimilarPracticeQuestion(
      '{"question":"Which is a mammal?","options":["Shark","Dolphin","Trout","Jellyfish"],"correctIndex":1}',
    );
    expect(parsed).toEqual({
      question: 'Which is a mammal?',
      options: ['Shark', 'Dolphin', 'Trout', 'Jellyfish'],
      correctIndex: 1,
    });
  });

  it('parses fenced JSON and plain A–D text fallbacks', () => {
    const fenced = parseSimilarPracticeQuestion(`\`\`\`json
{"question":"Pick one","options":["A1","B1","C1","D1"],"correctIndex":0}
\`\`\``);
    expect(fenced?.question).toBe('Pick one');
    expect(fenced?.options).toEqual(['A1', 'B1', 'C1', 'D1']);

    const plain = parseSimilarPracticeQuestion(`Practice only:
What color is the sky?
A. Green
B. Blue
C. Red
D. Yellow`);
    expect(plain?.question).toContain('What color is the sky?');
    expect(plain?.options[1]).toBe('Blue');
  });

  it('detects wrong module-quiz rows', () => {
    expect(isModuleQuizQuestionWrong([{ questionIndex: 0, correct: false }], 0)).toBe(true);
    expect(isModuleQuizQuestionWrong([{ questionIndex: 0, correct: true }], 0)).toBe(false);
    expect(isModuleQuizQuestionWrong(undefined, 0)).toBe(false);
  });
});
