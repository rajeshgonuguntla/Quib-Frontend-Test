import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate, useParams, Link, useLocation } from 'react-router';
import { Clock, Flag, ChevronLeft, ChevronRight, Sun, Moon } from 'lucide-react';
import { useTheme, getC } from './ThemeContext';
import { QuibLogo } from './QuibLogo';
import {
  buildFrontendSections,
  fetchQuizDetail,
  isUuid,
  mapApiQuestionsToFrontend,
  submitQuizAttempt,
  type ApiQuizSection,
  type FrontendQuestion,
  type FrontendSection,
} from '../api/quizApi';

interface QuizMeta {
  title: string;
  channelName: string;
  videoLength: string;
  youtubeUrl: string;
}

const readStoredQuestions = (): FrontendQuestion[] => {
  try {
    const raw = sessionStorage.getItem('generatedQuestions');
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as FrontendQuestion[]) : [];
  } catch {
    return [];
  }
};

const readStoredSections = (): ApiQuizSection[] | undefined => {
  try {
    const raw = sessionStorage.getItem('quizSections');
    if (!raw) return undefined;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ApiQuizSection[]) : undefined;
  } catch {
    return undefined;
  }
};

const readStoredVideoMeta = (fallbackUrl: string): QuizMeta => {
  const defaultMeta: QuizMeta = {
    title: 'Generated Quiz',
    channelName: 'Unknown Channel',
    videoLength: '--:--',
    youtubeUrl: fallbackUrl,
  };
  try {
    const raw = sessionStorage.getItem('generatedVideoMeta');
    if (!raw) return defaultMeta;
    const parsed = JSON.parse(raw) as Partial<QuizMeta>;
    return {
      title: parsed.title || defaultMeta.title,
      channelName: parsed.channelName || defaultMeta.channelName,
      videoLength: parsed.videoLength || defaultMeta.videoLength,
      youtubeUrl: parsed.youtubeUrl || fallbackUrl,
    };
  } catch {
    return defaultMeta;
  }
};

