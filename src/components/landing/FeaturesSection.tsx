import {
  motion,
  useInView,
  useMotionValue,
  useSpring,
  useTransform,
  AnimatePresence,
} from 'framer-motion';
import { useRef, useState, useEffect, type MouseEvent, type CSSProperties } from 'react';
import { Brain, Layers, Linkedin, SlidersHorizontal } from 'lucide-react';

const FEATURES = [
  {
    id: 'ai',
    tag: 'AI',
    title: 'AI-generated quizzes',
    desc: 'Quizzes built from the video you paste — not generic filler.',
    icon: Brain,
    accent: '#e10600',
  },
  {
    id: 'levels',
    tag: 'Levels',
    title: 'Difficulty control',
    desc: 'Easy, medium, or hard — tuned to your audience.',
    icon: SlidersHorizontal,
    accent: '#ededed',
  },
  {
    id: 'modules',
    tag: 'Modules',
    title: 'Structured courses',
    desc: 'Videos become modules and lessons you can follow in order.',
    icon: Layers,
    accent: '#60a5fa',
  },
  {
    id: 'share',
    tag: 'Share',
    title: 'Certificates',
    desc: 'Earn a certificate when you pass — download or share your result.',
    icon: Linkedin,
    accent: '#0a66c2',
  },
] as const;

const MODULES = ['Intro', 'Core ideas', 'Practice', 'Review'];

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
      <div className="mb-2 flex items-center gap-1.5">
        <motion.span
          className="size-1.5 rounded-full bg-[var(--brand,#e10600)]"
          animate={active ? { opacity: [0.3, 1, 0.3] } : { opacity: 0.3 }}
          transition={{ duration: 1.2, repeat: Infinity }}
        />
        <span className="text-[var(--landing-muted)]">generating quiz…</span>
      </div>
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

      {active && (
        <motion.div
          className="pointer-events-none absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.4, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{
            background: 'radial-gradient(circle at 70% 30%, rgba(10,102,194,0.2) 0%, transparent 50%)',
          }}
        />
      )}
    </div>
  );
}

const VISUALS = {
  ai: AiQuizVisual,
  levels: DifficultyVisual,
  modules: ModulesVisual,
  share: CertificateVisual,
} as const;

function FeatureCard({
  feature,
  index,
  active,
  onHover,
  onLeave,
  inView,
}: {
  feature: (typeof FEATURES)[number];
  index: number;
  active: boolean;
  onHover: () => void;
  onLeave: () => void;
  inView: boolean;
}) {
  const Visual = VISUALS[feature.id];
  const Icon = feature.icon;
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
              opacity: active ? 1 : 0.45,
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
        '--feature-accent': feature.accent,
      } as CSSProperties}
    >
      <div className={`landing-feature-beam pointer-events-none absolute -inset-px rounded-[13px] transition-opacity duration-500 ${active ? 'opacity-100' : 'opacity-0'}`} />

      <div className="relative flex h-full flex-col overflow-hidden rounded-xl border border-[var(--landing-border)] bg-[var(--landing-card)] p-5">
        <div
          className={`pointer-events-none absolute inset-0 transition-opacity duration-500 ${active ? 'opacity-100' : 'opacity-0'}`}
          style={{
            background: `radial-gradient(400px circle at 50% 0%, ${feature.accent}18 0%, transparent 65%)`,
          }}
        />

        <div className="relative mb-4 flex items-center justify-between">
          <span className="landing-mono-label">{feature.tag}</span>
          <motion.div
            animate={active ? { rotate: [0, 8, 0], scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Icon size={14} style={{ color: active ? feature.accent : 'var(--landing-muted)' }} />
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

        {/* Index marker */}
        <motion.span
          className="absolute bottom-3 right-4 font-mono text-[10px] tabular-nums text-[var(--landing-muted)]"
          animate={{ opacity: active ? 0.9 : 0.25, color: active ? feature.accent : undefined }}
        >
          0{index + 1}
        </motion.span>
      </div>
    </motion.article>
  );
}

