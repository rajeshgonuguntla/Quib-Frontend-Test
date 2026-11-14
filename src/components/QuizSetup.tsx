import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router';
import axios from 'axios';
import { AlertCircle } from 'lucide-react';
import { QuizReadyScreen, QuizSetupChrome } from './QuizReadyScreen';
import {
  cubitPublicQuizUrl,
  cubitPublicSignInUrl,
  downloadInteractiveQuizHtml,
  mapGeneratedQuestionsToInteractiveItems,
} from '../utils/downloadQuizAttemptHtml';
import { useTheme, getC } from './ThemeContext';
import {
  examBlueprintPreview,
  defaultQuizTimeLimitSeconds,
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
  correctAnswer?: string;
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
          q.correctAnswer?.trim() ||
          (typeof q.correctAnswerIndex === 'number' && options?.[q.correctAnswerIndex]
            ? options[q.correctAnswerIndex]
            : undefined),
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

const readSessionQuestionsForQuiz = (quizId: string): Question[] | null => {
  try {
    if (sessionStorage.getItem('currentQuizId') !== quizId) return null;
    const raw = sessionStorage.getItem('generatedQuestions');
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Question[];
    return parsed.length > 0 ? parsed : null;
  } catch {
    return null;
  }
};

const mergeQuestionsWithAnswerKeys = (fromApi: Question[], fromCache: Question[]): Question[] => {
  if (fromCache.length === fromApi.length) {
    return fromApi.map((q, i) => ({
      ...q,
      answer: fromCache[i]?.answer ?? q.answer,
      explanation: fromCache[i]?.explanation ?? q.explanation,
      options: q.options ?? fromCache[i]?.options,
    }));
  }
  const byPrompt = new Map(fromCache.map((q) => [q.question.trim(), q]));
  return fromApi.map((q) => {
    const hit = byPrompt.get(q.question.trim());
    if (!hit) return q;
    return {
      ...q,
      answer: hit.answer ?? q.answer,
      explanation: hit.explanation ?? q.explanation,
      options: q.options ?? hit.options,
    };
  });
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
  const [loadedExamType, setLoadedExamType] = useState<string | null>(null);

  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const youtubeUrl = location.state?.youtubeUrl || sessionStorage.getItem('youtubeUrl') || '';
  const promptRequest =
    (location.state?.prompt as string | undefined) || sessionStorage.getItem('quizPrompt') || '';
  const examType =
    loadedExamType ||
    (location.state?.examType as string | undefined) ||
    sessionStorage.getItem('quizExamType') ||
    'custom';
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

  const examKind = (examType || 'custom').toLowerCase();
  const blueprint = examKind === 'gre' || examKind === 'sat' ? examBlueprintPreview(examKind) : null;
  const questionCount = blueprint
    ? blueprint.questions
    : questions.length || location.state?.questionCount || 10;
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
    examType: blueprint ? examKind : promptRequest ? examType : undefined,
    sections: blueprint?.sections,
    sectionRows: blueprint?.sectionRows ?? [],
    displayTitle: blueprint?.displayTitle,
    practiceLabel: blueprint?.practiceLabel,
    minutes: blueprint?.minutes ?? Math.ceil(questionCount * 1.5),
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
          const cachedQuestions = readSessionQuestionsForQuiz(id);
          let data: Awaited<ReturnType<typeof fetchQuizDetail>>;
          try {
            data = await fetchQuizDetail(id, false);
          } catch (err) {
            if (!cachedQuestions?.length) throw err;
            if (!isMounted) return;
            setQuestions(cachedQuestions);
            const metaRaw = sessionStorage.getItem('generatedVideoMeta');
            if (metaRaw) {
              try {
                setVideoMeta(JSON.parse(metaRaw) as QuizMeta);
              } catch {
                /* keep default meta */
              }
            }
            setProgress(100);
            setLoading(false);
            return;
          }
          if (!isMounted) return;
          let parsedQuestions = mapApiQuestionsToFrontend(data.questions ?? [], data.sections);
          if (cachedQuestions) {
            parsedQuestions = mergeQuestionsWithAnswerKeys(parsedQuestions, cachedQuestions);
          }
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
            setLoadedExamType(data.examType);
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
            setLoadedExamType(response.data.examType);
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
      <QuizSetupChrome C={C}>
        <div className="mx-auto flex w-full max-w-md flex-col gap-10 px-5 py-16">
          <p className="text-[11px]" style={{ color: C.text3, fontFamily: 'var(--mono)' }}>
            Preparing your quiz
          </p>
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
        </div>
      </QuizSetupChrome>
    );
  }

  if (setupError) {
    return (
      <QuizSetupChrome C={C}>
        <div className="mx-auto w-full max-w-lg px-5 py-12">
          <p className="mb-3 text-[11px]" style={{ color: C.text3, fontFamily: 'var(--mono)' }}>
            Something went wrong
          </p>
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
              Back to dashboard
            </button>
          </div>
        </div>
        </div>
      </QuizSetupChrome>
    );
  }

  const quizIdForLink =
    (id && isUuid(id) ? id : null) ?? sessionStorage.getItem('currentQuizId') ?? undefined;
  const cubitQuizLink = cubitPublicQuizUrl(quizIdForLink);
  const shareUrl = cubitQuizLink;
  const interactiveItems = mapGeneratedQuestionsToInteractiveItems(questions);
  const canDownloadShareableHtml = questions.some((q) => q.question.trim().length > 0);

  const handleDownloadShareableQuizHtml = () => {
    if (!canDownloadShareableHtml) return;
    downloadInteractiveQuizHtml({
      quizTitle: quizData.displayTitle || quizData.videoTitle,
      channelName: videoMeta.channelName,
      examType: quizData.examType,
      passPercent: 70,
      timeLimitSeconds: defaultQuizTimeLimitSeconds(questions.length),
      questions: interactiveItems,
      takeQuizUrl: cubitQuizLink,
      resultsSignInUrl: cubitPublicSignInUrl(),
    });
  };
  const readinessLabel =
    promptRequest || examKind === 'gre' || examKind === 'sat'
      ? 'Answer keys validated'
      : 'Transcript available';
  const sectionRows =
    quizData.sectionRows.length > 0
      ? quizData.sectionRows
      : [
          {
            title: quizData.videoTitle || 'Quiz',
            questionsLabel: String(quizData.questionCount),
            minutes: quizData.minutes,
          },
        ];
  const readyTitle = quizData.displayTitle || quizData.videoTitle;

  const handleStart = () => {
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
  };

  return (
    <QuizSetupChrome C={C}>
      <QuizReadyScreen
        C={C}
        title={readyTitle}
        practiceLabel={quizData.practiceLabel}
        difficulty={quizData.difficulty}
        readinessLabel={readinessLabel}
        questionCount={quizData.questionCount}
        minutes={quizData.minutes}
        sectionCount={sectionRows.length}
        sections={sectionRows}
        shareUrl={shareUrl}
        copied={copied}
        canDownloadHtml={canDownloadShareableHtml}
        onCopyLink={() => {
          void navigator.clipboard.writeText(shareUrl);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 2000);
        }}
        onDownloadHtml={handleDownloadShareableQuizHtml}
        onStart={handleStart}
      />
    </QuizSetupChrome>
  );
}
