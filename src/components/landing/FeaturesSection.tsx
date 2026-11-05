import {
  motion,
  useInView,
  useMotionValue,
  useSpring,
  useTransform,
  AnimatePresence,
} from 'framer-motion';
import { useRef, useState, useEffect, type MouseEvent, type CSSProperties } from 'react';
import { Brain, Layers, Linkedin, MessageCircle, SlidersHorizontal, Sparkles } from 'lucide-react';
import { useTheme } from '../ThemeContext';

const FEATURES = [
  {
    id: 'ai',
    tag: 'Assess',
    title: 'AI-generated quizzes',
    desc: 'Multiple-choice and scored checks built from the lesson transcript — not a generic question bank.',
    icon: Brain,
    accent: '#e10600',
  },
  {
    id: 'study',
    tag: 'Study rail',
    title: 'Flashcards, notes, exams',
    desc: 'Regenerate flashcards, fill-in blanks, practice exams, and AI notes per lesson anytime.',
    icon: Sparkles,
    accent: '#a78bfa',
  },
  {
    id: 'tutor',
    tag: 'Tutor',
    title: 'Personal tutor',
    desc: 'Ask about anything you come across in class…',
    icon: MessageCircle,
    accent: '#ff7a1a',
  },
  {
    id: 'levels',
    tag: 'Assess',
    title: 'Difficulty control',
    desc: 'Easy, medium, or hard — tuned when educators generate or learners practice.',
    icon: SlidersHorizontal,
    accent: 'levels',
  },
  {
    id: 'modules',
    tag: 'Structure',
    title: 'Structured courses',
    desc: 'Playlists and channels become ordered modules with timestamp-linked lessons.',
    icon: Layers,
    accent: '#60a5fa',
  },
  {
    id: 'share',
    tag: 'Proof',
    title: 'Certificates',
    desc: 'Pass the assessments and download or share a verified completion record.',
    icon: Linkedin,
    accent: '#0a66c2',
  },
] as const;

const MODULES = ['Intro', 'Core ideas', 'Practice', 'Review'];

function StudyRailVisual({ active }: { active: boolean }) {
  const tools = ['Flashcards', 'Fill-in blanks', 'Practice exam', 'AI notes'];
  const [highlight, setHighlight] = useState(0);

  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => setHighlight((h) => (h + 1) % tools.length), 1100);
    return () => clearInterval(t);
  }, [active, tools.length]);

  return (
    <div className="flex h-28 flex-col justify-center gap-1.5 rounded-md border border-[var(--landing-border)] bg-[var(--landing-bg)] p-3">
      <p className="font-mono text-[9px] text-[var(--landing-muted)]">from transcript</p>
      {tools.map((tool, i) => (
        <motion.div
          key={tool}
          className="rounded px-2 py-0.5 font-mono text-[9px]"
          animate={
            active
              ? {
                  backgroundColor: highlight === i ? 'rgba(167,139,250,0.15)' : 'transparent',
                  color: highlight === i ? 'var(--landing-fg)' : 'var(--landing-muted)',
                }
              : {}
          }
        >
          {tool}
        </motion.div>
      ))}
    </div>
  );
}

function TutorVisual({ active }: { active: boolean }) {
  const [len, setLen] = useState(0);
  const reply = 'The loss surface is convex when…';

  useEffect(() => {
    if (!active) {
      setLen(0);
      return;
    }
    setLen(0);
    let i = 0;
    const t = setInterval(() => {
      i += 1;
      setLen(i);
      if (i >= reply.length) clearInterval(t);
    }, 28);
    return () => clearInterval(t);
  }, [active, reply.length]);

  return (
    <div className="flex h-28 flex-col justify-end rounded-md border border-[var(--landing-border)] bg-[var(--landing-bg)] p-3">
      <p className="mb-2 self-end rounded-md bg-[var(--landing-card)] px-2 py-1 font-mono text-[8px] text-[var(--landing-muted)]">
        Why did my quiz miss #3?
      </p>
      <p className="rounded-md border border-[var(--landing-border)] px-2 py-1.5 font-mono text-[9px] leading-relaxed text-[var(--landing-fg)]">
        {reply.slice(0, len)}
        {active && len < reply.length && (
          <motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.45, repeat: Infinity }}>|</motion.span>
        )}
      </p>
    </div>
  );
}