export function FeaturesSection() {
  const sectionRef = useRef(null);
  const inView = useInView(sectionRef, { once: true, margin: '-100px' });
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const spotX = useSpring(mouseX, { stiffness: 80, damping: 20 });
  const spotY = useSpring(mouseY, { stiffness: 80, damping: 20 });
  const spotlightBg = useTransform(
    [spotX, spotY],
    ([x, y]) =>
      `radial-gradient(700px circle at ${x}px ${y}px, rgba(225,6,0,0.06) 0%, transparent 55%)`,
  );

  useEffect(() => {
    if (!inView || isHovering) return;
    const t = setInterval(() => setActiveIndex((i) => (i + 1) % FEATURES.length), 3200);
    return () => clearInterval(t);
  }, [inView, isHovering]);

  const handleSectionMove = (e: MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  const words = ['Built', 'for', 'comprehension'];

  return (
    <section
      id="features"
      ref={sectionRef}
      onMouseMove={handleSectionMove}
      className="landing-features-section relative overflow-hidden border-t border-[var(--landing-border)] px-5 py-24 md:px-8 md:py-32"
    >
      {/* Cursor spotlight */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-0"
        style={{ background: spotlightBg }}
      />

      {/* Floating grid lines */}
      <div className="landing-features-grid pointer-events-none absolute inset-0 opacity-40" />

      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <motion.p
              initial={{ opacity: 0, x: -12 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              className="landing-mono-label mb-4"
            >
              Capabilities
            </motion.p>
            <h2 className="text-3xl font-semibold tracking-tight md:text-5xl">
              {words.map((word, i) => (
                <motion.span
                  key={word}
                  initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
                  animate={inView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
                  transition={{ delay: 0.1 + i * 0.08, duration: 0.5 }}
                  className={`mr-2 inline-block ${i === 2 ? 'text-[var(--brand,#e10600)]' : ''}`}
                >
                  {word}
                </motion.span>
              ))}
            </h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 0.4 }}
              className="landing-mono-label mt-4 max-w-md"
            >
              Every feature designed so learners actually understand — not just skim.
            </motion.p>
          </div>

          {/* Live comprehension meter */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.5 }}
            className="landing-comprehension-meter shrink-0 rounded-xl border border-[var(--landing-border)] bg-[var(--landing-card)] p-4"
          >
            <p className="landing-mono-label mb-2">Comprehension index</p>
            <div className="flex items-end gap-1">
              {Array.from({ length: 12 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1.5 rounded-full bg-[var(--brand,#e10600)]"
                  initial={{ height: 4 }}
                  animate={
                    inView
                      ? {
                          height: i <= activeIndex * 3 + 2 ? [4, 8 + (i % 4) * 6, 4] : 4,
                          opacity: i <= activeIndex * 3 + 2 ? 1 : 0.15,
                        }
                      : {}
                  }
                  transition={{
                    height: { duration: 1.2, repeat: Infinity, delay: i * 0.05 },
                    opacity: { duration: 0.3 },
                  }}
                />
              ))}
            </div>
            <motion.p
              key={activeIndex}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 font-mono text-[10px] text-[var(--landing-muted)]"
            >
              Active: {FEATURES[activeIndex].tag} · {String((activeIndex + 1) * 25).padStart(2, '0')}%
            </motion.p>
          </motion.div>
        </div>

        {/* Progress rail */}
        <div className="relative mt-12 hidden h-px w-full bg-[var(--landing-border)] md:block">
          <motion.div
            className="absolute inset-y-0 left-0 h-px bg-[var(--brand,#e10600)]"
            animate={{ width: `${((activeIndex + 1) / FEATURES.length) * 100}%` }}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
          />
          {FEATURES.map((f, i) => (
            <button
              key={f.id}
              type="button"
              onMouseEnter={() => { setIsHovering(true); setActiveIndex(i); }}
              onMouseLeave={() => setIsHovering(false)}
              onClick={() => setActiveIndex(i)}
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
              style={{ left: `${((i + 0.5) / FEATURES.length) * 100}%` }}
              aria-label={`Focus ${f.title}`}
            >
              <motion.span
                className="block size-2 rounded-full border border-[var(--landing-border)] bg-[var(--landing-bg)]"
                animate={{
                  scale: activeIndex === i ? 1.4 : 1,
                  backgroundColor: activeIndex === i ? '#e10600' : 'var(--landing-bg)',
                  borderColor: activeIndex === i ? '#e10600' : 'var(--landing-border)',
                }}
              />
            </button>
          ))}
        </div>

        <div
          className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
          style={{ perspective: 1200 }}
        >
          {FEATURES.map((f, i) => (
            <FeatureCard
              key={f.id}
              feature={f}
              index={i}
              active={activeIndex === i}
              inView={inView}
              onHover={() => { setIsHovering(true); setActiveIndex(i); }}
              onLeave={() => setIsHovering(false)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
