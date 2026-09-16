export type QuizHelpKind = 'hint' | 'simpler' | 'similar';

/** Build a tutor message that asks for help without requesting the correct option. */
export function buildQuizHelpMessage(
  kind: QuizHelpKind,
  question: string,
  options: string[],
): string {
  const listed = options
    .map((opt, i) => `${String.fromCharCode(65 + i)}. ${opt}`)
    .join('\n');
  const stem = `Practice question (do NOT say which option is correct):\n${question}\n${listed}`;

  if (kind === 'hint') {
    return `${stem}\n\nGive one short hint that nudges toward the idea without revealing the answer letter or option text as "the answer".`;
  }
  if (kind === 'simpler') {
    return `${stem}\n\nGive a simpler everyday example that teaches the same idea. Do not reveal which quiz option is correct.`;
  }
  return `${stem}\n\nWrite one similar practice question with four options (A–D). Label it "Practice only". Do not reveal the correct option for either question.`;
}

export function isModuleQuizQuestionWrong(
  questionResults: { questionIndex: number; correct: boolean }[] | undefined,
  questionIndex: number,
): boolean {
  const row = questionResults?.find((r) => r.questionIndex === questionIndex);
  return !!row && row.correct === false;
}
