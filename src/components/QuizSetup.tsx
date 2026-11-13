import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router';
import axios from 'axios';
import { ShellPage } from '../shell/ShellPage';
import { Play, ArrowRight, Copy, Check, AlertCircle } from 'lucide-react';
import { useTheme, getC } from './ThemeContext';
import {
  examBlueprintPreview,
  fetchQuizDetail,
  isUuid,
  mapApiQuestionsToFrontend,
} from '../api/quizApi';

interface Question {
  id: number;
  type: 'mcq' | 'trueFalse' | 'shortAnswer';
  question: string;
  options?: string[];
  answer?: string;
  explanation?: string;
}

interface BackendQuestion {
  question?: string;
  options?: string[];
  correctAnswerIndex?: number;
  explanation?: string;
}

interface BackendQuizObject {
  title?: string;
  questions?: BackendQuestion[];
}

interface QuizMeta {
  title: string;
  channelName: string;
  videoLength: string;
  youtubeUrl: string;
}

const getYoutubeVideoId = (url: string): string => {
  const matchWatch = url.match(/[?&]v=([^&]+)/);
  const matchShort = url.match(/youtu\.be\/([^?&]+)/);
  return matchWatch?.[1] ?? matchShort?.[1] ?? '';
};

const getYoutubeThumbnail = (url: string): string => {
  const videoId = getYoutubeVideoId(url);
  return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : '';
};

const stripCodeFence = (value: string): string => {
  const trimmed = value.trim();
  const fenceMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenceMatch?.[1]?.trim() ?? trimmed;
};

