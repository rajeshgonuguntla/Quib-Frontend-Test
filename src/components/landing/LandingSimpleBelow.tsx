import { Link } from 'react-router';
import { SIGN_IN_HASH_PATH } from '../../utils/navigation';

const FEATURE_CARDS = [
  {
    title: 'Notes',
    blurb: 'Capture key ideas from the lesson in one place.',
    preview: (
      <div className="space-y-2 p-3">
        <p className="text-[10px] font-medium text-[var(--landing-fg)]">Limits &amp; continuity</p>
        <div className="h-1.5 w-3/4 rounded-full bg-[var(--landing-border)]" />
        <div className="h-1.5 w-full rounded-full bg-[var(--landing-border)]" />
        <div className="h-1.5 w-5/6 rounded-full bg-[var(--landing-border)]" />
        <div className="mt-2 rounded border border-[var(--landing-border)] bg-[var(--landing-bg)] px-2 py-1.5 text-[9px] text-[var(--landing-muted)]">
          Definition → example → edge cases
        </div>
      </div>
    ),
  },
  {
    title: 'Tests',
    blurb: 'Stay ready for upcoming quizzes and exams.',
    preview: (
      <div className="space-y-2 p-3">
        <p className="text-[10px] font-medium text-[var(--landing-fg)]">Calculus midterm</p>
        <div className="flex gap-1">
          {['Mon', 'Tue', 'Wed', 'Thu'].map((d, i) => (
            <div
              key={d}
              className={`flex-1 rounded px-1 py-2 text-center text-[8px] ${
                i === 2 ? 'bg-[var(--brand,#ff7a1a)]/20 text-[var(--landing-fg)]' : 'bg-[var(--landing-bg)] text-[var(--landing-muted)]'
              }`}
            >
              {d}
            </div>
          ))}
        </div>
        <div className="h-1 w-full overflow-hidden rounded-full bg-[var(--landing-border)]">
          <div className="h-full w-2/3 rounded-full bg-[var(--brand,#ff7a1a)]" />
        </div>
      </div>
    ),
  },
  {
    title: 'Mock tests',
    blurb: 'Practice with questions that feel like the real thing.',
    preview: (
      <div className="space-y-2 p-3">
        <p className="text-[9px] text-[var(--landing-muted)]">Q3 · Derivatives</p>
        <p className="text-[10px] font-medium leading-snug text-[var(--landing-fg)]">What is the derivative of x²?</p>
        <div className="space-y-1">
          {['2x', 'x', '2'].map((opt, i) => (
            <div
              key={opt}
              className={`rounded border px-2 py-1 text-[9px] ${
                i === 0
                  ? 'border-[var(--brand,#ff7a1a)]/50 bg-[var(--brand,#ff7a1a)]/10 text-[var(--landing-fg)]'
                  : 'border-[var(--landing-border)] text-[var(--landing-muted)]'
              }`}
            >
              {String.fromCharCode(65 + i)}. {opt}
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    title: 'Past papers',
    blurb: 'Browse prior sets when you want extra practice.',
    preview: (
      <div className="flex items-end justify-center gap-2 p-3 pt-4">
        {[
          { y: '2024', h: 'h-14' },
          { y: '2023', h: 'h-11' },
          { y: '2022', h: 'h-9' },
        ].map((f) => (
          <div
            key={f.y}
            className={`flex ${f.h} w-12 flex-col justify-end rounded-t border border-[var(--landing-border)] bg-[var(--landing-bg)] px-1 pb-1`}
          >
            <span className="text-center text-[8px] text-[var(--landing-muted)]">{f.y}</span>
          </div>
        ))}
      </div>
    ),
  },
] as const;

const LEARN_CARDS = [
  {
    topic: 'Python in 4 hours',
    title: 'Python for Beginners',
    meta: '5 / 12 lessons',
    progress: 5 / 12,
    glyph: '>>>',
    wash: 'linear-gradient(145deg, rgba(59, 130, 246, 0.22) 0%, rgba(59, 130, 246, 0.04) 55%, transparent 100%)',
    glyphColor: 'rgba(37, 99, 235, 0.35)',
  },
  {
    topic: 'Calculus I',
    title: 'Limits & Derivatives',
    meta: '2 / 14 lessons',
    progress: 2 / 14,
    glyph: '∫',
    wash: 'linear-gradient(145deg, color-mix(in srgb, var(--brand, #ff7a1a) 28%, transparent) 0%, color-mix(in srgb, var(--brand, #ff7a1a) 6%, transparent) 55%, transparent 100%)',
    glyphColor: 'color-mix(in srgb, var(--brand, #ff7a1a) 40%, transparent)',
  },
  {
    topic: 'Cell Biology',
    title: 'Intro to Cell Biology',
    meta: '6 / 9 lessons',
    progress: 6 / 9,
    glyph: '◈',
    wash: 'linear-gradient(145deg, rgba(34, 160, 107, 0.22) 0%, rgba(34, 160, 107, 0.04) 55%, transparent 100%)',
    glyphColor: 'rgba(22, 128, 84, 0.35)',
  },
  {
    topic: 'SAT Reading',
    title: 'Evidence & Inference',
    meta: '8 questions',
    progress: 0.55,
    glyph: 'Aa',
    wash: 'linear-gradient(145deg, rgba(180, 120, 50, 0.2) 0%, rgba(180, 120, 50, 0.04) 55%, transparent 100%)',
    glyphColor: 'rgba(146, 94, 36, 0.35)',
  },
] as const;

export type LandingPanelId = 'features' | 'learn';

type LandingPanelCtaProps = {
  onGetStarted?: () => void;
};

export function LandingFeaturesContent({ onGetStarted }: LandingPanelCtaProps) {
  return (
    <div className="mx-auto max-w-6xl text-center">
      <p className="landing-mono-label mb-3">Features</p>
      <h2 className="text-3xl font-semibold tracking-tight text-[var(--landing-fg)] md:text-4xl">
        Everything you need, easy to see
      </h2>
      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURE_CARDS.map((card) => (
          <article
            key={card.title}
            className="overflow-hidden rounded-xl border border-[var(--landing-border)] bg-[var(--landing-card)] text-left"
          >
            <div className="min-h-[120px] border-b border-[var(--landing-border)] bg-[var(--landing-bg)]/40">
              {card.preview}
            </div>
            <div className="p-4">
              <h3 className="text-sm font-semibold text-[var(--landing-fg)]">{card.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[var(--landing-muted)]">{card.blurb}</p>
            </div>
          </article>
        ))}
      </div>
      <Link
        to={SIGN_IN_HASH_PATH}
        onClick={onGetStarted}
        className="mt-10 inline-flex min-h-11 items-center justify-center rounded-md bg-[var(--landing-fg)] px-7 py-3.5 text-sm font-medium text-[var(--landing-bg)] no-underline transition-opacity hover:opacity-90"
      >
        Get started free
      </Link>
    </div>
  );
}

export function LandingLearnContent({ onGetStarted }: LandingPanelCtaProps) {
  return (
    <div className="mx-auto max-w-6xl text-center">
      <p className="landing-mono-label mb-3">Learn</p>
      <h2 className="text-3xl font-semibold tracking-tight text-[var(--landing-fg)] md:text-4xl">
        Pick up any lesson and ask
      </h2>
      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {LEARN_CARDS.map((card) => (
          <article
            key={card.title}
            className="overflow-hidden rounded-xl border border-[var(--landing-border)] bg-[var(--landing-card)] text-left"
          >
            <div
              className="relative flex min-h-[120px] flex-col justify-between overflow-hidden border-b border-[var(--landing-border)] px-3 py-3"
              style={{ background: card.wash }}
            >
              <p className="relative z-[1] text-[10px] font-medium text-[var(--landing-fg)]">{card.topic}</p>
              <span
                aria-hidden
                className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 select-none font-mono text-[2.75rem] font-semibold leading-none"
                style={{ color: card.glyphColor }}
              >
                {card.glyph}
              </span>
              <div className="relative z-[1] h-1 w-full overflow-hidden rounded-full bg-[var(--landing-border)]">
                <div
                  className="h-full rounded-full bg-[var(--brand,#ff7a1a)]"
                  style={{ width: `${Math.round(card.progress * 100)}%` }}
                />
              </div>
            </div>
            <div className="p-4">
              <h3 className="text-sm font-semibold text-[var(--landing-fg)]">{card.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[var(--landing-muted)]">{card.meta}</p>
            </div>
          </article>
        ))}
      </div>
      <Link
        to={SIGN_IN_HASH_PATH}
        onClick={onGetStarted}
        className="mt-10 inline-flex min-h-11 items-center justify-center rounded-md bg-[var(--landing-fg)] px-7 py-3.5 text-sm font-medium text-[var(--landing-bg)] no-underline transition-opacity hover:opacity-90"
      >
        Get started free
      </Link>
    </div>
  );
}
