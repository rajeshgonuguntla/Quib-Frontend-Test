import { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router';
import { DarkLayout } from './DarkLayout';
import { Youtube, Clock, FileText, Play, CheckCircle, Award, ArrowRight, Share2, Link2, Copy, Check } from 'lucide-react';
import { useTheme, getC } from './ThemeContext';

export function QuizSetup() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { isDark } = useTheme();
  const C = getC(isDark);
  const [copied, setCopied] = useState(false);

  const quizData = {
    videoTitle: 'Introduction to Machine Learning',
    channel: 'MIT OpenCourseWare',
    duration: '1:24:35',
    transcriptStatus: 'available',
    questionCount: location.state?.questionCount || 10,
    difficulty: location.state?.difficulty || 'medium',
    estimatedTime: '30 minutes',
  };

  return (
    <DarkLayout activeNav="dashboard" title="Quiz Ready!" subtitle="Review the details below and start when you're ready">
      <div className="space-y-6 max-w-4xl">
        {/* Video Preview Card */}
        <div
          className="rounded-xl overflow-hidden"
          style={{ background: C.bg1, border: `1px solid ${C.border}` }}
        >
          <div className="aspect-video relative" style={{ background: C.bg2 }}>
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(225,6,0,0.15)', border: '1px solid rgba(225,6,0,0.3)' }}
              >
                <Play className="w-7 h-7 ml-1" style={{ color: C.red }} />
              </div>
            </div>
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
