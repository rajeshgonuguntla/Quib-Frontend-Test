import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router';
import { ChevronDown, ChevronUp, CheckCircle, XCircle, Linkedin, Smile, Sun, Moon, FileText, Download, Share2, Link2, Check, Copy } from 'lucide-react';
import { useTheme, getC } from './ThemeContext';

export function Results() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isDark, toggleTheme } = useTheme();
  const C = getC(isDark);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set());
  const [copied, setCopied] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const score = 92;
  const passed = score >= 70;
  const totalQuestions = 5;
  const correctAnswers = 4;
  const quizTitle = 'Introduction to Machine Learning';
  const shareUrl = `${window.location.origin}/quiz/${id}`;
  const shareText = `I scored ${score}% on "${quizTitle}" on Quib! Can you beat my score?`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const breakdown = [
    { topic: 'Supervised Learning', score: 100, total: 2 },
    { topic: 'Neural Networks', score: 83, total: 2 },
    { topic: 'Model Evaluation', score: 100, total: 1 }
  ];

  const questionReview = [
    { id: 0, question: 'What is the primary goal of supervised learning in machine learning?', userAnswer: 'To learn from labeled training data to make predictions', correctAnswer: 'To learn from labeled training data to make predictions', isCorrect: true, explanation: 'Supervised learning involves training a model on labeled data where both input features and corresponding output labels are provided.' },
    { id: 1, question: 'Which of the following is NOT a common activation function in neural networks?', userAnswer: 'Sigmoid', correctAnswer: 'Logarithmic', isCorrect: false, explanation: 'Logarithmic is not a standard activation function. Common activation functions include ReLU, Sigmoid, Tanh, and Softmax.' },
    { id: 2, question: 'Overfitting occurs when a model performs well on training data but poorly on unseen test data.', userAnswer: 'True', correctAnswer: 'True', isCorrect: true, explanation: 'Overfitting happens when a model learns the training data too well, including noise, and fails to generalize to new data.' },
    { id: 3, question: 'What does the term "gradient descent" refer to in machine learning?', userAnswer: 'An optimization algorithm to minimize loss functions', correctAnswer: 'An optimization algorithm to minimize loss functions', isCorrect: true, explanation: 'Gradient descent is an iterative optimization algorithm used to minimize the loss function by adjusting model parameters.' },
    { id: 4, question: 'A confusion matrix can only be used for binary classification problems.', userAnswer: 'False', correctAnswer: 'False', isCorrect: true, explanation: 'Confusion matrices can be used for multi-class classification problems as well, not just binary classification.' }
  ];

  const toggleQuestion = (id: number) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(id)) newExpanded.delete(id);
    else newExpanded.add(id);
    setExpandedQuestions(newExpanded);
  };

  return (
    <div className="min-h-screen" style={{ background: C.bg, color: C.text, fontFamily: "var(--display)" }}>
      {/* Header */}
      <header className="px-8 py-4 sticky top-0 z-50" style={{ background: C.bg1, borderBottom: `1px solid ${C.border}` }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-1.5 no-underline" style={{ color: C.text }}>
            <span className="text-[1.05rem] font-[700] tracking-tight">Quib</span>
          </Link>
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-lg flex items-center justify-center transition-all"
              style={{ background: C.bg2, border: `1px solid ${C.border}`, color: C.text2 }}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 rounded-lg text-sm font-[500] cursor-pointer transition-colors"
              style={{ background: 'transparent', border: `1px solid ${C.border2}`, color: C.text2 }}
              onMouseEnter={(e) => { e.currentTarget.style.background = C.bg2; e.currentTarget.style.color = C.text; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.text2; }}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-8 py-12">
        {/* Score Hero */}
        <div className="text-center mb-12">
          <div className="w-32 h-32 mx-auto mb-6 rounded-full flex items-center justify-center relative" style={{ background: passed ? 'rgba(34,197,94,0.08)' : 'rgba(249,115,22,0.08)' }}>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle cx="64" cy="64" r="56" stroke={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.07)'} strokeWidth="8" fill="none" />
                <circle
                  cx="64" cy="64" r="56"
                  stroke={passed ? '#22c55e' : '#f97316'}
                  strokeWidth="8" fill="none"
                  strokeDasharray={`${(score / 100) * 351.86} 351.86`}
                  className="transition-all duration-1000"
                  style={{ filter: `drop-shadow(0 0 6px ${passed ? 'rgba(34,197,94,0.4)' : 'rgba(249,115,22,0.4)'})` }}
                />
              </svg>
            </div>
            <span className="text-4xl font-[700] relative z-10" style={{ color: C.text }}>{score}%</span>
          </div>

          <div
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-[600] mb-4"
            style={{
              background: passed ? 'rgba(34,197,94,0.1)' : 'rgba(249,115,22,0.1)',
              color: passed ? '#22c55e' : '#f97316',
              border: `1px solid ${passed ? 'rgba(34,197,94,0.2)' : 'rgba(249,115,22,0.2)'}`,
            }}
          >
            {passed ? <><CheckCircle className="w-5 h-5" /> Passed</> : <><XCircle className="w-5 h-5" /> Not Passed</>}
          </div>

          <h1 className="text-3xl font-[400] mb-3" style={{ color: C.text, fontFamily: "var(--serif)", letterSpacing: '-0.01em' }}>
            {passed ? 'Congratulations!' : 'Keep Learning!'}
          </h1>
          <p className="text-sm mb-8" style={{ color: C.text2 }}>
            {passed
              ? `You scored ${correctAnswers} out of ${totalQuestions} questions correctly`
              : `You scored ${correctAnswers} out of ${totalQuestions}. Try again to earn your certificate`}
          </p>

          {passed && (
            <div className="flex items-center justify-center gap-4">
              {/* PDF Button with hover dropdown */}
              <div
                className="relative group"
                onMouseEnter={(e) => {
                  const dropdown = e.currentTarget.querySelector('[data-dropdown]') as HTMLElement;
                  if (dropdown) dropdown.style.opacity = '1';
                  if (dropdown) dropdown.style.pointerEvents = 'auto';
                  if (dropdown) dropdown.style.transform = 'translateY(0)';
                }}
                onMouseLeave={(e) => {
                  const dropdown = e.currentTarget.querySelector('[data-dropdown]') as HTMLElement;
                  if (dropdown) dropdown.style.opacity = '0';
                  if (dropdown) dropdown.style.pointerEvents = 'none';
                  if (dropdown) dropdown.style.transform = 'translateY(4px)';
                }}
              >
                <button
                  className="flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-[500] cursor-pointer transition-colors"
                  style={{ background: 'transparent', border: `1px solid ${C.border2}`, color: C.text2 }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = C.bg2; e.currentTarget.style.color = C.text; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.text2; }}
                >
                  <FileText className="w-5 h-5" /> PDF
                </button>
                <div
                  data-dropdown
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-2 rounded-lg overflow-hidden transition-all duration-200"
                  style={{
                    background: C.bg1,
                    border: `1px solid ${C.border2}`,
                    boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.4)' : '0 8px 24px rgba(0,0,0,0.12)',
                    opacity: 0,
                    pointerEvents: 'none',
                    transform: 'translateY(4px)',
                    minWidth: '160px',
                  }}
                >
                  <button
                    className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-[500] cursor-pointer transition-colors text-left"
                    style={{ background: 'transparent', border: 'none', color: C.text2 }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'; e.currentTarget.style.color = C.text; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.text2; }}
                  >
                    <Download className="w-4 h-4" /> Download PDF
                  </button>
                </div>
              </div>

              {/* Share Quiz Button with dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-[500] cursor-pointer transition-colors"
                  style={{ background: showShareMenu ? C.bg2 : 'transparent', border: `1px solid ${C.border2}`, color: showShareMenu ? C.text : C.text2 }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = C.bg2; e.currentTarget.style.color = C.text; }}
                  onMouseLeave={(e) => { if (!showShareMenu) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.text2; } }}
                >
                  <Share2 className="w-5 h-5" /> Share Quiz
                </button>

                {showShareMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowShareMenu(false)} />
                    <div
                      className="absolute top-full left-1/2 -translate-x-1/2 mt-2 rounded-xl overflow-hidden z-50"
                      style={{
                        background: C.bg1,
                        border: `1px solid ${C.border2}`,
                        boxShadow: isDark ? '0 12px 32px rgba(0,0,0,0.5)' : '0 12px 32px rgba(0,0,0,0.15)',
                        minWidth: '240px',
                        animation: 'dashFadeUp 0.15s ease both',
                      }}
                    >
                      {/* Share link preview */}
                      <div className="px-4 py-3" style={{ borderBottom: `1px solid ${C.border}` }}>
                        <p className="text-[0.65rem] font-[500] uppercase tracking-wider mb-1.5" style={{ color: C.text3, fontFamily: 'var(--mono)' }}>Share this quiz</p>
                        <div
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
                          style={{ background: C.bg2, border: `1px solid ${C.border}`, color: C.text3, fontFamily: 'var(--mono)' }}
                        >
                          <Link2 className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="truncate">{shareUrl}</span>
                        </div>
                      </div>

                      {/* Copy Link */}
                      <button
                        onClick={handleCopyLink}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-[500] cursor-pointer transition-colors text-left"
                        style={{ background: 'transparent', border: 'none', color: copied ? '#22c55e' : C.text2 }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'; if (!copied) e.currentTarget.style.color = C.text; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; if (!copied) e.currentTarget.style.color = C.text2; }}
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copied ? 'Copied!' : 'Copy Link'}
                      </button>

                      <div style={{ height: 1, background: C.border }} />

                      {/* WhatsApp */}
                      <button
                        onClick={() => { window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`, '_blank'); setShowShareMenu(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-[500] cursor-pointer transition-colors text-left"
                        style={{ background: 'transparent', border: 'none', color: C.text2 }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'; e.currentTarget.style.color = '#25D366'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.text2; }}
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492l4.597-1.472A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818c-2.168 0-4.19-.587-5.932-1.61l-.425-.253-2.727.874.875-2.649-.278-.442A9.78 9.78 0 012.182 12c0-5.415 4.403-9.818 9.818-9.818S21.818 6.585 21.818 12s-4.403 9.818-9.818 9.818z"/></svg>
                        WhatsApp
                      </button>

                      {/* Twitter/X */}
                      <button
                        onClick={() => { window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank'); setShowShareMenu(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-[500] cursor-pointer transition-colors text-left"
                        style={{ background: 'transparent', border: 'none', color: C.text2 }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'; e.currentTarget.style.color = C.text; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.text2; }}
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                        Twitter / X
                      </button>

                      {/* LinkedIn */}
                      <button
                        onClick={() => { window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank'); setShowShareMenu(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-[500] cursor-pointer transition-colors text-left"
                        style={{ background: 'transparent', border: 'none', color: C.text2 }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'; e.currentTarget.style.color = '#0A66C2'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.text2; }}
                      >
                        <Linkedin className="w-4 h-4" />
                        LinkedIn
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Performance Breakdown */}
        <div className="rounded-xl p-8 mb-8" style={{ background: C.bg1, border: `1px solid ${C.border}` }}>
          <div className="text-[10px] tracking-[3px] uppercase font-[500] mb-6" style={{ color: C.text3, fontFamily: "var(--mono)" }}>
            Performance Breakdown
          </div>

          <div className="space-y-4 mb-6">
            {breakdown.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-lg" style={{ background: C.bg2, border: `1px solid ${C.border}` }}>
                <div className="flex-1">
                  <div className="text-sm font-[500] mb-1" style={{ color: C.text }}>{item.topic}</div>
                  <div className="text-xs" style={{ color: C.text3 }}>{item.total} questions</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-48">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs" style={{ color: C.text3 }}>Score</span>
                      <span className="text-xs font-[500]" style={{ color: C.text }}>{item.score}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.07)' }}>
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${item.score}%`,
                          background: item.score >= 80 ? '#22c55e' : item.score >= 60 ? '#eab308' : C.red,
                          boxShadow: `0 0 6px ${item.score >= 80 ? 'rgba(34,197,94,0.4)' : item.score >= 60 ? 'rgba(234,179,8,0.4)' : 'rgba(225,6,0,0.4)'}`,
                        }}
                      />
                    </div>
                  </div>
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{
                      background: item.score >= 80 ? 'rgba(34,197,94,0.1)' : item.score >= 60 ? 'rgba(234,179,8,0.1)' : 'rgba(225,6,0,0.1)',
                    }}
                  >
                    {item.score >= 80 ? (
                      <Smile className="w-5 h-5" style={{ color: '#22c55e' }} />
                    ) : item.score >= 60 ? (
                      <span className="text-lg">😐</span>
                    ) : (
                      <span className="text-lg">😕</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-6" style={{ borderTop: `1px solid ${C.border}` }}>
            <div className="font-[600]" style={{ color: C.text }}>Overall Score</div>
            <div className="flex items-center gap-4">
              <div className="text-3xl font-[700]" style={{ color: C.red }}>{score}%</div>
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: C.redDim }}>
                <Smile className="w-5 h-5" style={{ color: '#22c55e' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Question Review */}
        <div className="mb-8">
          <div className="text-[10px] tracking-[3px] uppercase font-[500] mb-6" style={{ color: C.text3, fontFamily: "var(--mono)" }}>
            Review Answers
          </div>
          <div className="space-y-3">
            {questionReview.map((q) => (
              <div key={q.id} className="rounded-xl overflow-hidden" style={{ background: C.bg1, border: `1px solid ${C.border}` }}>
                <button
                  onClick={() => toggleQuestion(q.id)}
                  className="w-full p-5 flex items-start gap-4 text-left cursor-pointer transition-colors"
                  style={{ background: 'transparent', border: 'none' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      background: q.isCorrect ? 'rgba(34,197,94,0.1)' : 'rgba(225,6,0,0.1)',
                      border: `1px solid ${q.isCorrect ? 'rgba(34,197,94,0.2)' : 'rgba(225,6,0,0.2)'}`,
                    }}
                  >
                    {q.isCorrect ? (
                      <CheckCircle className="w-5 h-5" style={{ color: '#22c55e' }} />
                    ) : (
                      <XCircle className="w-5 h-5" style={{ color: C.red }} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-xs font-[500] mb-1.5" style={{ color: C.text3 }}>Question {q.id + 1}</div>
                        <div className="text-sm font-[500] mb-1.5" style={{ color: C.text }}>{q.question}</div>
                        <div className="text-xs font-[500]" style={{ color: q.isCorrect ? '#22c55e' : C.red }}>
                          {q.isCorrect ? 'Correct' : 'Incorrect'}
                        </div>
                      </div>
                      {expandedQuestions.has(q.id) ? (
                        <ChevronUp className="w-4 h-4 flex-shrink-0" style={{ color: C.text3 }} />
                      ) : (
                        <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: C.text3 }} />
                      )}
                    </div>
                  </div>
                </button>

                {expandedQuestions.has(q.id) && (
                  <div className="px-5 pb-5 space-y-3" style={{ borderTop: `1px solid ${C.border}` }}>
                    <div className="pt-4">
                      <div className="text-xs font-[500] mb-2" style={{ color: C.text3 }}>Your Answer:</div>
                      <div
                        className="p-3 rounded-lg text-sm"
                        style={{
                          background: q.isCorrect ? 'rgba(34,197,94,0.08)' : 'rgba(225,6,0,0.08)',
                          border: `1px solid ${q.isCorrect ? 'rgba(34,197,94,0.15)' : 'rgba(225,6,0,0.15)'}`,
                          color: q.isCorrect ? '#16a34a' : '#dc2626',
                        }}
                      >
                        {q.userAnswer}
                      </div>
                    </div>

                    {!q.isCorrect && (
                      <div>
                        <div className="text-xs font-[500] mb-2" style={{ color: C.text3 }}>Correct Answer:</div>
                        <div
                          className="p-3 rounded-lg text-sm"
                          style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)', color: '#16a34a' }}
                        >
                          {q.correctAnswer}
                        </div>
                      </div>
                    )}

                    <div>
                      <div className="text-xs font-[500] mb-2" style={{ color: C.text3 }}>Explanation:</div>
                      <div
                        className="p-3 rounded-lg text-sm"
                        style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)', color: '#2563eb' }}
                      >
                        {q.explanation}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 rounded-lg text-sm font-[500] cursor-pointer transition-colors"
            style={{ background: 'transparent', border: `1px solid ${C.border2}`, color: C.text2 }}
            onMouseEnter={(e) => { e.currentTarget.style.background = C.bg2; e.currentTarget.style.color = C.text; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.text2; }}
          >
            Back to Dashboard
          </button>
        </div>
      </main>
    </div>
  );
}
