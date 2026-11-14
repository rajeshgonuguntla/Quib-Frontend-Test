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

const kickerStyle = (C: Theme) => ({
  color: C.text3,
  fontFamily: 'var(--mono)',
  letterSpacing: '0.04em',
});

export function QuizSetupChrome({
  C,
  children,
  backChevron = true,
}: {
  C: Theme;
  children: ReactNode;
  backChevron?: boolean;
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
        className="sticky top-0 z-50"
        style={{ background: C.bg, borderBottom: `1px solid ${C.border}` }}
      >
        <div className="mx-auto flex h-14 w-full max-w-[1080px] items-center justify-between px-5 md:h-[3.75rem] md:px-10">
          <Link to="/dashboard" className="no-underline" style={{ color: C.text }}>
            <QuibLogo size={22} wordmarkClassName="text-[1.05rem] font-[700] tracking-tight" />
          </Link>
          <Link
            to="/dashboard"
            className="inline-flex h-11 items-center gap-0.5 text-[13px] no-underline"
            style={{ color: C.text2 }}
          >
            {backChevron ? <ChevronLeft className="size-3.5" strokeWidth={2.2} /> : null}
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
  const tableCols = 'md:grid-cols-[minmax(0,1fr)_8.75rem_3.6rem]';

  const startButton = (
    <button
      type="button"
      onClick={onStart}
      className="inline-flex h-12 w-full items-center justify-center rounded-2xl text-[15px] font-semibold text-white transition-opacity hover:opacity-90"
      style={{ background: C.red }}
    >
      Start quiz
    </button>
  );

  const shareBlock = (
    <div className="flex flex-col gap-2.5">
      <p className="text-[11px]" style={kickerStyle(C)}>
        Share with students
      </p>
      <div className="flex gap-2">
        <div
          className="min-h-11 min-w-0 flex-1 truncate rounded-xl px-3 py-2.5 text-[12px]"
          style={{ background: C.bg1, color: C.text2, fontFamily: 'var(--mono)' }}
          title={shareUrl}
        >
          {shareUrl}
        </div>
        <button
          type="button"
          onClick={onCopyLink}
          className="inline-flex h-11 shrink-0 items-center rounded-xl px-3.5 text-[13px] font-medium"
          style={{ border: `1px solid ${C.border}`, color: C.text, background: 'transparent' }}
        >
          {copied ? 'Copied' : 'Copy link'}
        </button>
      </div>
      <button
        type="button"
        disabled={!canDownloadHtml}
        onClick={onDownloadHtml}
        className="inline-flex h-11 w-full items-center justify-center rounded-xl text-[13px] font-semibold disabled:cursor-not-allowed disabled:opacity-50"
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
    <div className="mx-auto grid w-full max-w-[1080px] grid-cols-1 gap-10 px-5 py-8 pb-28 md:grid-cols-[minmax(0,1fr)_20rem] md:items-start md:gap-12 md:px-10 md:py-9 md:pb-12">
      <div className="min-w-0">
        <p className="mb-2.5 text-[11px]" style={kickerStyle(C)}>
          Quiz ready
        </p>
        <h1
          className="text-[1.85rem] font-bold leading-[1.12] tracking-[-0.04em] md:text-[2.5rem]"
          style={{ color: C.text }}
        >
          {title}
        </h1>

        <div className="mt-5 hidden flex-wrap items-center gap-2 md:flex">
          {pills.map((pill) => (
            <span
              key={pill}
              className="inline-flex h-[26px] items-center gap-1 rounded-full px-2.5 text-[11px] font-medium"
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
          className="mt-8 grid grid-cols-3 border-y py-6 text-center"
          style={{ borderColor: C.border }}
        >
          <div>
            <p className="text-[2rem] font-bold tabular-nums tracking-[-0.04em]">{questionCount}</p>
            <p className="mt-1 text-[12px]" style={{ color: C.text3 }}>
              questions
            </p>
          </div>
          <div style={{ borderLeft: `1px solid ${C.border}`, borderRight: `1px solid ${C.border}` }}>
            <p className="text-[2rem] font-bold tabular-nums tracking-[-0.04em]">{minutes}</p>
            <p className="mt-1 text-[12px]" style={{ color: C.text3 }}>
              min
            </p>
          </div>
          <div>
            <p className="text-[2rem] font-bold tabular-nums tracking-[-0.04em]">{sectionCount}</p>
            <p className="mt-1 text-[12px]" style={{ color: C.text3 }}>
              sections
            </p>
          </div>
        </div>

        {showTableHead ? (
          <section className="mt-9">
            <p className="mb-3 text-[11px]" style={kickerStyle(C)}>
              Sections
            </p>
            <div
              className={`mb-0 hidden grid gap-x-6 pb-2 text-[11px] md:grid ${tableCols}`}
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
                    className="py-4"
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
                    <div className={`hidden items-start gap-x-6 md:grid ${tableCols}`}>
                      <div>
                        <p className="text-[15px] font-semibold leading-snug">{row.title}</p>
                        {row.subtitle ? (
                          <p className="mt-0.5 text-[13px]" style={{ color: C.text3 }}>
                            {row.subtitle}
                          </p>
                        ) : null}
                      </div>
                      <p className="pt-0.5 text-right text-[14px]" style={{ color: C.text2 }}>
                        {row.questionsLabel}
                      </p>
                      <p className="pt-0.5 text-right text-[14px]" style={{ color: C.text2 }}>
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
          className="sticky top-[4.75rem] flex flex-col gap-3.5 rounded-[18px] p-5"
          style={{ border: `1px solid ${C.border}`, background: C.bg }}
        >
          {startButton}
          <p className="text-center text-[12px]" style={{ color: C.text3 }}>
            Results available after the quiz
          </p>
          <div className="my-0.5 h-px" style={{ background: C.border }} />
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
