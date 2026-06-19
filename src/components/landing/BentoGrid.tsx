import {
  motion,
  useInView,
  useMotionValue,
  useSpring,
  useTransform,
  AnimatePresence,
} from 'framer-motion';
import { useRef, useState, useEffect, type MouseEvent } from 'react';
import { Box, Layers, Sparkles } from 'lucide-react';
import { useTheme } from '../ThemeContext';

const WORKFLOW_STEPS = [
  { label: 'extract()', ms: 420, width: 1 },
  { label: 'generate()', ms: 252, width: 0.72, indent: 24 },
  { label: 'quiz()', ms: 168, width: 0.48, indent: 48 },
  { label: 'publish()', ms: 168, width: 0.48, indent: 48 },
];

const STUDIO_FILES = [
  { icon: Sparkles, name: 'channel.tsx', color: 'rgba(225, 6, 0, 0.15)' },
  { icon: Layers, name: 'course.tsx', color: 'rgba(255, 255, 255, 0.04)' },
  { icon: Box, name: 'quiz.tsx', color: 'rgba(255, 255, 255, 0.04)' },
];

const DOT_GRID = Array.from({ length: 64 }, (_, i) => ({
  id: i,
  col: i % 8,
  row: Math.floor(i / 8),
}));

function BrandingCard({ inView }: { inView: boolean }) {
  const { isDark } = useTheme();
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 120, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 120, damping: 20 });
  const glowX = useTransform(springX, [-0.5, 0.5], ['35%', '65%']);
  const glowY = useTransform(springY, [-0.5, 0.5], ['35%', '65%']);
  const logoX = useTransform(springX, [-0.5, 0.5], [-6, 6]);
  const logoY = useTransform(springY, [-0.5, 0.5], [-4, 4]);
  const glowBg = useTransform(
    [glowX, glowY],
    ([x, y]) =>
      `radial-gradient(600px circle at ${x} ${y}, rgba(225, 6, 0, ${isDark ? 0.12 : 0.2}) 0%, transparent 60%)`,
  );

  const handleMove = (e: MouseEvent) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className="landing-bento-card landing-brand-card group relative flex min-h-[320px] cursor-default items-center justify-center overflow-hidden md:row-span-2 md:min-h-[480px]"
    >
      {/* Cursor-following glow */}
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: glowBg }}
      />

      {/* Animated dot field */}
      <div className="absolute inset-0 p-6">
        <div className="grid h-full w-full grid-cols-8 grid-rows-8 gap-3">
          {DOT_GRID.map((dot) => (
            <motion.span
              key={dot.id}
              className="size-1.5 rounded-sm bg-[var(--landing-muted)]"
              initial={{ opacity: 0.15, scale: 0.6 }}
              animate={
                inView
                  ? {
                      opacity: [0.12, isDark ? 0.55 : 0.75, 0.12],
                      scale: [0.7, 1, 0.7],
                    }
                  : {}
              }
              transition={{
                duration: 2.8 + (dot.col % 3) * 0.4,
                repeat: Infinity,
                delay: dot.col * 0.15 + dot.row * 0.08,
                ease: 'easeInOut',
              }}
              whileHover={{ opacity: 1, scale: 1.4, backgroundColor: 'rgba(225, 6, 0, 0.8)' }}
            />
          ))}
        </div>
      </div>

      {/* Scan line */}
      <div className="landing-scan-line pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(225,6,0,0.4)] to-transparent" />

      {/* Logo */}
      <motion.div className="relative z-10 text-center" style={{ x: logoX, y: logoY }}>
        <motion.span
          className="text-4xl font-semibold tracking-tight text-[var(--landing-fg)] md:text-5xl"
          animate={inView ? { opacity: [0.85, 1, 0.85] } : {}}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          Quib
        </motion.span>
        <motion.span
          className="ml-2 inline-flex items-center justify-center rounded border border-[var(--landing-border)] px-2 py-0.5 text-sm font-medium text-[var(--landing-muted)]"
          animate={
            inView
              ? {
                  y: [0, -3, 0],
                  borderColor: [
                    'rgba(255,255,255,0.1)',
                    'rgba(225,6,0,0.4)',
                    'rgba(255,255,255,0.1)',
                  ],
                }
              : {}
          }
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          26
        </motion.span>
      </motion.div>
    </motion.div>
  );
}

