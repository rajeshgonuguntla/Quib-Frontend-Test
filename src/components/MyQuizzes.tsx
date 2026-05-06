import { useState } from 'react';
import { useNavigate } from 'react-router';
import { DarkLayout } from './DarkLayout';
import { BookOpen, Clock, TrendingUp, CheckCircle2, PlayCircle, BarChart2, Zap } from 'lucide-react';
import { YTThumbnail } from './YTThumbnail';
import { useTheme, getC } from './ThemeContext';

interface Course {
  id: string;
  title: string;
  channel: string;
  channelInitials: string;
  channelColor: string;
  category: string;
  categoryColor: string;
  videoId: string;
  status: 'completed' | 'in-progress' | 'not-started';
  progress: number;
  score: number | null;
  quizzes: number;
  duration: string;
  lastActivity: string;
}

const ALL_COURSES: Course[] = [
  {
    id: '1',
    title: 'Introduction to Machine Learning',
    channel: '3Blue1Brown',
    channelInitials: '3B',
    channelColor: '#4f8ef7',
    category: 'AI & ML',
    categoryColor: '#6366f1',
    videoId: 'aircAruvnKk',
    status: 'completed',
    progress: 100,
    score: 92,
    quizzes: 3,
    duration: '19 min',
    lastActivity: '2 days ago',
  },
  {
    id: '2',
    title: 'React Hooks Complete Guide',
    channel: 'Traversy Media',
    channelInitials: 'TM',
    channelColor: '#0ea5e9',
    category: 'Web Dev',
    categoryColor: '#06b6d4',
    videoId: 'LDB4uaJ87e0',
    status: 'in-progress',
    progress: 60,
    score: null,
    quizzes: 2,
    duration: '1h 48 min',
    lastActivity: '1 week ago',
  },
  {
    id: '3',
    title: 'Advanced TypeScript Patterns',
    channel: 'Fireship',
    channelInitials: 'FS',
    channelColor: '#ff6b35',
    category: 'Programming',
    categoryColor: '#22c55e',
    videoId: 'ysEN5RaKOlA',
    status: 'not-started',
    progress: 0,
    score: null,
    quizzes: 1,
    duration: '12 min',
    lastActivity: '2 weeks ago',
  },
  {
    id: '4',
    title: 'Python for Data Science',
    channel: 'freeCodeCamp',
    channelInitials: 'FC',
    channelColor: '#0a0a23',
    category: 'Programming',
    categoryColor: '#22c55e',
    videoId: 'rfscVS0vtbw',
    status: 'completed',
    progress: 100,
    score: 88,
    quizzes: 4,
    duration: '4h 26 min',
    lastActivity: '3 weeks ago',
  },
  {
    id: '5',
    title: "Math's Fundamental Flaw",
    channel: 'Veritasium',
    channelInitials: 'VR',
    channelColor: '#8b5cf6',
    category: 'Mathematics',
    categoryColor: '#3b82f6',
    videoId: 'HeQX2HjkcNo',
    status: 'in-progress',
    progress: 35,
    score: null,
    quizzes: 2,
    duration: '34 min',
    lastActivity: '1 month ago',
  },
  {
    id: '6',
    title: 'Linear Algebra – Lecture 1',
    channel: 'MIT OpenCourseWare',
    channelInitials: 'MIT',
    channelColor: '#a31f34',
    category: 'Mathematics',
    categoryColor: '#3b82f6',
    videoId: 'ZK3O402wf1c',
    status: 'completed',
    progress: 100,
    score: 95,
    quizzes: 3,
    duration: '39 min',
    lastActivity: '1 month ago',
  },
  {
    id: '7',
    title: 'Build GPT from Scratch',
    channel: 'Andrej Karpathy',
    channelInitials: 'AK',
    channelColor: '#7c3aed',
    category: 'AI & ML',
    categoryColor: '#6366f1',
    videoId: 'kCc8FmEb1nY',
    status: 'not-started',
    progress: 0,
    score: null,
    quizzes: 1,
    duration: '1h 56 min',
    lastActivity: '2 months ago',
  },
  {
    id: '8',
    title: 'How Does the Immune System Work?',
    channel: 'TED-Ed',
    channelInitials: 'TE',
    channelColor: '#e62b1e',
    category: 'Biology',
    categoryColor: '#10b981',
    videoId: 'PSZwnBNDNf0',
    status: 'completed',
    progress: 100,
    score: 90,
    quizzes: 2,
    duration: '5 min',
    lastActivity: '2 months ago',
  },
];

const STATUS_CONFIG = {
  completed:    { label: 'Completed',   bg: 'rgba(34,197,94,0.1)',  color: '#22c55e', border: 'rgba(34,197,94,0.25)' },
  'in-progress':{ label: 'In Progress', bg: 'rgba(249,115,22,0.1)', color: '#f97316', border: 'rgba(249,115,22,0.25)' },
  'not-started':{ label: 'Not Started', bg: 'rgba(100,116,139,0.1)',color: '#94a3b8', border: 'rgba(100,116,139,0.2)' },
};