export function QuizTaking() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();
  const C = getC(isDark);
  const youtubeUrl: string = location.state?.youtubeUrl || sessionStorage.getItem('youtubeUrl') || '';
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string | string[]>>({});
  const [flagged, setFlagged] = useState<Set<number>>(new Set());
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [questions, setQuestions] = useState<FrontendQuestion[]>(
    () => location.state?.questions ?? readStoredQuestions()
  );
  const [apiSections, setApiSections] = useState<ApiQuizSection[] | undefined>(
    () => location.state?.sections ?? readStoredSections()
  );
  const [sectionIndex, setSectionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [videoMeta, setVideoMeta] = useState<QuizMeta>(() =>
    location.state?.videoMeta ?? readStoredVideoMeta(youtubeUrl)
  );

  const sections: FrontendSection[] = useMemo(
    () => buildFrontendSections(apiSections, questions),
    [apiSections, questions]
  );
  const activeSection = sections[Math.min(sectionIndex, Math.max(0, sections.length - 1))];
  const sectionQuestionIndexes = activeSection?.questionIndexes ?? questions.map((_, i) => i);
  const initialTime = activeSection?.timeLimitSeconds ?? Math.max(questions.length * 90, 300);
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const timeLeftRef = useRef(timeLeft);
  const totalSpentRef = useRef(0);
  const submitRef = useRef<(() => void) | null>(null);
  const advanceSectionRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);

  useEffect(() => {
    setTimeLeft(activeSection?.timeLimitSeconds ?? Math.max(questions.length * 90, 300));
  }, [sectionIndex, activeSection?.timeLimitSeconds, questions.length]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setIsLoading(true);
      setError(null);
      if (id && isUuid(id)) {
        try {
          const data = await fetchQuizDetail(id, false);
          if (!mounted) return;
          const loaded = mapApiQuestionsToFrontend(data.questions ?? [], data.sections);
          setQuestions(loaded);
          setApiSections(data.sections);
          if (data.sections) {
            sessionStorage.setItem('quizSections', JSON.stringify(data.sections));
          }
          setVideoMeta({
            title: data.title ?? 'Generated Quiz',
            channelName: data.channelName ?? '',
            videoLength: data.durationLabel ?? '--:--',
            youtubeUrl: data.youtubeUrl ?? youtubeUrl,
          });
          if (loaded.length > 0) {
            setCurrentQuestion(0);
            setSectionIndex(0);
          }
        } catch {
          if (mounted) setError('Failed to load quiz. Please try again from the dashboard.');
        } finally {
          if (mounted) setIsLoading(false);
        }
        return;
      }
      if (questions.length === 0) {
        setError('Quiz data is missing. Please generate the quiz again from setup.');
      }
      setIsLoading(false);
    };
    load();
    return () => {
      mounted = false;
    };
  }, [id]);

  const handleSubmit = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    totalSpentRef.current += Math.max(0, initialTime - timeLeftRef.current);
    if (id && isUuid(id)) {
      try {
        const result = await submitQuizAttempt(id, answers, totalSpentRef.current);
        navigate(`/results/${id}`, { state: { result, videoMeta, questions } });
        return;
      } catch {
        setError('Failed to submit quiz. Please try again.');
        setSubmitting(false);
        return;
      }
    }
    setError('This quiz must be submitted from a saved quiz. Please regenerate it from setup.');
    setSubmitting(false);
  }, [submitting, id, answers, videoMeta, questions, navigate, initialTime]);

  const goNextSectionOrSubmit = useCallback(() => {
    totalSpentRef.current += Math.max(0, initialTime - timeLeftRef.current);
    if (sectionIndex < sections.length - 1) {
      const next = sectionIndex + 1;
      setSectionIndex(next);
      const nextIndexes = sections[next]?.questionIndexes;
      if (nextIndexes && nextIndexes.length > 0) {
        setCurrentQuestion(nextIndexes[0]!);
      }
      return;
    }
    void handleSubmit();
  }, [sectionIndex, sections, initialTime, handleSubmit]);

  useEffect(() => {
    submitRef.current = () => {
      void handleSubmit();
    };
    advanceSectionRef.current = goNextSectionOrSubmit;
  }, [handleSubmit, goNextSectionOrSubmit]);

  useEffect(() => {
    if (isLoading || questions.length === 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev: number) => {
        if (prev <= 1) {
          clearInterval(timer);
          advanceSectionRef.current?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isLoading, questions.length, sectionIndex]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const localIndex = sectionQuestionIndexes.indexOf(currentQuestion);
  const progress =
    sectionQuestionIndexes.length > 0
      ? (((localIndex >= 0 ? localIndex : 0) + 1) / sectionQuestionIndexes.length) * 100
      : 0;
  const handleAnswer = (answer: string) => setAnswers({ ...answers, [currentQuestion]: answer });
  const handleNext = () => {
    const idx = sectionQuestionIndexes.indexOf(currentQuestion);
    if (idx >= 0 && idx < sectionQuestionIndexes.length - 1) {
      setCurrentQuestion(sectionQuestionIndexes[idx + 1]!);
      return;
    }
    if (sectionIndex < sections.length - 1) {
      goNextSectionOrSubmit();
    } else {
      setShowSubmitModal(true);
    }
  };
  const handlePrevious = () => {
    const idx = sectionQuestionIndexes.indexOf(currentQuestion);
    if (idx > 0) {
      setCurrentQuestion(sectionQuestionIndexes[idx - 1]!);
      return;
    }
    if (sectionIndex > 0) {
      const prev = sectionIndex - 1;
      setSectionIndex(prev);
      const prevIndexes = sections[prev]?.questionIndexes ?? [];
      if (prevIndexes.length > 0) {
        setCurrentQuestion(prevIndexes[prevIndexes.length - 1]!);
      }
    }
  };

  const toggleFlag = () => {
    const newFlagged = new Set(flagged);
    if (newFlagged.has(currentQuestion)) newFlagged.delete(currentQuestion);
    else newFlagged.add(currentQuestion);
    setFlagged(newFlagged);
  };

  const answeredCount = Object.keys(answers).length;
  const unansweredCount = questions.length - answeredCount;
  const isLastInSection =
    sectionQuestionIndexes.length > 0 &&
    currentQuestion === sectionQuestionIndexes[sectionQuestionIndexes.length - 1];
  const isLastSection = sectionIndex >= sections.length - 1;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: C.bg, color: C.text2 }}>
        Loading quiz…
      </div>
    );
  }

  if (error || questions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6" style={{ background: C.bg, color: C.text }}>
        <p className="text-center text-sm" style={{ color: C.text2 }}>
          {error ?? 'Quiz not found.'}
        </p>
        <Link to="/dashboard" className="text-sm no-underline" style={{ color: C.red }}>
          Back to dashboard
        </Link>
      </div>
    );
  }

  const cardBg = isDark ? C.bg1 : '#ffffff';
  const optionIdleBg = isDark ? C.bg2 : '#ffffff';
  const typeLabel =
    questions[currentQuestion].type === 'mcq'
      ? 'Multiple choice'
      : questions[currentQuestion].type === 'trueFalse'
        ? 'True/False'
        : 'Short answer';
  const hasAnswer = answers[currentQuestion] != null && answers[currentQuestion] !== '';

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: C.bg,
        color: C.text,
        fontFamily: "'Inter', system-ui, sans-serif",
        ['--display' as string]: "'Inter', system-ui, sans-serif",
        ['--mono' as string]: "'IBM Plex Mono', ui-monospace, monospace",
        ['--serif' as string]: "'Inter', system-ui, sans-serif",
      }}
    >
      <header className="px-6 md:px-8 py-4 sticky top-0 z-50" style={{ background: cardBg, borderBottom: `1px solid ${C.border}` }}>
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <Link to="/dashboard" className="no-underline shrink-0" style={{ color: C.text }}>
              <QuibLogo
                size={18}
                wordmarkClassName="text-[1.05rem] font-[700] tracking-tight"
                variant={isDark ? 'dark' : 'light'}
              />
            </Link>
            <div className="hidden md:block text-sm font-[500] truncate" style={{ color: C.text2 }}>
              {videoMeta.title}
              {activeSection ? ` · ${activeSection.title}` : ''}
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2 font-[500] tabular-nums" style={{ fontFamily: 'var(--mono)' }}>
              <Clock className="w-4 h-4" style={{ color: C.red }} />
              <span style={{ color: timeLeft < 300 ? '#f97316' : C.text }}>{formatTime(timeLeft)}</span>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer"
              style={{ background: optionIdleBg, border: `1px solid ${C.border}`, color: C.text2 }}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={() => setShowSubmitModal(true)}
              className="px-4 py-2 rounded-xl text-[0.82rem] font-[600] cursor-pointer"
              style={{ background: C.red, border: 'none', color: '#fff' }}
            >
              Submit Quiz
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 p-6 md:p-8">
        <div className="max-w-3xl mx-auto space-y-4">
          {sections.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {sections.map((s, i) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => {
                    setSectionIndex(i);
                    if (s.questionIndexes[0] != null) setCurrentQuestion(s.questionIndexes[0]);
                  }}
                  className="px-3 py-1.5 rounded-lg text-[0.7rem] font-[600] cursor-pointer"
                  style={{
                    background: i === sectionIndex ? C.red : optionIdleBg,
                    border: `1px solid ${i === sectionIndex ? C.red : C.border}`,
                    color: i === sectionIndex ? '#fff' : C.text2,
                  }}
                >
                  {s.title}
                </button>
              ))}
            </div>
          )}

          <div className="rounded-2xl overflow-hidden" style={{ background: cardBg, border: `1px solid ${C.border}` }}>
            <div className="px-6 pt-5 pb-6">
              <div className="flex items-center justify-between mb-8">
                <span
                  className="inline-flex items-center rounded-full px-3 py-1 text-[0.65rem] font-[600] tracking-[0.06em] uppercase"
                  style={{ background: isDark ? C.bg2 : C.bg1, color: C.text3, border: `1px solid ${C.border}` }}
                >
                  {typeLabel}
                </span>
                <button
                  type="button"
                  onClick={toggleFlag}
                  aria-label={flagged.has(currentQuestion) ? 'Unflag question' : 'Flag question'}
                  aria-pressed={flagged.has(currentQuestion)}
                  className="inline-flex size-9 items-center justify-center rounded-lg cursor-pointer"
                  style={{
                    background: flagged.has(currentQuestion) ? 'rgba(225,6,0,0.08)' : 'transparent',
                    border: `1px solid ${flagged.has(currentQuestion) ? C.red : C.border}`,
                    color: flagged.has(currentQuestion) ? C.red : C.text3,
                  }}
                >
                  <Flag className={`w-4 h-4 ${flagged.has(currentQuestion) ? 'fill-current' : ''}`} />
                </button>
              </div>

              <p className="text-[1.25rem] leading-[1.55] font-[500] mb-8" style={{ color: C.text, fontFamily: 'var(--display)' }}>
                {questions[currentQuestion].question}
              </p>

              {questions[currentQuestion].type === 'mcq' || questions[currentQuestion].type === 'trueFalse' ? (
                <div className="space-y-3">
                  {questions[currentQuestion].options?.map((option, index) => {
                    const isSelected = answers[currentQuestion] === option;
                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleAnswer(option)}
                        className="w-full flex items-center gap-3 text-left px-4 py-3.5 rounded-xl text-[0.95rem] cursor-pointer"
                        style={{
                          background: isSelected ? C.redDim : optionIdleBg,
                          border: `1px solid ${isSelected ? C.red : C.border}`,
                          color: C.text,
                          fontFamily: 'var(--display)',
                        }}
                      >
                        <span
                          className="inline-flex size-[18px] shrink-0 items-center justify-center rounded-full"
                          style={{
                            border: `2px solid ${isSelected ? C.red : C.border}`,
                            background: isSelected ? C.red : 'transparent',
                          }}
                          aria-hidden
                        >
                          {isSelected ? <span className="size-1.5 rounded-full bg-white" /> : null}
                        </span>
                        {option}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <textarea
                  value={(answers[currentQuestion] as string) || ''}
                  onChange={(e) => handleAnswer(e.target.value)}
                  placeholder="Type your answer here..."
                  className="w-full h-40 p-4 rounded-xl outline-none resize-none text-[0.95rem]"
                  style={{ background: optionIdleBg, border: `1px solid ${C.border}`, color: C.text, fontFamily: 'var(--display)' }}
                />
              )}
            </div>

            <div
              className="flex flex-wrap items-center justify-between gap-4 px-6 py-4"
              style={{ borderTop: `1px solid ${C.border}` }}
            >
              <div className="flex items-center gap-3 min-w-[140px] flex-1">
                <div className="h-1 flex-1 max-w-[160px] rounded-full overflow-hidden" style={{ background: C.bg2 }}>
                  <div className="h-full rounded-full" style={{ width: `${progress}%`, background: C.red }} />
                </div>
                <span className="text-[0.8rem] tabular-nums whitespace-nowrap" style={{ color: C.text2, fontFamily: 'var(--mono)' }}>
                  {(localIndex >= 0 ? localIndex : 0) + 1} / {sectionQuestionIndexes.length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrevious}
                  disabled={currentQuestion === 0 && sectionIndex === 0}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[0.82rem] font-[600] cursor-pointer disabled:opacity-40"
                  style={{ background: optionIdleBg, border: `1px solid ${C.border}`, color: C.text }}
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>
                {isLastInSection && isLastSection ? (
                  <button
                    type="button"
                    onClick={() => setShowSubmitModal(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[0.82rem] font-[600] cursor-pointer"
                    style={{ background: C.red, border: `1px solid ${C.red}`, color: '#fff' }}
                  >
                    Submit
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={!hasAnswer}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[0.82rem] font-[600] cursor-pointer disabled:opacity-40"
                    style={{
                      background: hasAnswer ? C.red : optionIdleBg,
                      border: `1px solid ${hasAnswer ? C.red : C.border}`,
                      color: hasAnswer ? '#fff' : C.text,
                    }}
                  >
                    {isLastInSection ? 'Next section' : 'Next'} <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-2xl px-5 py-4" style={{ background: cardBg, border: `1px solid ${C.border}` }}>
            <div className="text-[0.65rem] tracking-[0.08em] uppercase font-[600] mb-3" style={{ color: C.text3, fontFamily: 'var(--mono)' }}>
              {activeSection?.title ?? 'Question navigator'}
            </div>
            <div className="flex flex-wrap gap-2">
              {sectionQuestionIndexes.map((index) => {
                const isCurrent = index === currentQuestion;
                const isAnswered = !!answers[index];
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setCurrentQuestion(index)}
                    className="size-9 rounded-lg flex items-center justify-center text-[0.75rem] font-[600] cursor-pointer relative tabular-nums"
                    style={{
                      background: isCurrent ? C.red : isAnswered ? 'rgba(34,197,94,0.1)' : optionIdleBg,
                      border: isCurrent
                        ? `1px solid ${C.red}`
                        : isAnswered
                          ? '1px solid rgba(34,197,94,0.25)'
                          : `1px solid ${C.border}`,
                      color: isCurrent ? '#fff' : isAnswered ? '#22c55e' : C.text3,
                      fontFamily: 'var(--mono)',
                    }}
                  >
                    {index + 1}
                    {flagged.has(index) && (
                      <Flag className="w-2.5 h-2.5 fill-current absolute -top-1 -right-1" style={{ color: C.red }} />
                    )}
                  </button>
                );
              })}
            </div>
            <p className="text-[0.75rem] mt-3" style={{ color: C.text3 }}>
              {answeredCount} answered · {unansweredCount} remaining
            </p>
          </div>
        </div>
      </div>

      {showSubmitModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-6"
          style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }}
        >
          <div className="max-w-md w-full rounded-2xl p-8" style={{ background: cardBg, border: `1px solid ${C.border}` }}>
            <h3 className="text-xl font-[600] mb-3" style={{ color: C.text, fontFamily: 'var(--display)' }}>
              Submit Quiz?
            </h3>
            <p className="text-sm mb-6" style={{ color: C.text2 }}>
              You have answered {answeredCount} out of {questions.length} questions.
              {unansweredCount > 0 && ` ${unansweredCount} questions remain unanswered.`}
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-[600] cursor-pointer"
                style={{ background: optionIdleBg, border: `1px solid ${C.border}`, color: C.text }}
              >
                Review Answers
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-[600] cursor-pointer"
                style={{ background: C.red, border: 'none', color: '#fff' }}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
