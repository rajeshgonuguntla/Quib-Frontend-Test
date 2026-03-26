import { useNavigate, useLocation } from 'react-router';
import { DarkLayout } from './DarkLayout';
import { Youtube, Play, Clock, TrendingUp, Target, Flame, FileText, Award, Upload } from 'lucide-react';
import { CubeLoader } from './CubeLoader';
import { useState, useRef, ChangeEvent } from 'react';
import { useTheme, getC } from './ThemeContext';

export function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark } = useTheme();
  const C = getC(isDark);
  const [youtubeUrl, setYoutubeUrl] = useState(location.state?.youtubeUrl || '');
  const [difficulty, setDifficulty] = useState('medium');
  const [questionCount, setQuestionCount] = useState(10);
  const [timedExam, setTimedExam] = useState(false);
  const [questionTypes, setQuestionTypes] = useState({
    mcq: true,
    trueFalse: true,
    shortAnswer: false,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [urlFocused, setUrlFocused] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log('Uploaded file:', file.name, file.type, file.size);
      // TODO: handle file processing
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const isPlaylistUrl = (url: string) => url.includes('list=');

  const handleGenerate = () => {
    if (!youtubeUrl) return;
    if (isPlaylistUrl(youtubeUrl)) {
      navigate('/playlist-setup/new', { state: { playlistUrl: youtubeUrl } });
      return;
    }
    setIsGenerating(true);
    setTimeout(() => {
      navigate('/quiz-setup/new', { state: { youtubeUrl, difficulty, questionCount, timedExam, questionTypes } });
    }, 8000);
  };

  const recentQuizzes = [
    { id: '1', title: 'Introduction to Machine Learning', status: 'completed', score: 92, date: '2 days ago' },
    { id: '2', title: 'React Hooks Complete Guide', status: 'in-progress', score: null, date: '1 week ago' },
    { id: '3', title: 'Advanced TypeScript Patterns', status: 'generated', score: null, date: '2 weeks ago' },
  ];

  const stats = [
    { label: 'Quizzes Taken', value: '12', icon: FileText, color: C.red },
    { label: 'Avg Score', value: '87%', icon: Target, color: '#22c55e' },
    { label: 'Quizzes Won', value: '8', icon: Award, color: '#3b82f6' },
    { label: 'Day Streak', value: '5', icon: Flame, color: '#f97316' },
  ];

  return (
    <DarkLayout activeNav="dashboard" showSearch={true} sectionLabel="DASHBOARD">
      {isGenerating && <CubeLoader />}

      {/* Welcome Hero */}
      <div
        className="dash-fade-up rounded-xl px-8 py-5 mb-6 relative overflow-hidden"
        style={{
          background: 'transparent',
          border: 'none',
        }}
      >
        {/* Grid pattern background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(${isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'} 1px, transparent 1px), linear-gradient(90deg, ${isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'} 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
            maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 70%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 70%)',
          }}
        />
        {/* Radial glow */}
        <div
          className="absolute top-0 right-0 pointer-events-none"
          style={{
            width: '60%',
            height: '100%',
            background: 'radial-gradient(ellipse at top right, rgba(225,6,0,0.04) 0%, transparent 60%)',
          }}
        />
        <div className="relative z-10">
          <p
            className="mb-2"
            style={{
              fontFamily: "var(--mono)",
              fontSize: '0.68rem',
              color: C.red,
              letterSpacing: '0.12em',
              fontWeight: 500,
            }}
          >
            WELCOME BACK
          </p>
          <h1
            className="mb-0.5"
            style={{
              fontFamily: "var(--serif)",
              fontWeight: 400,
              fontSize: 'clamp(1.3rem, 2vw, 1.6rem)',
              letterSpacing: '-0.01em',
              color: C.text,
            }}
          >
            Hello, Rajesh!
          </h1>
          <p className="text-xs" style={{ color: C.text2, fontWeight: 300, lineHeight: 1.6 }}>
            Ready to learn something new today?
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="dash-fade-up grid grid-cols-2 md:grid-cols-4 gap-4 mb-8" style={{ animationDelay: '0.05s' }}>
        {stats.map((stat) => (
          <div
            key={stat.label}
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
                background: `linear-gradient(90deg, transparent, ${stat.color}40, transparent)`,
              }}
            />
            <div className="mb-4">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{
                  background: `${stat.color}15`,
                  boxShadow: `0 0 12px ${stat.color}15`,
                }}
              >
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
              </div>
            </div>
            <div
              className="text-2xl font-[700] mb-0.5"
              style={{ color: C.text, fontFamily: "var(--mono)", letterSpacing: '-0.02em' }}
            >
              {stat.value}
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
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Generate Quiz Card */}
      <div
        className="dash-fade-up rounded-xl p-6 md:p-8 mb-8"
        style={{
          background: `linear-gradient(135deg, ${C.bg1}, ${isDark ? 'rgba(225,6,0,0.02)' : 'rgba(225,6,0,0.01)'})`,
          border: `1px solid ${C.border}`,
          animationDelay: '0.1s',
        }}
      >
        <div className="flex items-start gap-4 mb-6">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 relative group/logo cursor-pointer"
            style={{ background: C.redDim }}
            onMouseEnter={(e) => {
              const expanded = e.currentTarget.querySelector('[data-logo-expanded]') as HTMLElement;
              if (expanded) { expanded.style.opacity = '1'; expanded.style.transform = 'scale(1)'; expanded.style.pointerEvents = 'auto'; }
            }}
            onMouseLeave={(e) => {
              const expanded = e.currentTarget.querySelector('[data-logo-expanded]') as HTMLElement;
              if (expanded) { expanded.style.opacity = '0'; expanded.style.transform = 'scale(0.8)'; expanded.style.pointerEvents = 'none'; }
            }}
          >
            <svg viewBox="250 250 300 300" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7">
              <defs>
                <linearGradient id="cTopG" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor={isDark ? '#f0f0f0' : '#d0d0d0'} /><stop offset="100%" stopColor={isDark ? '#d0d0d0' : '#b0b0b0'} /></linearGradient>
                <linearGradient id="cLeftG" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor={isDark ? '#b0b0b0' : '#909090'} /><stop offset="100%" stopColor={isDark ? '#909090' : '#707070'} /></linearGradient>
                <linearGradient id="cRightG" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor={isDark ? '#c0c0c0' : '#a0a0a0'} /><stop offset="100%" stopColor={isDark ? '#a0a0a0' : '#808080'} /></linearGradient>
                <linearGradient id="cBTop" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#ff4d4d" /><stop offset="100%" stopColor="#ff2d2d" /></linearGradient>
                <linearGradient id="cBLeft" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#cc0000" /><stop offset="100%" stopColor="#990000" /></linearGradient>
                <linearGradient id="cBRight" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#ff1a1a" /><stop offset="100%" stopColor="#cc0000" /></linearGradient>
              </defs>
              <g opacity="0.5">
                <g transform="translate(310,270)"><polygon points="0,30 50,5 100,30 50,55" fill="url(#cTopG)" /><polygon points="0,30 0,80 50,105 50,55" fill="url(#cLeftG)" /><polygon points="100,30 100,80 50,105 50,55" fill="url(#cRightG)" /></g>
                <g transform="translate(390,270)"><polygon points="0,30 50,5 100,30 50,55" fill="url(#cTopG)" /><polygon points="0,30 0,80 50,105 50,55" fill="url(#cLeftG)" /><polygon points="100,30 100,80 50,105 50,55" fill="url(#cRightG)" /></g>
              </g>
              <g opacity="0.7">
                <g transform="translate(270,320)"><polygon points="0,30 50,5 100,30 50,55" fill="url(#cTopG)" /><polygon points="0,30 0,80 50,105 50,55" fill="url(#cLeftG)" /><polygon points="100,30 100,80 50,105 50,55" fill="url(#cRightG)" /></g>
                <g transform="translate(350,295)"><polygon points="0,30 50,5 100,30 50,55" fill="url(#cTopG)" /><polygon points="0,30 0,80 50,105 50,55" fill="url(#cLeftG)" /><polygon points="100,30 100,80 50,105 50,55" fill="url(#cRightG)" /></g>
                <g transform="translate(430,320)"><polygon points="0,30 50,5 100,30 50,55" fill="url(#cTopG)" /><polygon points="0,30 0,80 50,105 50,55" fill="url(#cLeftG)" /><polygon points="100,30 100,80 50,105 50,55" fill="url(#cRightG)" /></g>
              </g>
              <g>
                <g transform="translate(310,370)"><polygon points="0,30 50,5 100,30 50,55" fill="url(#cTopG)" /><polygon points="0,30 0,80 50,105 50,55" fill="url(#cLeftG)" /><polygon points="120,30 120,80 50,105 50,55" fill="url(#cRightG)" /></g>
                <g transform="translate(350,345)"><polygon points="0,30 50,5 100,30 50,55" fill="url(#cBTop)" /><polygon points="0,30 0,80 50,105 50,55" fill="url(#cBLeft)" /><polygon points="100,30 100,80 50,105 50,55" fill="url(#cBRight)" /><polygon points="0,30 50,5 100,30 50,55" fill="#fff" opacity="0.2" /></g>
                <g transform="translate(390,370)"><polygon points="0,30 50,5 100,30 50,55" fill="url(#cTopG)" /><polygon points="0,30 0,80 50,105 50,55" fill="url(#cLeftG)" /><polygon points="100,30 100,80 50,105 50,55" fill="url(#cRightG)" /></g>
                <g transform="translate(350,395)"><polygon points="0,30 50,5 100,30 50,55" fill="url(#cTopG)" /><polygon points="0,30 0,80 50,105 50,55" fill="url(#cLeftG)" /><polygon points="100,30 100,80 50,105 50,55" fill="url(#cRightG)" /></g>
              </g>
              <circle cx="400" cy="400" r="100" fill="#ff2d2d" opacity="0.06" />
            </svg>
            {/* Expanded logo on hover */}
            <div
              data-logo-expanded
              className="absolute top-0 left-0 z-50 rounded-xl flex items-center justify-center"
              style={{
                width: 200,
                height: 200,
                background: isDark ? C.bg1 : '#fff',
                border: `1px solid ${C.border2}`,
                boxShadow: isDark ? '0 12px 40px rgba(0,0,0,0.5)' : '0 12px 40px rgba(0,0,0,0.15)',
                opacity: 0,
                transform: 'scale(0.8)',
                pointerEvents: 'none',
                transition: 'opacity 0.2s ease, transform 0.2s ease',
                transformOrigin: 'top left',
              }}
            >
              <svg viewBox="250 250 300 300" xmlns="http://www.w3.org/2000/svg" className="w-40 h-40">
                <defs>
                  <linearGradient id="cTopGE" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor={isDark ? '#f0f0f0' : '#d0d0d0'} /><stop offset="100%" stopColor={isDark ? '#d0d0d0' : '#b0b0b0'} /></linearGradient>
                  <linearGradient id="cLeftGE" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor={isDark ? '#b0b0b0' : '#909090'} /><stop offset="100%" stopColor={isDark ? '#909090' : '#707070'} /></linearGradient>
                  <linearGradient id="cRightGE" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor={isDark ? '#c0c0c0' : '#a0a0a0'} /><stop offset="100%" stopColor={isDark ? '#a0a0a0' : '#808080'} /></linearGradient>
                  <linearGradient id="cBTopE" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#ff4d4d" /><stop offset="100%" stopColor="#ff2d2d" /></linearGradient>
                  <linearGradient id="cBLeftE" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#cc0000" /><stop offset="100%" stopColor="#990000" /></linearGradient>
                  <linearGradient id="cBRightE" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#ff1a1a" /><stop offset="100%" stopColor="#cc0000" /></linearGradient>
                </defs>
                <g opacity="0.5">
                  <g transform="translate(310,270)"><polygon points="0,30 50,5 100,30 50,55" fill="url(#cTopGE)" /><polygon points="0,30 0,80 50,105 50,55" fill="url(#cLeftGE)" /><polygon points="100,30 100,80 50,105 50,55" fill="url(#cRightGE)" /></g>
                  <g transform="translate(390,270)"><polygon points="0,30 50,5 100,30 50,55" fill="url(#cTopGE)" /><polygon points="0,30 0,80 50,105 50,55" fill="url(#cLeftGE)" /><polygon points="100,30 100,80 50,105 50,55" fill="url(#cRightGE)" /></g>
                </g>
                <g opacity="0.7">
                  <g transform="translate(270,320)"><polygon points="0,30 50,5 100,30 50,55" fill="url(#cTopGE)" /><polygon points="0,30 0,80 50,105 50,55" fill="url(#cLeftGE)" /><polygon points="100,30 100,80 50,105 50,55" fill="url(#cRightGE)" /></g>
                  <g transform="translate(350,295)"><polygon points="0,30 50,5 100,30 50,55" fill="url(#cTopGE)" /><polygon points="0,30 0,80 50,105 50,55" fill="url(#cLeftGE)" /><polygon points="100,30 100,80 50,105 50,55" fill="url(#cRightGE)" /></g>
                  <g transform="translate(430,320)"><polygon points="0,30 50,5 100,30 50,55" fill="url(#cTopGE)" /><polygon points="0,30 0,80 50,105 50,55" fill="url(#cLeftGE)" /><polygon points="100,30 100,80 50,105 50,55" fill="url(#cRightGE)" /></g>
                </g>
                <g>
                  <g transform="translate(310,370)"><polygon points="0,30 50,5 100,30 50,55" fill="url(#cTopGE)" /><polygon points="0,30 0,80 50,105 50,55" fill="url(#cLeftGE)" /><polygon points="120,30 120,80 50,105 50,55" fill="url(#cRightGE)" /></g>
                  <g transform="translate(350,345)"><polygon points="0,30 50,5 100,30 50,55" fill="url(#cBTopE)" /><polygon points="0,30 0,80 50,105 50,55" fill="url(#cBLeftE)" /><polygon points="100,30 100,80 50,105 50,55" fill="url(#cBRightE)" /><polygon points="0,30 50,5 100,30 50,55" fill="#fff" opacity="0.2" /></g>
                  <g transform="translate(390,370)"><polygon points="0,30 50,5 100,30 50,55" fill="url(#cTopGE)" /><polygon points="0,30 0,80 50,105 50,55" fill="url(#cLeftGE)" /><polygon points="100,30 100,80 50,105 50,55" fill="url(#cRightGE)" /></g>
                  <g transform="translate(350,395)"><polygon points="0,30 50,5 100,30 50,55" fill="url(#cTopGE)" /><polygon points="0,30 0,80 50,105 50,55" fill="url(#cLeftGE)" /><polygon points="100,30 100,80 50,105 50,55" fill="url(#cRightGE)" /></g>
                </g>
                <circle cx="400" cy="400" r="100" fill="#ff2d2d" opacity="0.06" />
              </svg>
            </div>
          </div>
          <div>
            <p
              className="mb-1"
              style={{
                fontFamily: "var(--mono)",
                fontSize: '0.65rem',
                color: C.text3,
                letterSpacing: '0.1em',
                fontWeight: 500,
              }}
            >
              GENERATE
            </p>
            <h2
              style={{
                fontFamily: "var(--serif)",
                fontWeight: 400,
                fontSize: '1.5rem',
                letterSpacing: '-0.01em',
                color: C.text,
                marginBottom: 4,
              }}
            >
              Quiz from YouTube
            </h2>
            <p className="text-sm font-[300]" style={{ color: C.text2 }}>
              Paste any video or playlist URL to create a custom assessment
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Youtube
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200"
                style={{ color: urlFocused ? C.red : C.text3 }}
              />
              <input
                type="text"
                placeholder="https://youtube.com/watch?v=..."
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                onFocus={() => setUrlFocused(true)}
                onBlur={() => setUrlFocused(false)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg outline-none text-sm transition-all duration-200"
                style={{
                  background: C.bg,
                  border: `1px solid ${urlFocused ? C.border2 : C.border}`,
                  color: C.text,
                  fontFamily: "var(--mono)",
                  letterSpacing: '0.01em',
                  boxShadow: urlFocused ? '0 0 0 3px rgba(225,6,0,0.06)' : 'none',
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
              />
            </div>
            {/* Upload Document */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="hidden"
              onChange={handleFileUpload}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-2.5 rounded-lg transition-all duration-200 flex-shrink-0"
              style={{
                background: C.bg,
                border: `1px solid ${C.border}`,
                color: C.text2,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = C.border2;
                e.currentTarget.style.color = C.red;
                e.currentTarget.style.background = C.redDim;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = C.border;
                e.currentTarget.style.color = C.text2;
                e.currentTarget.style.background = C.bg;
              }}
              title="Upload PDF or Word document"
            >
              <Upload className="w-4 h-4" />
            </button>
            <button
              onClick={handleGenerate}
              disabled={!youtubeUrl}
              className="px-6 py-2.5 rounded-lg text-sm font-[600] text-white transition-all duration-200 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: C.red,
                boxShadow: youtubeUrl ? '0 4px 14px rgba(225,6,0,0.25)' : 'none',
              }}
              onMouseEnter={(e) => { if (youtubeUrl) e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              Generate
            </button>
          </div>

          {/* Options Grid */}
          <div>
            {/* Gradient divider */}
            <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${C.border2}, transparent)`, marginBottom: 24 }} />
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-[500] mb-3" style={{ color: C.text2 }}>Difficulty Level</label>
                <div className="flex gap-2">
                  {['easy', 'medium', 'hard'].map((level) => (
                    <button
                      key={level}
                      onClick={() => setDifficulty(level)}
                      className="flex-1 px-4 py-2 rounded-lg text-sm font-[500] transition-all duration-200"
                      style={{
                        background: difficulty === level ? C.red : C.bg,
                        color: difficulty === level ? '#fff' : C.text2,
                        border: `1px solid ${difficulty === level ? C.red : C.border}`,
                        boxShadow: difficulty === level ? '0 0 12px rgba(225,6,0,0.2)' : 'none',
                      }}
                      onMouseEnter={(e) => { if (difficulty !== level) e.currentTarget.style.borderColor = C.border2; }}
                      onMouseLeave={(e) => { if (difficulty !== level) e.currentTarget.style.borderColor = C.border; }}
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-[500] mb-3" style={{ color: C.text2 }}>
                  Question Count: <span style={{ color: C.text }}>{questionCount}</span>
                </label>
                <input
                  type="range"
                  min="5"
                  max="25"
                  step="5"
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                  style={{ background: C.bg3, accentColor: C.red }}
                />
                <div className="flex justify-between text-xs mt-1" style={{ color: C.text3 }}>
                  <span>5</span>
                  <span>25</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-[500] mb-3" style={{ color: C.text2 }}>Question Types</label>
                <div className="space-y-2.5">
                  {[
                    { key: 'mcq', label: 'Multiple Choice' },
                    { key: 'trueFalse', label: 'True/False' },
                    { key: 'shortAnswer', label: 'Short Answer' },
                  ].map((type) => (
                    <label key={type.key} className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={questionTypes[type.key as keyof typeof questionTypes]}
                        onChange={(e) =>
                          setQuestionTypes({ ...questionTypes, [type.key]: e.target.checked })
                        }
                        className="rounded"
                        style={{ accentColor: C.red }}
                      />
                      <span className="text-sm" style={{ color: C.text2 }}>{type.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-[500] mb-3" style={{ color: C.text2 }}>Time Limit</label>
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={timedExam}
                    onChange={(e) => setTimedExam(e.target.checked)}
                    className="rounded"
                    style={{ accentColor: C.red }}
                  />
                  <span className="text-sm" style={{ color: C.text2 }}>Enable timed exam (30 minutes)</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Quizzes */}
      <div className="dash-fade-up" style={{ animationDelay: '0.15s' }}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <p
              className="mb-1"
              style={{
                fontFamily: "var(--mono)",
                fontSize: '0.65rem',
                color: C.text3,
                letterSpacing: '0.1em',
                fontWeight: 500,
              }}
            >
              RECENT ACTIVITY
            </p>
            <h2
              style={{
                fontFamily: "var(--serif)",
                fontWeight: 400,
                fontSize: '1.25rem',
                color: C.text,
                letterSpacing: '-0.01em',
              }}
            >
              Recent Quizzes
            </h2>
          </div>
          <button
            className="text-sm font-[500] transition-all duration-200 hover:opacity-80"
            style={{ color: C.red }}
            onClick={() => navigate('/my-quizzes')}
          >
            View all
          </button>
        </div>

        <div className="space-y-3">
          {recentQuizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="rounded-xl p-5 flex items-center gap-5 transition-all duration-250 group cursor-pointer"
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
                <h3 className="text-sm font-[600] truncate mb-1.5" style={{ color: C.text }}>{quiz.title}</h3>
                <div className="flex items-center gap-4 text-xs" style={{ color: C.text3 }}>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {quiz.date}
                  </span>
                  {quiz.score && (
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" />
                      Score: {quiz.score}%
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
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
                   quiz.status === 'in-progress' ? 'IN PROGRESS' : 'GENERATED'}
                </span>
                {quiz.status === 'completed' ? (
                  <>
                    <button
                      onClick={() => navigate(`/results/${quiz.id}`)}
                      className="px-3 py-1.5 rounded-md text-xs font-[600] transition-all duration-200 hover:opacity-90"
                      style={{ background: C.red, color: '#fff', boxShadow: '0 2px 8px rgba(225,6,0,0.2)' }}
                      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
                    >
                      Results
                    </button>
                  </>
                ) : quiz.status === 'in-progress' ? (
                  <button
                    onClick={() => navigate(`/quiz/${quiz.id}`)}
                    className="px-3 py-1.5 rounded-md text-xs font-[600] transition-all duration-200 hover:opacity-90"
                    style={{ background: C.red, color: '#fff', boxShadow: '0 2px 8px rgba(225,6,0,0.2)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    Resume
                  </button>
                ) : (
                  <button
                    onClick={() => navigate(`/quiz/${quiz.id}`)}
                    className="px-3 py-1.5 rounded-md text-xs font-[600] transition-all duration-200 hover:opacity-90"
                    style={{ background: C.red, color: '#fff', boxShadow: '0 2px 8px rgba(225,6,0,0.2)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    Start
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </DarkLayout>
  );
}
