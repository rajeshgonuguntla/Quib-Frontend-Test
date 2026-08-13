import { useEffect, useState, type CSSProperties } from 'react';
import axios from 'axios';
import { Loader2, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  generateLessonStudyTool,
  type LessonStudyToolResponse,
  type StudyBlank,
  type StudyExamQuestion,
  type StudyFlashcard,
  type StudyToolType,
} from '../api/studyRailApi';
import { LessonNotes } from './LessonNotes';

type Theme = {
  text: string;
  text2: string;
  text3: string;
  border: string;
  bg1: string;
  bg2: string;
  red: string;
  redDim: string;
};

type Props = {
  courseId: string;
  lessonId: string;
  tool: StudyToolType;
  theme: Theme;
  isDark: boolean;
  /** Shown for notes until AI generate succeeds */
  fallbackNotes?: string;
};

function getError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string } | undefined;
    if (err.response?.status === 403) {
      return data?.message || 'Start learning to use study tools.';
    }
    if (err.response?.status === 429) {
      return 'Too many study-tool requests. Please wait and try again.';
    }
    return data?.message || err.message || 'Unable to generate study tools.';
  }
  if (err instanceof Error) return err.message;
  return 'Unable to generate study tools.';
}

export function StudyRailPanel({ courseId, lessonId, tool, theme: C, isDark, fallbackNotes }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<LessonStudyToolResponse | null>(null);

  useEffect(() => {
    setData(null);
    setError(null);
  }, [courseId, lessonId, tool]);

  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await generateLessonStudyTool(courseId, lessonId, tool);
      setData(res);
    } catch (err) {
      setError(getError(err));
    } finally {
      setLoading(false);
    }
  };

  const title =
    tool === 'notes' ? 'AI study notes'
      : tool === 'flashcards' ? 'Flashcards'
        : tool === 'blanks' ? 'Fill in blanks'
          : 'Create your own exam';

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[0.95rem] font-[600]" style={{ color: C.text }}>{title}</p>
          <p className="text-[0.75rem] mt-0.5" style={{ color: C.text3 }}>
            Generated from this lesson&apos;s transcript / study material
            {data?.source ? ` · source: ${data.source}` : ''}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void generate()}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-[0.8rem] font-[600] cursor-pointer disabled:opacity-60"
          style={{ background: C.red, color: '#fff', border: 'none' }}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
          {data ? 'Regenerate' : 'Generate'}
        </button>
      </div>

      {error && (
        <p className="text-[0.8rem]" style={{ color: C.red }}>{error}</p>
      )}

      {loading && !data && (
        <div className="rounded-2xl p-8 flex flex-col items-center gap-3" style={{ background: C.bg1, border: `1px solid ${C.border}` }}>
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: C.red }} />
          <p className="text-[0.85rem]" style={{ color: C.text2 }}>Building {title.toLowerCase()}…</p>
        </div>
      )}

      {!loading && !data && tool === 'notes' && fallbackNotes?.trim() && (
        <div className="rounded-2xl p-6" style={{ background: C.bg1, border: `1px solid ${C.border}` }}>
          <p className="text-[0.7rem] uppercase tracking-widest mb-4" style={{ color: C.text3, fontFamily: 'var(--mono)' }}>
            Saved course notes
          </p>
          <LessonNotes content={fallbackNotes} theme={C} />
          <p className="text-[0.75rem] mt-4" style={{ color: C.text3 }}>
            Or generate fresher AI notes from the transcript above.
          </p>
        </div>
      )}

      {!loading && !data && !(tool === 'notes' && fallbackNotes?.trim()) && (
        <div className="rounded-2xl p-6" style={{ background: C.bg1, border: `1px solid ${C.border}` }}>
          <p className="text-[0.85rem] leading-relaxed" style={{ color: C.text2 }}>
            Tap Generate to create {title.toLowerCase()} from this lesson.
          </p>
        </div>
      )}

      {data?.type === 'notes' && data.notes?.markdown && (
        <div className="rounded-2xl p-6" style={{ background: C.bg1, border: `1px solid ${C.border}` }}>
          <LessonNotes content={data.notes.markdown} theme={C} />
        </div>
      )}

      {data?.type === 'flashcards' && data.flashcards && (
        <FlashcardDeck cards={data.flashcards} C={C} />
      )}

      {data?.type === 'blanks' && data.blanks && (
        <BlanksQuiz items={data.blanks} C={C} isDark={isDark} />
      )}

      {data?.type === 'exam' && data.exam && (
        <ExamQuiz questions={data.exam} C={C} isDark={isDark} />
      )}
    </div>
  );
}