function WorkflowCard({ inView }: { inView: boolean }) {
  const [activeStep, setActiveStep] = useState(0);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (!inView) return;
    const interval = setInterval(() => {
      setActiveStep((s) => (s + 1) % WORKFLOW_STEPS.length);
    }, 2200);
    return () => clearInterval(interval);
  }, [inView]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: 0.1 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="landing-bento-card group flex min-h-[220px] flex-col justify-between p-6 md:p-8"
    >
      <div>
        <h3 className="text-lg font-semibold tracking-tight text-[var(--landing-fg)]">Workflows</h3>
        <p className="mt-2 max-w-sm font-mono text-xs leading-relaxed text-[var(--landing-muted)]">
                From YouTube URL to structured course — modules, lessons, and quizzes generated for you.
        </p>
      </div>

      <div className="relative mt-6 space-y-2">
        {WORKFLOW_STEPS.map((step, i) => {
          const isActive = activeStep === i;
          return (
            <div
              key={step.label}
              className="flex items-center gap-2"
              style={{ marginLeft: step.indent ?? 0 }}
            >
              <motion.div
                className="relative h-7 overflow-hidden rounded border bg-[var(--landing-bg)]"
                initial={{ width: 0, opacity: 0 }}
                animate={
                  inView
                    ? {
                        width: `${step.width * 100}%`,
                        opacity: 1,
                        borderColor: isActive
                          ? 'rgba(225, 6, 0, 0.5)'
                          : 'rgba(255, 255, 255, 0.1)',
                      }
                    : {}
                }
                transition={{
                  width: { duration: 0.7, delay: 0.3 + i * 0.12, ease: [0.25, 0.1, 0.25, 1] },
                  opacity: { duration: 0.4, delay: 0.3 + i * 0.12 },
                  borderColor: { duration: 0.3 },
                }}
                style={{ maxWidth: 280 }}
              >
                {/* Shimmer on active bar */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      key="shimmer"
                      initial={{ x: '-100%' }}
                      animate={{ x: '200%' }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 1.2, ease: 'easeInOut' }}
                      className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                    />
                  )}
                </AnimatePresence>

                <div className="relative flex h-full items-center px-2">
                  <span
                    className={`font-mono text-[10px] transition-colors duration-300 ${
                      isActive ? 'text-[var(--landing-fg)]' : 'text-[var(--landing-muted)]'
                    }`}
                  >
                    {step.label}
                  </span>
                  <motion.span
                    className="ml-auto font-mono text-[10px] tabular-nums"
                    animate={{ opacity: isActive ? 1 : 0.5, color: isActive ? '#e10600' : 'var(--landing-muted)' }}
                    transition={{ duration: 0.3 }}
                  >
                    {step.ms}ms
                  </motion.span>
                </div>
              </motion.div>
            </div>
          );
        })}

        {/* Progress indicator */}
        <motion.div
          className="absolute -bottom-1 left-0 h-px bg-[var(--landing-border)]"
          style={{ width: '100%', maxWidth: 280 }}
        >
          <motion.div
            className="h-full bg-[var(--brand,#e10600)]"
            animate={{ width: `${((activeStep + 1) / WORKFLOW_STEPS.length) * 100}%` }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          />
        </motion.div>
      </div>

      {hovered && (
        <motion.p
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="landing-mono-label mt-3"
        >
          Running step {activeStep + 1} of {WORKFLOW_STEPS.length}
        </motion.p>
      )}
    </motion.div>
  );
}

function StudioCard({ inView }: { inView: boolean }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: 0.2 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="landing-bento-card flex min-h-[220px] items-center justify-between gap-6 p-6 md:p-8"
    >
      <div className="max-w-[200px]">
        <h3 className="text-lg font-semibold tracking-tight text-[var(--landing-fg)]">Studio</h3>
        <motion.p
          className="mt-2 font-mono text-xs leading-relaxed text-[var(--landing-muted)]"
          animate={{ opacity: hovered ? 1 : 0.7 }}
        >
          {hovered ? 'Hover to explore the stack →' : 'Turn your YouTube channel into structured courses.'}
        </motion.p>
      </div>

      <div className="relative h-32 w-40 shrink-0" style={{ perspective: 600 }}>
        {STUDIO_FILES.map((file, i) => {
          const Icon = file.icon;
          const restY = i * 10;
          const restX = i * 4;
          const hoverSpread = hovered ? i * 18 : 0;
          const hoverRotate = hovered ? (i - 1) * 6 : 0;

          const floatOffset = 4 + i * 2;
          const baseY = restY + (hovered ? hoverSpread : 0);

          return (
            <motion.div
              key={file.name}
              initial={{ opacity: 0, y: 24, rotateX: 25 }}
              animate={
                inView
                  ? {
                      opacity: hovered ? 1 : 1 - i * 0.15,
                      y: hovered ? baseY : [baseY, baseY + floatOffset, baseY],
                      x: restX + (hovered ? i * 8 : 0),
                      rotateX: hovered ? 0 : 8 - i * 2,
                      rotateZ: hoverRotate,
                      scale: hovered && i === 0 ? 1.05 : 1,
                    }
                  : {}
              }
              transition={
                hovered
                  ? { type: 'spring', stiffness: 260, damping: 22, delay: i * 0.04 }
                  : {
                      y: { duration: 2.5 + i * 0.4, repeat: Infinity, ease: 'easeInOut' },
                      opacity: { duration: 0.3 },
                      rotateX: { duration: 0.4 },
                    }
              }
              whileHover={{ scale: 1.08, zIndex: 10 }}
              className="absolute inset-x-0 cursor-pointer rounded-lg border border-[var(--landing-border)] p-3 shadow-lg backdrop-blur-sm"
              style={{
                top: 0,
                zIndex: 3 - i,
                background: file.color,
                transformOrigin: 'center bottom',
              }}
            >
              <div className="flex items-center gap-2">
                <motion.div
                  animate={inView && !hovered ? { rotate: [0, 8, 0] } : {}}
                  transition={{ duration: 3 + i, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Icon size={14} className={i === 0 ? 'text-[var(--brand,#e10600)]' : 'text-[var(--landing-muted)]'} />
                </motion.div>
                <span className="font-mono text-[9px] text-[var(--landing-muted)]">{file.name}</span>
                {i === 0 && (
                  <motion.span
                    className="ml-auto size-1.5 rounded-full bg-[var(--brand,#e10600)]"
                    animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1.2, 0.8] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

export function BentoGrid() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} className="border-t border-[var(--landing-border)] px-5 py-24 md:px-8 md:py-32">
      <div className="mx-auto max-w-6xl">
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          className="landing-mono-label mb-12"
        >
          Latest
        </motion.p>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:grid-rows-2">
          <BrandingCard inView={inView} />
          <WorkflowCard inView={inView} />
          <StudioCard inView={inView} />
        </div>
      </div>
    </section>
  );
}
