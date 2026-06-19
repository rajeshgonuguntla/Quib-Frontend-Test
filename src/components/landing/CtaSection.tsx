import {
  motion,
  useInView,
  useMotionValue,
  useSpring,
  useTransform,
  AnimatePresence,
} from 'framer-motion';
import { Link } from 'react-router';
import { useRef, useState, useEffect, type MouseEvent } from 'react';
import { ArrowRight, BookOpen, GraduationCap, Play, Sparkles } from 'lucide-react';
import { LandingThumb } from './LandingThumb';
import { LANDING_CTA_TOPICS } from './landingThumbnails';

const MODES = [
  { label: 'learn', line: 'Paste a YouTube video or playlist URL', hint: 'Sign in · Generate a quiz · Save your progress' },
  { label: 'browse', line: 'Browse published educator courses', hint: 'Enroll · Follow modules · Track completion' },
  { label: 'build', line: 'Connect YouTube in Educator Studio', hint: 'Pick videos · Generate a course · Publish to catalog' },
] as const;

const FLOATING_WINDOWS = [
  { id: 'quiz', label: 'quiz.tsx', icon: Sparkles, x: -280, y: -60, z: -80, rotateY: 35, rotateX: 12, delay: 0 },
  { id: 'course', label: 'course.json', icon: BookOpen, x: 260, y: -80, z: -120, rotateY: -40, rotateX: 8, delay: 0.2 },
  { id: 'video', label: 'lecture.mp4', icon: Play, x: -220, y: 90, z: -40, rotateY: 25, rotateX: -15, delay: 0.4 },
  { id: 'studio', label: 'studio.tsx', icon: GraduationCap, x: 240, y: 100, z: -90, rotateY: -30, rotateX: -10, delay: 0.6 },
];

function FloatingWindow({
  win,
  inView,
  mouseX,
  mouseY,
  focused,
}: {
  win: (typeof FLOATING_WINDOWS)[number];
  inView: boolean;
  mouseX: ReturnType<typeof useSpring>;
  mouseY: ReturnType<typeof useSpring>;
  focused: boolean;
}) {
  const Icon = win.icon;
  const parallaxX = useTransform(mouseX, [-0.5, 0.5], [win.x - 20, win.x + 20]);
  const parallaxY = useTransform(mouseY, [-0.5, 0.5], [win.y - 15, win.y + 15]);

  return (
    <motion.div
      className="landing-cta-window pointer-events-none absolute left-1/2 top-1/2 hidden w-44 md:block"
      initial={{ opacity: 0, scale: 0.6 }}
      animate={
        inView
          ? {
              opacity: focused ? 0.95 : 0.55,
              scale: focused ? 1.05 : 1,
              rotateY: focused ? 0 : win.rotateY,
              rotateX: focused ? 0 : win.rotateX,
              z: focused ? 40 : win.z,
            }
          : {}
      }
      transition={{ type: 'spring', stiffness: 80, damping: 18, delay: win.delay }}
      style={{
        x: parallaxX,
        y: parallaxY,
        translateX: '-50%',
        translateY: '-50%',
        transformStyle: 'preserve-3d',
        zIndex: focused ? 10 : 1,
      }}
    >
      <motion.div
        animate={inView ? { y: [0, -6, 0] } : {}}
        transition={{ duration: 4 + win.delay * 2, repeat: Infinity, ease: 'easeInOut', delay: win.delay }}
        className="overflow-hidden rounded-lg border border-[var(--landing-border)] bg-[var(--landing-card)] shadow-2xl backdrop-blur-md"
      >
        <div className="flex items-center gap-1.5 border-b border-[var(--landing-border)] px-2.5 py-1.5">
          <span className="size-1.5 rounded-full bg-red-500/70" />
          <span className="size-1.5 rounded-full bg-yellow-500/70" />
          <span className="size-1.5 rounded-full bg-green-500/70" />
          <span className="ml-1 truncate font-mono text-[8px] text-[var(--landing-muted)]">{win.label}</span>
        </div>
        <div className="space-y-1.5 p-2.5">
          <div className="flex items-center gap-1.5">
            <Icon size={10} className="text-[var(--brand,#e10600)]" />
            <div className="h-1 flex-1 rounded bg-[var(--landing-border)]" />
          </div>
          <div className="h-1 w-full rounded bg-[var(--landing-border)]" />
          <div className="h-1 w-2/3 rounded bg-[var(--landing-border)]" />
          <div className="mt-2 aspect-video overflow-hidden rounded border border-[var(--landing-border)]">
            <LandingThumb
              topic={LANDING_CTA_TOPICS[win.id]}
              className="h-full w-full"
              showPlay={win.id === 'video'}
            />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ImpossibleRings({ inView }: { inView: boolean }) {
  return (
    <div className="landing-cta-portal pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
      {[320, 420, 520, 620].map((size, i) => (
        <motion.div
          key={size}
          className="absolute left-1/2 top-1/2 rounded-full border border-[var(--landing-border)]"
          style={{
            width: size,
            height: size,
            marginLeft: -size / 2,
            marginTop: -size / 2,
            transformStyle: 'preserve-3d',
          }}
          initial={{ opacity: 0, scale: 0.8, rotateX: 70, rotateZ: 0 }}
          animate={
            inView
              ? {
                  opacity: 0.15 + (3 - i) * 0.08,
                  scale: 1,
                  rotateX: 65 + i * 5,
                  rotateZ: i % 2 === 0 ? 360 : -360,
                }
              : {}
          }
          transition={{
            rotateZ: { duration: 30 + i * 10, repeat: Infinity, ease: 'linear' },
            opacity: { duration: 0.8, delay: i * 0.1 },
            scale: { duration: 0.8, delay: i * 0.1 },
          }}
        />
      ))}
      {/* Impossible triangle connectors */}
      <svg className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" width="400" height="400" viewBox="0 0 400 400">
        <motion.path
          d="M200 40 L360 320 L40 320 Z"
          fill="none"
          stroke="rgba(225,6,0,0.15)"
          strokeWidth="1"
          strokeDasharray="8 6"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={inView ? { pathLength: 1, opacity: 1 } : {}}
          transition={{ duration: 2, ease: 'easeInOut' }}
        />
        {[ [200, 40], [360, 320], [40, 320] ].map(([cx, cy], i) => (
          <motion.circle
            key={i}
            cx={cx}
            cy={cy}
            r="4"
            fill="#e10600"
            initial={{ opacity: 0, scale: 0 }}
            animate={inView ? { opacity: [0.4, 1, 0.4], scale: [0.8, 1.2, 0.8] } : {}}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.6 }}
          />
        ))}
      </svg>
    </div>
  );
}