export function MyQuizzes() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const C = getC(isDark);
  const [activeTab, setActiveTab] = useState<'all' | 'in-progress' | 'completed'>('all');

  const filtered = ALL_COURSES.filter(c => {
    if (activeTab === 'in-progress') return c.status === 'in-progress' || c.status === 'not-started';
    if (activeTab === 'completed') return c.status === 'completed';
    return true;
  });

  const stats = {
    total: ALL_COURSES.length,
    inProgress: ALL_COURSES.filter(c => c.status === 'in-progress').length,
    completed: ALL_COURSES.filter(c => c.status === 'completed').length,
    avgScore: Math.round(
      ALL_COURSES.filter(c => c.score).reduce((a, c) => a + (c.score ?? 0), 0) /
      ALL_COURSES.filter(c => c.score).length
    ),
  };

  const statCards = [
    { label: 'Total Courses', value: stats.total,      icon: BookOpen,      color: C.red },
    { label: 'In Progress',   value: stats.inProgress, icon: PlayCircle,    color: '#f97316' },
    { label: 'Completed',     value: stats.completed,  icon: CheckCircle2,  color: '#22c55e' },
    { label: 'Avg Score',     value: `${stats.avgScore}%`, icon: BarChart2, color: '#3b82f6' },
  ];

  const tabs = [
    { key: 'all' as const,         label: 'All Courses', count: ALL_COURSES.length },
    { key: 'in-progress' as const, label: 'In Progress', count: stats.inProgress },
    { key: 'completed' as const,   label: 'Completed',   count: stats.completed },
  ];

  return (
    <DarkLayout activeNav="my-quizzes" showSearch={false} sectionLabel="LEARNING" title="My Courses" subtitle="Track your progress across all enrolled courses">

      {/* Stats */}
      <div className="dash-fade-up grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statCards.map(s => (
          <div
            key={s.label}
            className="rounded-xl p-5 relative overflow-hidden transition-all duration-300"
            style={{ background: C.bg1, border: `1px solid ${C.border}` }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = C.border2; e.currentTarget.style.boxShadow = isDark ? '0 8px 24px rgba(0,0,0,0.2)' : '0 8px 24px rgba(0,0,0,0.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = C.border; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <div className="absolute top-0 left-0 right-0" style={{ height: 1, background: `linear-gradient(90deg, transparent, ${s.color}50, transparent)` }} />
            <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ background: `${s.color}15` }}>
              <s.icon className="w-4.5 h-4.5" style={{ color: s.color, width: 18, height: 18 }} />
            </div>
            <div className="text-2xl font-[700] mb-0.5" style={{ color: C.text, fontFamily: 'var(--mono)', letterSpacing: '-0.02em' }}>{s.value}</div>
            <div className="text-[0.65rem] font-[500] uppercase tracking-widest" style={{ color: C.text3, fontFamily: 'var(--mono)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs + CTA */}
      <div className="dash-fade-up flex flex-wrap items-end justify-between gap-4 mb-6" style={{ animationDelay: '0.05s' }}>
        <div className="flex" style={{ borderBottom: `1px solid ${C.border}` }}>
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="px-1 pb-3 mr-6 text-sm font-[500] transition-all duration-200 relative"
              style={{ background: 'transparent', color: activeTab === tab.key ? C.text : C.text3, border: 'none' }}
            >
              {tab.label}
              <span className="ml-1.5" style={{ fontFamily: 'var(--mono)', fontSize: '0.7rem', color: activeTab === tab.key ? C.red : C.text3 }}>
                {tab.count}
              </span>
              {activeTab === tab.key && (
                <span className="absolute bottom-0 left-0 right-0" style={{ height: 2, background: C.red, borderRadius: 1 }} />
              )}
            </button>
          ))}
        </div>
        <button
          onClick={() => navigate('/home')}
          className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-[600] text-white transition-all duration-200"
          style={{ background: C.red, boxShadow: '0 4px 14px rgba(225,6,0,0.25)' }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          <Zap className="w-4 h-4" />
          Browse Courses
        </button>
      </div>

      {/* Course Grid */}
      <div className="dash-fade-up grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5" style={{ animationDelay: '0.1s' }}>
        {filtered.length === 0 ? (
          <div
            className="col-span-3 rounded-xl p-12 text-center"
            style={{ background: C.bg1, border: `1px solid ${C.border}` }}
          >
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: C.bg2 }}>
              <BookOpen className="w-7 h-7" style={{ color: C.text3 }} />
            </div>
            <h3 className="text-base font-[600] mb-2" style={{ color: C.text }}>No courses found</h3>
            <p className="text-sm mb-6" style={{ color: C.text2 }}>Head to the home feed to discover and enrol in courses.</p>
            <button
              onClick={() => navigate('/home')}
              className="px-5 py-2 rounded-lg text-sm font-[600] text-white"
              style={{ background: C.red }}
            >
              Browse Courses
            </button>
          </div>
        ) : (
          filtered.map(course => {
            const st = STATUS_CONFIG[course.status];
            return (
              <div
                key={course.id}
                className="rounded-xl overflow-hidden flex flex-col transition-all duration-250 group"
                style={{ background: C.bg1, border: `1px solid ${C.border}` }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = C.border2; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = isDark ? '0 8px 28px rgba(0,0,0,0.2)' : '0 8px 28px rgba(0,0,0,0.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                {/* Thumbnail */}
                <div className="relative overflow-hidden" style={{ aspectRatio: '16/9', background: C.bg2 }}>
                  <YTThumbnail videoId={course.videoId} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  {/* Category badge */}
                  <div
                    className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[0.65rem] font-[700]"
                    style={{ background: `${course.categoryColor}cc`, color: '#fff', backdropFilter: 'blur(4px)' }}
                  >
                    {course.category}
                  </div>
                  {/* Status badge */}
                  <div
                    className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[0.65rem] font-[700]"
                    style={{ background: st.bg, color: st.color, border: `1px solid ${st.border}`, backdropFilter: 'blur(8px)' }}
                  >
                    {st.label}
                  </div>
                  {/* Progress bar overlay at bottom of thumbnail */}
                  {course.progress > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: 'rgba(0,0,0,0.3)' }}>
                      <div
                        className="h-full transition-all"
                        style={{ width: `${course.progress}%`, background: course.status === 'completed' ? '#22c55e' : C.red }}
                      />
                    </div>
                  )}
                </div>

                {/* Card body */}
                <div className="flex flex-col flex-1 p-4">
                  {/* Channel */}
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[0.5rem] font-[700] text-white flex-shrink-0"
                      style={{ background: course.channelColor }}
                    >
                      {course.channelInitials[0]}
                    </div>
                    <span className="text-[0.72rem] font-[500] truncate" style={{ color: C.text3 }}>{course.channel}</span>
                  </div>

                  {/* Title */}
                  <h3 className="text-[0.9rem] font-[600] leading-snug mb-3 flex-1" style={{ color: C.text }}>{course.title}</h3>

                  {/* Meta row */}
                  <div className="flex items-center gap-3 mb-3 text-[0.72rem]" style={{ color: C.text3 }}>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {course.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      {course.quizzes} {course.quizzes === 1 ? 'lesson' : 'lessons'}
                    </span>
                    {course.score && (
                      <span className="flex items-center gap-1 ml-auto font-[600]" style={{ color: '#22c55e' }}>
                        <TrendingUp className="w-3 h-3" />
                        {course.score}%
                      </span>
                    )}
                  </div>

                  {/* Progress bar (for in-progress) */}
                  {course.status === 'in-progress' && (
                    <div className="mb-3">
                      <div className="flex justify-between text-[0.65rem] mb-1" style={{ color: C.text3 }}>
                        <span>Progress</span>
                        <span>{course.progress}%</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: C.bg3 }}>
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${course.progress}%`, background: `linear-gradient(90deg, ${C.red}, #ff6666)` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-3" style={{ borderTop: `1px solid ${C.border}` }}>
                    {course.status === 'completed' ? (
                      <>
                        <button
                          onClick={() => navigate(`/results/${course.id}`)}
                          className="flex-1 py-1.5 rounded-lg text-xs font-[600] text-white transition-all duration-200"
                          style={{ background: C.red, boxShadow: '0 2px 8px rgba(225,6,0,0.2)' }}
                          onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                        >
                          View Results
                        </button>
                        <button
                          onClick={() => navigate(`/quiz-setup/new`, { state: { youtubeUrl: `https://www.youtube.com/watch?v=${course.videoId}` } })}
                          className="px-3 py-1.5 rounded-lg text-xs font-[500] transition-all duration-200"
                          style={{ color: C.text2, border: `1px solid ${C.border}` }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = C.border2; e.currentTarget.style.color = C.text; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.text2; }}
                        >
                          Retake
                        </button>
                      </>
                    ) : course.status === 'in-progress' ? (
                      <>
                        <button
                          onClick={() => navigate(`/quiz/${course.id}`)}
                          className="flex-1 py-1.5 rounded-lg text-xs font-[600] text-white transition-all duration-200"
                          style={{ background: C.red, boxShadow: '0 2px 8px rgba(225,6,0,0.2)' }}
                          onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                        >
                          Continue
                        </button>
                        <span className="text-[0.68rem]" style={{ color: C.text3 }}>
                          <Clock className="w-3 h-3 inline mr-1" />
                          {course.lastActivity}
                        </span>
                      </>
                    ) : (
                      <button
                        onClick={() => navigate(`/quiz/${course.id}`)}
                        className="flex-1 py-1.5 rounded-lg text-xs font-[600] text-white transition-all duration-200"
                        style={{ background: C.red, boxShadow: '0 2px 8px rgba(225,6,0,0.2)' }}
                        onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                      >
                        Start Course
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </DarkLayout>
  );
}
