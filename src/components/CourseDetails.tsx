import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useParams, useSearchParams } from 'react-router';
import axios from 'axios';
import {
  ChevronDown, ChevronRight,
  PlayCircle, FileText, CheckCircle, CheckCircle2, Copy,
  ArrowLeft, ArrowUpRight, BookOpen, Calendar, Layers, AlertCircle, Globe, Pencil,
} from 'lucide-react';
import { publishCourse, unpublishCourse, deleteCourse } from '../api/catalogApi';
import {
  completeLesson,
  enrollCourse,
  fetchCourseProgress,
  recordLessonView,
  submitModuleQuiz,
  type ModuleQuizResult,
} from '../api/courseApi';
import { createCourseCheckout } from '../api/paymentApi';
import { isTokenValid, useAuthSessionKey } from '../auth';
import { formatPriceCents } from '../utils/formatPrice';
import { useUserProfile } from '../context/UserProfileContext';
import { useTheme, getC } from './ThemeContext';
import { CourseGenerationLoader } from './CourseGenerationLoader';
import { CoursePageNav } from './CoursePageNav';
import { CourseChatWidget } from './CourseChatWidget';
import { EducatorAssistantWidget, type AssistantApplyResult } from './EducatorAssistantWidget';
import { QuibLogo } from './QuibLogo';
import { PreCheckoutProfileModal } from './PreCheckoutProfileModal';
import { isCheckoutProfileReady } from '../utils/checkoutProfile';
import { LessonStudyContent } from './LessonNotes';
import { fetchCourseAssignmentSummary } from '../api/assignmentApi';
import { ModuleAssignmentPanel } from './assignments/ModuleAssignmentPanel';
import { YoutubeLessonPlayer } from './YoutubeLessonPlayer';
import { LessonFeedbackPanel } from './LessonFeedbackPanel';
import { CourseReviewPanel } from './CourseReviewPanel';
import { updateCourse } from '../api/educatorApi';
import { buildSavePayloadFromAssistant } from '../utils/courseEditOperations';
import type { CourseGenerationOptions, EditableCourse } from '../types/courseGeneration';

// ─── Types ────────────────────────────────────────────────────────────────────

interface QuizQuestion {
  question: string;
  options: string[];
  answer: number;
}

interface Lesson {
  id: string;
  title: string;
  duration: string;
  type: 'video' | 'reading';
  videoId?: string;
  videoUrl?: string;
  summary?: string;
  keyConcepts?: string[];
  takeaway?: string;
  notes?: string;
}

interface PlaylistVideo {
  videoId: string;
  videoUrl: string;
  title: string;
  duration: string;
  playlistIndex: number;
}

interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  quiz: QuizQuestion[];
}

interface Course {
  title: string;
  description: string;
  difficulty: string;
  date: string;
  modules: Module[];
  playlistUrl?: string;
  playlistVideos?: PlaylistVideo[];
  videoTitle?: string;
  channelName?: string;
  videoLength?: string;
  isFree?: boolean;
  priceCents?: number;
  currency?: string;
  requiresPurchase?: boolean;
  hasPurchased?: boolean;
}

const getYoutubeEmbedId = (videoId?: string, videoUrl?: string, fallbackUrl?: string): string => {
  if (videoId?.trim()) {
    return videoId.trim();
  }
  if (videoUrl) {
    const matchWatch = videoUrl.match(/[?&]v=([^&]+)/);
    const matchShort = videoUrl.match(/youtu\.be\/([^?&]+)/);
    if (matchWatch?.[1]) return matchWatch[1];
    if (matchShort?.[1]) return matchShort[1];
  }
  if (fallbackUrl) {
    const matchWatch = fallbackUrl.match(/[?&]v=([^&]+)/);
    const matchShort = fallbackUrl.match(/youtu\.be\/([^?&]+)/);
    if (matchWatch?.[1]) return matchWatch[1];
    if (matchShort?.[1]) return matchShort[1];
  }
  return '';
};

function courseToEditable(c: Course): EditableCourse {
  return {
    title: c.title,
    description: c.description,
    difficulty: c.difficulty,
    modules: c.modules,
    playlistVideos: c.playlistVideos,
  };
}

function getCourseGenerationError(err: unknown) {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string; details?: string } | undefined;
    return data?.message || data?.details || err.message || 'Unable to generate the course.';
  }

  if (err instanceof Error) {
    return err.message;
  }

  return 'Unable to generate the course.';
}

function getCheckoutError(err: unknown) {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string; details?: string } | undefined;
    return data?.message || data?.details || err.message || 'Checkout is unavailable. Please try again later.';
  }
  if (err instanceof Error && err.message) {
    return err.message;
  }
  return 'Checkout is unavailable. Please try again later.';
}

// ─── Learning Mode ─────────────────────────────────────────────────────────────

