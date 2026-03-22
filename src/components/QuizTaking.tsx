import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router';
import { Award, Clock, Flag, ChevronLeft, ChevronRight, CheckCircle, Sun, Moon } from 'lucide-react';
import { useTheme, getC } from './ThemeContext';

interface Question {
  id: number;
  type: 'mcq' | 'trueFalse' | 'shortAnswer';
  question: string;
  options?: string[];
  answer?: string;
}

export function QuizTaking() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isDark, toggleTheme } = useTheme();
  const C = getC(isDark);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string | string[]>>({});
  const [flagged, setFlagged] = useState<Set<number>>(new Set());
  const [timeLeft, setTimeLeft] = useState(1800);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const questions: Question[] = [
    {
      id: 0, type: 'mcq',
      question: 'What is the primary goal of supervised learning in machine learning?',
      options: ['To find hidden patterns in unlabeled data', 'To learn from labeled training data to make predictions', 'To maximize rewards through trial and error', 'To reduce the dimensionality of data']
    },
    {
      id: 1, type: 'mcq',
      question: 'Which of the following is NOT a common activation function in neural networks?',
      options: ['ReLU (Rectified Linear Unit)', 'Sigmoid', 'Tanh', 'Logarithmic']
    },
    {
      id: 2, type: 'trueFalse',
      question: 'Overfitting occurs when a model performs well on training data but poorly on unseen test data.',
      options: ['True', 'False']
    },
    {
      id: 3, type: 'mcq',
      question: 'What does the term "gradient descent" refer to in machine learning?',
      options: ['A method for data visualization', 'An optimization algorithm to minimize loss functions', 'A technique for feature selection', 'A type of neural network architecture']
    },
    {
      id: 4, type: 'trueFalse',
      question: 'A confusion matrix can only be used for binary classification problems.',
      options: ['True', 'False']
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) { clearInterval(timer); handleSubmit(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const handleAnswer = (answer: string) => setAnswers({ ...answers, [currentQuestion]: answer });
  const handleNext = () => { if (currentQuestion < questions.length - 1) setCurrentQuestion(currentQuestion + 1); };
  const handlePrevious = () => { if (currentQuestion > 0) setCurrentQuestion(currentQuestion - 1); };

  const toggleFlag = () => {
    const newFlagged = new Set(flagged);
    if (newFlagged.has(currentQuestion)) newFlagged.delete(currentQuestion);
    else newFlagged.add(currentQuestion);
    setFlagged(newFlagged);
  };

  const handleSubmit = () => navigate(`/results/${id}`);
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = questions.length - answeredCount;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: C.bg, color: C.text, fontFamily: "var(--display)" }}>
      {/* Header */}
      <header className="px-8 py-4 sticky top-0 z-50" style={{ background: C.bg1, borderBottom: `1px solid ${C.border}` }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/dashboard" className="flex items-center gap-1.5 no-underline" style={{ color: C.text }}>
              <span className="text-[1.05rem] font-[700] tracking-tight">Quib</span>
            </Link>
            <div className="hidden md:block text-sm" style={{ color: C.text2 }}>
              Introduction to Machine Learning
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 font-[500]">
              <Clock className="w-5 h-5" style={{ color: C.red }} />
              <span style={{ color: timeLeft < 300 ? '#f97316' : C.text }}>{formatTime(timeLeft)}</span>
            </div>
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
              onClick={() => setShowSubmitModal(true)}
              className="px-5 py-2 rounded-lg text-sm font-[600] cursor-pointer transition-all"
              style={{ background: C.red, border: 'none', color: '#fff', boxShadow: '0 0 20px rgba(225,6,0,0.3)' }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 0 30px rgba(225,6,0,0.5)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 0 20px rgba(225,6,0,0.3)'; }}
            >
              Submit Quiz
            </button>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="px-8 py-3" style={{ background: C.bg1, borderBottom: `1px solid ${C.border}` }}>
        <div className="max-w-7xl mx-auto">
          <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.07)' }}>
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: C.red, boxShadow: '0 0 8px rgba(225,6,0,0.4)' }} />
          </div>
          <div className="flex items-center justify-between mt-2 text-xs">
            <span style={{ color: C.text2 }}>Question {currentQuestion + 1} of {questions.length}</span>
            <span style={{ color: C.text3 }}>{answeredCount} answered • {unansweredCount} remaining</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Question Area */}
        <div className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="rounded-xl p-8 mb-6" style={{ background: C.bg1, border: `1px solid ${C.border}` }}>
              <div className="flex items-start justify-between mb-8">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 rounded-lg text-xs font-[500]" style={{ background: C.bg2, color: C.text2, border: `1px solid ${C.border}` }}>
                      {questions[currentQuestion].type === 'mcq' ? 'Multiple Choice' :
                       questions[currentQuestion].type === 'trueFalse' ? 'True/False' : 'Short Answer'}
                    </span>
                    {flagged.has(currentQuestion) && (
                      <span className="flex items-center gap-1 text-xs font-[500]" style={{ color: '#f97316' }}>
                        <Flag className="w-3.5 h-3.5 fill-current" /> Flagged
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-[400]" style={{ color: C.text, fontFamily: "var(--serif)" }}>
                    {questions[currentQuestion].question}
                  </h2>
                </div>
                <button
                  onClick={toggleFlag}
                  className="p-2 rounded-lg cursor-pointer transition-colors"
                  style={{ background: 'transparent', border: 'none', color: flagged.has(currentQuestion) ? '#f97316' : C.text3 }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = C.bg2; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <Flag className={`w-5 h-5 ${flagged.has(currentQuestion) ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* Answer Options */}
              {questions[currentQuestion].type === 'mcq' || questions[currentQuestion].type === 'trueFalse' ? (
                <div className="space-y-3">
                  {questions[currentQuestion].options?.map((option, index) => {
                    const isSelected = answers[currentQuestion] === option;
                    return (
                      <button
                        key={index}
                        onClick={() => handleAnswer(option)}
                        className="w-full p-5 rounded-xl text-left transition-all cursor-pointer"
                        style={{
                          background: isSelected ? C.redDim : C.bg2,
                          border: isSelected ? '1px solid rgba(225,6,0,0.3)' : `1px solid ${C.border}`,
                        }}
                        onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.borderColor = C.border2; }}
                        onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.borderColor = C.border; }}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{
                              border: isSelected ? 'none' : `2px solid ${C.text3}`,
                              background: isSelected ? C.red : 'transparent',
                            }}
                          >
                            {isSelected && <CheckCircle className="w-4 h-4 text-white" />}
                          </div>
                          <span className="text-sm font-[400]" style={{ color: isSelected ? C.text : C.text2 }}>
                            {option}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <textarea
                  value={(answers[currentQuestion] as string) || ''}
                  onChange={(e) => handleAnswer(e.target.value)}
                  placeholder="Type your answer here..."
                  className="w-full h-40 p-4 rounded-xl outline-none resize-none text-sm"
                  style={{ background: C.bg2, border: `1px solid ${C.border}`, color: C.text }}
                />
              )}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-[500] cursor-pointer transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ background: 'transparent', border: `1px solid ${C.border2}`, color: C.text2 }}
                onMouseEnter={(e) => { if (!e.currentTarget.disabled) { e.currentTarget.style.background = C.bg2; e.currentTarget.style.color = C.text; }}}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.text2; }}
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              {currentQuestion === questions.length - 1 ? (
                <button
                  onClick={() => setShowSubmitModal(true)}
                  className="px-6 py-2.5 rounded-lg text-sm font-[600] cursor-pointer"
                  style={{ background: C.red, border: 'none', color: '#fff', boxShadow: '0 0 20px rgba(225,6,0,0.3)' }}
                >
                  Submit Quiz
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-[600] cursor-pointer transition-all"
                  style={{ background: C.red, border: 'none', color: '#fff', boxShadow: '0 0 20px rgba(225,6,0,0.3)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 0 30px rgba(225,6,0,0.5)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 0 20px rgba(225,6,0,0.3)'; }}
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Question Navigator Sidebar */}
        <aside className="w-72 p-6 overflow-auto" style={{ background: C.bg1, borderLeft: `1px solid ${C.border}` }}>
          <div className="text-[10px] tracking-[3px] uppercase font-[500] mb-4" style={{ color: C.text3, fontFamily: "var(--mono)" }}>
            Question Navigator
          </div>
          <div className="grid grid-cols-5 gap-2">
            {questions.map((_, index) => {
              const isCurrent = index === currentQuestion;
              const isAnswered = !!answers[index];
              return (
                <button
                  key={index}
                  onClick={() => setCurrentQuestion(index)}
                  className="aspect-square rounded-lg flex items-center justify-center text-xs font-[500] cursor-pointer transition-all relative"
                  style={{
                    background: isCurrent ? C.red : isAnswered ? 'rgba(34,197,94,0.1)' : C.bg2,
                    border: isCurrent ? 'none' : isAnswered ? '1px solid rgba(34,197,94,0.2)' : `1px solid ${C.border}`,
                    color: isCurrent ? '#fff' : isAnswered ? '#22c55e' : C.text3,
                    boxShadow: isCurrent ? '0 0 12px rgba(225,6,0,0.4)' : 'none',
                  }}
                >
                  {index + 1}
                  {flagged.has(index) && (
                    <Flag className="w-2.5 h-2.5 fill-current absolute -top-1 -right-1" style={{ color: '#f97316' }} />
                  )}
                </button>
              );
            })}
          </div>
        </aside>
      </div>

      {/* Submit Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-6" style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }}>
          <div className="max-w-md w-full rounded-xl p-8" style={{ background: C.bg1, border: `1px solid ${C.border2}`, boxShadow: isDark ? '0 24px 60px rgba(0,0,0,0.6)' : '0 24px 60px rgba(0,0,0,0.15)' }}>
            <h3 className="text-xl font-[400] mb-3" style={{ color: C.text, fontFamily: "var(--serif)" }}>Submit Quiz?</h3>
            <p className="text-sm mb-6" style={{ color: C.text2 }}>
              You have answered {answeredCount} out of {questions.length} questions.
              {unansweredCount > 0 && ` ${unansweredCount} questions remain unanswered.`}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 px-4 py-2.5 rounded-lg text-sm font-[500] cursor-pointer"
                style={{ background: 'transparent', border: `1px solid ${C.border2}`, color: C.text2 }}
              >
                Review Answers
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 px-4 py-2.5 rounded-lg text-sm font-[600] cursor-pointer"
                style={{ background: C.red, border: 'none', color: '#fff', boxShadow: '0 0 20px rgba(225,6,0,0.3)' }}
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
