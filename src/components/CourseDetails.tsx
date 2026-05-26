import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useParams } from 'react-router';
import axios from 'axios';
import {
  Sun, Moon, ChevronDown, ChevronRight,
  PlayCircle, FileText, CheckCircle,
  ArrowLeft, ArrowUpRight, BookOpen, Calendar, Layers, AlertCircle,
} from 'lucide-react';
import { useTheme, getC } from './ThemeContext';

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
  videoTitle?: string;
  channelName?: string;
  videoLength?: string;
}

// ─── Learning Mode ─────────────────────────────────────────────────────────────

function LearningMode({ course, youtubeUrl, onBack }: { course: Course; youtubeUrl: string; onBack: () => void }) {
  const { isDark, toggleTheme } = useTheme();
  const C = getC(isDark);

  const allLessons = course.modules.flatMap((m) =>
    m.lessons.map((l) => ({ ...l, moduleId: m.id, moduleTitle: m.title }))
  );

  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set([course.modules[0]?.id]));
  const [activeLessonId, setActiveLessonId] = useState<string>(allLessons[0]?.id ?? '');
  const [activeQuizModuleId, setActiveQuizModuleId] = useState<string | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const activeLesson = allLessons.find((l) => l.id === activeLessonId);
  const activeQuizModule = course.modules.find((m) => m.id === activeQuizModuleId);
  const navBg = isDark ? 'rgba(6,6,8,0.92)' : 'rgba(255,255,255,0.92)';

  const getYoutubeEmbedId = (url: string) => {
    const matchWatch = url.match(/[?&]v=([^&]+)/);
    const matchShort = url.match(/youtu\.be\/([^?&]+)/);
    return matchWatch?.[1] ?? matchShort?.[1] ?? '';
  };

  const toggleModule = (id: string) => setExpandedModules((prev) => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const openLesson = (id: string) => {
    setActiveLessonId(id);
    setActiveQuizModuleId(null);
    setQuizAnswers({});
    setQuizSubmitted(false);
  };

  const openQuiz = (moduleId: string) => {
    setActiveQuizModuleId(moduleId);
    setActiveLessonId('');
    setQuizAnswers({});
    setQuizSubmitted(false);
  };

  const markComplete = () => {
    setCompletedLessons((prev) => new Set([...prev, activeLessonId]));
    const idx = allLessons.findIndex((l) => l.id === activeLessonId);
    if (idx < allLessons.length - 1) setActiveLessonId(allLessons[idx + 1].id);
  };

  const quizScore = activeQuizModule
    ? activeQuizModule.quiz.filter((q, i) => quizAnswers[i] === q.answer).length
    : 0;
  const completedCount = completedLessons.size;
  const totalLessons = allLessons.length;
  const progressPct = Math.round((completedCount / totalLessons) * 100);
  const embedId = getYoutubeEmbedId(youtubeUrl);

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: 'var(--display)' }}>
      <nav className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-5 md:px-8"
        style={{ height: 56, background: navBg, backdropFilter: 'blur(20px)', borderBottom: `1px solid ${C.border}` }}>
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="flex items-center gap-1.5 cursor-pointer" style={{ background: 'none', border: 'none', color: C.text2, padding: 0 }}>
            <ArrowLeft className="w-4 h-4" />
            <span className="text-[0.82rem]">Course Overview</span>
          </button>
          <div style={{ width: 1, height: 16, background: C.border }} />
          <Link to="/" className="no-underline font-[700] tracking-tight text-[1rem]" style={{ color: C.text }}>Quib</Link>
        </div>
        <div className="hidden md:flex flex-col items-center gap-1">
          <span className="text-[0.78rem] font-[500] truncate max-w-xs" style={{ color: C.text }}>{course.title}</span>
          <div className="flex items-center gap-2">
            <div className="w-28 h-1 rounded-full overflow-hidden" style={{ background: C.bg2 }}>
              <div className="h-full rounded-full" style={{ width: `${progressPct}%`, background: C.red }} />
            </div>
            <span className="text-[0.68rem]" style={{ color: C.text3 }}>{completedCount}/{totalLessons}</span>
          </div>
        </div>
        <button onClick={toggleTheme} className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', border: `1px solid ${C.border}`, color: C.text2, cursor: 'pointer' }}>
          {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
        </button>
      </nav>

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
                      <button onClick={() => openQuiz(mod.id)} className="w-full flex items-center gap-3 px-4 py-2.5 text-left"
                        style={{ background: activeQuizModuleId === mod.id ? isDark ? 'rgba(225,6,0,0.08)' : 'rgba(225,6,0,0.05)' : 'transparent', border: 'none', borderLeft: activeQuizModuleId === mod.id ? `2px solid ${C.red}` : '2px solid transparent', cursor: 'pointer' }}
                        onMouseEnter={(e) => { if (activeQuizModuleId !== mod.id) e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'; }}
                        onMouseLeave={(e) => { if (activeQuizModuleId !== mod.id) e.currentTarget.style.background = 'transparent'; }}>
                        <span className="text-sm flex-shrink-0">📝</span>
                        <div className="min-w-0 flex-1">
                          <p className="text-[0.78rem] font-[500]" style={{ color: activeQuizModuleId === mod.id ? C.red : C.text2 }}>Module Quiz</p>
                          <p className="text-[0.66rem] mt-0.5" style={{ color: C.text3 }}>{mod.quiz.length} questions</p>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0">
          {activeLesson && !activeQuizModuleId && (
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
              {activeLesson.type === 'video' && embedId && (
                <div className="w-full rounded-2xl overflow-hidden mb-8"
                  style={{ border: `1px solid ${C.border}`, aspectRatio: '16/9', background: C.bg2 }}>
                  <iframe src={`https://www.youtube.com/embed/${embedId}`} title={activeLesson.title}
                    className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen style={{ border: 'none' }} />
                </div>
              )}
              <div className="rounded-2xl p-6 mb-8" style={{ background: C.bg1, border: `1px solid ${C.border}` }}>
                <p className="text-[0.875rem] leading-relaxed" style={{ color: C.text2, lineHeight: 1.8 }}>
                  This lesson covers <strong style={{ color: C.text }}>{activeLesson.title}</strong> as part of the module on <em>{allLessons.find((l) => l.id === activeLessonId)?.moduleTitle}</em>. Follow along with the {activeLesson.type === 'video' ? 'video' : 'reading material'} and take note of the key concepts presented.
                </p>
              </div>
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
                        const correct = quizSubmitted && oi === q.answer;
                        const wrong = quizSubmitted && selected && oi !== q.answer;
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
                <button onClick={() => setQuizSubmitted(true)}
                  disabled={Object.keys(quizAnswers).length < activeQuizModule.quiz.length}
                  className="px-8 py-3 rounded-lg text-[0.875rem] font-[600] cursor-pointer transition-all"
                  style={{ background: Object.keys(quizAnswers).length === activeQuizModule.quiz.length ? C.red : C.bg2, color: Object.keys(quizAnswers).length === activeQuizModule.quiz.length ? '#fff' : C.text3, border: 'none', boxShadow: Object.keys(quizAnswers).length === activeQuizModule.quiz.length ? '0 4px 16px rgba(225,6,0,0.25)' : 'none' }}>
                  Submit Quiz
                </button>
              ) : (
                <div className="rounded-2xl p-6" style={{ background: quizScore >= 2 ? 'rgba(34,197,94,0.08)' : 'rgba(225,6,0,0.06)', border: `1px solid ${quizScore >= 2 ? 'rgba(34,197,94,0.25)' : 'rgba(225,6,0,0.2)'}` }}>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: quizScore >= 2 ? 'rgba(34,197,94,0.15)' : C.redDim, border: `1px solid ${quizScore >= 2 ? 'rgba(34,197,94,0.3)' : 'rgba(225,6,0,0.2)'}` }}>
                      <span style={{ fontFamily: 'var(--serif)', fontSize: '1.1rem', color: quizScore >= 2 ? '#22c55e' : C.red }}>{quizScore}/{activeQuizModule.quiz.length}</span>
                    </div>
                    <div>
                      <p className="font-[600] text-[0.95rem]" style={{ color: C.text }}>{quizScore >= 2 ? 'Great work!' : 'Keep going'}</p>
                      <p className="text-[0.8rem] mt-0.5" style={{ color: C.text2 }}>
                        {quizScore >= 2 ? 'You passed this module. Move on to the next one.' : `You got ${quizScore} of ${activeQuizModule.quiz.length} correct. Review the topics and try again.`}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
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

  const youtubeUrl: string = location.state?.youtubeUrl ?? sessionStorage.getItem('courseYoutubeUrl') ?? '';
  const courseId: string | undefined = courseIdParam ?? location.state?.courseId;

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [learningMode, setLearningMode] = useState(false);

  const navBg = isDark ? 'rgba(6,6,8,0.92)' : 'rgba(255,255,255,0.92)';

  const steps = [
    { label: 'Fetching transcript', done: progress >= 33 },
    { label: 'Analysing content', done: progress >= 66 },
    { label: 'Generating course structure', done: progress >= 100 },
  ];

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
    const interval = setInterval(() => setProgress((p) => (p >= 90 ? 90 : p + 10)), 400);

    const loadCourse = async () => {
      if (!courseId && !youtubeUrl) {
        setError('No course specified. Please go back and generate a course.');
        setLoading(false);
        clearInterval(interval);
        return;
      }
      try {
        const res = courseId
          ? await axios.get(`/api/course/${courseId}`)
          : await axios.post('/api/course/generate', { youtubeUrl });
        if (!mounted) return;
        const data: Course = res.data;
        setCourse(data);
        setExpandedModules(new Set([data.modules[0]?.id]));
        if (res.data.playlistUrl) {
          sessionStorage.setItem('courseYoutubeUrl', res.data.playlistUrl);
        }
        setProgress(100);
        setLoading(false);
      } catch {
        if (!mounted) return;
        setCourse(MOCK_COURSE);
        setExpandedModules(new Set([MOCK_COURSE.modules[0].id]));
        setProgress(100);
        setLoading(false);
      } finally {
        clearInterval(interval);
      }
    };

    loadCourse();
    return () => { mounted = false; clearInterval(interval); };
  }, [courseId, youtubeUrl]);

  const toggleModule = (id: string) => setExpandedModules((prev) => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  // ── Loading ──
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: 'var(--display)', display: 'flex', flexDirection: 'column' }}>
        <nav className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-5 md:px-8"
          style={{ height: 56, background: navBg, backdropFilter: 'blur(20px)', borderBottom: `1px solid ${C.border}` }}>
          <Link to="/" className="no-underline font-[700] tracking-tight text-[1rem]" style={{ color: C.text }}>Quib</Link>
          <button onClick={toggleTheme} className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', border: `1px solid ${C.border}`, color: C.text2, cursor: 'pointer' }}>
            {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
        </nav>
        <div className="flex-1 flex flex-col items-center justify-center px-6" style={{ paddingTop: 56 }}>
          <div className="w-full max-w-md space-y-6">
            <div className="text-center mb-8">
              <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.6rem', fontWeight: 400, color: C.text, marginBottom: 8 }}>Building Your Course</h2>
              <p className="text-[0.85rem]" style={{ color: C.text2 }}>This usually takes 20–40 seconds</p>
            </div>
            <div className="rounded-xl p-6" style={{ background: C.bg1, border: `1px solid ${C.border}` }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-[500]" style={{ color: C.text2 }}>Generating course…</span>
                <span className="text-sm font-[600] tabular-nums" style={{ color: C.text }}>{progress}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: C.bg2 }}>
                <div className="h-full rounded-full transition-all duration-300" style={{ width: `${progress}%`, background: C.red }} />
              </div>
            </div>
            <div className="space-y-3">
              {steps.map((step, idx) => (
                <div key={idx} className="flex items-center gap-3 p-4 rounded-xl"
                  style={{ background: C.bg1, border: `1px solid ${C.border}` }}>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300"
                    style={{ background: step.done ? 'rgba(34,197,94,0.15)' : C.bg2, border: `1px solid ${step.done ? 'rgba(34,197,94,0.4)' : C.border}` }}>
                    {step.done
                      ? <CheckCircle className="w-3.5 h-3.5" style={{ color: '#22c55e' }} />
                      : <div className="w-2 h-2 rounded-full" style={{ background: C.text3 }} />}
                  </div>
                  <span className="text-sm" style={{ color: step.done ? C.text : C.text3 }}>{step.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Error ──
  if (error || !course) {
    return (
      <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: 'var(--display)', display: 'flex', flexDirection: 'column' }}>
        <nav className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-5 md:px-8"
          style={{ height: 56, background: navBg, backdropFilter: 'blur(20px)', borderBottom: `1px solid ${C.border}` }}>
          <Link to="/" className="no-underline font-[700] tracking-tight text-[1rem]" style={{ color: C.text }}>Quib</Link>
        </nav>
        <div className="flex-1 flex items-center justify-center px-6" style={{ paddingTop: 56 }}>
          <div className="w-full max-w-md rounded-xl p-6" style={{ background: C.bg1, border: '1px solid rgba(225,6,0,0.3)' }}>
            <div className="flex items-start gap-3 mb-5">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: C.red }} />
              <p className="text-sm leading-relaxed" style={{ color: C.text2 }}>{error ?? 'Something went wrong.'}</p>
            </div>
            <button onClick={() => navigate('/educator-course-builder')} className="px-5 py-2.5 rounded-lg text-sm font-[500] cursor-pointer"
              style={{ background: C.bg2, border: `1px solid ${C.border2}`, color: C.text2 }}>
              ← Try another URL
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Learning Mode ──
  if (learningMode) {
    return <LearningMode course={course} youtubeUrl={youtubeUrl} onBack={() => setLearningMode(false)} />;
  }

  const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);

  // ── Course Overview ──
  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: 'var(--display)' }}>
      <nav className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-5 md:px-10"
        style={{ height: 56, background: navBg, backdropFilter: 'blur(20px)', borderBottom: `1px solid ${C.border}` }}>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/educator-course-builder')} className="flex items-center gap-1.5 cursor-pointer"
            style={{ background: 'none', border: 'none', color: C.text2, padding: 0 }}>
            <ArrowLeft className="w-4 h-4" />
            <span className="text-[0.82rem]">Back</span>
          </button>
          <div style={{ width: 1, height: 16, background: C.border }} />
          <Link to="/" className="no-underline font-[700] tracking-tight text-[1rem]" style={{ color: C.text }}>Quib</Link>
        </div>
        <ul className="hidden md:flex gap-7 list-none absolute left-1/2 -translate-x-1/2">
          {[{ label: 'Platform', href: '/' }, { label: 'For Educators', href: '/educators' }].map((l) => (
            <li key={l.label}>
              <Link to={l.href} className="text-[0.875rem] font-[400] no-underline transition-opacity hover:opacity-100"
                style={{ color: C.text2, letterSpacing: '0.01em', opacity: 0.8 }}>{l.label}</Link>
            </li>
          ))}
        </ul>
        <button onClick={toggleTheme} className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', border: `1px solid ${C.border}`, color: C.text2, cursor: 'pointer' }}>
          {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
        </button>
      </nav>

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
            ].map((b) => (
              <div key={b.label} className="flex items-center gap-2 px-4 py-2 rounded-lg text-[0.78rem] font-[500]"
                style={{ background: C.redDim, border: `1px solid ${isDark ? 'rgba(225,6,0,0.2)' : 'rgba(225,6,0,0.12)'}`, color: C.red }}>
                {b.icon}{b.label}
              </div>
            ))}
          </div>
        </div>

        <div style={{ height: 1, background: C.border, marginBottom: 40 }} />

        {/* Modules */}
        <div className="flex items-center justify-between mb-6">
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(1.4rem, 2.5vw, 1.8rem)', fontWeight: 400, color: C.text }}>
            Course Modules
          </h2>
          <button onClick={() => setLearningMode(true)}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-[0.875rem] font-[600] transition-all cursor-pointer"
            style={{ background: C.red, color: '#fff', border: 'none', boxShadow: '0 4px 16px rgba(225,6,0,0.3)' }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}>
            Start Learning <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          {course.modules.map((mod, modIdx) => {
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
                          <span className="text-[0.72rem] ml-2" style={{ color: isDark ? 'rgba(225,6,0,0.6)' : 'rgba(225,6,0,0.5)' }}>· {mod.quiz.length} questions</span>
                        </div>
                        <button onClick={() => setLearningMode(true)}
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
          <button onClick={() => setLearningMode(true)}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-[0.9rem] font-[600] cursor-pointer transition-all"
            style={{ background: C.red, color: '#fff', border: 'none', boxShadow: '0 6px 24px rgba(225,6,0,0.3)' }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}>
            Start Learning <ArrowUpRight className="w-4 h-4" />
          </button>
          <p className="text-[0.78rem] mt-3" style={{ color: C.text3 }}>
            {totalLessons} lessons · {course.modules.length} module quizzes · Certificate on completion
          </p>
        </div>
      </div>
    </div>
  );
}