function AiQuizVisual({ active }: { active: boolean }) {
  const question = 'What causes gradient descent to converge?';
  const [len, setLen] = useState(0);

  useEffect(() => {
    if (!active) {
      setLen(0);
      return;
    }
    setLen(0);
    let i = 0;
    const t = setInterval(() => {
      i += 1;
      setLen(i);
      if (i >= question.length) clearInterval(t);
    }, 35);
    return () => clearInterval(t);
  }, [active, question.length]);

  return (
    <div className="relative h-28 overflow-hidden rounded-md border border-[var(--landing-border)] bg-[var(--landing-bg)] p-3 font-mono text-[9px]">
      <div className="mb-2 font-mono text-[9px] text-[var(--landing-muted)]">generating quiz…</div>
      <p className="leading-relaxed text-[var(--landing-fg)]">
        {question.slice(0, len)}
        {active && len < question.length && (
          <motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.5, repeat: Infinity }}>|</motion.span>
        )}
      </p>
      <div className="mt-2 space-y-1">
        {['Learning rate too high', 'Convex loss surface', 'Random init'].map((opt, i) => (
          <motion.div
            key={opt}
            className="rounded px-2 py-1 text-[var(--landing-muted)]"
            animate={
              active && len >= question.length
                ? {
                    backgroundColor: i === 1 ? 'rgba(225,6,0,0.15)' : 'transparent',
                    color: i === 1 ? 'var(--landing-fg)' : 'var(--landing-muted)',
                    x: i === 1 ? [0, 2, 0] : 0,
                  }
                : {}
            }
            transition={{ delay: i * 0.15, duration: 0.4 }}
          >
            {String.fromCharCode(65 + i)}. {opt}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function DifficultyVisual({ active }: { active: boolean }) {
  const levels = [
    { label: 'Easy', h: 28, color: 'rgba(34,197,94,0.6)' },
    { label: 'Med', h: 48, color: 'rgba(234,179,8,0.6)' },
    { label: 'Hard', h: 68, color: 'rgba(225,6,0,0.7)' },
  ];
  const [highlight, setHighlight] = useState(0);

  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => setHighlight((h) => (h + 1) % 3), 1400);
    return () => clearInterval(t);
  }, [active]);

  return (
    <div className="flex h-28 flex-col justify-between rounded-md border border-[var(--landing-border)] bg-[var(--landing-bg)] p-3">
      <div className="flex items-end justify-center gap-3 pt-2">
        {levels.map((lv, i) => (
          <div key={lv.label} className="flex flex-col items-center gap-1">
            <motion.div
              className="w-8 rounded-sm"
              style={{ background: lv.color }}
              initial={{ height: 12 }}
              animate={
                active
                  ? {
                      height: highlight === i ? lv.h : lv.h * 0.45,
                      opacity: highlight === i ? 1 : 0.35,
                    }
                  : { height: lv.h * 0.3, opacity: 0.25 }
              }
              transition={{ type: 'spring', stiffness: 200, damping: 18 }}
            />
            <span className={`font-mono text-[8px] ${highlight === i && active ? 'text-[var(--landing-fg)]' : 'text-[var(--landing-muted)]'}`}>
              {lv.label}
            </span>
          </div>
        ))}
      </div>
      <motion.div
        className="relative mx-auto h-1 w-full max-w-[140px] rounded-full bg-[var(--landing-border)]"
        animate={active ? {} : {}}
      >
        <motion.div
          className="absolute inset-y-0 w-3 rounded-full bg-[var(--landing-fg)]"
          animate={active ? { left: [`${highlight * 33}%`, `${highlight * 33 + 5}%`] } : { left: '33%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        />
      </motion.div>
    </div>
  );
}

function ModulesVisual({ active }: { active: boolean }) {
  const [done, setDone] = useState(0);

  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => setDone((d) => (d + 1) % (MODULES.length + 1)), 1200);
    return () => clearInterval(t);
  }, [active]);

  return (
    <div className="flex h-28 flex-col justify-center gap-2 rounded-md border border-[var(--landing-border)] bg-[var(--landing-bg)] p-3">
      {MODULES.map((mod, i) => (
        <motion.div
          key={mod}
          className="flex items-center gap-2 rounded px-2 py-1"
          animate={
            active
              ? {
                  backgroundColor: i < done ? 'rgba(96,165,250,0.12)' : 'transparent',
                  opacity: i <= done ? 1 : 0.45,
                }
              : { opacity: 0.45 }
          }
          transition={{ duration: 0.35 }}
        >
          <span
            className="flex size-4 shrink-0 items-center justify-center rounded-full border font-mono text-[8px]"
            style={{
              borderColor: i < done ? '#60a5fa' : 'var(--landing-border)',
              color: i < done ? '#60a5fa' : 'var(--landing-muted)',
            }}
          >
            {i < done ? '✓' : i + 1}
          </span>
          <span className="font-mono text-[9px] text-[var(--landing-muted)]">{mod}</span>
          <motion.div
            className="ml-auto h-1 w-10 rounded-full bg-[var(--landing-border)]"
            animate={active && i === done - 1 ? { width: ['0%', '100%'] } : {}}
            transition={{ duration: 1, ease: 'easeInOut' }}
          >
            <div className="h-full rounded-full bg-[#60a5fa]" style={{ width: i < done ? '100%' : '0%' }} />
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
}

function CertificateVisual({ active }: { active: boolean }) {
  return (
    <div className="relative flex h-28 items-center justify-center overflow-hidden rounded-md border border-[var(--landing-border)] bg-[var(--landing-bg)] p-3">
      <motion.div
        className="relative w-full max-w-[140px] rounded border border-[var(--landing-border)] bg-[var(--landing-card)] p-3"
        animate={active ? { y: [0, -2, 0] } : {}}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="mb-2 h-1 w-8 rounded bg-[var(--landing-border)]" />
        <div className="mb-1 h-1 w-full rounded bg-[var(--landing-border)]" />
        <div className="h-1 w-2/3 rounded bg-[var(--landing-border)]" />
        <div className="mt-3 flex items-center gap-1">
          <Linkedin size={10} className="text-[#0a66c2]" />
          <span className="font-mono text-[7px] text-[var(--landing-muted)]">Verified</span>
        </div>

        <AnimatePresence>
          {active && (
            <motion.div
              initial={{ scale: 2, opacity: 0, rotate: -20 }}
              animate={{ scale: 1, opacity: 0.85, rotate: -12 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.3 }}
              className="absolute -right-1 -top-1 flex size-10 items-center justify-center rounded-full border-2 border-[#0a66c2] font-mono text-[7px] font-bold text-[#0a66c2]"
            >
              ✓
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

const VISUALS = {
  ai: AiQuizVisual,
  study: StudyRailVisual,
  tutor: TutorVisual,
  levels: DifficultyVisual,
  modules: ModulesVisual,
  share: CertificateVisual,
} as const;

function resolveAccent(accent: string, isDark: boolean): string {
  if (accent === 'levels') return isDark ? '#ededed' : '#404040';
  return accent;
}

function FeatureCard({
  feature,
  index,
  active,
  onHover,
  onLeave,
  inView,
  isDark,
}: {
  feature: (typeof FEATURES)[number];
  index: number;
  active: boolean;
  onHover: () => void;
  onLeave: () => void;
  inView: boolean;
  isDark: boolean;
}) {
  const Visual = VISUALS[feature.id];
  const Icon = feature.icon;
  const accent = resolveAccent(feature.accent, isDark);
  const inactiveOpacity = isDark ? 0.45 : 0.58;
  const cardRef = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [6, -6]), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-6, 6]), { stiffness: 200, damping: 20 });

  const handleMove = (e: MouseEvent) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set((e.clientX - rect.left) / rect.width - 0.5);
    my.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleLeave = () => {
    mx.set(0);
    my.set(0);
    onLeave();
  };

  return (
    <motion.article
      ref={cardRef}
      initial={{ opacity: 0, y: 40, filter: 'blur(8px)' }}
      animate={
        inView
          ? {
              opacity: active ? 1 : inactiveOpacity,
              y: 0,
              filter: 'blur(0px)',
              scale: active ? 1.02 : 0.98,
            }
          : {}
      }
      transition={{
        opacity: { duration: 0.4 },
        scale: { type: 'spring', stiffness: 260, damping: 24 },
        delay: index * 0.1,
        duration: 0.6,
      }}
      onMouseEnter={onHover}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={`landing-feature-card relative cursor-default ${active ? 'is-active' : ''}`}
      style={{
        rotateX: active ? rotateX : 0,
        rotateY: active ? rotateY : 0,
        transformStyle: 'preserve-3d',
        perspective: 800,
        '--feature-accent': accent,
      } as CSSProperties}
    >
      <div className={`landing-feature-beam pointer-events-none absolute -inset-px rounded-[13px] transition-opacity duration-500 ${active ? 'opacity-100' : 'opacity-0'}`} />

      <div className="relative flex h-full flex-col overflow-hidden rounded-xl border border-[var(--landing-border)] bg-[var(--landing-card)] p-5">
        <div
          className={`pointer-events-none absolute inset-0 transition-opacity duration-500 ${active ? 'opacity-100' : 'opacity-0'}`}
          style={{
            background: `radial-gradient(400px circle at 50% 0%, ${accent}18 0%, transparent 65%)`,
          }}
        />

        <div className="relative mb-4 flex items-center justify-between">
          <span className="landing-mono-label">{feature.tag}</span>
          <motion.div
            animate={active ? { rotate: [0, 8, 0], scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Icon size={14} style={{ color: active ? accent : 'var(--landing-muted)' }} />
          </motion.div>
        </div>

        <Visual active={active} />

        <div className="relative mt-4">
          <motion.h3
            className="text-sm font-semibold text-[var(--landing-fg)]"
            animate={active ? { x: [0, 2, 0] } : {}}
            transition={{ duration: 4, repeat: Infinity }}
          >
            {feature.title}
          </motion.h3>
          <p className="mt-1.5 text-sm leading-relaxed text-[var(--landing-muted)]">{feature.desc}</p>
        </div>
      </div>
    </motion.article>
  );
}

export function FeaturesSection({ variant = 'default' }: { variant?: 'default' | 'belowHero' }) {
  const { isDark } = useTheme();
  const sectionRef = useRef(null);
  const inView = useInView(sectionRef, { once: true, margin: '-100px' });
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const belowHero = variant === 'belowHero';

  useEffect(() => {
    if (!inView || isHovering) return;
    const t = setInterval(() => setActiveIndex((i) => (i + 1) % FEATURES.length), 3200);
    return () => clearInterval(t);
  }, [inView, isHovering]);

  const headline = 'A personal tutor for everything in class';

  return (
    <section
      id="features"
      ref={sectionRef}
      className={`landing-features-section relative overflow-hidden ${
        belowHero
          ? 'landing-features-below-hero w-full border-t-0'
          : 'border-t border-[var(--landing-border)] px-5 py-24 md:px-8 md:py-32'
      }`}
    >
      {/* Floating grid lines */}
      <div className="landing-features-grid pointer-events-none absolute inset-0 opacity-40" />

      <div className="relative z-10 mx-auto w-full max-w-6xl">
        <div className={`landing-features-intro ${belowHero ? 'landing-features-intro--hero' : ''}`}>
          <div>
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              className={`landing-mono-label ${belowHero ? 'mb-3' : 'mb-4'}`}
            >
              Capabilities
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
              className={`font-semibold tracking-tight text-[var(--landing-fg)] ${
                belowHero
                  ? 'mx-auto max-w-2xl text-2xl leading-snug md:text-3xl'
                  : 'max-w-md text-3xl md:max-w-lg md:text-4xl'
              }`}
            >
              {headline}
            </motion.h2>
          </div>
        </div>

        <div
          className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 ${
            belowHero ? 'landing-features-grid-wrap' : 'mt-12'
          }`}
          style={{ perspective: 1200 }}
        >
          {FEATURES.map((f, i) => (
            <FeatureCard
              key={f.id}
              feature={f}
              index={i}
              active={activeIndex === i}
              inView={inView}
              isDark={isDark}
              onHover={() => { setIsHovering(true); setActiveIndex(i); }}
              onLeave={() => setIsHovering(false)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