function LearningMode({
  course,
  courseId,
  youtubeUrl,
  onBack,
  showCourseChat,
  showEducatorAssistant,
  onEducatorApplyUpdate,
  onEducatorApproveAndSave,
  chatSignedIn,
  onChatSignInRequired,
  chatSessionKey,
}: {
  course: Course;
  courseId: string;
  youtubeUrl: string;
  onBack: () => void;
  showCourseChat: boolean;
  showEducatorAssistant: boolean;
  onEducatorApplyUpdate: (result: AssistantApplyResult) => void;
  onEducatorApproveAndSave: (result: AssistantApplyResult) => Promise<void>;
  chatSignedIn: boolean;
  onChatSignInRequired: () => void;
  chatSessionKey: string;
}) {
  const { isDark, toggleTheme } = useTheme();
  const C = getC(isDark);

  const allLessons = course.modules.flatMap((m) =>
    m.lessons.map((l) => ({ ...l, moduleId: m.id, moduleTitle: m.title }))
  );

  const firstLessonId = allLessons[0]?.id ?? '';
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    () => new Set(course.modules[0]?.id ? [course.modules[0].id] : []),
  );
  const [activeLessonId, setActiveLessonId] = useState<string>(firstLessonId);
  const [activeQuizModuleId, setActiveQuizModuleId] = useState<string | null>(null);
  const [activeAssignmentModuleId, setActiveAssignmentModuleId] = useState<string | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [passedModules, setPassedModules] = useState<Set<string>>(new Set());
  const [passedAssignmentModules, setPassedAssignmentModules] = useState<Set<string>>(new Set());
  const [assignmentModuleIds, setAssignmentModuleIds] = useState<Set<string>>(new Set());
  const [progressPercent, setProgressPercent] = useState(0);
  const [progressMeta, setProgressMeta] = useState({
    totalLessons: 0,
    totalQuizModules: 0,
    totalAssignmentModules: 0,
  });
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResult, setQuizResult] = useState<ModuleQuizResult | null>(null);
  const [quizSubmitError, setQuizSubmitError] = useState<string | null>(null);
  const [lessonActionError, setLessonActionError] = useState<string | null>(null);

  const reloadProgress = async () => {
    try {
      const progress = await fetchCourseProgress(courseId);
      setCompletedLessons(new Set(progress.completedLessonIds));
      setPassedModules(new Set(progress.passedModuleIds));
      setPassedAssignmentModules(new Set(progress.passedAssignmentModuleIds ?? []));
      setProgressPercent(progress.progressPercent);
      setProgressMeta({
        totalLessons: progress.totalLessons,
        totalQuizModules: progress.totalQuizModules,
        totalAssignmentModules: progress.totalAssignmentModules ?? 0,
      });
    } catch {
      /* progress unavailable until enrolled */
    }
  };

  useEffect(() => {
    void reloadProgress();
  }, [courseId]);

  useEffect(() => {
    let mounted = true;
    fetchCourseAssignmentSummary(courseId)
      .then((items) => {
        if (mounted) setAssignmentModuleIds(new Set(items.map((i) => i.moduleId)));
      })
      .catch(() => {
        if (mounted) setAssignmentModuleIds(new Set());
      });
    return () => {
      mounted = false;
    };
  }, [courseId]);

  useEffect(() => {
    if (!activeLessonId || !chatSignedIn) return;
    void recordLessonView(courseId, activeLessonId).catch(() => {
      /* enrolled learners only; ignore for preview / anonymous */
    });
  }, [activeLessonId, courseId, chatSignedIn]);

  const activeLesson = allLessons.find((l) => l.id === activeLessonId);
  const activeQuizModule = course.modules.find((m) => m.id === activeQuizModuleId);
  const navBg = isDark ? 'rgba(6,6,8,0.92)' : 'rgba(255,255,255,0.92)';

  const toggleModule = (id: string) => setExpandedModules((prev) => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const openLesson = (id: string) => {
    setActiveLessonId(id);
    setActiveQuizModuleId(null);
    setActiveAssignmentModuleId(null);
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizResult(null);
    setQuizSubmitError(null);
  };

  const openQuiz = (moduleId: string) => {
    setActiveQuizModuleId(moduleId);
    setActiveAssignmentModuleId(null);
    setActiveLessonId('');
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizResult(null);
    setQuizSubmitError(null);
  };

  const openAssignment = (moduleId: string) => {
    setActiveAssignmentModuleId(moduleId);
    setActiveQuizModuleId(null);
    setActiveLessonId('');
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizResult(null);
    setQuizSubmitError(null);
  };

  const activeAssignmentModule = course.modules.find((m) => m.id === activeAssignmentModuleId);

  const markComplete = async () => {
    if (!activeLessonId || completedLessons.has(activeLessonId)) return;
    setLessonActionError(null);
    try {
      await completeLesson(courseId, activeLessonId);
      await reloadProgress();
      const idx = allLessons.findIndex((l) => l.id === activeLessonId);
      if (idx < allLessons.length - 1) setActiveLessonId(allLessons[idx + 1].id);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        setLessonActionError('Session expired. Please sign in again to save progress.');
        return;
      }
      if (axios.isAxiosError(err) && err.response?.status === 402) {
        setLessonActionError('Purchase required before marking lessons complete.');
        return;
      }
      setLessonActionError('Could not save progress. Please try again.');
    }
  };

  const handleQuizSubmit = async () => {
    if (!activeQuizModule) return;
    setQuizSubmitError(null);
    try {
      const payload = Object.fromEntries(
        Object.entries(quizAnswers).map(([key, value]) => [key, value]),
      );
      const result = await submitModuleQuiz(courseId, activeQuizModule.id, payload);
      setQuizResult(result);
      setQuizSubmitted(true);
      await reloadProgress();
    } catch {
      setQuizSubmitError('Could not submit quiz. Please sign in and try again.');
    }
  };

  const correctAnswerForQuestion = (questionIndex: number): number | undefined => {
    const fromResult = quizResult?.questionResults?.find((r) => r.questionIndex === questionIndex)?.correctAnswer;
    if (fromResult != null && fromResult >= 0) return fromResult;
    return undefined;
  };

  const quizScore = quizResult?.score ?? 0;
  const quizTotal = quizResult?.total ?? activeQuizModule?.quiz.length ?? 0;
  const quizPassed = quizResult?.passed ?? false;
  const completedCount = completedLessons.size;
  const totalLessons = progressMeta.totalLessons || allLessons.length;
  const passedQuizCount = passedModules.size;
  const passedAssignmentCount = passedAssignmentModules.size;
  const totalQuizModules = progressMeta.totalQuizModules
    || course.modules.filter((m) => (m.quiz?.length ?? 0) > 0).length;
  const totalAssignmentModules = progressMeta.totalAssignmentModules
    || assignmentModuleIds.size;
  const progressPct = progressPercent;
  const embedId = activeLesson
    ? getYoutubeEmbedId(activeLesson.videoId, activeLesson.videoUrl, youtubeUrl)
    : '';

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: 'var(--display)' }}>
      <CoursePageNav
        C={C}
        isDark={isDark}
        toggleTheme={toggleTheme}
        navBg={navBg}
        left={(
          <>
            <button onClick={onBack} className="flex items-center gap-1.5 cursor-pointer" style={{ background: 'none', border: 'none', color: C.text2, padding: 0 }}>
              <ArrowLeft className="w-4 h-4" />
              <span className="text-[0.82rem]">Course Overview</span>
            </button>
            <div style={{ width: 1, height: 16, background: C.border }} />
            <Link to="/" className="no-underline" style={{ color: C.text }}>
              <QuibLogo
                size={16}
                wordmarkClassName="text-[1rem] font-[700] tracking-tight"
                variant={isDark ? 'dark' : 'light'}
              />
            </Link>
          </>
        )}
        center={(
          <div className="flex flex-col items-center gap-1">
            <span className="text-[0.78rem] font-[500] truncate max-w-xs" style={{ color: C.text }}>{course.title}</span>
            <div className="flex items-center gap-2">
              <div className="w-28 h-1 rounded-full overflow-hidden" style={{ background: C.bg2 }}>
                <div className="h-full rounded-full" style={{ width: `${progressPct}%`, background: C.red }} />
              </div>
              <span className="text-[0.68rem]" style={{ color: C.text3 }}>
                {completedCount}/{totalLessons} lessons · {passedQuizCount}/{totalQuizModules} quizzes
                {totalAssignmentModules > 0 ? ` · ${passedAssignmentCount}/${totalAssignmentModules} assignments` : ''}
              </span>
            </div>
          </div>
        )}
      />

      <div className="flex" style={{ paddingTop: 56 }}>
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col flex-shrink-0 overflow-y-auto"
          style={{ width: 300, height: 'calc(100vh - 56px)', position: 'sticky', top: 56, borderRight: `1px solid ${C.border}`, background: C.bg1 }}>
          <div className="flex-1 overflow-y-auto py-2">
            {course.modules.map((mod, modIdx) => {
              const isExpanded = expandedModules.has(mod.id);
              return (
                <div key={mod.id}>
                  <button onClick={() => toggleModule(mod.id)} className="w-full flex items-center justify-between px-4 py-3.5 text-left"
                    style={{ background: 'transparent', border: 'none', borderBottom: `1px solid ${C.border}`, cursor: 'pointer' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 text-[0.65rem] font-[700]"
                        style={{ background: C.red, color: '#fff' }}>{modIdx + 1}</span>
                      <span className="text-[0.8rem] font-[500] truncate" style={{ color: C.text }}>{mod.title}</span>
                    </div>
                    {isExpanded ? <ChevronDown className="w-3.5 h-3.5 flex-shrink-0" style={{ color: C.text3 }} />
                      : <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" style={{ color: C.text3 }} />}
                  </button>
                  {isExpanded && (
                    <div style={{ borderBottom: `1px solid ${C.border}` }}>
                      {mod.lessons.map((lesson) => {
                        const isActive = activeLessonId === lesson.id;
                        const isDone = completedLessons.has(lesson.id);
                        return (
                          <button key={lesson.id} onClick={() => openLesson(lesson.id)} className="w-full flex items-center gap-3 px-4 py-2.5 text-left"
                            style={{ background: isActive ? isDark ? 'rgba(225,6,0,0.08)' : 'rgba(225,6,0,0.05)' : 'transparent', border: 'none', borderLeft: isActive ? `2px solid ${C.red}` : '2px solid transparent', cursor: 'pointer' }}
                            onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'; }}
                            onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}>
                            {isDone ? <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#22c55e' }} />
                              : lesson.type === 'video' ? <PlayCircle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: isActive ? C.red : C.text3 }} />
                                : <FileText className="w-3.5 h-3.5 flex-shrink-0" style={{ color: isActive ? C.red : C.text3 }} />}
                            <div className="min-w-0 flex-1">
                              <p className="text-[0.78rem] truncate" style={{ color: isActive ? C.text : isDone ? C.text3 : C.text2 }}>{lesson.title}</p>
                              <p className="text-[0.66rem] mt-0.5" style={{ color: C.text3 }}>{lesson.duration}</p>
                            </div>
                          </button>
                        );
                      })}
                      {(mod.quiz?.length ?? 0) > 0 && (
                      <button onClick={() => openQuiz(mod.id)} className="w-full flex items-center gap-3 px-4 py-2.5 text-left"
                        style={{ background: activeQuizModuleId === mod.id ? isDark ? 'rgba(225,6,0,0.08)' : 'rgba(225,6,0,0.05)' : 'transparent', border: 'none', borderLeft: activeQuizModuleId === mod.id ? `2px solid ${C.red}` : '2px solid transparent', cursor: 'pointer' }}
                        onMouseEnter={(e) => { if (activeQuizModuleId !== mod.id) e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'; }}
                        onMouseLeave={(e) => { if (activeQuizModuleId !== mod.id) e.currentTarget.style.background = 'transparent'; }}>
                        {passedModules.has(mod.id) ? (
                          <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#22c55e' }} />
                        ) : (
                          <span className="text-sm flex-shrink-0">📝</span>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-[0.78rem] font-[500]" style={{ color: activeQuizModuleId === mod.id ? C.red : C.text2 }}>Module Quiz</p>
                          <p className="text-[0.66rem] mt-0.5" style={{ color: C.text3 }}>{mod.quiz?.length ?? 0} questions</p>
                        </div>
                      </button>
                      )}
                      {assignmentModuleIds.has(mod.id) && (
                      <button onClick={() => openAssignment(mod.id)} className="w-full flex items-center gap-3 px-4 py-2.5 text-left"
                        style={{ background: activeAssignmentModuleId === mod.id ? isDark ? 'rgba(225,6,0,0.08)' : 'rgba(225,6,0,0.05)' : 'transparent', border: 'none', borderLeft: activeAssignmentModuleId === mod.id ? `2px solid ${C.red}` : '2px solid transparent', cursor: 'pointer' }}
                        onMouseEnter={(e) => { if (activeAssignmentModuleId !== mod.id) e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'; }}
                        onMouseLeave={(e) => { if (activeAssignmentModuleId !== mod.id) e.currentTarget.style.background = 'transparent'; }}>
                        {passedAssignmentModules.has(mod.id) ? (
                          <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#22c55e' }} />
                        ) : (
                          <FileText className="w-3.5 h-3.5 flex-shrink-0" style={{ color: activeAssignmentModuleId === mod.id ? C.red : C.text3 }} />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-[0.78rem] font-[500]" style={{ color: activeAssignmentModuleId === mod.id ? C.red : C.text2 }}>Assignment</p>
                          <p className="text-[0.66rem] mt-0.5" style={{ color: C.text3 }}>Submit work</p>
                        </div>
                      </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0">
          {/* Mobile course outline */}
          <div className="md:hidden border-b" style={{ borderColor: C.border, background: C.bg1 }}>
            <div className="px-4 py-3">
              <p className="text-[0.7rem] uppercase tracking-widest mb-2" style={{ color: C.text3, fontFamily: 'var(--mono)' }}>
                Course outline
              </p>
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {course.modules.map((mod, modIdx) => {
                  const isExpanded = expandedModules.has(mod.id);
                  const hasQuiz = (mod.quiz?.length ?? 0) > 0;
                  const hasAssignment = assignmentModuleIds.has(mod.id);
                  return (
                    <div key={mod.id} className="rounded-lg overflow-hidden" style={{ border: `1px solid ${C.border}` }}>
                      <button
                        type="button"
                        onClick={() => toggleModule(mod.id)}
                        className="w-full flex items-center justify-between px-3 py-2 text-left"
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                      >
                        <span className="text-[0.8rem] font-[500] truncate" style={{ color: C.text }}>
                          {modIdx + 1}. {mod.title}
                        </span>
                        {isExpanded ? <ChevronDown className="w-3.5 h-3.5" style={{ color: C.text3 }} />
                          : <ChevronRight className="w-3.5 h-3.5" style={{ color: C.text3 }} />}
                      </button>
                      {isExpanded && (
                        <div className="pb-1">
                          {mod.lessons.map((lesson) => {
                            const isActive = activeLessonId === lesson.id && !activeQuizModuleId && !activeAssignmentModuleId;
                            return (
                              <button
                                key={lesson.id}
                                type="button"
                                onClick={() => openLesson(lesson.id)}
                                className="w-full text-left px-3 py-2 text-[0.78rem] truncate"
                                style={{
                                  background: isActive ? isDark ? 'rgba(225,6,0,0.08)' : 'rgba(225,6,0,0.05)' : 'transparent',
                                  border: 'none',
                                  color: isActive ? C.red : C.text2,
                                  cursor: 'pointer',
                                }}
                              >
                                {lesson.title}
                              </button>
                            );
                          })}
                          {hasQuiz && (
                            <button
                              type="button"
                              onClick={() => openQuiz(mod.id)}
                              className="w-full text-left px-3 py-2 text-[0.78rem] font-[500]"
                              style={{
                                background: activeQuizModuleId === mod.id ? isDark ? 'rgba(225,6,0,0.08)' : 'rgba(225,6,0,0.05)' : 'transparent',
                                border: 'none',
                                color: activeQuizModuleId === mod.id ? C.red : C.text2,
                                cursor: 'pointer',
                              }}
                            >
                              📝 Module Quiz ({mod.quiz?.length ?? 0})
                            </button>
                          )}
                          {hasAssignment && (
                            <button
                              type="button"
                              onClick={() => openAssignment(mod.id)}
                              className="w-full text-left px-3 py-2 text-[0.78rem] font-[500]"
                              style={{
                                background: activeAssignmentModuleId === mod.id ? isDark ? 'rgba(225,6,0,0.08)' : 'rgba(225,6,0,0.05)' : 'transparent',
                                border: 'none',
                                color: activeAssignmentModuleId === mod.id ? C.red : C.text2,
                                cursor: 'pointer',
                              }}
                            >
                              Assignment
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {activeLesson && !activeQuizModuleId && !activeAssignmentModuleId && (
            <div className="max-w-3xl mx-auto px-6 py-10">
              <p className="text-[0.7rem] mb-5 uppercase tracking-widest" style={{ color: C.text3, fontFamily: 'var(--mono)' }}>
                {allLessons.find((l) => l.id === activeLessonId)?.moduleTitle}
              </p>
              <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 400, lineHeight: 1.2, color: C.text, marginBottom: 12 }}>
                {activeLesson.title}
              </h1>
              <div className="flex items-center gap-3 mb-8">
                <span className="text-[0.68rem] font-[500] px-2 py-1 rounded uppercase tracking-wide"
                  style={{ background: C.redDim, color: C.red, fontFamily: 'var(--mono)' }}>
                  {activeLesson.type === 'video' ? '▶ Video' : '📄 Reading'}
                </span>
                <span className="text-[0.75rem]" style={{ color: C.text3 }}>{activeLesson.duration}</span>
              </div>
              {activeLesson.type === 'video' && embedId ? (
                <div className="w-full rounded-2xl overflow-hidden mb-8"
                  style={{ border: `1px solid ${C.border}`, aspectRatio: '16/9', background: C.bg2 }}>
                  <YoutubeLessonPlayer
                    videoId={embedId}
                    title={activeLesson.title}
                    courseId={courseId}
                    lessonId={activeLessonId}
                    trackProgress={chatSignedIn}
                    className="w-full h-full"
                  />
                </div>
              ) : activeLesson.type === 'video' ? (
                <div className="w-full rounded-2xl p-6 mb-8 text-center text-sm" style={{ background: C.bg1, border: `1px solid ${C.border}`, color: C.text3 }}>
                  Video player unavailable for this lesson.
                </div>
              ) : null}
              <LessonStudyContent
                lesson={activeLesson}
                theme={C}
                moduleTitle={allLessons.find((l) => l.id === activeLessonId)?.moduleTitle}
              />
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                {completedLessons.has(activeLessonId) ? (
                  <div className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[0.82rem] font-[500]"
                    style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.25)' }}>
                    <CheckCircle className="w-4 h-4" /> Completed
                  </div>
                ) : (
                  <button onClick={markComplete} className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[0.82rem] font-[600] cursor-pointer"
                    style={{ background: C.red, color: '#fff', border: 'none' }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}>
                    Mark Complete & Continue
                  </button>
                )}
                </div>
                {lessonActionError && (
                  <p className="text-[0.8rem]" style={{ color: C.red }}>{lessonActionError}</p>
                )}
              </div>
              <LessonFeedbackPanel
                courseId={courseId}
                lessonId={activeLessonId}
                lessonTitle={activeLesson?.title}
                enabled={chatSignedIn}
                theme={C}
              />
              <CourseReviewPanel courseId={courseId} enabled={chatSignedIn} theme={C} />
            </div>
          )}

          {activeQuizModule && (
            <div className="max-w-3xl mx-auto px-6 py-10">
              <p className="text-[0.7rem] mb-4 uppercase tracking-widest" style={{ color: C.text3, fontFamily: 'var(--mono)' }}>{activeQuizModule.title}</p>
              <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 400, lineHeight: 1.2, color: C.text, marginBottom: 8 }}>Module Quiz</h1>
              <p className="text-[0.85rem] mb-8" style={{ color: C.text2 }}>{activeQuizModule.quiz.length} questions · Test your understanding</p>
              <div className="space-y-5 mb-8">
                {activeQuizModule.quiz.map((q, qi) => (
                  <div key={qi} className="rounded-2xl p-6" style={{ background: C.bg1, border: `1px solid ${C.border}` }}>
                    <p className="text-[0.875rem] font-[500] mb-4 leading-relaxed" style={{ color: C.text }}>
                      <span style={{ color: C.red, fontFamily: 'var(--mono)', fontSize: '0.72rem', marginRight: 8 }}>Q{qi + 1}</span>
                      {q.question}
                    </p>
                    <div className="space-y-2">
                      {q.options.map((opt, oi) => {
                        const selected = quizAnswers[qi] === oi;
                        const correctAnswer = correctAnswerForQuestion(qi);
                        const correct = quizSubmitted && correctAnswer != null && oi === correctAnswer;
                        const wrong = quizSubmitted && selected && correctAnswer != null && oi !== correctAnswer;
                        return (
                          <button key={oi} onClick={() => !quizSubmitted && setQuizAnswers((prev) => ({ ...prev, [qi]: oi }))}
                            className="w-full text-left px-4 py-3 rounded-xl text-[0.82rem] transition-all"
                            style={{ background: correct ? 'rgba(34,197,94,0.12)' : wrong ? 'rgba(225,6,0,0.1)' : selected ? isDark ? 'rgba(225,6,0,0.1)' : 'rgba(225,6,0,0.06)' : isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.025)', border: `1px solid ${correct ? 'rgba(34,197,94,0.35)' : wrong ? 'rgba(225,6,0,0.3)' : selected ? C.red : C.border}`, color: correct ? '#22c55e' : wrong ? C.red : C.text2, cursor: quizSubmitted ? 'default' : 'pointer' }}>
                            <span className="font-[600] mr-2" style={{ fontFamily: 'var(--mono)', fontSize: '0.72rem' }}>{String.fromCharCode(65 + oi)}.</span>
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              {!quizSubmitted ? (
                <div className="space-y-3">
                  {quizSubmitError && (
                    <p className="text-[0.82rem]" style={{ color: C.red }}>{quizSubmitError}</p>
                  )}
                  <button onClick={handleQuizSubmit}
                  disabled={Object.keys(quizAnswers).length < activeQuizModule.quiz.length}
                  className="px-8 py-3 rounded-lg text-[0.875rem] font-[600] cursor-pointer transition-all"
                  style={{ background: Object.keys(quizAnswers).length === activeQuizModule.quiz.length ? C.red : C.bg2, color: Object.keys(quizAnswers).length === activeQuizModule.quiz.length ? '#fff' : C.text3, border: 'none', boxShadow: Object.keys(quizAnswers).length === activeQuizModule.quiz.length ? '0 4px 16px rgba(225,6,0,0.25)' : 'none' }}>
                  Submit Quiz
                </button>
                </div>
              ) : (
                <div className="rounded-2xl p-6" style={{ background: quizPassed ? 'rgba(34,197,94,0.08)' : 'rgba(225,6,0,0.06)', border: `1px solid ${quizPassed ? 'rgba(34,197,94,0.25)' : 'rgba(225,6,0,0.2)'}` }}>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: quizPassed ? 'rgba(34,197,94,0.15)' : C.redDim, border: `1px solid ${quizPassed ? 'rgba(34,197,94,0.3)' : 'rgba(225,6,0,0.2)'}` }}>
                      <span style={{ fontFamily: 'var(--serif)', fontSize: '1.1rem', color: quizPassed ? '#22c55e' : C.red }}>{quizScore}/{quizTotal}</span>
                    </div>
                    <div>
                      <p className="font-[600] text-[0.95rem]" style={{ color: C.text }}>{quizPassed ? 'Great work!' : 'Keep going'}</p>
                      <p className="text-[0.8rem] mt-0.5" style={{ color: C.text2 }}>
                        {quizPassed
                          ? 'You passed this module. Move on to the next one.'
                          : `You got ${quizScore} of ${quizTotal} correct (${Math.round((quizScore / Math.max(quizTotal, 1)) * 100)}%). You need 70% to pass.`}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeAssignmentModule && activeAssignmentModuleId && (
            <ModuleAssignmentPanel
              courseId={courseId}
              moduleId={activeAssignmentModuleId}
              moduleTitle={activeAssignmentModule.title}
              C={C}
              isDark={isDark}
              onSubmitted={() => void reloadProgress()}
            />
          )}

          {!activeLesson && !activeQuizModuleId && !activeAssignmentModuleId && (
            <div className="max-w-3xl mx-auto px-6 py-10 text-center">
              <p className="text-[0.9rem] mb-4" style={{ color: C.text2 }}>
                {allLessons.length === 0
                  ? 'This course has no lessons yet.'
                  : 'Select a lesson, quiz, or assignment from the outline above.'}
              </p>
            </div>
          )}
        </main>
      </div>
      {showEducatorAssistant && (
        <EducatorAssistantWidget
          key={chatSessionKey}
          courseId={courseId}
          courseTitle={course.title}
          sessionKey={chatSessionKey}
          onPreviewChange={onEducatorApplyUpdate}
          onApproveAndSave={onEducatorApproveAndSave}
        />
      )}
      {showCourseChat && !showEducatorAssistant && (
        <CourseChatWidget
          key={chatSessionKey}
          courseId={courseId}
          courseTitle={course.title}
          lessonId={activeLessonId || undefined}
          moduleId={activeQuizModuleId || undefined}
          signedIn={chatSignedIn}
          onSignInRequired={onChatSignInRequired}
          sessionKey={chatSessionKey}
        />
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function CourseDetails() {
  const { isDark, toggleTheme } = useTheme();
  const C = getC(isDark);
  const navigate = useNavigate();
  const location = useLocation();
  const { courseId: courseIdParam } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { profile, refreshProfile, setProfile } = useUserProfile();
  const authSessionKey = useAuthSessionKey();
  const chatSignedIn = isTokenValid();

  const youtubeUrl: string = location.state?.youtubeUrl ?? sessionStorage.getItem('courseYoutubeUrl') ?? '';
  const videoUrls: string[] | undefined = location.state?.videoUrls;
  const generationOptions: CourseGenerationOptions | undefined = location.state?.generationOptions;
  const courseId: string | undefined = courseIdParam ?? location.state?.courseId;
  const returnTo: string | undefined = location.state?.from;

  const handleBack = () => {
    if (returnTo) {
      navigate(returnTo);
      return;
    }
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate(isOwner ? (returnTo || '/educator-studio') : '/dashboard');
  };

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [learningMode, setLearningMode] = useState(false);
  const [resolvedCourseId, setResolvedCourseId] = useState<string | undefined>(courseId);
  const [isPublished, setIsPublished] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showPreCheckout, setShowPreCheckout] = useState(false);

  const isEducator = profile?.role === 'educator' || profile?.role === 'admin';
  const canPublish = isOwner && isEducator;

  const navBg = isDark ? 'rgba(6,6,8,0.92)' : 'rgba(255,255,255,0.92)';

  useEffect(() => {
    if (youtubeUrl) sessionStorage.setItem('courseYoutubeUrl', youtubeUrl);
  }, [youtubeUrl]);

  const MOCK_COURSE: Course = {
    title: 'Mastering React: From Fundamentals to Advanced Patterns',
    description:
      'A comprehensive course built from your video that takes you from core React concepts all the way to production-ready patterns. You will understand the component model deeply, manage state at scale, optimise rendering performance, and ship maintainable, well-tested applications.',
    difficulty: 'Intermediate',
    date: '4/18/2026',
    videoTitle: 'React Full Course 2024',
    channelName: 'Traversy Media',
    videoLength: '2h 34m',
    modules: [
      {
        id: 'm1',
        title: 'React Fundamentals',
        description:
          'Get comfortable with JSX, props, and the component model. By the end of this module you will be able to build static UIs composed of reusable components and understand how React reconciles the virtual DOM.',
        lessons: [
          { id: 'l1', title: 'What is React and why it exists', duration: '6 min', type: 'video' },
          { id: 'l2', title: 'JSX syntax deep dive', duration: '9 min', type: 'video' },
          { id: 'l3', title: 'Props and component composition', duration: '11 min', type: 'reading' },
          { id: 'l4', title: 'Lists, keys, and conditional rendering', duration: '8 min', type: 'video' },
        ],
        quiz: [
          {
            question: 'What does JSX compile to under the hood?',
            options: ['HTML strings', 'React.createElement calls', 'Virtual DOM nodes directly', 'TypeScript decorators'],
            answer: 1,
          },
          {
            question: 'Which prop is required when rendering a list of elements to help React track items?',
            options: ['id', 'index', 'key', 'ref'],
            answer: 2,
          },
          {
            question: 'What is the correct way to pass a number as a prop in JSX?',
            options: ['count="5"', 'count={5}', 'count=5', '{count: 5}'],
            answer: 1,
          },
          {
            question: 'Which of the following statements about components is true?',
            options: [
              'Components must always return a single DOM element',
              'Class components are required for stateful logic',
              'A component name must start with a capital letter',
              'Props can be mutated inside the component',
            ],
            answer: 2,
          },
        ],
      },
      {
        id: 'm2',
        title: 'State & the React Hooks System',
        description:
          'Learn how useState, useEffect, useRef, and custom hooks let you encapsulate and reuse stateful logic. This module also covers the Rules of Hooks and common pitfalls like stale closures.',
        lessons: [
          { id: 'l5', title: 'useState — local component state', duration: '10 min', type: 'video' },
          { id: 'l6', title: 'useEffect and the dependency array', duration: '13 min', type: 'video' },
          { id: 'l7', title: 'useRef and accessing DOM nodes', duration: '7 min', type: 'reading' },
          { id: 'l8', title: 'Building your first custom hook', duration: '12 min', type: 'video' },
        ],
        quiz: [
          {
            question: 'What triggers a component to re-render?',
            options: ['A variable assignment inside the component', 'A state update via the setter', 'Any function call inside the component', 'Reading a ref value'],
            answer: 1,
          },
          {
            question: 'An empty dependency array [] in useEffect means the effect runs…',
            options: ['On every render', 'Never', 'Only on mount (and cleanup on unmount)', 'Only when the component unmounts'],
            answer: 2,
          },
          {
            question: 'What value does useRef return?',
            options: ['The current DOM node', 'A mutable object with a .current property', 'A new state variable', 'A callback function'],
            answer: 1,
          },
          {
            question: 'Which rule must you follow when calling hooks?',
            options: [
              'Hooks can only be called inside class components',
              'Hooks must be called conditionally for performance',
              'Hooks must be called at the top level of a React function',
              'Hooks cannot be used inside custom hooks',
            ],
            answer: 2,
          },
        ],
      },
      {
        id: 'm3',
        title: 'State Management at Scale',
        description:
          "Explore when local state isn't enough. This module covers the Context API for global state, useReducer for complex state transitions, and an introduction to external libraries like Zustand.",
        lessons: [
          { id: 'l9', title: 'Prop drilling and why it hurts', duration: '8 min', type: 'reading' },
          { id: 'l10', title: 'Context API — createContext and useContext', duration: '14 min', type: 'video' },
          { id: 'l11', title: 'useReducer for complex state', duration: '11 min', type: 'video' },
          { id: 'l12', title: 'Introduction to Zustand', duration: '10 min', type: 'video' },
        ],
        quiz: [
          {
            question: 'What problem does the Context API primarily solve?',
            options: ['Server-side rendering', 'Prop drilling across many component levels', 'Asynchronous data fetching', 'Component styling'],
            answer: 1,
          },
          {
            question: 'useReducer is most useful when…',
            options: [
              'You have a single boolean toggle',
              'State transitions depend on the previous state and multiple sub-values',
              'You need to fetch data from an API',
              'You want to avoid re-renders entirely',
            ],
            answer: 1,
          },
          {
            question: 'In the Context API, which component makes a value available to descendants?',
            options: ['Context.Consumer', 'Context.Provider', 'Context.Selector', 'Context.Dispatcher'],
            answer: 1,
          },
          {
            question: 'Zustand stores state…',
            options: ['Inside Redux reducers', 'Outside the React component tree', 'Only in localStorage', 'Inside a context provider'],
            answer: 1,
          },
        ],
      },
      {
        id: 'm4',
        title: 'Performance & Production Patterns',
        description:
          'Ship fast, maintainable React apps. Topics include memoisation with useMemo and useCallback, code splitting with React.lazy, error boundaries, and best practices for testing with React Testing Library.',
        lessons: [
          { id: 'l13', title: 'useMemo and useCallback — when to reach for them', duration: '12 min', type: 'video' },
          { id: 'l14', title: 'Code splitting with React.lazy and Suspense', duration: '9 min', type: 'video' },
          { id: 'l15', title: 'Error boundaries', duration: '7 min', type: 'reading' },
          { id: 'l16', title: 'Testing with React Testing Library', duration: '15 min', type: 'video' },
        ],
        quiz: [
          {
            question: 'What does React.memo do?',
            options: [
              'Memoises the return value of a hook',
              'Prevents a component from re-rendering if its props have not changed',
              'Caches API responses',
              'Delays rendering until data is ready',
            ],
            answer: 1,
          },
          {
            question: 'React.lazy is used together with which component to show a fallback while loading?',
            options: ['ErrorBoundary', 'StrictMode', 'Suspense', 'Transition'],
            answer: 2,
          },
          {
            question: 'An Error Boundary must be implemented as…',
            options: ['A function component with try/catch', 'A class component with componentDidCatch', 'A custom hook', 'A context provider'],
            answer: 1,
          },
          {
            question: 'React Testing Library encourages testing…',
            options: ['Implementation details like state variables', 'Component internals via instance methods', 'Behaviour from the user\'s perspective', 'Only snapshot tests'],
            answer: 2,
          },
        ],
      },
    ],
  };

  useEffect(() => {
    let mounted = true;

    const loadCourse = async () => {
      if (!courseId && !youtubeUrl && (!videoUrls || videoUrls.length === 0)) {
        setError('No course specified. Select videos in Studio or paste a playlist URL.');
        setLoading(false);
        return;
      }
      try {
        const res = courseId
          ? await axios.get(`/api/course/${courseId}`)
          : videoUrls && videoUrls.length > 0
            ? await axios.post('/api/course/generate-from-videos', { videoUrls, options: generationOptions })
            : await axios.post('/api/course/generate', { youtubeUrl, options: generationOptions });
        if (!mounted) return;
        const data = res.data as Course & {
          courseId?: string;
          isPublished?: boolean;
          isOwner?: boolean;
          isFree?: boolean;
          priceCents?: number;
          currency?: string;
          requiresPurchase?: boolean;
          hasPurchased?: boolean;
        };
        setCourse(data);
        setResolvedCourseId(data.courseId ?? courseId);
        setIsPublished(!!data.isPublished);
        setIsOwner(!!data.isOwner);
        setExpandedModules(new Set([data.modules?.[0]?.id].filter(Boolean) as string[]));
        if (data.playlistUrl) {
          sessionStorage.setItem('courseYoutubeUrl', data.playlistUrl);
        }
        if (data.courseId && !courseId) {
          void refreshProfile();
          navigate(`/course-details/${data.courseId}`, {
            replace: true,
            state: { ...location.state, courseId: data.courseId },
          });
        }
        setLoading(false);
      } catch (err) {
        if (!mounted) return;
        setError(getCourseGenerationError(err));
        setLoading(false);
      }
    };

    loadCourse();
    return () => { mounted = false; };
  }, [courseId, youtubeUrl, videoUrls, generationOptions]);

  useEffect(() => {
    if (searchParams.get('checkout') !== 'success' || !resolvedCourseId) {
      return;
    }
    if (!isTokenValid()) {
      navigate('/signin', {
        replace: true,
        state: { returnTo: `/course-details/${resolvedCourseId}?checkout=success` },
      });
      return;
    }
    let mounted = true;
    const completePurchase = async () => {
      try {
        await enrollCourse(resolvedCourseId);
        if (!mounted) return;
        setSearchParams({}, { replace: true });
        const res = await axios.get(`/api/course/${resolvedCourseId}`);
        const data = res.data as Course;
        setCourse((prev) => (prev ? { ...prev, ...data } : data));
        setLearningMode(true);
      } catch {
        if (mounted) {
          setError('Payment received — finishing enrollment failed. Try Start Learning again.');
        }
      }
    };
    void completePurchase();
    return () => { mounted = false; };
  }, [resolvedCourseId, searchParams, setSearchParams, navigate]);

  const handleUnpublish = async () => {
    if (!resolvedCourseId) return;
    if (!window.confirm('Unpublish this course? It will be hidden from Browse.')) return;
    setPublishing(true);
    setPublishError(null);
    try {
      const data = await unpublishCourse(resolvedCourseId);
      setIsPublished(!!data.isPublished);
    } catch (err) {
      setPublishError(getCourseGenerationError(err));
    } finally {
      setPublishing(false);
    }
  };

  const handleDelete = async () => {
    if (!resolvedCourseId) return;
    if (!window.confirm('Delete this course permanently?')) return;
    setPublishing(true);
    setPublishError(null);
    try {
      await deleteCourse(resolvedCourseId);
      navigate('/educator-courses');
    } catch (err) {
      setPublishError(getCourseGenerationError(err));
    } finally {
      setPublishing(false);
    }
  };

  const toggleModule = (id: string) => setExpandedModules((prev) => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const isGenerating = !courseId && (!!youtubeUrl || (videoUrls?.length ?? 0) > 0);

  // ── Loading ──
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: 'var(--display)', display: 'flex', flexDirection: 'column' }}>
        <CoursePageNav
          C={C}
          isDark={isDark}
          toggleTheme={toggleTheme}
          navBg={navBg}
          left={(
            <Link to="/" className="no-underline" style={{ color: C.text }}>
              <QuibLogo
                size={16}
                wordmarkClassName="text-[1rem] font-[700] tracking-tight"
                variant={isDark ? 'dark' : 'light'}
              />
            </Link>
          )}
        />
        <div className="flex-1 flex flex-col items-center justify-center px-6" style={{ paddingTop: 56 }}>
          {isGenerating ? (
            <CourseGenerationLoader />
          ) : (
            <div className="text-center space-y-3">
              <div
                className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-transparent"
                style={{ borderTopColor: C.red, borderRightColor: C.red }}
                aria-hidden
              />
              <p className="text-[0.9rem]" style={{ color: C.text2 }}>Loading course…</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Error ──
  if (error || !course) {
    return (
      <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: 'var(--display)', display: 'flex', flexDirection: 'column' }}>
        <CoursePageNav
          C={C}
          isDark={isDark}
          toggleTheme={toggleTheme}
          navBg={navBg}
          left={(
            <Link to="/" className="no-underline" style={{ color: C.text }}>
              <QuibLogo
                size={16}
                wordmarkClassName="text-[1rem] font-[700] tracking-tight"
                variant={isDark ? 'dark' : 'light'}
              />
            </Link>
          )}
        />
        <div className="flex-1 flex items-center justify-center px-6" style={{ paddingTop: 56 }}>
          <div className="w-full max-w-md rounded-xl p-6" style={{ background: C.bg1, border: '1px solid rgba(225,6,0,0.3)' }}>
            <div className="flex items-start gap-3 mb-5">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: C.red }} />
              <p className="text-sm leading-relaxed" style={{ color: C.text2 }}>{error ?? 'Something went wrong.'}</p>
            </div>
            <button onClick={handleBack} className="px-5 py-2.5 rounded-lg text-sm font-[500] cursor-pointer"
              style={{ background: C.bg2, border: `1px solid ${C.border2}`, color: C.text2 }}>
              ← Go back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const priceLabel = formatPriceCents(
    course.isFree === false && course.priceCents ? course.priceCents : 0,
    course.currency,
  );
  const showPaidCta = !!course.requiresPurchase && !isOwner;
  const startButtonLabel = showPaidCta ? `Buy course · ${priceLabel}` : 'Start Learning';

  const proceedToCheckout = async () => {
    if (!resolvedCourseId) return;
    const url = await createCourseCheckout(resolvedCourseId);
    window.location.href = url;
  };

  const handleStartLearning = async () => {
    if (!resolvedCourseId) return;
    if (!isTokenValid()) {
      navigate('/signin', { state: { returnTo: `/course-details/${resolvedCourseId}` } });
      return;
    }
    try {
      if (showPaidCta) {
        if (!isCheckoutProfileReady(profile)) {
          setShowPreCheckout(true);
          return;
        }
        await proceedToCheckout();
        return;
      }
      await enrollCourse(resolvedCourseId);
      setLearningMode(true);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        navigate('/signin', { state: { returnTo: `/course-details/${resolvedCourseId}` } });
        return;
      }
      if (axios.isAxiosError(err) && err.response?.status === 402) {
        try {
          if (!isCheckoutProfileReady(profile)) {
            setShowPreCheckout(true);
            return;
          }
          await proceedToCheckout();
          return;
        } catch (checkoutErr) {
          setError(getCheckoutError(checkoutErr));
          return;
        }
      }
      if (axios.isAxiosError(err) && err.response?.status === 400) {
        const msg = (err.response.data as { message?: string })?.message;
        if (msg?.toLowerCase().includes('mobile')) {
          setShowPreCheckout(true);
          return;
        }
      }
      setError('Unable to start learning. Please sign in and try again.');
    }
  };

  // ── Learning Mode ──
  const chatSessionKey = `${resolvedCourseId ?? 'course'}-${authSessionKey}`;
  const showCourseChat = !!resolvedCourseId;
  const showEducatorAssistant = chatSignedIn && isOwner && isEducator && !!resolvedCourseId;
  const handleEducatorApplyUpdate = (result: AssistantApplyResult) => {
    if (!resolvedCourseId) return;
    sessionStorage.setItem(
      `assistant-pending-${resolvedCourseId}`,
      JSON.stringify({ update: result.courseUpdate, operations: result.operations }),
    );
    navigate(`/educator-courses/${resolvedCourseId}/edit`);
  };
  const handleEducatorApproveAndSave = async (result: AssistantApplyResult) => {
    if (!resolvedCourseId || !course) return;
    const videoIds = course.playlistVideos?.map((v) => v.videoId).filter(Boolean) ?? [];
    const payload = buildSavePayloadFromAssistant(courseToEditable(course), result, videoIds);
    await updateCourse(resolvedCourseId, payload);
    const res = await axios.get(`/api/course/${resolvedCourseId}`);
    setCourse(res.data as Course);
  };
  const handleChatSignIn = () => {
    navigate('/signin', { state: { returnTo: `/course-details/${resolvedCourseId}` } });
  };

  if (learningMode && resolvedCourseId) {
    return (
      <LearningMode
        course={course}
        courseId={resolvedCourseId}
        youtubeUrl={youtubeUrl}
        onBack={() => setLearningMode(false)}
        showCourseChat={showCourseChat}
        showEducatorAssistant={showEducatorAssistant}
        onEducatorApplyUpdate={handleEducatorApplyUpdate}
        onEducatorApproveAndSave={handleEducatorApproveAndSave}
        chatSignedIn={chatSignedIn}
        onChatSignInRequired={handleChatSignIn}
        chatSessionKey={chatSessionKey}
      />
    );
  }

  const modules = course.modules ?? [];
  const totalLessons = modules.reduce((acc, m) => acc + (m.lessons?.length ?? 0), 0);
  const linkedVideoLessons = modules.reduce(
    (acc, m) => acc + (m.lessons ?? []).filter((l) => l.type === 'video' && (l.videoId || l.videoUrl)).length,
    0,
  );
  const sourcePlaylistSize = course.playlistVideos?.length;

  const shareUrl = resolvedCourseId
    ? `${window.location.origin}/course-details/${resolvedCourseId}`
    : '';

  const handlePublish = async () => {
    if (!resolvedCourseId) return;
    setPublishing(true);
    setPublishError(null);
    try {
      const data = await publishCourse(resolvedCourseId);
      setIsPublished(!!data.isPublished);
      setIsOwner(!!data.isOwner);
    } catch (err) {
      setPublishError(getCourseGenerationError(err));
    } finally {
      setPublishing(false);
    }
  };

  const handleCopyLink = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      window.setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      setPublishError('Unable to copy link.');
    }
  };

  // ── Course Overview ──
  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: 'var(--display)' }}>
      <CoursePageNav
        C={C}
        isDark={isDark}
        toggleTheme={toggleTheme}
        navBg={navBg}
        left={(
          <>
            <button onClick={handleBack} className="flex items-center gap-1.5 cursor-pointer"
              style={{ background: 'none', border: 'none', color: C.text2, padding: 0 }}>
              <ArrowLeft className="w-4 h-4" />
              <span className="text-[0.82rem]">Back</span>
            </button>
            <div style={{ width: 1, height: 16, background: C.border }} />
            <Link to="/" className="no-underline" style={{ color: C.text }}>
              <QuibLogo
                size={16}
                wordmarkClassName="text-[1rem] font-[700] tracking-tight"
                variant={isDark ? 'dark' : 'light'}
              />
            </Link>
          </>
        )}
      />

      <div className="max-w-4xl mx-auto px-6 md:px-10" style={{ paddingTop: 96, paddingBottom: 80 }}>
        {/* Header */}
        <div className="mb-10">
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 400, lineHeight: 1.15, color: C.text, marginBottom: 20 }}>
            {course.title}
          </h1>
          <p className="text-[0.9rem] leading-relaxed mb-8" style={{ color: C.text2, lineHeight: 1.8, maxWidth: 720 }}>
            {course.description}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            {[
              { icon: <BookOpen className="w-3.5 h-3.5" />, label: `Difficulty ${course.difficulty}` },
              { icon: <Calendar className="w-3.5 h-3.5" />, label: course.date },
              { icon: <Layers className="w-3.5 h-3.5" />, label: `${course.modules.length} Modules` },
              { icon: <PlayCircle className="w-3.5 h-3.5" />, label: `${totalLessons} Lessons` },
              { icon: <BookOpen className="w-3.5 h-3.5" />, label: priceLabel },
              ...(linkedVideoLessons > 0
                ? [{ icon: <PlayCircle className="w-3.5 h-3.5" />, label: `${linkedVideoLessons} Video lessons` }]
                : []),
              ...(sourcePlaylistSize && sourcePlaylistSize > totalLessons
                ? [{ icon: <PlayCircle className="w-3.5 h-3.5" />, label: `${sourcePlaylistSize} source videos` }]
                : []),
            ].map((b) => (
              <div key={b.label} className="flex items-center gap-2 px-4 py-2 rounded-lg text-[0.78rem] font-[500]"
                style={{ background: C.redDim, border: `1px solid ${isDark ? 'rgba(225,6,0,0.2)' : 'rgba(225,6,0,0.12)'}`, color: C.red }}>
                {b.icon}{b.label}
              </div>
            ))}
          </div>
        </div>

        {isOwner && !isEducator && !isPublished && (
          <div
            className="mb-8 rounded-2xl px-5 py-4 text-[0.8rem]"
            style={{ background: C.bg1, border: `1px solid ${C.border}`, color: C.text2 }}
          >
            Course created. Educator accounts can publish courses to the catalog after generation.
          </div>
        )}

        {isOwner && isEducator && (
          <div className="mb-6 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => resolvedCourseId && navigate(`/educator-courses/${resolvedCourseId}/edit`)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-[0.82rem] font-[600] cursor-pointer"
              style={{ background: C.bg2, border: `1px solid ${C.border2}`, color: C.text2 }}
            >
              <Pencil className="w-4 h-4" /> Edit course
            </button>
            {isPublished && (
              <button
                type="button"
                onClick={() => void handleUnpublish()}
                disabled={publishing}
                className="px-4 py-2 rounded-lg text-[0.82rem] font-[600] cursor-pointer disabled:opacity-60"
                style={{ background: C.bg2, border: `1px solid ${C.border2}`, color: C.text2 }}
              >
                Unpublish
              </button>
            )}
            <button
              type="button"
              onClick={() => void handleDelete()}
              disabled={publishing}
              className="px-4 py-2 rounded-lg text-[0.82rem] font-[600] cursor-pointer disabled:opacity-60"
              style={{ background: 'rgba(225,6,0,0.08)', border: '1px solid rgba(225,6,0,0.2)', color: C.red }}
            >
              Delete
            </button>
          </div>
        )}

        {(canPublish || (isOwner && isPublished)) && (
          <div
            className="mb-8 rounded-2xl p-5"
            style={{ background: C.bg1, border: `1px solid ${C.border}` }}
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="mb-1 flex items-center gap-2 text-[0.9rem] font-[600]" style={{ color: C.text }}>
                  <Globe className="w-4 h-4" style={{ color: C.red }} />
                  {isPublished ? 'Published to catalog' : 'Ready to publish'}
                </p>
                <p className="text-[0.8rem]" style={{ color: C.text2 }}>
                  {isPublished
                    ? 'Other learners can find this course by creator name, playlist URL, or video title.'
                    : 'Publish to make this course searchable for all signed-in learners.'}
                </p>
                {publishError && (
                  <p className="mt-2 text-[0.78rem]" style={{ color: C.red }}>{publishError}</p>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {canPublish && !isPublished && (
                  <button
                    type="button"
                    onClick={handlePublish}
                    disabled={publishing}
                    className="px-5 py-2.5 rounded-lg text-[0.82rem] font-[600] cursor-pointer disabled:opacity-60"
                    style={{ background: C.red, color: '#fff', border: 'none' }}
                  >
                    {publishing ? 'Publishing…' : 'Publish course'}
                  </button>
                )}
                {isPublished && shareUrl && (
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[0.82rem] font-[600] cursor-pointer"
                    style={{ background: C.bg2, border: `1px solid ${C.border2}`, color: C.text2 }}
                  >
                    {copiedLink ? <CheckCircle2 className="w-4 h-4" style={{ color: '#22c55e' }} /> : <Copy className="w-4 h-4" />}
                    {copiedLink ? 'Copied' : 'Copy course link'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        <div style={{ height: 1, background: C.border, marginBottom: 40 }} />

        {/* Modules */}
        <div className="flex items-center justify-between mb-6">
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(1.4rem, 2.5vw, 1.8rem)', fontWeight: 400, color: C.text }}>
            Course Modules
          </h2>
          <button onClick={handleStartLearning}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-[0.875rem] font-[600] transition-all cursor-pointer"
            style={{ background: C.red, color: '#fff', border: 'none', boxShadow: '0 4px 16px rgba(225,6,0,0.3)' }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}>
            {startButtonLabel} <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          {modules.map((mod, modIdx) => {
            const isExpanded = expandedModules.has(mod.id);
            return (
              <div key={mod.id} className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${C.border}`, background: C.bg1 }}>
                <button onClick={() => toggleModule(mod.id)} className="w-full flex items-center justify-between px-5 py-4 text-left cursor-pointer"
                  style={{ background: 'transparent', border: 'none' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                  <div className="flex items-center gap-4">
                    <span className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-[0.82rem] font-[700]"
                      style={{ background: C.red, color: '#fff' }}>{modIdx + 1}</span>
                    <span className="text-[0.95rem] font-[600]" style={{ color: C.text }}>{mod.title}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[0.72rem] font-[500] px-3 py-1 rounded-full"
                      style={{ background: isDark ? 'rgba(225,6,0,0.12)' : 'rgba(225,6,0,0.08)', color: C.red, border: `1px solid ${isDark ? 'rgba(225,6,0,0.2)' : 'rgba(225,6,0,0.12)'}` }}>
                      {mod.lessons.length} Lessons
                    </span>
                    {isExpanded ? <ChevronDown className="w-4 h-4" style={{ color: C.text3 }} /> : <ChevronRight className="w-4 h-4" style={{ color: C.text3 }} />}
                  </div>
                </button>

                {isExpanded && (
                  <div style={{ borderTop: `1px solid ${C.border}` }}>
                    <div className="px-5 pt-5 pb-3">
                      <p className="text-[0.85rem] mb-5" style={{ color: C.text2, lineHeight: 1.7 }}>{mod.description}</p>
                      <p className="text-[0.72rem] font-[600] uppercase tracking-wider mb-3" style={{ color: C.text3, fontFamily: 'var(--mono)' }}>Lessons</p>
                      <div className="space-y-1 mb-5">
                        {mod.lessons.map((lesson, li) => (
                          <div key={lesson.id} className="flex items-center gap-3 py-2 px-3 rounded-lg"
                            style={{ background: isDark ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0.02)' }}>
                            <span className="text-[0.68rem] font-[600] w-5 text-center flex-shrink-0" style={{ color: C.text3, fontFamily: 'var(--mono)' }}>
                              {String(li + 1).padStart(2, '0')}
                            </span>
                            {lesson.type === 'video'
                              ? <PlayCircle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: C.text3 }} />
                              : <FileText className="w-3.5 h-3.5 flex-shrink-0" style={{ color: C.text3 }} />}
                            <span className="text-[0.82rem] flex-1" style={{ color: C.text2 }}>{lesson.title}</span>
                            <span className="text-[0.7rem]" style={{ color: C.text3 }}>{lesson.duration}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center gap-3 py-3 px-3 rounded-lg"
                        style={{ background: C.redDim, border: `1px solid ${isDark ? 'rgba(225,6,0,0.15)' : 'rgba(225,6,0,0.1)'}` }}>
                        <span className="text-sm flex-shrink-0">📝</span>
                        <div className="flex-1">
                          <span className="text-[0.82rem] font-[500]" style={{ color: C.red }}>Module Quiz</span>
                          <span className="text-[0.72rem] ml-2" style={{ color: isDark ? 'rgba(225,6,0,0.6)' : 'rgba(225,6,0,0.5)' }}>· {mod.quiz?.length ?? 0} questions</span>
                        </div>
                        <button onClick={handleStartLearning}
                          className="text-[0.72rem] font-[600] px-3 py-1.5 rounded-lg cursor-pointer"
                          style={{ background: C.red, color: '#fff', border: 'none' }}
                          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
                          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}>
                          Take Quiz →
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <button onClick={handleStartLearning}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-[0.9rem] font-[600] cursor-pointer transition-all"
            style={{ background: C.red, color: '#fff', border: 'none', boxShadow: '0 6px 24px rgba(225,6,0,0.3)' }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}>
            {startButtonLabel} <ArrowUpRight className="w-4 h-4" />
          </button>
          <p className="text-[0.78rem] mt-3" style={{ color: C.text3 }}>
            {totalLessons} video lessons · {course.modules.length} module quizzes · Certificate on completion
          </p>
        </div>
      </div>
      {showEducatorAssistant && resolvedCourseId && (
        <EducatorAssistantWidget
          key={chatSessionKey}
          courseId={resolvedCourseId}
          courseTitle={course.title}
          sessionKey={chatSessionKey}
          onPreviewChange={handleEducatorApplyUpdate}
          onApproveAndSave={handleEducatorApproveAndSave}
        />
      )}
      {showCourseChat && !showEducatorAssistant && resolvedCourseId && (
        <CourseChatWidget
          key={chatSessionKey}
          courseId={resolvedCourseId}
          courseTitle={course.title}
          signedIn={chatSignedIn}
          onSignInRequired={handleChatSignIn}
          sessionKey={chatSessionKey}
        />
      )}
      {showPreCheckout && profile && (
        <PreCheckoutProfileModal
          profile={profile}
          theme={C}
          onCancel={() => setShowPreCheckout(false)}
          onComplete={(updated) => {
            setProfile(updated);
            setShowPreCheckout(false);
            void proceedToCheckout().catch((checkoutErr) => {
              setError(getCheckoutError(checkoutErr));
            });
          }}
        />
      )}
    </div>
  );
}
