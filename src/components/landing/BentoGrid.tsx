import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Box, Layers, Sparkles } from 'lucide-react';

const WORKFLOW_STEPS = [
  { label: 'extract()', ms: 420, width: '100%' },
  { label: 'generate()', ms: 252, width: '72%', indent: 24 },
  { label: 'quiz()', ms: 168, width: '48%', indent: 48 },
  { label: 'publish()', ms: 168, width: '48%', indent: 48 },
];

export function BentoGrid() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

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
          {/* Large left card — Ship-style branding */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="landing-bento-card landing-pattern-dots relative flex min-h-[320px] items-center justify-center md:row-span-2 md:min-h-[480px]"
          >
            <div className="absolute inset-0 flex flex-wrap content-center justify-center gap-3 p-8 opacity-30">
              {Array.from({ length: 48 }).map((_, i) => (
                <motion.span
                  key={i}
                  className="landing-pulse-dot size-1.5 rounded-sm bg-[var(--landing-muted)]"
                  style={{ animationDelay: `${(i % 8) * 0.3}s` }}
                />
              ))}
            </div>
            <div className="relative text-center">
              <span className="text-4xl font-semibold tracking-tight text-[var(--landing-fg)] md:text-5xl">
                Quib
              </span>
              <span className="ml-2 inline-flex items-center justify-center rounded border border-[var(--landing-border)] px-2 py-0.5 text-sm font-medium text-[var(--landing-muted)]">
                26
              </span>
            </div>
          </motion.div>

          {/* Workflows card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="landing-bento-card flex min-h-[220px] flex-col justify-between p-6 md:p-8"
          >
            <div>
              <h3 className="text-lg font-semibold tracking-tight text-[var(--landing-fg)]">Workflows</h3>
              <p className="mt-2 max-w-sm font-mono text-xs leading-relaxed text-[var(--landing-muted)]">
                From YouTube URL to structured course — pause, resume, pick up exactly where you left off.
              </p>
            </div>
            <div className="mt-6 space-y-2">
              {WORKFLOW_STEPS.map((step, i) => (
                <motion.div
                  key={step.label}
                  initial={{ width: 0, opacity: 0 }}
                  animate={inView ? { width: step.width, opacity: 1 } : {}}
                  transition={{ duration: 0.8, delay: 0.4 + i * 0.12, ease: [0.25, 0.1, 0.25, 1] }}
                  className="flex items-center gap-2"
                  style={{ marginLeft: step.indent ?? 0 }}
                >
                  <div
                    className="h-7 rounded border border-[var(--landing-border)] bg-[var(--landing-bg)] px-2 flex items-center"
                    style={{ width: '100%', maxWidth: 280 }}
                  >
                    <span className="font-mono text-[10px] text-[var(--landing-muted)]">{step.label}</span>
                    <span className="ml-auto font-mono text-[10px] tabular-nums text-[var(--landing-muted)]">{step.ms}ms</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Studio card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="landing-bento-card flex min-h-[220px] items-center justify-between gap-6 p-6 md:p-8"
          >
            <div className="max-w-[200px]">
              <h3 className="text-lg font-semibold tracking-tight text-[var(--landing-fg)]">Studio</h3>
              <p className="mt-2 font-mono text-xs leading-relaxed text-[var(--landing-muted)]">
                The safest way to turn your YouTube channel into courses.
              </p>
            </div>
            <div className="relative h-28 w-36 shrink-0">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16, rotateX: 20 }}
                  animate={inView ? { opacity: 1 - i * 0.2, y: i * 8, rotateX: 0 } : {}}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="absolute inset-x-0 rounded-lg border border-[var(--landing-border)] bg-[var(--landing-card)] p-3 shadow-lg"
                  style={{ top: i * 10, zIndex: 3 - i }}
                >
                  <div className="flex items-center gap-2">
                    {i === 0 ? <Sparkles size={14} className="text-[var(--landing-muted)]" /> : i === 1 ? <Layers size={14} /> : <Box size={14} />}
                    <span className="font-mono text-[9px] text-[var(--landing-muted)]">
                      {i === 0 ? 'channel.tsx' : i === 1 ? 'course.tsx' : 'quiz.tsx'}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
