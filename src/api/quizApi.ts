import axios from 'axios';

export interface ApiQuizSection {
  id?: string;
  sectionKey?: string;
  title?: string;
  sortOrder?: number;
  questionCount?: number;
  timeLimitSeconds?: number;
}

export interface ApiQuizQuestion {
  id?: string;
  sectionId?: string;
  sectionKey?: string;
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
  sectionKey?: string;
  sectionTitle?: string;
}

export interface FrontendSection {
  key: string;
  title: string;
  questionCount: number;
  timeLimitSeconds: number;
  questionIndexes: number[];
}

export interface ApiSectionScore {
  sectionKey?: string;
  title?: string;
  correctCount?: number;
  totalCount?: number;
  scorePercent?: number;
}

export interface ApiAttemptSummary {
  attemptId: string;
  attemptNumber: number;
  scorePercent: number;
  correctCount: number;
  totalCount: number;
  passed: boolean;
  submittedAt?: string;
}

export function mapApiQuestionType(type?: string): FrontendQuestion['type'] {
  if (type === 'true_false') return 'trueFalse';
  if (type === 'short_answer') return 'shortAnswer';
  return 'mcq';
}

export function mapApiQuestionsToFrontend(
  questions: ApiQuizQuestion[],
  sections?: ApiQuizSection[]
): FrontendQuestion[] {
  const titleByKey = new Map(
    (sections ?? []).map((s) => [s.sectionKey ?? '', s.title ?? s.sectionKey ?? ''])
  );
  return questions
    .map((q, index) => ({
      id: index,
      type: mapApiQuestionType(q.type),
      question: q.question?.trim() ?? '',
      options: q.options,
      answer: q.correctAnswer,
      explanation: q.explanation,
      sectionKey: q.sectionKey,
      sectionTitle: q.sectionKey ? titleByKey.get(q.sectionKey) : undefined,
    }))
    .filter((q) => q.question.length > 0);
}

export function buildFrontendSections(
  sections: ApiQuizSection[] | undefined,
  questions: FrontendQuestion[]
): FrontendSection[] {
  if (sections && sections.length > 0) {
    return sections
      .slice()
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .map((s) => {
        const key = s.sectionKey ?? '';
        const indexes = questions
          .map((q, i) => (q.sectionKey === key ? i : -1))
          .filter((i) => i >= 0);
        return {
          key,
          title: s.title ?? key,
          questionCount: s.questionCount ?? indexes.length,
          timeLimitSeconds: s.timeLimitSeconds ?? Math.max(indexes.length * 90, 300),
          questionIndexes: indexes,
        };
      });
  }
  return [
    {
      key: 'all',
      title: 'Quiz',
      questionCount: questions.length,
      timeLimitSeconds: Math.max(questions.length * 90, 300),
      questionIndexes: questions.map((_, i) => i),
    },
  ];
}

/** Display sizes matching backend ExamBlueprint (before generate). */
export function examBlueprintPreview(examType: string): { questions: number; minutes: number; sections: string[] } {
  const t = (examType || 'custom').toLowerCase();
  if (t === 'sat') {
    return {
      questions: 98,
      minutes: 134,
      sections: [
        'Reading and Writing Module 1 (27)',
        'Reading and Writing Module 2 (27)',
        'Math Module 1 (22)',
        'Math Module 2 (22)',
      ],
    };
  }
  if (t === 'gre') {
    return {
      questions: 108,
      minutes: 176,
      sections: [
        'Verbal Reasoning 1 (27)',
        'Verbal Reasoning 2 (27)',
        'Quantitative Reasoning 1 (27)',
        'Quantitative Reasoning 2 (27)',
      ],
    };
  }
  return {
    questions: 60,
    minutes: 90,
    sections: ['Topic Section 1 (20)', 'Topic Section 2 (20)', 'Topic Section 3 (20)'],
  };
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

export async function fetchLatestQuizAttempt(quizId: string) {
  const response = await axios.get(`/api/quizzes/${quizId}/latest-attempt`);
  return response.data;
}

export async function fetchQuizAttempts(quizId: string): Promise<ApiAttemptSummary[]> {
  const response = await axios.get(`/api/quizzes/${quizId}/attempts`);
  return response.data ?? [];
}

export async function fetchQuizAttempt(quizId: string, attemptId: string) {
  const response = await axios.get(`/api/quizzes/${quizId}/attempts/${attemptId}`);
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