const normalizeQuestions = (rawQuestions: BackendQuestion[]): Question[] => {
  return rawQuestions
    .map((q, index) => {
      const options = Array.isArray(q.options) ? q.options : undefined;
      const isTrueFalse =
        Array.isArray(options) &&
        options.length === 2 &&
        options.every((option) => {
          const normalized = option.trim().toLowerCase();
          return normalized === 'true' || normalized === 'false';
        });

      const type: Question['type'] = options?.length
        ? (isTrueFalse ? 'trueFalse' : 'mcq')
        : 'shortAnswer';

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
};

const extractQuestionsFromResponse = (payload: unknown): Question[] => {
  if (Array.isArray(payload)) {
    return normalizeQuestions(payload as BackendQuestion[]);
  }

  if (!payload || typeof payload !== 'object') {
    return [];
  }

  const data = payload as {
    questions?: BackendQuestion[];
    quiz?: string | BackendQuizObject;
  };

  if (Array.isArray(data.questions)) {
    return normalizeQuestions(data.questions);
  }

  if (typeof data.quiz === 'string') {
    try {
      const parsedQuiz = JSON.parse(stripCodeFence(data.quiz)) as BackendQuizObject;
      if (Array.isArray(parsedQuiz.questions)) {
        return normalizeQuestions(parsedQuiz.questions);
      }
    } catch {
      return [];
    }
  }

  if (data.quiz && typeof data.quiz === 'object' && Array.isArray(data.quiz.questions)) {
    return normalizeQuestions(data.quiz.questions);
  }

  return [];
};

const extractMetaFromResponse = (payload: unknown, fallbackUrl: string): QuizMeta => {
  const defaultMeta: QuizMeta = {
    title: 'Generated Quiz',
    channelName: 'Unknown Channel',
    videoLength: '--:--',
    youtubeUrl: fallbackUrl,
  };

  if (!payload || typeof payload !== 'object') {
    return defaultMeta;
  }

  const data = payload as {
    videoTitle?: string;
    channelName?: string;
    videoLength?: string;
    quiz?: string | BackendQuizObject;
  };

  let quizTitle = '';
  if (typeof data.quiz === 'string') {
    try {
      const parsedQuiz = JSON.parse(stripCodeFence(data.quiz)) as BackendQuizObject;
      quizTitle = parsedQuiz.title?.trim() ?? '';
    } catch {
      quizTitle = '';
    }
  } else if (data.quiz && typeof data.quiz === 'object') {
    quizTitle = data.quiz.title?.trim() ?? '';
  }

  return {
    title: data.videoTitle?.trim() || quizTitle || defaultMeta.title,
    channelName: data.channelName?.trim() || defaultMeta.channelName,
    videoLength: data.videoLength?.trim() || defaultMeta.videoLength,
    youtubeUrl: fallbackUrl,
  };
};


export function QuizSetup() {
  const { isDark } = useTheme();
  const C = getC(isDark);
  const [copied, setCopied] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const youtubeUrl = location.state?.youtubeUrl || sessionStorage.getItem('youtubeUrl') || '';
  const promptRequest =
    (location.state?.prompt as string | undefined) || sessionStorage.getItem('quizPrompt') || '';
  const examType =
    (location.state?.examType as string | undefined) || sessionStorage.getItem('quizExamType') || 'custom';
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [setupError, setSetupError] = useState<string | null>(null);
  const [videoMeta, setVideoMeta] = useState<QuizMeta>({
    title: 'Generated Quiz',
    channelName: promptRequest ? 'Custom practice' : 'Unknown Channel',
    videoLength: '--:--',
    youtubeUrl,
  });

  const blueprint = promptRequest ? examBlueprintPreview(examType) : null;
  const questionCount =
    questions.length ||
    (blueprint ? blueprint.questions : location.state?.questionCount || 10);
  const quizData = {
    videoTitle: videoMeta.title,
    channel: videoMeta.channelName,
    duration: videoMeta.videoLength,
    thumbnail: getYoutubeThumbnail(videoMeta.youtubeUrl),
    transcriptStatus: promptRequest ? 'prompt' : 'available',
    questionCount,
    difficulty: location.state?.difficulty || 'medium',
    estimatedTime: blueprint
      ? `${blueprint.minutes} minutes`
      : `${Math.ceil(questionCount * 1.5)} minutes`,
    examType: promptRequest ? examType : undefined,
    sections: blueprint?.sections,
  };

  useEffect(() => {
    let isMounted = true;
    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 90 ? 90 : prev + 10));
    }, 300);

    const loadOrGenerateQuiz = async () => {
      setSetupError(null);

      try {
        if (id && isUuid(id)) {
          const data = await fetchQuizDetail(id, false);
          if (!isMounted) return;
          const parsedQuestions = mapApiQuestionsToFrontend(data.questions ?? [], data.sections);
          const parsedMeta: QuizMeta = {
            title: data.title ?? 'Generated Quiz',
            channelName: data.channelName ?? 'Unknown Channel',
            videoLength: data.durationLabel ?? '--:--',
            youtubeUrl: data.youtubeUrl ?? youtubeUrl,
          };
          setQuestions(parsedQuestions);
          setVideoMeta(parsedMeta);
          sessionStorage.setItem('generatedQuestions', JSON.stringify(parsedQuestions));
          sessionStorage.setItem('generatedVideoMeta', JSON.stringify(parsedMeta));
          if (data.sections) {
            sessionStorage.setItem('quizSections', JSON.stringify(data.sections));
          }
          if (data.examType) {
            sessionStorage.setItem('quizExamType', data.examType);
          }
          setProgress(100);
          setLoading(false);
          return;
        }

        if (promptRequest.trim()) {
          const response = await axios.post('/api/quiz/generate-from-prompt', {
            prompt: promptRequest.trim(),
            examType,
            config: {
              difficulty: location.state?.difficulty || 'medium',
              timedExam: true,
              questionTypes: location.state?.questionTypes,
            },
          });

          const parsedQuestions = response.data.questions?.length
            ? mapApiQuestionsToFrontend(response.data.questions, response.data.sections)
            : extractQuestionsFromResponse(response.data);
          const parsedMeta: QuizMeta = {
            title: response.data.videoTitle?.trim() || 'Practice quiz',
            channelName: response.data.channelName?.trim() || 'Custom practice',
            videoLength: response.data.videoLength?.trim() || '--:--',
            youtubeUrl: '',
          };

          if (!isMounted) return;

          if (parsedQuestions.length === 0) {
            setSetupError('Quiz was generated but no valid questions were found in the response.');
            setLoading(false);
            clearInterval(interval);
            return;
          }

          setQuestions(parsedQuestions);
          setVideoMeta(parsedMeta);
          sessionStorage.setItem('generatedQuestions', JSON.stringify(parsedQuestions));
          sessionStorage.setItem('generatedVideoMeta', JSON.stringify(parsedMeta));
          if (response.data.sections) {
            sessionStorage.setItem('quizSections', JSON.stringify(response.data.sections));
          }
          if (response.data.examType) {
            sessionStorage.setItem('quizExamType', response.data.examType);
          }
          if (response.data.quizId) {
            sessionStorage.setItem('currentQuizId', response.data.quizId);
            if (id === 'new' || !id) {
              navigate(`/quiz-setup/${response.data.quizId}`, { replace: true, state: location.state });
            }
          }
          setProgress(100);
          setLoading(false);
          return;
        }

        if (!youtubeUrl) {
          setSetupError('Add a topic or YouTube URL from the dashboard to generate a sample test.');
          setLoading(false);
          clearInterval(interval);
          return;
        }

        const response = await axios.post('/api/quiz/generate', {
          youtubeUrl,
          config: {
            difficulty: location.state?.difficulty || 'medium',
            questionCount: location.state?.questionCount || 10,
            timedExam: location.state?.timedExam || false,
            questionTypes: location.state?.questionTypes,
          },
        });

        const parsedQuestions = response.data.questions?.length
          ? mapApiQuestionsToFrontend(response.data.questions)
          : extractQuestionsFromResponse(response.data);
        const parsedMeta = extractMetaFromResponse(response.data, youtubeUrl);

        if (!isMounted) return;

        if (parsedQuestions.length === 0) {
          setSetupError('Quiz was generated but no valid questions were found in the response.');
          setLoading(false);
          clearInterval(interval);
          return;
        }

        setQuestions(parsedQuestions);
        setVideoMeta(parsedMeta);
        sessionStorage.setItem('generatedQuestions', JSON.stringify(parsedQuestions));
        sessionStorage.setItem('generatedVideoMeta', JSON.stringify(parsedMeta));
        if (response.data.quizId) {
          sessionStorage.setItem('currentQuizId', response.data.quizId);
          if (id === 'new') {
            navigate(`/quiz-setup/${response.data.quizId}`, { replace: true, state: location.state });
          }
        }
        setProgress(100);
        setLoading(false);
      } catch (err) {
        if (!isMounted) {
          return;
        }
        if (axios.isAxiosError(err)) {
          setSetupError(err.response?.data?.message ?? err.message ?? 'Failed to generate quiz.');
        } else {
          setSetupError('An unexpected error occurred while generating the quiz.');
        }
        setLoading(false);
      } finally {
        clearInterval(interval);
      }
    };

    loadOrGenerateQuiz();

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [youtubeUrl, promptRequest, examType, id]);

  useEffect(() => {
    if (youtubeUrl) {
      sessionStorage.setItem('youtubeUrl', youtubeUrl);
    }
    if (promptRequest) {
      sessionStorage.setItem('quizPrompt', promptRequest);
      sessionStorage.setItem('quizExamType', examType);
    }
  }, [youtubeUrl, promptRequest, examType]);

  const statusLabels = promptRequest
    ? [
        { at: 0, label: 'Planning exam sections' },
        { at: 20, label: 'Generating section questions' },
        { at: 55, label: 'Validating answer keys' },
        { at: 85, label: 'Almost ready' },
        { at: 100, label: 'Ready to start' },
      ]
    : [
        { at: 0, label: 'Fetching transcript' },
        { at: 33, label: 'Analyzing content' },
        { at: 66, label: 'Generating questions' },
        { at: 100, label: 'Ready to start' },
      ];

  const currentStatus =
    [...statusLabels].reverse().find((s) => progress >= s.at)?.label
    ?? statusLabels[0]!.label;

  if (loading) {
    return (
      <ShellPage
        title="Preparing your quiz"
        description={
          promptRequest
            ? `Full ${examType.toUpperCase()} practice exam — this can take several minutes`
            : 'This usually takes 20–30 seconds'
        }
      >
        {/* One quiet composition: large % + one status line + hairline progress. No step checklist. */}
        <div className="mx-auto flex w-full max-w-md flex-col gap-10 pt-6">
          <div>
            <p
              className="tabular-nums text-[56px] font-bold leading-none tracking-[-0.04em] motion-safe:transition-[color] motion-safe:duration-300"
              style={{ color: C.text, fontFamily: 'var(--display)' }}
              aria-live="polite"
            >
              {progress}
              <span className="text-[28px] font-semibold tracking-[-0.02em]" style={{ color: C.text3 }}>
                %
              </span>
            </p>
            <p
              className="mt-4 text-[13px] leading-snug"
              style={{ color: C.text2, fontFamily: 'var(--mono)' }}
              aria-live="polite"
            >
              {currentStatus}
            </p>
          </div>

          <div
            className="h-px w-full overflow-hidden"
            style={{ background: C.border }}
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
            aria-label="Quiz generation progress"
          >
            <div
              className="h-full origin-left motion-safe:transition-[width] motion-safe:duration-300 motion-safe:ease-out"
              style={{ width: `${Math.max(progress, 2)}%`, background: C.red }}
            />
          </div>

          <p className="text-[12px] leading-relaxed" style={{ color: C.text3 }}>
            {promptRequest
              ? 'Stay on this page — we will open the exam when it is ready.'
              : 'Hang tight while Cubit builds your questions.'}
          </p>
        </div>
      </ShellPage>
    );
  }

  if (setupError) {
    return (
      <ShellPage title="Something went wrong" description="We couldn't generate your quiz">
        <div className="max-w-lg">
          <div
            className="rounded-xl p-6 flex flex-col gap-5"
            style={{ background: C.bg1, border: `1px solid rgba(225,6,0,0.3)` }}
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: C.red }} />
              <p className="text-sm leading-relaxed" style={{ color: C.text2 }}>{setupError}</p>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="self-start px-5 py-2.5 rounded-lg text-sm font-[500] cursor-pointer transition-colors"
              style={{ background: C.bg2, border: `1px solid ${C.border2}`, color: C.text2 }}
              onMouseEnter={(e) => { e.currentTarget.style.color = C.text; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = C.text2; }}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </ShellPage>
    );
  }

  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/quiz/${id}`;
  const readinessLabel = promptRequest ? 'Answer keys validated' : 'Transcript available';
  const metaBits = [
    quizData.channel,
    quizData.duration !== '--:--' ? quizData.duration : null,
    readinessLabel,
    quizData.examType ? `${quizData.examType} practice exam` : null,
  ].filter(Boolean) as string[];

  const detailRows = [
    { label: 'Questions', value: `${quizData.questionCount} questions` },
    { label: 'Difficulty', value: quizData.difficulty },
    { label: 'Estimated time', value: quizData.estimatedTime },
    { label: 'Completion', value: 'Results available after quiz' },
  ];

  return (
    <ShellPage title="Quiz ready" description="Review the details below and start when you're ready">
      <div className="mx-auto flex w-full max-w-xl flex-col gap-10 pt-2">
        {/* Title + optional video — one plane, no tinted meta chips */}
        <div className="flex flex-col gap-5">
          {!promptRequest && (
            <div
              className="aspect-video relative overflow-hidden"
              style={{ background: C.bg2, borderBottom: `1px solid ${C.border}` }}
            >
              {getYoutubeVideoId(videoMeta.youtubeUrl) ? (
                <iframe
                  src={`https://www.youtube.com/embed/${getYoutubeVideoId(videoMeta.youtubeUrl)}`}
                  title={quizData.videoTitle}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ border: 'none' }}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Play className="size-8" style={{ color: C.text3 }} strokeWidth={1.75} />
                </div>
              )}
            </div>
          )}

          <div>
            <h2
              className="text-[22px] font-semibold leading-snug tracking-[-0.02em]"
              style={{ color: C.text, fontFamily: 'var(--display)' }}
            >
              {quizData.videoTitle}
            </h2>
            <p
              className="mt-2 text-[13px] leading-relaxed"
              style={{ color: C.text2 }}
            >
              {metaBits.join(' · ')}
            </p>
          </div>
        </div>

        {quizData.sections && quizData.sections.length > 0 && (
          <section className="flex flex-col gap-3" style={{ borderTop: `1px solid ${C.border}`, paddingTop: 28 }}>
            <h3
              className="text-[11px] font-medium uppercase tracking-[0.14em]"
              style={{ color: C.text3, fontFamily: 'var(--mono)' }}
            >
              Sections
            </h3>
            <ol className="flex flex-col gap-2.5">
              {quizData.sections.map((label) => (
                <li key={label} className="text-[14px] leading-snug" style={{ color: C.text2 }}>
                  {label}
                </li>
              ))}
            </ol>
          </section>
        )}

        <section className="flex flex-col gap-3" style={{ borderTop: `1px solid ${C.border}`, paddingTop: 28 }}>
          <h3
            className="text-[11px] font-medium uppercase tracking-[0.14em]"
            style={{ color: C.text3, fontFamily: 'var(--mono)' }}
          >
            Quiz details
          </h3>
          <dl className="flex flex-col">
            {detailRows.map((row) => (
              <div
                key={row.label}
                className="flex items-baseline justify-between gap-6 py-3"
                style={{ borderBottom: `1px solid ${C.border}` }}
              >
                <dt className="text-[13px] shrink-0" style={{ color: C.text3 }}>
                  {row.label}
                </dt>
                <dd
                  className="text-right text-[14px] font-medium capitalize leading-snug"
                  style={{ color: C.text }}
                >
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="flex flex-col gap-3" style={{ borderTop: `1px solid ${C.border}`, paddingTop: 28 }}>
          <h3
            className="text-[11px] font-medium uppercase tracking-[0.14em]"
            style={{ color: C.text3, fontFamily: 'var(--mono)' }}
          >
            Share with students
          </h3>
          <div className="flex min-h-11 items-center gap-3">
            <span
              className="min-w-0 flex-1 truncate text-[12px]"
              style={{ color: C.text2, fontFamily: 'var(--mono)' }}
              title={shareUrl}
            >
              {shareUrl}
            </span>
            <button
              type="button"
              onClick={() => {
                void navigator.clipboard.writeText(shareUrl);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="inline-flex h-11 shrink-0 items-center gap-1.5 px-3 text-[13px] font-medium transition-colors"
              style={{ color: copied ? C.text : C.red }}
            >
              {copied ? <Check className="size-3.5" strokeWidth={2.2} /> : <Copy className="size-3.5" strokeWidth={2.2} />}
              {copied ? 'Copied' : 'Copy link'}
            </button>
          </div>
        </section>

        <div
          className="flex flex-wrap items-center gap-3 pt-2"
          style={{ borderTop: `1px solid ${C.border}`, paddingTop: 28 }}
        >
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="inline-flex h-11 items-center px-5 text-[13px] font-medium transition-colors"
            style={{
              background: 'transparent',
              border: `1px solid ${C.border}`,
              color: C.text2,
            }}
          >
            Back to dashboard
          </button>
          <button
            type="button"
            onClick={() => {
              const quizId = (id && isUuid(id)) ? id : sessionStorage.getItem('currentQuizId') || id;
              navigate(`/quiz/${quizId}`, {
                state: {
                  questions,
                  videoMeta,
                  youtubeUrl,
                  sections: sessionStorage.getItem('quizSections')
                    ? JSON.parse(sessionStorage.getItem('quizSections')!)
                    : undefined,
                },
              });
            }}
            className="inline-flex h-11 items-center gap-2 px-6 text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: C.red }}
          >
            Start quiz
            <ArrowRight className="size-4" strokeWidth={2.2} />
          </button>
        </div>
      </div>
    </ShellPage>
  );
}
