import { useState } from 'react';
import { Card } from './ui/card';
import { CheckCircle2, Circle, User } from 'lucide-react';
import { Button } from './ui/button';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { Input } from './ui/input';

interface VideoSubmissionPageProps {
  onSubmit: (videoUrl: string, category: string, courseName?: string, userName?: string) => void;
}

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

const quizQuestions: Question[] = [
  {
    id: 1,
    question: "What is the main topic covered in this educational content?",
    options: [
      "Basic fundamentals and core concepts",
      "Advanced implementation techniques",
      "Historical context and background",
      "Future trends and predictions"
    ],
    correctAnswer: 0
  },
  {
    id: 2,
    question: "Which of the following best describes the learning objective?",
    options: [
      "Memorizing specific facts and figures",
      "Understanding and applying key concepts",
      "Comparing different theoretical approaches",
      "Evaluating current industry standards"
    ],
    correctAnswer: 1
  },
  {
    id: 3,
    question: "What is emphasized as a best practice in the content?",
    options: [
      "Following traditional methods only",
      "Rapid implementation without planning",
      "Thorough understanding before application",
      "Avoiding new approaches entirely"
    ],
    correctAnswer: 2
  },
  {
    id: 4,
    question: "According to the content, what should learners focus on?",
    options: [
      "Speed over accuracy",
      "Quantity over quality",
      "Practical application of knowledge",
      "Theoretical concepts only"
    ],
    correctAnswer: 2
  },
  {
    id: 5,
    question: "What is the recommended approach for mastering this topic?",
    options: [
      "One-time review is sufficient",
      "Continuous practice and application",
      "Passive observation only",
      "Avoiding hands-on experience"
    ],
    correctAnswer: 1
  }
];

export function VideoSubmissionPage({ onSubmit }: VideoSubmissionPageProps) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userName, setUserName] = useState('');

  const handleAnswerChange = (questionId: number, answerIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  const calculateScore = () => {
    // All answered questions are considered correct
    return Object.keys(answers).length;
  };

  const handleSubmitQuiz = () => {
    const allAnswered = quizQuestions.every(q => answers[q.id] !== undefined);
    
    if (!allAnswered) {
      alert('Please answer all questions before submitting.');
      return;
    }

    if (!userName.trim()) {
      alert('Please enter your name for the certificate.');
      return;
    }

    setShowResults(true);
    
    // Wait a moment to show results, then proceed to certification
    setTimeout(() => {
      setIsSubmitting(true);
      setTimeout(() => {
        // Proceed to next step (certification)
        onSubmit(
          'https://www.youtube.com/watch?v=VGFpV3Qj4as', 
          'Educational', 
          'Educational Content Fundamentals',
          userName.trim()
        );
      }, 1500);
    }, 2000);
  };

  const score = calculateScore();
  const totalQuestions = quizQuestions.length;
  const passed = true; // Always pass

  return (
    <div className="min-h-screen bg-white py-12" style={{ fontFamily: "var(--display)" }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h1 className="mb-2">CERtification Quiz</h1>
          <p className="text-gray-600">
            Answer the following questions to verify your understanding
          </p>
        </div>

        <Card className="p-8 shadow-xl">
          {!showResults ? (
            <div className="space-y-8">
              {/* Name input field */}
              <div className="pb-6 border-b border-gray-200">
                <Label htmlFor="userName" className="text-gray-900 mb-3 flex items-center gap-2">
                  <User className="w-5 h-5 text-red-600" />
                  Your Name (for the CERtificate)
                </Label>
                <Input
                  id="userName"
                  type="text"
                  placeholder="Enter your full name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="mt-2"
                  required
                />
              </div>
              
              {quizQuestions.map((question, index) => (
                <div key={question.id} className="pb-6 border-b border-gray-200 last:border-0">
                  <div className="flex gap-3 mb-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center">
                      {index + 1}
                    </div>
                    <h3 className="text-gray-900 flex-1">{question.question}</h3>
                  </div>
                  
                  <RadioGroup
                    value={answers[question.id]?.toString()}
                    onValueChange={(value) => handleAnswerChange(question.id, parseInt(value))}
                  >
                    <div className="space-y-3 ml-11">
                      {question.options.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex items-center space-x-3">
                          <RadioGroupItem 
                            value={optionIndex.toString()} 
                            id={`q${question.id}-option${optionIndex}`}
                            className="border-gray-300"
                          />
                          <Label 
                            htmlFor={`q${question.id}-option${optionIndex}`}
                            className="text-gray-700 cursor-pointer flex-1"
                          >
                            {option}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </div>
              ))}

              <div className="pt-6">
                <Button 
                  onClick={handleSubmitQuiz}
                  className="w-full bg-red-600 hover:bg-red-700 h-12 shadow-lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Processing...' : 'Submit Quiz'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className={`w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center ${
                passed ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {passed ? (
                  <CheckCircle2 className="w-12 h-12 text-green-600" />
                ) : (
                  <Circle className="w-12 h-12 text-red-600" />
                )}
              </div>
              
              <h2 className="mb-4">Quiz Results</h2>
              <p className="text-gray-600 mb-6">
                You scored <span className="text-2xl font-semibold text-gray-900">{score}</span> out of {totalQuestions}
              </p>

              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800">
                    Congratulations! You've passed the quiz and are being CERtified.
                  </p>
                </div>
                {isSubmitting && (
                  <div className="flex items-center justify-center gap-2 text-gray-600">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                    <span>Generating your CERtificate...</span>
                  </div>
                )}
              </div>

              {/* Show all answers as correct */}
              <div className="mt-8 space-y-4 text-left">
                <h3 className="text-center text-gray-900">Answer Review</h3>
                {quizQuestions.map((question, index) => {
                  const userAnswer = answers[question.id];
                  
                  return (
                    <div key={question.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex gap-2 items-start mb-2">
                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-gray-700">{question.question}</p>
                      </div>
                      <p className="text-sm text-gray-600 ml-7">
                        Your answer: <span className="text-green-700">
                          {question.options[userAnswer]}
                        </span>
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
