import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { Check, ChevronLeft } from 'lucide-react';
import { QuibLogo } from './QuibLogo';
import type { ExamBlueprintSectionRow } from '../api/quizApi';
import type { getC } from './ThemeContext';

type Theme = ReturnType<typeof getC>;

type QuizReadyScreenProps = {
  C: Theme;
  title: string;
  practiceLabel?: string;
  difficulty: string;
  readinessLabel: string;
  questionCount: number;
  minutes: number;
  sectionCount: number;
  sections: ExamBlueprintSectionRow[];
  shareUrl: string;
  copied: boolean;
  canDownloadHtml: boolean;
  onCopyLink: () => void;
  onDownloadHtml: () => void;
  onStart: () => void;
};

export function QuizSetupChrome({
  C,
  children,
}: {
  C: Theme;
  children: ReactNode;
}) {
  return (
    <div
      className="flex min-h-dvh flex-col"
      style={{
        background: C.bg,
        color: C.text,
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <header
        className="sticky top-0 z-50 px-5 py-3.5 md:px-8"
        style={{ background: C.bg, borderBottom: `1px solid ${C.border}` }}
      >
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3">
          <Link to="/dashboard" className="no-underline" style={{ color: C.text }}>
            <QuibLogo size={20} wordmarkClassName="text-[1.05rem] font-[700] tracking-tight" />
          </Link>
          <Link
            to="/dashboard"
            className="inline-flex h-11 items-center gap-1 text-[13px] no-underline"
            style={{ color: C.text2 }}
          >
            <ChevronLeft className="size-3.5" strokeWidth={2.2} />
            Back to dashboard
          </Link>
        </div>
      </header>
      {children}
    </div>
  );
}

export function QuizReadyScreen({
  C,
  title,
  practiceLabel,
  difficulty,
  readinessLabel,
  questionCount,
  minutes,
  sectionCount,
  sections,
  shareUrl,
  copied,
  canDownloadHtml,
  onCopyLink,
  onDownloadHtml,
  onStart,
}: QuizReadyScreenProps) {
  const difficultyLabel = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  const pills = [practiceLabel, difficultyLabel, readinessLabel].filter(Boolean) as string[];
  const showTableHead = sections.length > 0;

  const startButton = (
    <button
      type="button"
      onClick={onStart}
      className="inline-flex h-12 w-full items-center justify-center rounded-xl text-[15px] font-semibold text-white transition-opacity hover:opacity-90"
      style={{ background: C.red }}
    >
      Start quiz
    </button>
  );

  const shareBlock = (
    <div className="flex flex-col gap-3">
      <p
        className="text-[11px]"
        style={{ color: C.text3, fontFamily: 'var(--mono)' }}
      >
        Share with students
      </p>
      <div className="flex gap-2">
        <div
          className="min-h-11 min-w-0 flex-1 truncate rounded-lg px-3 py-2.5 text-[12px]"
          style={{ background: C.bg2, color: C.text2, fontFamily: 'var(--mono)' }}
          title={shareUrl}
        >
          {shareUrl}
        </div>
        <button
          type="button"
          onClick={onCopyLink}
          className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-lg px-3.5 text-[13px] font-medium"
          style={{ border: `1px solid ${C.border}`, color: C.text, background: 'transparent' }}
        >
          {copied ? <Check className="size-3.5" strokeWidth={2.2} /> : null}
          {copied ? 'Copied' : 'Copy link'}
        </button>
      </div>
      <button
        type="button"
        disabled={!canDownloadHtml}
        onClick={onDownloadHtml}
        className="inline-flex h-11 w-full items-center justify-center rounded-lg text-[13px] font-semibold disabled:cursor-not-allowed disabled:opacity-50"
        style={{ border: `1px solid ${C.border}`, background: 'transparent', color: C.text }}
      >
        Download offline HTML
      </button>
      <p className="text-[12px] leading-relaxed" style={{ color: C.text3 }}>
        Students open the same intro screen either way.
      </p>
    </div>
  );

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-5 py-8 pb-28 md:grid md:grid-cols-[minmax(0,1fr)_minmax(16.5rem,20.5rem)] md:items-start md:gap-12 md:px-8 md:py-10 md:pb-10 lg:gap-16">
      <div className="min-w-0">
        <p
          className="mb-2 text-[11px]"
          style={{ color: C.text3, fontFamily: 'var(--mono)' }}
        >
          Quiz ready
        </p>
        <h1
          className="text-[1.75rem] font-bold leading-[1.15] tracking-[-0.035em] md:text-[2.15rem]"
          style={{ color: C.text }}
        >
          {title}
        </h1>

        <div className="mt-4 hidden flex-wrap items-center gap-2 md:flex">
          {pills.map((pill) => (
            <span
              key={pill}
              className="inline-flex h-7 items-center gap-1 rounded-full px-3 text-[11px] font-medium"
              style={{ border: `1px solid ${C.border}`, color: C.text2 }}
            >
              {pill === readinessLabel ? (
                <Check className="size-3" strokeWidth={2.4} style={{ color: C.red }} />
              ) : null}
              {pill}
            </span>
          ))}
        </div>
        <p className="mt-3 text-[13px] leading-relaxed md:hidden" style={{ color: C.text2 }}>
          {pills.map((pill, i) => (
            <span key={pill}>
              {i > 0 ? ' · ' : ''}
              {pill === readinessLabel ? (
                <Check className="mr-1 inline size-3 align-[-2px]" strokeWidth={2.4} style={{ color: C.red }} />
              ) : null}
              {pill}
            </span>
          ))}
        </p>

        <div
          className="mt-7 grid grid-cols-3 border-y py-5 text-center"
          style={{ borderColor: C.border }}
        >
          <div>
            <p className="text-[1.65rem] font-bold tabular-nums tracking-[-0.04em]">{questionCount}</p>
            <p className="mt-0.5 text-[12px]" style={{ color: C.text3 }}>
              questions
            </p>
          </div>
          <div style={{ borderLeft: `1px solid ${C.border}`, borderRight: `1px solid ${C.border}` }}>
            <p className="text-[1.65rem] font-bold tabular-nums tracking-[-0.04em]">{minutes}</p>
            <p className="mt-0.5 text-[12px]" style={{ color: C.text3 }}>
              min
            </p>
          </div>
          <div>
            <p className="text-[1.65rem] font-bold tabular-nums tracking-[-0.04em]">{sectionCount}</p>
            <p className="mt-0.5 text-[12px]" style={{ color: C.text3 }}>
              sections
            </p>
          </div>
        </div>

        {showTableHead ? (
          <section className="mt-8">
            <p
              className="mb-3 text-[11px]"
              style={{ color: C.text3, fontFamily: 'var(--mono)' }}
            >
              Sections
            </p>
            <div
              className="mb-1 hidden grid-cols-[minmax(0,1fr)_9.5rem_4.75rem] gap-3 pb-2 text-[11px] md:grid"
              style={{ color: C.text3, borderBottom: `1px solid ${C.border}` }}
            >
              <span>Section</span>
              <span className="text-right">Questions</span>
              <span className="text-right">Time</span>
            </div>
            <ul>
              {sections.map((row) => {
                const counted = /^\d+$/.test(row.questionsLabel);
                const phoneMeta = counted
                  ? [row.subtitle, `${row.questionsLabel} questions`].filter(Boolean).join(' · ')
                  : null;
                return (
                  <li
                    key={`${row.title}-${row.subtitle ?? ''}`}
                    className="py-3.5"
                    style={{ borderBottom: `1px solid ${C.border}` }}
                  >
                    <div className="flex items-start justify-between gap-4 md:hidden">
                      <div className="min-w-0">
                        <p className="text-[15px] font-semibold leading-snug">{row.title}</p>
                        {phoneMeta ? (
                          <p className="mt-0.5 text-[13px]" style={{ color: C.text2 }}>
                            {phoneMeta}
                          </p>
                        ) : (
                          <>
                            {row.subtitle ? (
                              <p className="mt-0.5 text-[13px]" style={{ color: C.text3 }}>
                                {row.subtitle}
                              </p>
                            ) : null}
                            <p className="mt-0.5 text-[13px]" style={{ color: C.text2 }}>
                              {row.questionsLabel}
                            </p>
                          </>
                        )}
                      </div>
                      <p className="shrink-0 pt-0.5 text-[13px]" style={{ color: C.text2 }}>
                        {row.minutes} min
                      </p>
                    </div>
                    <div className="hidden grid-cols-[minmax(0,1fr)_9.5rem_4.75rem] items-start gap-3 md:grid">
                      <div>
                        <p className="text-[15px] font-semibold leading-snug">{row.title}</p>
                        {row.subtitle ? (
                          <p className="mt-0.5 text-[13px]" style={{ color: C.text3 }}>
                            {row.subtitle}
                          </p>
                        ) : null}
                      </div>
                      <p className="text-right text-[14px]" style={{ color: C.text2 }}>
                        {row.questionsLabel}
                      </p>
                      <p className="text-right text-[14px]" style={{ color: C.text2 }}>
                        {row.minutes} min
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}

        <div className="mt-8 flex flex-col gap-6 md:hidden">
          {shareBlock}
        </div>
      </div>

      <aside className="hidden md:block">
        <div
          className="sticky top-24 flex flex-col gap-4 rounded-2xl p-5"
          style={{ border: `1px solid ${C.border}`, background: C.bg }}
        >
          {startButton}
          <p className="text-center text-[12px]" style={{ color: C.text3 }}>
            Results available after the quiz
          </p>
          <div className="h-px" style={{ background: C.border }} />
          {shareBlock}
        </div>
      </aside>

      <div
        className="fixed inset-x-0 bottom-0 z-40 border-t px-5 py-3 md:hidden"
        style={{
          background: C.bg,
          borderColor: C.border,
          paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))',
        }}
      >
        {startButton}
      </div>
    </div>
  );
}
