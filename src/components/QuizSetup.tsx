import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router';
import axios from 'axios';
import { DarkLayout } from './DarkLayout';
import { Youtube, Clock, FileText, Play, CheckCircle, Award, ArrowRight, Share2, Link2, Copy, Check, AlertCircle } from 'lucide-react';
import { useTheme, getC } from './ThemeContext';

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
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [setupError, setSetupError] = useState<string | null>(null);
  const [videoMeta, setVideoMeta] = useState<QuizMeta>({
    title: 'Generated Quiz',
    channelName: 'Unknown Channel',
    videoLength: '--:--',
    youtubeUrl,
  });

  const questionCount = questions.length || location.state?.questionCount || 10;
  const quizData = {
    videoTitle: videoMeta.title,
    channel: videoMeta.channelName,
    duration: videoMeta.videoLength,
    thumbnail: getYoutubeThumbnail(videoMeta.youtubeUrl),
    transcriptStatus: 'available',
    questionCount,
    difficulty: location.state?.difficulty || 'medium',
    estimatedTime: `${Math.ceil(questionCount * 1.5)} minutes`,
  };

  useEffect(() => {
    let isMounted = true;
    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 90 ? 90 : prev + 10));
    }, 300);

    const generateQuiz = async () => {
      setSetupError(null);
      if (!youtubeUrl) {
        if (!isMounted) {
          return;
        }
        setSetupError('YouTube URL is missing. Please go back and paste the video URL again.');
        setLoading(false);
        clearInterval(interval);
        return;
      }

      try {
        const response = await axios.post('/api/quiz/generate', { youtubeUrl });
        const parsedQuestions = extractQuestionsFromResponse(response.data);
        const parsedMeta = extractMetaFromResponse(response.data, youtubeUrl);

        if (!isMounted) {
          return;
        }

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

    generateQuiz();

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [youtubeUrl]);

  useEffect(() => {
    if (youtubeUrl) {
      sessionStorage.setItem('youtubeUrl', youtubeUrl);
    }
  }, [youtubeUrl]);

  const steps = [
    { label: 'Fetching transcript', completed: progress >= 33 },
    { label: 'Analyzing content', completed: progress >= 66 },
    { label: 'Generating questions', completed: progress >= 100 }
  ];

  if (loading) {
    return (
      <DarkLayout activeNav="dashboard" title="Preparing Your Quiz" subtitle="This usually takes 20–30 seconds">
        <div className="max-w-lg space-y-6">
          {/* Progress bar */}
          <div
            className="rounded-xl p-6"
            style={{ background: C.bg1, border: `1px solid ${C.border}` }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-[500]" style={{ color: C.text2 }}>Generating quiz…</span>
              <span className="text-sm font-[600] tabular-nums" style={{ color: C.text }}>{progress}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: C.bg2 }}>
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${progress}%`, background: C.red }}
              />
            </div>
          </div>
          {/* Steps */}
          <div className="space-y-3">
            {steps.map((step, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-4 rounded-xl"
                style={{ background: C.bg1, border: `1px solid ${C.border}` }}
              >
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300"
                  style={{
                    background: step.completed ? 'rgba(34,197,94,0.15)' : C.bg2,
                    border: `1px solid ${step.completed ? 'rgba(34,197,94,0.4)' : C.border}`,
                  }}
                >
                  {step.completed ? (
                    <CheckCircle className="w-3.5 h-3.5" style={{ color: '#22c55e' }} />
                  ) : (
                    <div className="w-2 h-2 rounded-full" style={{ background: C.text3 }} />
                  )}
                </div>
                <span className="text-sm" style={{ color: step.completed ? C.text : C.text3 }}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </DarkLayout>
    );
  }

  if (setupError) {
    return (
      <DarkLayout activeNav="dashboard" title="Something went wrong" subtitle="We couldn't generate your quiz">
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
      </DarkLayout>
    );
  }

  return (
    <DarkLayout activeNav="dashboard" title="Quiz Ready!" subtitle="Review the details below and start when you're ready">
      <div className="space-y-6 max-w-4xl">
        {/* Video Preview Card */}
        <div
          className="rounded-xl overflow-hidden"
          style={{ background: C.bg1, border: `1px solid ${C.border}` }}
        >
          <div className="aspect-video relative" style={{ background: C.bg2 }}>
            {getYoutubeVideoId(videoMeta.youtubeUrl) ? (
              <iframe
                src={`https://www.youtube.com/embed/${getYoutubeVideoId(videoMeta.youtubeUrl)}`}
                title={quizData.videoTitle}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ border: 'none' }}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(225,6,0,0.15)', border: '1px solid rgba(225,6,0,0.3)', backdropFilter: 'blur(4px)' }}
                >
                  <Play className="w-7 h-7 ml-1" style={{ color: C.red }} />
                </div>
              </div>
            )}
          </div>
          <div className="p-6">
            <h2 className="text-xl font-[400] mb-3" style={{ color: C.text, fontFamily: "var(--display)" }}>{quizData.videoTitle}</h2>
            <div className="flex flex-wrap items-center gap-5">
              <span className="flex items-center gap-2 text-sm" style={{ color: C.text2 }}>
                <Youtube className="w-4 h-4" style={{ color: C.red }} />
                {quizData.channel}
              </span>
              <span className="flex items-center gap-2 text-sm" style={{ color: C.text2 }}>
                <Clock className="w-4 h-4" />
                {quizData.duration}
              </span>
              <span className="flex items-center gap-2 text-sm" style={{ color: '#22c55e' }}>
                <CheckCircle className="w-4 h-4" />
                Transcript available
              </span>
            </div>
          </div>
        </div>

        {/* Quiz Details Grid */}
        <div
          className="rounded-xl p-6"
          style={{ background: C.bg1, border: `1px solid ${C.border}` }}
        >
          <div className="flex items-center gap-2 mb-5">
            <span className="text-[10px] tracking-[3px] uppercase font-[500]" style={{ color: C.text3, fontFamily: "var(--mono)" }}>
              Quiz Details
            </span>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: FileText, label: 'Questions', value: `${quizData.questionCount} questions`, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
              { icon: null, label: 'Difficulty', value: quizData.difficulty, color: '#a855f7', bg: 'rgba(168,85,247,0.1)', emoji: '📊' },
              { icon: Clock, label: 'Estimated Time', value: quizData.estimatedTime, color: '#f97316', bg: 'rgba(249,115,22,0.1)' },
              { icon: Award, label: 'Completion', value: 'Results available after quiz', color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-4 p-4 rounded-lg"
                style={{ background: C.bg2, border: `1px solid ${C.border}` }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: item.bg }}
                >
                  {item.emoji ? (
                    <span className="text-lg">{item.emoji}</span>
                  ) : item.icon ? (
                    <item.icon className="w-5 h-5" style={{ color: item.color }} />
                  ) : null}
                </div>
                <div>
                  <div className="text-xs font-[500] mb-0.5" style={{ color: C.text3 }}>{item.label}</div>
                  <div className="text-sm font-[500] capitalize" style={{ color: C.text }}>{item.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Share with Students */}
        <div
          className="rounded-xl p-6"
          style={{ background: C.bg1, border: `1px solid ${C.border}` }}
        >
          <div className="flex items-center gap-2 mb-5">
            <Share2 className="w-4 h-4" style={{ color: C.text3 }} />
            <span className="text-[10px] tracking-[3px] uppercase font-[500]" style={{ color: C.text3, fontFamily: "var(--mono)" }}>
              Share with Students
            </span>
          </div>

          {/* Share link preview - always visible */}
          <div
            className="flex items-center gap-3 p-3 rounded-lg mb-4"
            style={{ background: C.bg2, border: `1px solid ${C.border}` }}
          >
            <Link2 className="w-4 h-4 flex-shrink-0" style={{ color: C.text3 }} />
            <span className="text-sm truncate flex-1" style={{ color: C.text2, fontFamily: 'var(--mono)' }}>
              {`${typeof window !== 'undefined' ? window.location.origin : ''}/quiz/${id}`}
            </span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/quiz/${id}`);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-[500] cursor-pointer transition-all flex-shrink-0"
              style={{
                background: copied ? 'rgba(34,197,94,0.15)' : 'rgba(225,6,0,0.1)',
                border: `1px solid ${copied ? 'rgba(34,197,94,0.3)' : 'rgba(225,6,0,0.2)'}`,
                color: copied ? '#22c55e' : C.red,
              }}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>

        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 pt-2">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 rounded-lg text-sm font-[500] cursor-pointer transition-colors"
            style={{
              background: 'transparent',
              border: `1px solid ${C.border2}`,
              color: C.text2,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = C.bg2; e.currentTarget.style.color = C.text; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.text2; }}
          >
            Back to Dashboard
          </button>
          <button
            onClick={() => navigate(`/quiz/${id}`)}
            className="px-8 py-3 rounded-lg text-sm font-[600] cursor-pointer transition-all flex items-center gap-2"
            style={{
              background: C.red,
              border: 'none',
              color: '#fff',
              boxShadow: '0 0 20px rgba(225,6,0,0.3)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 0 30px rgba(225,6,0,0.5)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 0 20px rgba(225,6,0,0.3)'; }}
          >
            Start Quiz
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </DarkLayout>
  );
}
