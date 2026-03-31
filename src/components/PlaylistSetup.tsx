import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import axios from 'axios';
import { DarkLayout } from './DarkLayout';
import { Youtube, Clock, Play, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { useTheme, getC } from './ThemeContext';

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

interface QuizResponse {
  caption: string;
  quiz: string;
  videoTitle: string;
  channelName: string;
  videoLength: string;
  videoUrl?: string;
}

const getYoutubeVideoId = (url: string): string => {
  const matchWatch = url.match(/[?&]v=([^&]+)/);
  const matchShort = url.match(/youtu\.be\/([^?&]+)/);
  return matchWatch?.[1] ?? matchShort?.[1] ?? '';
};

interface PlaylistQuizResponse {
  playlistUrl: string;
  quizzes: QuizResponse[];
}

const stripCodeFence = (value: string): string => {
  const trimmed = value.trim();
  const fenceMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenceMatch?.[1]?.trim() ?? trimmed;
};

const normalizeQuestions = (rawQuestions: BackendQuestion[]) => {
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
};

export function PlaylistSetup() {
  const { isDark } = useTheme();
  const C = getC(isDark);
  const navigate = useNavigate();
  const location = useLocation();

  const playlistUrl: string = location.state?.playlistUrl ?? '';

  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [setupError, setSetupError] = useState<string | null>(null);
  const [result, setResult] = useState<PlaylistQuizResponse | null>(null);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [completedQuizzes, setCompletedQuizzes] = useState<Set<number>>(new Set());

  const steps = [
    { label: 'Fetching playlist videos', completed: progress >= 33 },
    { label: 'Extracting transcripts', completed: progress >= 66 },
    { label: 'Generating quizzes', completed: progress >= 100 },
  ];

  useEffect(() => {
    let isMounted = true;
    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 85 ? 85 : prev + 3));
    }, 800);

    const generate = async () => {
      setSetupError(null);
      if (!playlistUrl) {
        if (!isMounted) return;
        setSetupError('Playlist URL is missing. Please go back and paste the playlist URL again.');
        setLoading(false);
        clearInterval(interval);
        return;
      }

      try {
        const apiBase = import.meta.env.PROD
        ? 'https://quib-app-backend-944587700647.europe-west1.run.app'
        : '';
        const response = await axios.post(`${apiBase}/api/quiz/generate-playlist`, { playlistUrl });
        if (!isMounted) return;

        if (!response.data.quizzes?.length) {
          setSetupError('No quizzes could be generated from this playlist.');
          setLoading(false);
          clearInterval(interval);
          return;
        }

        setResult(response.data);
        setProgress(100);
        setLoading(false);
      } catch (err) {
        if (!isMounted) return;
        if (axios.isAxiosError(err)) {
          setSetupError(err.response?.data?.message ?? err.message ?? 'Failed to generate playlist quizzes.');
        } else {
          setSetupError('An unexpected error occurred while generating playlist quizzes.');
        }
        setLoading(false);
      } finally {
        clearInterval(interval);
      }
    };

    generate();
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [playlistUrl]);

  const startQuiz = (quiz: QuizResponse, index: number) => {
    try {
      const parsed = JSON.parse(stripCodeFence(quiz.quiz)) as BackendQuizObject;
      const questions = normalizeQuestions(parsed.questions ?? []);
      const videoUrl = quiz.videoUrl || '';
      const meta = {
        title: parsed.title?.trim() || quiz.videoTitle,
        channelName: quiz.channelName,
        videoLength: quiz.videoLength,
        youtubeUrl: videoUrl,
      };
      // Store playlist state so we can resume after quiz
      sessionStorage.setItem('playlistResult', JSON.stringify(result));
      sessionStorage.setItem('playlistCurrentIndex', String(index));
      sessionStorage.setItem('playlistCompleted', JSON.stringify([...completedQuizzes]));
      sessionStorage.setItem('generatedQuestions', JSON.stringify(questions));
      sessionStorage.setItem('generatedVideoMeta', JSON.stringify(meta));
      navigate(`/quiz/playlist-${index}`);
    } catch {
      setSetupError(`Failed to load quiz for "${quiz.videoTitle}". Please try again.`);
    }
  };

  // Restore playlist state if returning from a quiz
  useEffect(() => {
    if (!result) {
      const savedResult = sessionStorage.getItem('playlistResult');
      const savedIndex = sessionStorage.getItem('playlistCurrentIndex');
      const savedCompleted = sessionStorage.getItem('playlistCompleted');
      if (savedResult) {
        try {
          const parsed = JSON.parse(savedResult) as PlaylistQuizResponse;
          setResult(parsed);
          setLoading(false);
          setProgress(100);
          if (savedCompleted) {
            const completedArr = JSON.parse(savedCompleted) as number[];
            const lastCompleted = savedIndex ? parseInt(savedIndex, 10) : -1;
            const newCompleted = new Set([...completedArr, lastCompleted]);
            setCompletedQuizzes(newCompleted);
            // Advance to next uncompleted quiz
            const nextIndex = parsed.quizzes.findIndex((_, i) => !newCompleted.has(i));
            setCurrentQuizIndex(nextIndex >= 0 ? nextIndex : parsed.quizzes.length);
          }
        } catch { /* ignore */ }
      }
    }
  }, []);

  if (loading) {
    return (
      <DarkLayout activeNav="dashboard" title="Generating Playlist Quizzes" subtitle="This may take a few minutes depending on playlist size">
        <div className="max-w-lg space-y-6">
          <div
            className="rounded-xl p-6"
            style={{ background: C.bg1, border: `1px solid ${C.border}` }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-[500]" style={{ color: C.text2 }}>Processing playlist…</span>
              <span className="text-sm font-[600] tabular-nums" style={{ color: C.text }}>{progress}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: C.bg2 }}>
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${progress}%`, background: C.red }}
              />
            </div>
          </div>
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
      <DarkLayout activeNav="dashboard" title="Something went wrong" subtitle="We couldn't generate your playlist quizzes">
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

  const quizzes = result!.quizzes;
  const totalQuizzes = quizzes.length;
  const allCompleted = currentQuizIndex >= totalQuizzes;
  const currentQuiz = allCompleted ? null : quizzes[currentQuizIndex];
  const currentVideoId = currentQuiz?.videoUrl ? getYoutubeVideoId(currentQuiz.videoUrl) : '';
  const playlistProgress = Math.round((completedQuizzes.size / totalQuizzes) * 100);

  if (allCompleted) {
    return (
      <DarkLayout activeNav="dashboard" title="Playlist Complete!" subtitle={`You completed all ${totalQuizzes} quizzes`}>
        <div className="max-w-2xl space-y-6">
          <div className="rounded-xl p-6" style={{ background: C.bg1, border: `1px solid ${C.border}` }}>
            <div className="flex items-center gap-4 mb-5">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(34,197,94,0.15)' }}>
                <CheckCircle className="w-6 h-6" style={{ color: '#22c55e' }} />
              </div>
              <div>
                <p className="text-lg font-[500]" style={{ color: C.text, fontFamily: 'var(--display)' }}>All quizzes completed</p>
                <p className="text-sm" style={{ color: C.text3 }}>{totalQuizzes} of {totalQuizzes} videos</p>
              </div>
            </div>
            <div className="space-y-2">
              {quizzes.map((q, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: C.bg2 }}>
                  <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: '#22c55e' }} />
                  <span className="text-sm truncate" style={{ color: C.text }}>{q.videoTitle}</span>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={() => { sessionStorage.removeItem('playlistResult'); sessionStorage.removeItem('playlistCurrentIndex'); sessionStorage.removeItem('playlistCompleted'); navigate('/dashboard'); }}
            className="px-6 py-3 rounded-lg text-sm font-[600] cursor-pointer transition-all"
            style={{ background: C.red, border: 'none', color: '#fff', boxShadow: '0 0 20px rgba(225,6,0,0.3)' }}
          >
            Back to Dashboard
          </button>
        </div>
      </DarkLayout>
    );
  }

  return (
    <DarkLayout
      activeNav="dashboard"
      title={`Video ${currentQuizIndex + 1} of ${totalQuizzes}`}
      subtitle="Watch the video, then start the quiz"
    >
      <div className="flex gap-6 max-w-6xl">
        {/* Main content */}
        <div className="flex-1 space-y-6 min-w-0">
          {/* Video Embed */}
          <div className="rounded-xl overflow-hidden" style={{ background: C.bg1, border: `1px solid ${C.border}` }}>
            <div className="aspect-video relative" style={{ background: C.bg2 }}>
              {currentVideoId ? (
                <iframe
                  src={`https://www.youtube.com/embed/${currentVideoId}`}
                  title={currentQuiz!.videoTitle}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ border: 'none' }}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'rgba(225,6,0,0.15)', border: '1px solid rgba(225,6,0,0.3)' }}>
                    <Play className="w-7 h-7 ml-1" style={{ color: C.red }} />
                  </div>
                </div>
              )}
            </div>
            <div className="p-6">
              <h2 className="text-xl font-[400] mb-3" style={{ color: C.text, fontFamily: 'var(--display)' }}>{currentQuiz!.videoTitle}</h2>
              <div className="flex flex-wrap items-center gap-5">
                <span className="flex items-center gap-2 text-sm" style={{ color: C.text2 }}>
                  <Youtube className="w-4 h-4" style={{ color: C.red }} />
                  {currentQuiz!.channelName}
                </span>
                <span className="flex items-center gap-2 text-sm" style={{ color: C.text2 }}>
                  <Clock className="w-4 h-4" />
                  {currentQuiz!.videoLength}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 rounded-lg text-sm font-[500] cursor-pointer transition-colors"
              style={{ background: 'transparent', border: `1px solid ${C.border2}`, color: C.text2 }}
              onMouseEnter={(e) => { e.currentTarget.style.background = C.bg2; e.currentTarget.style.color = C.text; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.text2; }}
            >
              Back to Dashboard
            </button>
            <button
              onClick={() => startQuiz(currentQuiz!, currentQuizIndex)}
              className="px-8 py-3 rounded-lg text-sm font-[600] cursor-pointer transition-all flex items-center gap-2"
              style={{ background: C.red, border: 'none', color: '#fff', boxShadow: '0 0 20px rgba(225,6,0,0.3)' }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 0 30px rgba(225,6,0,0.5)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 0 20px rgba(225,6,0,0.3)'; }}
            >
              Start Quiz
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Playlist Sidebar */}
        <aside className="w-72 flex-shrink-0 hidden lg:block">
          <div className="rounded-xl p-5 sticky top-24" style={{ background: C.bg1, border: `1px solid ${C.border}` }}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] tracking-[3px] uppercase font-[500]" style={{ color: C.text3, fontFamily: 'var(--mono)' }}>
                Playlist
              </span>
              <span className="text-xs font-[600] tabular-nums" style={{ color: C.text2 }}>
                {completedQuizzes.size}/{totalQuizzes}
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-full h-1.5 rounded-full overflow-hidden mb-4" style={{ background: C.bg2 }}>
              <div className="h-full rounded-full transition-all duration-300" style={{ width: `${playlistProgress}%`, background: '#22c55e' }} />
            </div>
            <div className="space-y-1.5 max-h-[60vh] overflow-y-auto">
              {quizzes.map((q, i) => {
                const isCompleted = completedQuizzes.has(i);
                const isCurrent = i === currentQuizIndex;
                return (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-2.5 rounded-lg transition-all"
                    style={{
                      background: isCurrent ? C.redDim || 'rgba(225,6,0,0.08)' : 'transparent',
                      border: isCurrent ? '1px solid rgba(225,6,0,0.2)' : '1px solid transparent',
                    }}
                  >
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{
                      background: isCompleted ? 'rgba(34,197,94,0.15)' : isCurrent ? 'rgba(225,6,0,0.15)' : C.bg2,
                      border: `1px solid ${isCompleted ? 'rgba(34,197,94,0.3)' : isCurrent ? 'rgba(225,6,0,0.3)' : C.border}`,
                    }}>
                      {isCompleted ? (
                        <CheckCircle className="w-3.5 h-3.5" style={{ color: '#22c55e' }} />
                      ) : (
                        <span className="text-[10px] font-[600]" style={{ color: isCurrent ? C.red : C.text3 }}>{i + 1}</span>
                      )}
                    </div>
                    <span className="text-xs truncate" style={{ color: isCurrent ? C.text : isCompleted ? C.text2 : C.text3 }}>
                      {q.videoTitle}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>
      </div>
    </DarkLayout>
  );
}