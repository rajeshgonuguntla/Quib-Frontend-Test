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
  correctAnswerIndex?: number;
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
    .map((q, index) => {
      const fromIndex =
        typeof q.correctAnswerIndex === 'number' && Array.isArray(q.options)
          ? q.options[q.correctAnswerIndex]?.trim()
          : undefined;
      const fromField = q.correctAnswer?.trim();
      return {
      id: index,
      type: mapApiQuestionType(q.type),
      question: q.question?.trim() ?? '',
      options: q.options,
      answer: fromField || fromIndex || undefined,
      correctAnswerIndex:
        typeof q.correctAnswerIndex === 'number' ? q.correctAnswerIndex : undefined,
      explanation: q.explanation,
      sectionKey: q.sectionKey,
      sectionTitle: q.sectionKey ? titleByKey.get(q.sectionKey) : undefined,
    };
    })
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
          timeLimitSeconds: s.timeLimitSeconds ?? defaultQuizTimeLimitSeconds(indexes.length),
          questionIndexes: indexes,
        };
      });
  }
  return [
    {
      key: 'all',
      title: 'Quiz',
      questionCount: questions.length,
      timeLimitSeconds: defaultQuizTimeLimitSeconds(questions.length),
      questionIndexes: questions.map((_, i) => i),
    },
  ];
}

/** Same clock as in-app QuizTaking and exported HTML: 90s per question, 5 minutes minimum. */
export function defaultQuizTimeLimitSeconds(questionCount: number): number {
  return Math.max(Math.max(0, questionCount) * 90, 300);
}

export type ExamBlueprintSectionRow = {
  title: string;
  subtitle?: string;
  questionsLabel: string;
  minutes: number;
};

export type ExamBlueprintPreview = {
  questions: number;
  minutes: number;
  displayTitle: string;
  practiceLabel: string;
  sectionRows: ExamBlueprintSectionRow[];
  /** Flattened labels for tests and older call sites. */
  sections: string[];
};

function blueprintFromRows(
  questions: number,
  minutes: number,
  displayTitle: string,
  practiceLabel: string,
  sectionRows: ExamBlueprintSectionRow[],
): ExamBlueprintPreview {
  return {
    questions,
    minutes,
    displayTitle,
    practiceLabel,
    sectionRows,
    sections: sectionRows.map((row) => {
      const sub = row.subtitle ? ` — ${row.subtitle}` : '';
      return `${row.title}${sub} (${row.questionsLabel} / ${row.minutes} min)`;
    }),
  };
}

/** Display sizes matching backend ExamBlueprint (before generate). */
export function examBlueprintPreview(examType: string): ExamBlueprintPreview {
  const t = (examType || 'custom').toLowerCase();
  if (t === 'sat') {
    return blueprintFromRows(98, 134, 'SAT practice exam: reading, writing & math', 'SAT practice', [
      { title: 'Reading and Writing', subtitle: 'Module 1', questionsLabel: '27', minutes: 32 },
      { title: 'Reading and Writing', subtitle: 'Module 2', questionsLabel: '27', minutes: 32 },
      { title: 'Math', subtitle: 'Module 1', questionsLabel: '22', minutes: 35 },
      { title: 'Math', subtitle: 'Module 2', questionsLabel: '22', minutes: 35 },
    ]);
  }
  if (t === 'gre') {
    // Objective modules match ExamBlueprint.gre (Sept 2023). AWA 30 min is self-scored, not auto-generated.
    return blueprintFromRows(
      54,
      118,
      'GRE practice exam: verbal & quantitative reasoning',
      'GRE practice',
      [
        {
          title: 'Analytical writing',
          subtitle: 'Analyze an issue',
          questionsLabel: 'Essay · self-score',
          minutes: 30,
        },
        { title: 'Verbal reasoning', subtitle: 'Section 1', questionsLabel: '12', minutes: 18 },
        { title: 'Verbal reasoning', subtitle: 'Section 2', questionsLabel: '15', minutes: 23 },
        { title: 'Quantitative reasoning', subtitle: 'Section 1', questionsLabel: '12', minutes: 21 },
        { title: 'Quantitative reasoning', subtitle: 'Section 2', questionsLabel: '15', minutes: 26 },
      ],
    );
  }
  return blueprintFromRows(60, 90, 'Practice exam', 'Practice', [
    { title: 'Topic section', subtitle: 'Section 1', questionsLabel: '20', minutes: 30 },
    { title: 'Topic section', subtitle: 'Section 2', questionsLabel: '20', minutes: 30 },
    { title: 'Topic section', subtitle: 'Section 3', questionsLabel: '20', minutes: 30 },
  ]);
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