function FlashcardDeck({ cards, C }: { cards: StudyFlashcard[]; C: Theme }) {
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const card = cards[idx];

  useEffect(() => {
    setFlipped(false);
  }, [idx]);

  if (!card) return null;

  const faceBase: CSSProperties = {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '1.5rem',
    borderRadius: '1rem',
    background: C.bg1,
    border: `1px solid ${C.border}`,
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
  };

  return (
    <div className="space-y-4">
      <div style={{ perspective: 1200 }}>
        <button
          type="button"
          onClick={() => setFlipped((f) => !f)}
          aria-label={flipped ? 'Show prompt' : 'Show answer'}
          className="relative w-full min-h-[200px] cursor-pointer text-left"
          style={{
            border: 'none',
            background: 'transparent',
            padding: 0,
            transformStyle: 'preserve-3d',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            transition: 'transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          {/* Front */}
          <div style={faceBase}>
            <div>
              <p className="text-[0.68rem] uppercase tracking-widest mb-3" style={{ color: C.red, fontFamily: 'var(--mono)' }}>
                Prompt · {idx + 1}/{cards.length}
              </p>
              <p className="text-[1rem] leading-relaxed font-[500]" style={{ color: C.text }}>
                {card.front}
              </p>
            </div>
            <p className="text-[0.72rem]" style={{ color: C.text3 }}>Tap to flip</p>
          </div>
          {/* Back */}
          <div
            style={{
              ...faceBase,
              transform: 'rotateY(180deg)',
            }}
          >
            <div>
              <p className="text-[0.68rem] uppercase tracking-widest mb-3" style={{ color: C.red, fontFamily: 'var(--mono)' }}>
                Answer · {idx + 1}/{cards.length}
              </p>
              <p className="text-[1rem] leading-relaxed font-[500]" style={{ color: C.text }}>
                {card.back}
              </p>
            </div>
            <p className="text-[0.72rem]" style={{ color: C.text3 }}>Tap to flip back</p>
          </div>
        </button>
      </div>
      <div className="flex items-center justify-between">
        <button
          type="button"
          disabled={idx === 0}
          onClick={() => setIdx((i) => Math.max(0, i - 1))}
          className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-[0.8rem] cursor-pointer disabled:opacity-40"
          style={{ background: C.bg2, border: `1px solid ${C.border}`, color: C.text2 }}
        >
          <ChevronLeft className="w-4 h-4" /> Prev
        </button>
        <button
          type="button"
          disabled={idx >= cards.length - 1}
          onClick={() => setIdx((i) => Math.min(cards.length - 1, i + 1))}
          className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-[0.8rem] cursor-pointer disabled:opacity-40"
          style={{ background: C.bg2, border: `1px solid ${C.border}`, color: C.text2 }}
        >
          Next <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function BlanksQuiz({ items, C, isDark }: { items: StudyBlank[]; C: Theme; isDark: boolean }) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const score = items.reduce((acc, item, i) => {
    const a = (answers[i] ?? '').trim().toLowerCase();
    const expected = item.answer.trim().toLowerCase();
    return acc + (a && a === expected ? 1 : 0);
  }, 0);

  return (
    <div className="space-y-4">
      {items.map((item, i) => {
        const user = answers[i] ?? '';
        const ok = submitted && user.trim().toLowerCase() === item.answer.trim().toLowerCase();
        const bad = submitted && !ok;
        return (
          <div key={i} className="rounded-2xl p-5" style={{ background: C.bg1, border: `1px solid ${C.border}` }}>
            <p className="text-[0.875rem] mb-3 leading-relaxed" style={{ color: C.text }}>
              <span style={{ color: C.red, fontFamily: 'var(--mono)', fontSize: '0.72rem', marginRight: 8 }}>Q{i + 1}</span>
              {item.sentence}
            </p>
            {item.hint?.trim() && !submitted && (
              <p className="text-[0.72rem] mb-2" style={{ color: C.text3 }}>Hint: {item.hint}</p>
            )}
            <input
              value={user}
              disabled={submitted}
              onChange={(e) => setAnswers((prev) => ({ ...prev, [i]: e.target.value }))}
              placeholder="Your answer"
              className="w-full rounded-xl px-3 py-2.5 text-[0.85rem] outline-none"
              style={{
                background: C.bg2,
                border: `1px solid ${ok ? 'rgba(34,197,94,0.45)' : bad ? 'rgba(225,6,0,0.4)' : C.border}`,
                color: C.text,
              }}
            />
            {submitted && (
              <p className="text-[0.75rem] mt-2" style={{ color: ok ? '#22c55e' : C.red }}>
                {ok ? 'Correct' : `Answer: ${item.answer}`}
              </p>
            )}
          </div>
        );
      })}
      {!submitted ? (
        <button
          type="button"
          onClick={() => setSubmitted(true)}
          disabled={Object.keys(answers).length < items.length}
          className="px-6 py-2.5 rounded-lg text-[0.85rem] font-[600] cursor-pointer disabled:opacity-50"
          style={{ background: C.red, color: '#fff', border: 'none' }}
        >
          Check answers
        </button>
      ) : (
        <div className="rounded-2xl p-5" style={{ background: isDark ? 'rgba(34,197,94,0.08)' : 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.25)' }}>
          <p className="font-[600]" style={{ color: C.text }}>Score: {score}/{items.length}</p>
          <button
            type="button"
            onClick={() => { setSubmitted(false); setAnswers({}); }}
            className="mt-3 text-[0.8rem] underline cursor-pointer"
            style={{ background: 'none', border: 'none', color: C.text2 }}
          >
            Try again
          </button>
        </div>
      )}
    </div>
  );
}

function ExamQuiz({ questions, C, isDark }: { questions: StudyExamQuestion[]; C: Theme; isDark: boolean }) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const score = questions.reduce((acc, q, i) => acc + (answers[i] === q.correctAnswerIndex ? 1 : 0), 0);

  return (
    <div className="space-y-5">
      {questions.map((q, qi) => (
        <div key={qi} className="rounded-2xl p-6" style={{ background: C.bg1, border: `1px solid ${C.border}` }}>
          <p className="text-[0.875rem] font-[500] mb-4 leading-relaxed" style={{ color: C.text }}>
            <span style={{ color: C.red, fontFamily: 'var(--mono)', fontSize: '0.72rem', marginRight: 8 }}>Q{qi + 1}</span>
            {q.question}
          </p>
          <div className="space-y-2">
            {q.options.map((opt, oi) => {
              const selected = answers[qi] === oi;
              const correct = submitted && oi === q.correctAnswerIndex;
              const wrong = submitted && selected && oi !== q.correctAnswerIndex;
              return (
                <button
                  key={oi}
                  type="button"
                  onClick={() => !submitted && setAnswers((prev) => ({ ...prev, [qi]: oi }))}
                  className="w-full text-left px-4 py-3 rounded-xl text-[0.82rem]"
                  style={{
                    background: correct
                      ? 'rgba(34,197,94,0.12)'
                      : wrong
                        ? 'rgba(225,6,0,0.1)'
                        : selected
                          ? isDark ? 'rgba(225,6,0,0.1)' : 'rgba(225,6,0,0.06)'
                          : isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.025)',
                    border: `1px solid ${correct ? 'rgba(34,197,94,0.35)' : wrong ? 'rgba(225,6,0,0.3)' : selected ? C.red : C.border}`,
                    color: correct ? '#22c55e' : wrong ? C.red : C.text2,
                    cursor: submitted ? 'default' : 'pointer',
                  }}
                >
                  <span className="font-[600] mr-2" style={{ fontFamily: 'var(--mono)', fontSize: '0.72rem' }}>
                    {String.fromCharCode(65 + oi)}.
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>
          {submitted && q.explanation?.trim() && (
            <p className="text-[0.78rem] mt-3 leading-relaxed" style={{ color: C.text2 }}>
              {q.explanation}
            </p>
          )}
        </div>
      ))}
      {!submitted ? (
        <button
          type="button"
          disabled={Object.keys(answers).length < questions.length}
          onClick={() => setSubmitted(true)}
          className="px-8 py-3 rounded-lg text-[0.875rem] font-[600] cursor-pointer disabled:opacity-50"
          style={{ background: C.red, color: '#fff', border: 'none' }}
        >
          Submit exam
        </button>
      ) : (
        <div className="rounded-2xl p-6" style={{ background: score >= Math.ceil(questions.length * 0.7) ? 'rgba(34,197,94,0.08)' : 'rgba(225,6,0,0.06)', border: `1px solid ${score >= Math.ceil(questions.length * 0.7) ? 'rgba(34,197,94,0.25)' : 'rgba(225,6,0,0.2)'}` }}>
          <p className="font-[600] text-[0.95rem]" style={{ color: C.text }}>
            {score}/{questions.length} correct ({Math.round((score / Math.max(questions.length, 1)) * 100)}%)
          </p>
          <button
            type="button"
            onClick={() => { setSubmitted(false); setAnswers({}); }}
            className="mt-3 text-[0.8rem] underline cursor-pointer"
            style={{ background: 'none', border: 'none', color: C.text2 }}
          >
            Retake
          </button>
        </div>
      )}
    </div>
  );
}
