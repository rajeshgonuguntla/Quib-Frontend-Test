import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router';
import { useTheme, getC } from './ThemeContext';
import { QuizSetupChrome } from './QuizReadyScreen';
import { ResultsScreen, type ResultsFilter, type ResultsQuestionRow } from './ResultsScreen';
import {
  examBlueprintPreview,
  fetchLatestQuizAttempt,
  fetchQuizAttempt,
  fetchQuizAttempts,
  fetchQuizDetail,
  isUuid,
  mapApiQuestionsToFrontend,
  type ApiAttemptSummary,
  type ApiSectionScore,
  type FrontendQuestion,
} from '../api/quizApi';
import { cubitPublicQuizUrl, downloadQuizAttemptHtmlReport } from '../utils/downloadQuizAttemptHtml';
import {
  classifyAttemptAnswer,
  formatExamMetaLine,
  formatResultsSectionLabel,
  kickerForQuestionIndex,
  resultsSummaryCopy,
} from '../utils/resultsReview';

const EMPTY_ANSWERS: Record<number, string | string[]> = {};

interface QuizMeta {
  title: string;
  channelName: string;
  videoLength: string;
  youtubeUrl: string;
}

const readStored = <T,>(key: string, fallback: T): T => {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

function answerText(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value.join(', ');
  return String(value ?? '');
}

type AttemptResult = {
  attemptId?: string;
  scorePercent?: number;
  correctCount?: number;
  totalCount?: number;
  passed?: boolean;
  attemptNumber?: number;
  examType?: string;
  submittedAt?: string;
  sectionScores?: ApiSectionScore[];
  questionReview?: Array<{
    sortOrder: number;
    type: string;
    question: string;
    userAnswer: string;
    correctAnswer: string;
    correct: boolean;
    explanation?: string;
    sectionTitle?: string;
  }>;
};

export function Results() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { isDark } = useTheme();
  const C = getC(isDark);
  const [filter, setFilter] = useState<ResultsFilter>('all');
  const [loadedResult, setLoadedResult] = useState<AttemptResult | undefined>(location.state?.result);
  const [resultsError, setResultsError] = useState<string | null>(null);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [attemptHistory, setAttemptHistory] = useState<ApiAttemptSummary[]>([]);
  const [examType, setExamType] = useState(
    () =>
      sessionStorage.getItem('quizExamType') ||
      (location.state?.examType as string | undefined) ||
      '',
  );
  const [questions, setQuestions] = useState<FrontendQuestion[]>(
    () => location.state?.questions ?? readStored<FrontendQuestion[]>('generatedQuestions', []),
  );
  const [videoMeta, setVideoMeta] = useState<QuizMeta>(
    () =>
      location.state?.videoMeta ??
      readStored<QuizMeta>('generatedVideoMeta', {
        title: 'Generated Quiz',
        channelName: 'Unknown Channel',
        videoLength: '--:--',
        youtubeUrl: '',
      }),
  );

  const answers: Record<number, string | string[]> = location.state?.answers ?? EMPTY_ANSWERS;

  useEffect(() => {
    if (loadedResult || !id || !isUuid(id)) return;
    let mounted = true;
    setResultsLoading(true);
    fetchLatestQuizAttempt(id)
      .then((data) => {
        if (mounted) setLoadedResult(data);
      })
      .catch(() => {
        if (mounted) setResultsError('No saved results found for this quiz.');
      })
      .finally(() => {
        if (mounted) setResultsLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [id, loadedResult]);

  useEffect(() => {
    if (!id || !isUuid(id)) return;
    let mounted = true;
    fetchQuizAttempts(id)
      .then((rows) => {
        if (mounted) setAttemptHistory(rows);
      })
      .catch(() => {
        if (mounted) setAttemptHistory([]);
      });
    return () => {
      mounted = false;
    };
  }, [id, loadedResult]);

  useEffect(() => {
    if (!id || !isUuid(id)) return;
    let mounted = true;
    fetchQuizDetail(id, false)
      .then((data) => {
        if (!mounted) return;
        if (data.examType) {
          sessionStorage.setItem('quizExamType', data.examType);
          setExamType(data.examType);
        }
        const mapped = mapApiQuestionsToFrontend(data.questions ?? [], data.sections);
        if (mapped.length) setQuestions(mapped);
        setVideoMeta({
          title: data.title ?? 'Generated Quiz',
          channelName: data.channelName ?? 'Unknown Channel',
          videoLength: data.durationLabel ?? '--:--',
          youtubeUrl: data.youtubeUrl ?? '',
        });
      })
      .catch(() => {
        /* keep session or navigation state */
      });
    return () => {
      mounted = false;
    };
  }, [id]);

  const apiResult = loadedResult;
  const blueprint =
    examType && ['gre', 'sat'].includes(examType.toLowerCase())
      ? examBlueprintPreview(examType)
      : null;

  const sectionScores = (apiResult?.sectionScores ?? []).filter((s) => (s.totalCount ?? 0) > 0);

  const questionReview = apiResult?.questionReview;
  const reviewRows: ResultsQuestionRow[] = useMemo(() => {
    if (questionReview?.length) {
      return questionReview.map((q, i) => ({
        index: i + 1,
        prompt: q.question,
        sectionKicker:
          q.sectionTitle
            ? kickerForQuestionIndex(i, [{ sectionTitle: q.sectionTitle }], [])
            : kickerForQuestionIndex(i, questions, sectionScores),
        status: classifyAttemptAnswer(q.userAnswer, q.correct),
        explanation: q.explanation,
        userAnswer: q.userAnswer,
        correctAnswer: q.correctAnswer,
      }));
    }
    return questions.map((q, i) => {
      const user = answerText(answers[q.id] ?? answers[i]);
      const isCorrect = Boolean(q.answer && user.trim() && user.trim() === q.answer.trim());
      return {
        index: i + 1,
        prompt: q.question,
        sectionKicker: kickerForQuestionIndex(i, questions, sectionScores),
        status: classifyAttemptAnswer(user, isCorrect),
        explanation: q.explanation,
        userAnswer: user,
        correctAnswer: q.answer,
      };
    });
  }, [questionReview, questions, answers, sectionScores]);

  const totalQuestions = apiResult?.totalCount ?? (reviewRows.length || questions.length);
  const correctAnswers =
    apiResult?.correctCount ?? reviewRows.filter((q) => q.status === 'correct').length;
  const score =
    apiResult?.scorePercent ??
    (totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0);
  const passed = apiResult?.passed ?? score >= 70;

  const counts = {
    all: reviewRows.length,
    wrong: reviewRows.filter((q) => q.status === 'wrong').length,
    correct: reviewRows.filter((q) => q.status === 'correct').length,
    skipped: reviewRows.filter((q) => q.status === 'skipped').length,
  };

  const sections = sectionScores.map((s) => ({
    label: formatResultsSectionLabel(s.title || s.sectionKey || 'Section'),
    percent: s.scorePercent ?? 0,
    correct: s.correctCount ?? 0,
    total: s.totalCount ?? 0,
  }));

  const submittedAt =
    apiResult?.submittedAt ||
    attemptHistory.find((a) => a.attemptId === apiResult?.attemptId)?.submittedAt ||
    attemptHistory[0]?.submittedAt;

  const loadAttempt = async (attemptId: string) => {
    if (!id || !isUuid(id)) return;
    setResultsLoading(true);
    try {
      const data = await fetchQuizAttempt(id, attemptId);
      setLoadedResult(data);
      setResultsError(null);
    } catch {
      setResultsError('Could not load that attempt.');
    } finally {
      setResultsLoading(false);
    }
  };

  const quizTitle = videoMeta.title || 'Generated Quiz';
  const shareUrl = `${window.location.origin}/quiz/${id}`;
  const examMeta = formatExamMetaLine(
    blueprint?.practiceLabel || (examType && examType.toLowerCase() !== 'custom' ? examType : undefined),
    submittedAt,
  );

  const handleDownloadAttemptHtml = () => {
    if (reviewRows.length === 0) return;
    downloadQuizAttemptHtmlReport({
      quizTitle,
      channelName: videoMeta.channelName,
      scorePercent: score,
      correctCount: correctAnswers,
      totalCount: totalQuestions,
      passed,
      attemptNumber: apiResult?.attemptNumber,
      submittedAt,
      examMeta,
      sectionScores: sections.map((s) => ({
        topic: s.label,
        scorePercent: s.percent,
        totalCount: s.total,
        correctCount: s.correct,
      })),
      questions: reviewRows.map((q) => ({
        index: q.index,
        question: q.prompt,
        userAnswer: String(q.userAnswer ?? ''),
        correctAnswer: String(q.correctAnswer ?? ''),
        isCorrect: q.status === 'correct',
        status: q.status,
        sectionKicker: q.sectionKicker,
        explanation: q.explanation,
      })),
      takeQuizUrl: isUuid(id) ? cubitPublicQuizUrl(id) : shareUrl,
    });
  };

  if (resultsLoading) {
    return (
      <QuizSetupChrome C={C} backChevron={false}>
        <div className="flex min-h-[50vh] items-center justify-center text-sm" style={{ color: C.text2 }}>
          Loading results…
        </div>
      </QuizSetupChrome>
    );
  }

  if (!apiResult && resultsError && reviewRows.length === 0) {
    return (
      <QuizSetupChrome C={C} backChevron={false}>
        <div className="mx-auto flex max-w-lg flex-col gap-4 px-5 py-16">
          <p className="text-sm" style={{ color: C.text2 }}>
            {resultsError}
          </p>
          <Link to="/library?tab=saved" className="text-sm no-underline" style={{ color: C.red }}>
            Back to library
          </Link>
        </div>
      </QuizSetupChrome>
    );
  }

  return (
    <QuizSetupChrome C={C} backChevron={false}>
      {attemptHistory.length > 1 ? (
        <div className="mx-auto flex w-full max-w-[1080px] flex-wrap gap-2 px-5 pt-6 md:px-10">
          {attemptHistory.map((a) => {
            const active = loadedResult?.attemptId === a.attemptId;
            return (
              <button
                key={a.attemptId}
                type="button"
                onClick={() => void loadAttempt(a.attemptId)}
                className="inline-flex h-10 items-center rounded-lg px-3 text-[13px]"
                style={{
                  background: active ? C.bg2 : 'transparent',
                  border: `1px solid ${C.border}`,
                  color: C.text2,
                }}
              >
                #{a.attemptNumber} · {a.scorePercent}%
              </button>
            );
          })}
        </div>
      ) : null}
      <ResultsScreen
        C={C}
        score={score}
        correct={correctAnswers}
        total={totalQuestions}
        passed={passed}
        examMeta={examMeta}
        summary={resultsSummaryCopy(correctAnswers, totalQuestions, passed)}
        filter={filter}
        onFilter={setFilter}
        counts={counts}
        questions={reviewRows}
        sections={sections}
        onRetake={() => navigate(`/quiz/${id}`)}
        onDownload={handleDownloadAttemptHtml}
        canDownload={reviewRows.length > 0}
      />
    </QuizSetupChrome>
  );
}