export function CtaSection() {
  const sectionRef = useRef(null);
  const inView = useInView(sectionRef, { once: true, margin: '-80px' });
  const [modeIndex, setModeIndex] = useState(0);
  const [lineLen, setLineLen] = useState(0);
  const [focused, setFocused] = useState(false);

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const mouseX = useSpring(rawX, { stiffness: 60, damping: 20 });
  const mouseY = useSpring(rawY, { stiffness: 60, damping: 20 });

  const btnX = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), { stiffness: 150, damping: 15 });
  const btnY = useSpring(useTransform(mouseY, [-0.5, 0.5], [-6, 6]), { stiffness: 150, damping: 15 });

  const voidBg = useTransform(
    [mouseX, mouseY],
    ([x, y]) =>
      `radial-gradient(900px circle at ${50 + (x as number) * 30}% ${50 + (y as number) * 30}%, rgba(225,6,0,0.12) 0%, transparent 50%)`,
  );

  const mode = MODES[modeIndex];

  useEffect(() => {
    if (!inView) return;
    const modeTimer = setInterval(() => setModeIndex((i) => (i + 1) % MODES.length), 4000);
    return () => clearInterval(modeTimer);
  }, [inView]);

  useEffect(() => {
    setLineLen(0);
    if (!inView) return;
    let i = 0;
    const t = setInterval(() => {
      i += 1;
      setLineLen(i);
      if (i >= mode.line.length) clearInterval(t);
    }, 32);
    return () => clearInterval(t);
  }, [inView, mode.line, modeIndex]);

  const handleMove = (e: MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    rawX.set((e.clientX - rect.left) / rect.width - 0.5);
    rawY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleLeave = () => {
    rawX.set(0);
    rawY.set(0);
    setFocused(false);
  };

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMove}
      onMouseEnter={() => setFocused(true)}
      onMouseLeave={handleLeave}
      className="landing-cta-section relative overflow-hidden border-t border-[var(--landing-border)] px-5 py-28 md:px-8 md:py-40"
      style={{ perspective: 1200 }}
    >
      {/* Void background */}
      <motion.div className="pointer-events-none absolute inset-0" style={{ background: voidBg }} />
      <div className="landing-cta-stars pointer-events-none absolute inset-0" />
      <div className="landing-cta-grid pointer-events-none absolute inset-0 opacity-30" />

      <ImpossibleRings inView={inView} />

      {FLOATING_WINDOWS.map((win) => (
        <FloatingWindow key={win.id} win={win} inView={inView} mouseX={mouseX} mouseY={mouseY} focused={focused} />
      ))}

      {/* Particle stream toward center */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {Array.from({ length: 24 }).map((_, i) => (
          <motion.span
            key={i}
            className="absolute size-1 rounded-full bg-[var(--brand,#e10600)]"
            style={{
              left: `${10 + (i * 3.7) % 80}%`,
              top: `${5 + (i * 7.3) % 90}%`,
            }}
            animate={
              inView
                ? {
                    x: [0, (i % 2 === 0 ? 1 : -1) * (80 + i * 8)],
                    y: [0, (i % 3 === 0 ? 1 : -1) * (60 + i * 5)],
                    opacity: [0, 0.7, 0],
                    scale: [0, 1, 0],
                  }
                : {}
            }
            transition={{
              duration: 3 + (i % 5) * 0.5,
              repeat: Infinity,
              delay: i * 0.2,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="landing-mono-label mb-6"
        >
          How it works
        </motion.p>

        <h2 className="text-3xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
          {['Start', 'building', 'with'].map((word, i) => (
            <motion.span
              key={word}
              initial={{ opacity: 0, y: 30, rotateX: 40 }}
              animate={inView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
              transition={{ delay: 0.1 + i * 0.08, duration: 0.6 }}
              className="mr-2 inline-block"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {word}
            </motion.span>
          ))}
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
            className="inline-block bg-gradient-to-r from-[var(--landing-fg)] via-[var(--brand,#e10600)] to-[var(--landing-fg)] bg-clip-text text-transparent"
          >
            Quib
          </motion.span>
        </h2>

        {/* Step preview — real flows only */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.5 }}
          className="mx-auto mt-8 max-w-lg overflow-hidden rounded-xl border border-[var(--landing-border)] bg-[var(--landing-card)]/80 text-left shadow-2xl backdrop-blur-xl"
        >
          <div className="flex items-center gap-2 border-b border-[var(--landing-border)] px-4 py-2.5">
            <span className="landing-mono-label">Step {modeIndex + 1} of {MODES.length}</span>
            <motion.span
              className="ml-auto size-1.5 rounded-full bg-green-500"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
          <div className="px-4 py-3 font-mono text-xs">
            <AnimatePresence mode="wait">
              <motion.div
                key={modeIndex}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.25 }}
              >
                <p className="text-[var(--landing-fg)]">
                  {mode.line.slice(0, lineLen)}
                  {lineLen < mode.line.length && (
                    <motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.4, repeat: Infinity }}>|</motion.span>
                  )}
                </p>
                <p className="mt-1.5 text-[10px] text-[var(--landing-muted)]">{mode.hint}</p>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.6 }}
          className="mx-auto mt-5 max-w-md text-sm text-[var(--landing-muted)]"
        >
          For learners and educators. Free to try today.
        </motion.p>

        {/* Magnetic CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.7 }}
          className="relative mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          {/* Pulse rings behind primary button */}
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="pointer-events-none absolute left-1/2 top-1/2 size-32 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--brand,#e10600)]"
              animate={inView ? { scale: [1, 2.2], opacity: [0.35, 0] } : {}}
              transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.8, ease: 'easeOut' }}
            />
          ))}

          <motion.div style={{ x: btnX, y: btnY }}>
            <Link
              to="/signin"
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-md bg-[var(--landing-fg)] px-7 py-3.5 text-sm font-medium text-[var(--landing-bg)] no-underline"
            >
              <motion.span
                className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1 }}
              />
              Get started
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </motion.div>

          <Link
            to="/educators"
            className="rounded-md border border-[var(--landing-border)] bg-[var(--landing-card)]/50 px-7 py-3.5 text-sm text-[var(--landing-fg)] no-underline backdrop-blur-sm transition-colors hover:border-[var(--brand,#e10600)] hover:text-[var(--landing-fg)]"
          >
            For educators
          </Link>
        </motion.div>

        {/* Honest capability strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.9 }}
          className="mx-auto mt-14 flex max-w-lg flex-wrap justify-center gap-6 border-t border-[var(--landing-border)] pt-8 md:gap-10"
        >
          {[
            { v: 'YouTube', l: 'Video-first input' },
            { v: 'AI', l: 'Generated quizzes' },
            { v: 'Free', l: 'To try today' },
          ].map((s, i) => (
            <div key={s.l} className="text-center">
              <motion.p
                className="font-mono text-lg font-semibold text-[var(--landing-fg)]"
                animate={inView ? { opacity: [0.6, 1, 0.6] } : {}}
                transition={{ duration: 3, repeat: Infinity, delay: i * 0.4 }}
              >
                {s.v}
              </motion.p>
              <p className="landing-mono-label mt-1">{s.l}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
