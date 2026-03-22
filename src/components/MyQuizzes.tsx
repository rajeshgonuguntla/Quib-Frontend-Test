import { useState } from 'react';
import { useNavigate } from 'react-router';
import { DarkLayout } from './DarkLayout';
import { FileText, Play, Clock, TrendingUp, Calendar, CheckCircle2, AlertCircle, Zap } from 'lucide-react';
import { useTheme, getC } from './ThemeContext';

export function MyQuizzes() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const C = getC(isDark);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed'>('all');

  const allQuizzes = [
    { id: '1', title: 'Introduction to Machine Learning', status: 'completed', score: 92, date: '2 days ago', duration: '45 min', questions: 20, progress: undefined as number | undefined },
    { id: '2', title: 'React Hooks Complete Guide', status: 'in-progress', score: null, date: '1 week ago', duration: '30 min', questions: 15, progress: 60 },
    { id: '3', title: 'Advanced TypeScript Patterns', status: 'generated', score: null, date: '2 weeks ago', duration: '25 min', questions: 10, progress: undefined },
    { id: '4', title: 'Python for Data Science', status: 'completed', score: 88, date: '3 weeks ago', duration: '50 min', questions: 25, progress: undefined },
    { id: '5', title: 'Node.js Backend Development', status: 'in-progress', score: null, date: '1 month ago', duration: '40 min', questions: 20, progress: 35 },
    { id: '6', title: 'CSS Grid and Flexbox Mastery', status: 'completed', score: 95, date: '1 month ago', duration: '35 min', questions: 18, progress: undefined },
    { id: '7', title: 'JavaScript ES6+ Features', status: 'completed', score: 90, date: '2 months ago', duration: '30 min', questions: 15, progress: undefined },
    { id: '8', title: 'Docker Container Fundamentals', status: 'generated', score: null, date: '2 months ago', duration: '45 min', questions: 22, progress: undefined },
  ];

  const filteredQuizzes = allQuizzes.filter((quiz) => {
    if (activeTab === 'active') return quiz.status === 'in-progress' || quiz.status === 'generated';
    if (activeTab === 'completed') return quiz.status === 'completed';
    return true;
  });

  const stats = {
    total: allQuizzes.length,
    active: allQuizzes.filter((q) => q.status === 'in-progress' || q.status === 'generated').length,
    completed: allQuizzes.filter((q) => q.status === 'completed').length,
  };

  const statCards = [
    { label: 'Total Quizzes', value: stats.total, icon: FileText, color: C.red },
    { label: 'Active Quizzes', value: stats.active, icon: AlertCircle, color: '#f97316' },
    { label: 'Completed', value: stats.completed, icon: CheckCircle2, color: '#22c55e' },
  ];

  const tabs = [
    { key: 'all' as const, label: 'All Quizzes', count: allQuizzes.length },
    { key: 'active' as const, label: 'Active', count: stats.active },
    { key: 'completed' as const, label: 'Completed', count: stats.completed },
  ];

  return (
    <DarkLayout activeNav="my-quizzes" showSearch={false} sectionLabel="LIBRARY" title="My Quizzes" subtitle="Manage and track all your quizzes in one place">
      {/* Stats Cards */}
      <div className="dash-fade-up grid grid-cols-3 gap-4 mb-8">
        {statCards.map((s) => (
          <div
            key={s.label}
            className="rounded-xl p-5 relative overflow-hidden transition-all duration-300 cursor-default"
            style={{
              background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
              border: `1px solid ${C.border}`,
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = isDark ? '0 8px 24px rgba(0,0,0,0.2)' : '0 8px 24px rgba(0,0,0,0.08)';
              e.currentTarget.style.borderColor = C.border2;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.borderColor = C.border;
            }}
          >
            {/* Accent line at top */}
            <div
              className="absolute top-0 left-0 right-0"
              style={{
                height: 1,
                background: `linear-gradient(90deg, transparent, ${s.color}40, transparent)`,
              }}
            />
            <div className="mb-4">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: `${s.color}15`, boxShadow: `0 0 12px ${s.color}15` }}
              >
                <s.icon className="w-5 h-5" style={{ color: s.color }} />
              </div>
            </div>
            <div
              className="text-2xl font-[700] mb-0.5"
              style={{ color: C.text, fontFamily: "var(--mono)", letterSpacing: '-0.02em' }}
            >
              {s.value}
            </div>
            <div
              style={{
                color: C.text2,
                fontFamily: "var(--mono)",
                fontSize: '0.65rem',
                letterSpacing: '0.06em',
                textTransform: 'uppercase' as const,
                fontWeight: 400,
              }}
            >
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Tabs + New Quiz */}
      <div className="dash-fade-up flex flex-wrap items-end justify-between gap-4 mb-6" style={{ animationDelay: '0.05s' }}>
        <div className="flex" style={{ borderBottom: `1px solid ${C.border}` }}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="px-1 pb-3 mr-6 text-sm font-[500] transition-all duration-200 relative"
              style={{
                background: 'transparent',
                color: activeTab === tab.key ? C.text : C.text3,
                border: 'none',
              }}
            >
              {tab.label}
              <span
                className="ml-1.5"
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: '0.7rem',
                  color: activeTab === tab.key ? C.red : C.text3,
                }}
              >
                {tab.count}
              </span>
              {/* Active indicator */}
              {activeTab === tab.key && (
                <span
                  className="absolute bottom-0 left-0 right-0"
                  style={{ height: 2, background: C.red, borderRadius: 1 }}
                />
              )}
            </button>
          ))}
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-[600] text-white transition-all duration-200 hover:opacity-90"
          style={{ background: C.red, boxShadow: '0 4px 14px rgba(225,6,0,0.25)' }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          <Zap className="w-4 h-4" />
          New Quiz
        </button>
      </div>

      {/* Quiz List */}
      <div className="dash-fade-up space-y-3" style={{ animationDelay: '0.1s' }}>
        {filteredQuizzes.length === 0 ? (
          <div
            className="rounded-xl p-12 text-center relative overflow-hidden"
            style={{ background: C.bg1, border: `1px solid ${C.border}` }}
          >
            {/* Radial glow behind icon */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              style={{
                width: 200,
                height: 200,
                background: 'radial-gradient(circle, rgba(225,6,0,0.04) 0%, transparent 70%)',
              }}
            />
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 relative z-10"
              style={{ background: C.bg2 }}
            >
              <FileText className="w-7 h-7" style={{ color: C.text3 }} />
            </div>
            <h3 className="text-base font-[600] mb-2 relative z-10" style={{ color: C.text }}>No quizzes found</h3>
            <p className="text-sm mb-6 relative z-10" style={{ color: C.text2 }}>
              {activeTab === 'active' && "You don't have any active quizzes."}
              {activeTab === 'completed' && "You haven't completed any quizzes yet."}
              {activeTab === 'all' && 'Start by creating your first quiz.'}
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-5 py-2 rounded-lg text-sm font-[600] text-white relative z-10"
              style={{ background: C.red, boxShadow: '0 4px 14px rgba(225,6,0,0.25)' }}
            >
              Create Quiz
            </button>
          </div>
        ) : (
          filteredQuizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="rounded-xl p-5 flex items-center gap-5 transition-all duration-250"
              style={{ background: C.bg1, border: `1px solid ${C.border}` }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = C.border2;
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = isDark ? '0 4px 16px rgba(0,0,0,0.15)' : '0 4px 16px rgba(0,0,0,0.06)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = C.border;
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div
                className="w-24 h-16 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: `linear-gradient(135deg, ${C.bg2}, ${C.bg3})` }}
              >
                <Play className="w-6 h-6" style={{ color: C.text3 }} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 mb-1.5">
                  <h3 className="text-sm font-[600] truncate" style={{ color: C.text }}>{quiz.title}</h3>
                  <span
                    className="text-[0.68rem] font-[600] px-2.5 py-0.5 rounded-full flex-shrink-0"
                    style={{
                      fontFamily: "var(--mono)",
                      letterSpacing: '0.06em',
                      background:
                        quiz.status === 'completed' ? 'rgba(34,197,94,0.1)' :
                        quiz.status === 'in-progress' ? 'rgba(249,115,22,0.1)' : C.redDim,
                      color:
                        quiz.status === 'completed' ? '#22c55e' :
                        quiz.status === 'in-progress' ? '#f97316' : C.red,
                      border: `1px solid ${
                        quiz.status === 'completed' ? 'rgba(34,197,94,0.2)' :
                        quiz.status === 'in-progress' ? 'rgba(249,115,22,0.2)' : 'rgba(225,6,0,0.2)'
                      }`,
                    }}
                  >
                    {quiz.status === 'completed' ? 'COMPLETED' :
                     quiz.status === 'in-progress' ? 'IN PROGRESS' : 'NOT STARTED'}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs mb-3" style={{ color: C.text3 }}>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {quiz.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {quiz.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" />
                    {quiz.questions} questions
                  </span>
                  {quiz.score && (
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" />
                      Score: {quiz.score}%
                    </span>
                  )}
                </div>

                {/* Progress bar */}
                {quiz.status === 'in-progress' && quiz.progress && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-[0.65rem] mb-1" style={{ color: C.text3 }}>
                      <span>Progress</span>
                      <span>{quiz.progress}%</span>
                    </div>
                    <div className="h-1 rounded-full overflow-hidden" style={{ background: C.bg }}>
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${quiz.progress}%`,
                          background: `linear-gradient(90deg, ${C.red}, #ff6666)`,
                        }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  {quiz.status === 'completed' ? (
                    <>
                      <button
                        onClick={() => navigate(`/results/${quiz.id}`)}
                        className="px-3 py-1.5 rounded-md text-xs font-[600] text-white transition-all duration-200 hover:opacity-90"
                        style={{ background: C.red, boxShadow: '0 2px 8px rgba(225,6,0,0.2)' }}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
                      >
                        View Results
                      </button>
                    </>
                  ) : quiz.status === 'in-progress' ? (
                    <>
                      <button
                        onClick={() => navigate(`/quiz/${quiz.id}`)}
                        className="px-3 py-1.5 rounded-md text-xs font-[600] text-white transition-all duration-200 hover:opacity-90"
                        style={{ background: C.red, boxShadow: '0 2px 8px rgba(225,6,0,0.2)' }}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
                      >
                        Resume Quiz
                      </button>
                      <button
                        className="px-3 py-1.5 rounded-md text-xs font-[500] transition-all duration-200 hover:opacity-80"
                        style={{ color: C.text2, border: `1px solid ${C.border}` }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.border2; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; }}
                      >
                        Restart
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => navigate(`/quiz/${quiz.id}`)}
                        className="px-3 py-1.5 rounded-md text-xs font-[600] text-white transition-all duration-200 hover:opacity-90"
                        style={{ background: C.red, boxShadow: '0 2px 8px rgba(225,6,0,0.2)' }}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
                      >
                        Start Quiz
                      </button>
                      <button
                        className="px-3 py-1.5 rounded-md text-xs font-[500] transition-all duration-200 hover:opacity-80"
                        style={{ color: C.text2, border: `1px solid ${C.border}` }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.border2; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; }}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </DarkLayout>
  );
}
