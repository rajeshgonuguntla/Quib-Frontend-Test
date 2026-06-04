export interface BackendQuestion {
  question?: string;
  options?: string[];
  correctAnswerIndex?: number;
  explanation?: string;
}

export interface BackendQuizObject {
  title?: string;
  questions?: BackendQuestion[];
}

export interface ParsedQuizQuestion {
  id: number;
  type: 'mcq' | 'trueFalse' | 'shortAnswer';
  question: string;
  options?: string[];
  answer?: string;
  explanation?: string;
}

/** Match backend QuizJsonParser — handles fences even when not wrapped exactly. */
export function stripCodeFence(value: string): string {
  const trimmed = value.trim();
  if (!trimmed.startsWith('```')) {
    return trimmed;
  }
  const firstNewline = trimmed.indexOf('\n');
  const lastFence = trimmed.lastIndexOf('```');
  if (firstNewline >= 0 && lastFence > firstNewline) {
    return trimmed.substring(firstNewline + 1, lastFence).trim();
  }
  const fenceMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenceMatch?.[1]?.trim() ?? trimmed;
}

export function parseRawQuizJson(rawQuiz: string | undefined | null): BackendQuizObject | null {
  if (!rawQuiz?.trim()) {
    return null;
  }
  try {
    return JSON.parse(stripCodeFence(rawQuiz)) as BackendQuizObject;
  } catch {
    return null;
  }
}

export function normalizeQuestions(rawQuestions: BackendQuestion[]): ParsedQuizQuestion[] {
  return rawQuestions
    .map((q, index) => {
      const options = Array.isArray(q.options) ? q.options : undefined;
      const isTrueFalse =
        Array.isArray(options) &&
        options.length === 2 &&
        options.every((o) => {
          const n = o.trim().toLowerCase();
          return n === 'true' || n === 'false';
        });
      const type = options?.length ? (isTrueFalse ? 'trueFalse' : 'mcq') : 'shortAnswer';
      return {
        id: index,
        type,
        question: q.question?.trim() ?? '',
        options,
        answer:
          typeof q.correctAnswerIndex === 'number' && options?.[q.correctAnswerIndex]
            ? options[q.correctAnswerIndex]
            : undefined,
        explanation: q.explanation?.trim(),
      };
    })
    .filter((q) => q.question.length > 0);
}

export function questionsFromRawQuiz(rawQuiz: string | undefined | null): ParsedQuizQuestion[] {
  const parsed = parseRawQuizJson(rawQuiz);
  if (!parsed?.questions?.length) {
    return [];
  }
  return normalizeQuestions(parsed.questions);
}
