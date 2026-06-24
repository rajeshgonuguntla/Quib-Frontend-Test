import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { Box, Layers, Sparkles } from 'lucide-react';
import { useTheme } from '../ThemeContext';
import { TeachMock } from './TeachMock';

const STUDIO_FILES = [
  { icon: Sparkles, name: 'channel.tsx', colorDark: 'rgba(225, 6, 0, 0.15)', colorLight: 'rgba(225, 6, 0, 0.08)' },
  { icon: Layers, name: 'course.tsx', colorDark: 'rgba(255, 255, 255, 0.06)', colorLight: 'rgba(0, 0, 0, 0.04)' },
  { icon: Box, name: 'quiz.tsx', colorDark: 'rgba(255, 255, 255, 0.06)', colorLight: 'rgba(0, 0, 0, 0.04)' },
];

const TEACH_FEATURES = ['Public catalog', 'Module breakdown', 'Quiz generation'];

function StudioCard({ inView }: { inView: boolean }) {
  const { isDark } = useTheme();
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: 0.15 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="landing-bento-card flex min-h-[220px] items-center justify-between gap-6 p-6 md:p-8"
    >
      <div className="max-w-[220px]">
        <h3 className="text-lg font-semibold tracking-tight text-[var(--landing-fg)]">Studio</h3>
        <motion.p
          className="mt-2 font-mono text-xs leading-relaxed text-[var(--landing-muted)]"
          animate={{ opacity: hovered ? 1 : 0.75 }}
        >
          {hovered ? 'Hover to explore the stack →' : 'Turn your YouTube channel into structured courses.'}
        </motion.p>
      </div>

      <div className="relative h-36 w-44 shrink-0" style={{ perspective: 600 }}>
        {STUDIO_FILES.map((file, i) => {
          const Icon = file.icon;
          const restY = i * 12;
          const restX = i * 5;
          const hoverSpread = hovered ? i * 20 : 0;
          const hoverRotate = hovered ? (i - 1) * 7 : 0;
          const floatOffset = 5 + i * 2;
          const baseY = restY + hoverSpread;
          const bg = isDark ? file.colorDark : file.colorLight;

          return (
            <motion.div
              key={file.name}
              initial={{ opacity: 0, y: 28, rotateX: 20 }}
              animate={
                inView
                  ? {
                      opacity: hovered ? 1 : 1 - i * 0.12,
                      y: hovered ? baseY : [baseY, baseY + floatOffset, baseY],
                      x: restX + (hovered ? i * 10 : 0),
                      rotateX: hovered ? 0 : 10 - i * 3,
                      rotateZ: hoverRotate,
                      scale: hovered && i === 0 ? 1.06 : 1,
                    }
                  : {}
              }
              transition={
                hovered
                  ? { type: 'spring', stiffness: 260, damping: 22, delay: i * 0.04 }
                  : {
                      y: { duration: 2.4 + i * 0.35, repeat: Infinity, ease: 'easeInOut' },
                      opacity: { duration: 0.3 },
                      rotateX: { duration: 0.4 },
                    }
              }
              whileHover={{ scale: 1.08, zIndex: 10 }}
              className="absolute inset-x-0 cursor-pointer rounded-lg border border-[var(--landing-border)] p-3 shadow-lg backdrop-blur-sm"
              style={{
                top: 0,
                zIndex: 3 - i,
                background: bg,
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
    <section id="teach" ref={ref} className="border-t border-[var(--landing-border)] px-5 py-24 md:px-8 md:py-32">
      <div className="mx-auto max-w-6xl">
        {/* Teach — replaces Quib branding + Workflows bento cards */}
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="lg:col-span-3"
          >
            <h2 className="text-3xl font-semibold tracking-tight text-[var(--landing-fg)] md:text-4xl">Teach</h2>
            <p className="landing-mono-label mt-4 max-w-xs leading-relaxed">
              Publish to the Quib catalog. Your audience gets modules, assessments, and timestamp-linked lessons.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-6"
          >
            <div className="landing-bento-card shadow-lg">
              <TeachMock />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="lg:col-span-3"
          >
            <p className="text-lg font-medium leading-snug tracking-tight text-[var(--landing-fg)] md:text-xl">
              Your content. Structured. Searchable. Shareable.
            </p>
            <div className="mt-8 space-y-3">
              <p className="landing-mono-label">Features</p>
              {TEACH_FEATURES.map((f, i) => (
                <motion.p
                  key={f}
                  initial={{ opacity: 0, x: -8 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.25 + i * 0.06 }}
                  className="landing-feature-item"
                >
                  {f}
                </motion.p>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="mt-3">
          <StudioCard inView={inView} />
        </div>
      </div>
    </section>
  );
}
