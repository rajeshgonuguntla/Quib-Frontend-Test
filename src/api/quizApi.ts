import axios from 'axios';

export interface ApiQuizQuestion {
  id?: string;
  sortOrder?: number;
  type?: string;
  question?: string;
  options?: string[];
  correctAnswerIndex?: number;
  correctAnswer?: string;
  explanation?: string;
}

export interface FrontendQuestion {
  id: number;
  type: 'mcq' | 'trueFalse' | 'shortAnswer';
  question: string;
  options?: string[];
  answer?: string;
  explanation?: string;
}

export function mapApiQuestionType(type?: string): FrontendQuestion['type'] {
  if (type === 'true_false') return 'trueFalse';
  if (type === 'short_answer') return 'shortAnswer';
  return 'mcq';
}

export function mapApiQuestionsToFrontend(questions: ApiQuizQuestion[]): FrontendQuestion[] {
  return questions
    .map((q, index) => ({
      id: index,
      type: mapApiQuestionType(q.type),
      question: q.question?.trim() ?? '',
      options: q.options,
      answer: q.correctAnswer,
      explanation: q.explanation,
    }))
    .filter((q) => q.question.length > 0);
}

export function isUuid(value: string | undefined): boolean {
  if (!value) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export async function fetchQuizDetail(quizId: string, includeAnswers = false) {
  const response = await axios.get(`/api/quizzes/${quizId}`, {
    params: { includeAnswers },
  });
  return response.data;
}

export async function submitQuizAttempt(
  quizId: string,
  answers: Record<number, string | string[]>,
  timeSpentSeconds?: number
) {
  const payload = {
    answers: Object.fromEntries(
      Object.entries(answers).map(([key, value]) => [key, Array.isArray(value) ? value.join(', ') : value])
    ),
    timeSpentSeconds,
  };
  const response = await axios.post(`/api/quizzes/${quizId}/submit`, payload);
  return response.data;
}
