import { ChevronDown, ChevronUp } from 'lucide-react';
import { BRAND_FEEDBACK_RED } from '../brand';
import type { getC } from './ThemeContext';
import type { ResultStatus } from '../utils/resultsReview';

type Theme = ReturnType<typeof getC>;

export type ResultsFilter = 'all' | 'wrong' | 'correct' | 'skipped';

export type ResultsQuestionRow = {
  index: number;
  prompt: string;
  sectionKicker?: string;
  status: ResultStatus;
  explanation?: string;
  userAnswer?: string;
  correctAnswer?: string;
};

export type ResultsSectionScore = {
  label: string;
  percent: number;
  correct: number;
  total: number;
};

type ResultsScreenProps = {
  C: Theme;
  score: number;
  correct: number;
  total: number;
  passed: boolean;
  examMeta: string;
  summary: string;
  filter: ResultsFilter;
  onFilter: (next: ResultsFilter) => void;
  counts: Record<ResultsFilter, number>;
  questions: ResultsQuestionRow[];
  sections: ResultsSectionScore[];
  expanded: Set<number>;
  onToggle: (index: number) => void;
  onJump: (index: number) => void;
  onRetake: () => void;
  onDownload: () => void;
  canDownload: boolean;
};

export function ResultsScreen({
  C,
  score,
  correct,
  total,
  passed,
  examMeta,
  summary,
  filter,
  onFilter,
  counts,
  questions,
  sections,
  expanded,
  onToggle,
  onJump,
  onRetake,
  onDownload,
  canDownload,
}: ResultsScreenProps) {
  const visible = questions.filter((q) => (filter === 'all' ? true : q.status === filter));

  const retake = (
    <button
      type="button"
      onClick={onRetake}
      className="inline-flex h-12 w-full items-center justify-center rounded-lg text-[15px] font-semibold text-white"
      style={{ background: C.red }}
    >
      Retake quiz
    </button>
  );
  const download = (
    <button
      type="button"
      disabled={!canDownload}
      onClick={onDownload}
      className="inline-flex h-12 w-full items-center justify-center rounded-lg text-[15px] font-semibold disabled:cursor-not-allowed disabled:opacity-50"
      style={{ border: `1px solid ${C.border}`, background: 'transparent', color: C.text }}
    >
      Download report
    </button>
  );

  const filters: { id: ResultsFilter; label: string }[] = [
    { id: 'all', label: `All ${counts.all}` },
    { id: 'wrong', label: `Wrong ${counts.wrong}` },
    { id: 'correct', label: `Correct ${counts.correct}` },
    { id: 'skipped', label: `Skipped ${counts.skipped}` },
  ];

  return (
    <div className="mx-auto grid w-full max-w-[1080px] grid-cols-1 gap-10 px-5 py-8 pb-28 md:grid-cols-[minmax(0,1fr)_20rem] md:items-start md:gap-12 md:px-10 md:py-9 md:pb-12">
      <div className="min-w-0">
        <p
          className="mb-2.5 text-[11px]"
          style={{ color: C.text3, fontFamily: 'var(--mono)', letterSpacing: '0.04em' }}
        >
          Results
        </p>
        <h1
          className="text-[1.85rem] font-bold leading-[1.12] tracking-[-0.04em] md:text-[2.5rem]"
          style={{ color: C.text }}
        >
          Your results
        </h1>

        <div className="mt-6 flex flex-wrap items-end gap-x-4 gap-y-2">
          <p className="text-[3.25rem] font-bold leading-none tracking-[-0.05em] tabular-nums md:text-[3.75rem]">
            {score}%
          </p>
          <div className="mb-1.5">
            <p className="text-[15px] font-semibold">
              {correct} of {total} correct
            </p>
            <span
              className="mt-1 inline-flex h-6 items-center rounded-md px-1.5 text-[11px] font-medium"
              style={{ border: `1px solid ${C.border}`, color: C.text2 }}
            >
              {passed ? 'Passed' : 'Did not pass'}
            </span>
          </div>
        </div>

        {examMeta ? (
          <p className="mt-4 text-[13px]" style={{ color: C.text3 }}>
            {examMeta}
          </p>
        ) : null}
        <p className="mt-2 max-w-xl text-[15px] leading-relaxed" style={{ color: C.text2 }}>
          {summary}
        </p>

        <div className="mt-6 flex gap-1 overflow-x-auto">
          {filters.map((f) => {
            const on = filter === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => onFilter(f.id)}
                className="inline-flex h-11 shrink-0 items-center rounded-lg px-3.5 text-[13px] font-medium"
                style={{
                  background: on ? C.bg2 : 'transparent',
                  color: on ? C.text : C.text2,
                }}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        <ul className="mt-2" style={{ borderTop: `1px solid ${C.border}` }}>
          {visible.map((q) => {
            const open = expanded.has(q.index);
            return (
              <li
                key={q.index}
                id={`result-q-${q.index}`}
                className="scroll-mt-24 py-6"
                style={{ borderBottom: `1px solid ${C.border}` }}
              >
                <div className="mb-2 flex flex-col gap-1 md:flex-row md:items-baseline md:justify-between md:gap-3">
                  <p
                    className="text-[11px]"
                    style={{ color: C.text3, fontFamily: 'var(--mono)', letterSpacing: '0.04em' }}
                  >
                    Question {q.index}
                  </p>
                  {q.sectionKicker ? (
                    <p className="text-[12px]" style={{ color: C.text3 }}>
                      {q.sectionKicker}
                    </p>
                  ) : null}
                </div>
                <p className="text-[16px] font-semibold leading-snug">{q.prompt}</p>
                <p
                  className="mt-3 text-[13px] font-medium"
                  style={{
                    color:
                      q.status === 'correct'
                        ? C.text2
                        : q.status === 'skipped'
                          ? C.text3
                          : BRAND_FEEDBACK_RED,
                  }}
                >
                  {q.status === 'correct' ? 'Correct' : q.status === 'skipped' ? 'Skipped' : 'Incorrect'}
                </p>
                {q.explanation ? (
                  <button
                    type="button"
                    onClick={() => onToggle(q.index)}
                    className="mt-2 inline-flex h-11 items-center gap-1 text-[13px]"
                    style={{ color: C.text2 }}
                  >
                    Explanation
                    {open ? (
                      <ChevronUp className="size-3.5" strokeWidth={2.2} />
                    ) : (
                      <ChevronDown className="size-3.5" strokeWidth={2.2} />
                    )}
                  </button>
                ) : null}
                {open && q.explanation ? (
                  <div className="mt-1 text-[14px] leading-relaxed" style={{ color: C.text2 }}>
                    {q.status === 'wrong' && q.correctAnswer ? (
                      <p className="mb-2">
                        Correct answer: <span style={{ color: C.text }}>{q.correctAnswer}</span>
                      </p>
                    ) : null}
                    <p>{q.explanation}</p>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>

      <aside className="hidden md:block">
        <div
          className="sticky top-[4.75rem] rounded-[18px] p-5"
          style={{ border: `1px solid ${C.border}`, background: C.bg }}
        >
          <p className="text-[2.75rem] font-bold leading-none tracking-[-0.05em] tabular-nums">{score}%</p>
          <p className="mt-2 text-[13px]" style={{ color: C.text2 }}>
            {correct} of {total} correct
          </p>
          {sections.length > 0 ? (
            <ul className="mt-5" style={{ borderTop: `1px solid ${C.border}` }}>
              {sections.map((s) => (
                <li
                  key={s.label}
                  className="flex items-start justify-between gap-3 py-3"
                  style={{ borderBottom: `1px solid ${C.border}` }}
                >
                  <div>
                    <p className="text-[13px] font-semibold leading-snug">{s.label}</p>
                    <p className="mt-0.5 text-[12px]" style={{ color: C.text3 }}>
                      {s.correct} of {s.total}
                    </p>
                  </div>
                  <p className="text-[13px] tabular-nums" style={{ color: C.text2 }}>
                    {s.percent}%
                  </p>
                </li>
              ))}
            </ul>
          ) : null}

          {questions.length > 0 ? (
            <div className="mt-5">
              <p
                className="mb-3 text-[11px]"
                style={{ color: C.text3, fontFamily: 'var(--mono)', letterSpacing: '0.04em' }}
              >
                Jump to a question
              </p>
              <div className="grid grid-cols-9 gap-1">
                {questions.map((q) => (
                  <button
                    key={q.index}
                    type="button"
                    onClick={() => onJump(q.index)}
                    className="flex h-8 items-center justify-center rounded-[4px] text-[11px] font-medium tabular-nums"
                    style={{
                      border: `1px solid ${q.status === 'wrong' ? 'rgba(239,68,68,0.45)' : C.border}`,
                      color:
                        q.status === 'wrong'
                          ? BRAND_FEEDBACK_RED
                          : q.status === 'correct'
                            ? C.text
                            : C.text3,
                      background: 'transparent',
                    }}
                    aria-label={`Question ${q.index}, ${q.status}`}
                  >
                    {q.index}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-6 flex flex-col gap-2.5">
            {retake}
            {download}
          </div>
        </div>
      </aside>

      <div
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 gap-2 border-t px-5 py-3 md:hidden"
        style={{
          background: C.bg,
          borderColor: C.border,
          paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))',
        }}
      >
        {retake}
        {download}
      </div>
    </div>
  );
}
