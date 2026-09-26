export type QuizHelpKind = 'hint' | 'simpler' | 'similar';

export type SimilarPracticeQuestion = {
  question: string;
  options: string[];
  /** 0-based index when the model provides one; used only for practice feedback. */
  correctIndex?: number;
};

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
  return `${stem}\n\nCreate one similar practice question with exactly four options.
Respond with ONLY a single JSON object (no markdown fences, no extra prose):
{"question":"...","options":["...","...","...","..."],"correctIndex":0}
correctIndex is the 0-based index of the right option (for grading the practice attempt only — do not mention it in the question text).`;
}

/** Parse a similar-question tutor reply into quiz UI fields. */
export function parseSimilarPracticeQuestion(reply: string): SimilarPracticeQuestion | null {
  const trimmed = reply?.trim();
  if (!trimmed) return null;

  const fromJson = parseSimilarJson(trimmed);
  if (fromJson) return fromJson;

  return parseSimilarPlainText(trimmed);
}

function parseSimilarJson(text: string): SimilarPracticeQuestion | null {
  const candidates: string[] = [];
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) candidates.push(fenced[1].trim());
  const brace = text.match(/\{[\s\S]*\}/);
  if (brace?.[0]) candidates.push(brace[0]);
  candidates.push(text);

  for (const raw of candidates) {
    try {
      const data = JSON.parse(raw) as {
        question?: unknown;
        options?: unknown;
        correctIndex?: unknown;
        correct_index?: unknown;
      };
      const question = typeof data.question === 'string' ? data.question.trim() : '';
      const options = Array.isArray(data.options)
        ? data.options.map((o) => String(o ?? '').trim()).filter(Boolean)
        : [];
      if (!question || options.length < 2) continue;
      const four = options.slice(0, 4);
      while (four.length < 4) four.push(`Option ${String.fromCharCode(65 + four.length)}`);
      const idxRaw = data.correctIndex ?? data.correct_index;
      const correctIndex = typeof idxRaw === 'number' && Number.isInteger(idxRaw) && idxRaw >= 0 && idxRaw < four.length
        ? idxRaw
        : undefined;
      return { question, options: four, correctIndex };
    } catch {
      /* try next candidate */
    }
  }
  return null;
}

function parseSimilarPlainText(text: string): SimilarPracticeQuestion | null {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const optionRe = /^(?:[-*•]\s*)?(?:([A-Da-d])[.)]\s+|\(([A-Da-d])\)\s+)(.+)$/;
  const optionLines: { letter: string; text: string; lineIndex: number }[] = [];
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i]!.match(optionRe);
    if (!m) continue;
    const letter = (m[1] || m[2] || '').toUpperCase();
    const optText = (m[3] || '').trim();
    if (letter && optText) optionLines.push({ letter, text: optText, lineIndex: i });
  }
  if (optionLines.length < 2) return null;

  const firstOptLine = optionLines[0]!.lineIndex;
  const questionParts = lines.slice(0, firstOptLine).filter((l) => {
    const lower = l.toLowerCase();
    return !lower.startsWith('practice only') && !/^here'?s\b/i.test(l);
  });
  let question = questionParts.join(' ').replace(/^#+\s*/, '').trim();
  question = question.replace(/^practice(?:\s+only)?\s*[:.—-]\s*/i, '').trim();
  if (!question) return null;

  const byLetter = new Map<string, string>();
  for (const row of optionLines) {
    if (!byLetter.has(row.letter)) byLetter.set(row.letter, row.text);
  }
  const options = ['A', 'B', 'C', 'D'].map((letter, i) => {
    return byLetter.get(letter) ?? optionLines[i]?.text ?? `Option ${letter}`;
  });

  return { question, options };
}

export function isModuleQuizQuestionWrong(
  questionResults: { questionIndex: number; correct: boolean }[] | undefined,
  questionIndex: number,
): boolean {
  const row = questionResults?.find((r) => r.questionIndex === questionIndex);
  return !!row && row.correct === false;
}
