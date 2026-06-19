import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from 'framer-motion';
import { CubeMorphBackground } from '../CubeMorphBackground';
import { goToEducatorStudio, scrollToSection } from '../../utils/navigation';
import type { NavigateFunction } from 'react-router';
import { LandingThumb } from '../landing/LandingThumb';
import type { LandingThumbTopic } from '../landing/landingThumbnails';

type ThemeColors = {
  bg: string;
  text: string;
  text2: string;
  text3: string;
  border: string;
  border2: string;
  red: string;
  redDim: string;
};

type EducatorsHeroProps = {
  isDark: boolean;
  C: ThemeColors;
  navigate: NavigateFunction;
};

const FLOATS: Array<{ topic: LandingThumbTopic; x: number; y: number; rotateY: number; delay: number }> = [
  { topic: 'studio', x: -300, y: -40, rotateY: 32, delay: 0 },
  { topic: 'lecture', x: 290, y: -60, rotateY: -36, delay: 0.15 },
  { topic: 'quiz', x: -260, y: 100, rotateY: 24, delay: 0.3 },
  { topic: 'course-catalog', x: 270, y: 90, rotateY: -28, delay: 0.45 },
];

function FloatingEducatorWindow({
  topic,
  x,
  y,
  rotateY,
  delay,
  mouseX,
  mouseY,
  isDark,
  borderColor,
}: {
  topic: LandingThumbTopic;
  x: number;
  y: number;
  rotateY: number;
  delay: number;
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
  isDark: boolean;
  borderColor: string;
}) {
  const parallaxX = useTransform(mouseX, [-0.5, 0.5], [x - 16, x + 16]);
  const parallaxY = useTransform(mouseY, [-0.5, 0.5], [y - 12, y + 12]);

  return (
    <motion.div
      className="educators-hero-float pointer-events-none absolute left-1/2 top-[42%] hidden w-36 md:block"
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 0.7, scale: 1 }}
      transition={{ delay: 0.3 + delay, duration: 0.7 }}
      style={{
        x: parallaxX,
        y: parallaxY,
        translateX: '-50%',
        translateY: '-50%',
        rotateY,
        zIndex: 0,
      }}
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 5 + delay * 3, repeat: Infinity, ease: 'easeInOut' }}
        className="overflow-hidden rounded-lg border shadow-2xl backdrop-blur-md"
        style={{ borderColor, background: isDark ? 'rgba(10,10,10,0.75)' : 'rgba(255,255,255,0.85)' }}
      >
        <LandingThumb topic={topic} className="aspect-video w-full" showPlay={false} />
      </motion.div>
    </motion.div>
  );
}

export function EducatorsHero({ isDark, C, navigate }: EducatorsHeroProps) {
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const mouseX = useSpring(rawX, { stiffness: 70, damping: 22 });
  const mouseY = useSpring(rawY, { stiffness: 70, damping: 22 });
  const btnX = useSpring(useTransform(mouseX, [-0.5, 0.5], [-6, 6]), { stiffness: 160, damping: 18 });
  const btnY = useSpring(useTransform(mouseY, [-0.5, 0.5], [-4, 4]), { stiffness: 160, damping: 18 });

  return (
    <section
      className="educators-hero"
      style={{ position: 'relative', overflow: 'hidden' }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        rawX.set((e.clientX - rect.left) / rect.width - 0.5);
        rawY.set((e.clientY - rect.top) / rect.height - 0.5);
      }}
      onMouseLeave={() => {
        rawX.set(0);
        rawY.set(0);
      }}
    >
      <CubeMorphBackground isDark={isDark} />

      <div className="educators-hero-portal">
        {[280, 380, 480].map((size, i) => (
          <motion.div
            key={size}
            className="absolute left-1/2 top-[42%] rounded-full border"
            style={{
              width: size,
              height: size,
              marginLeft: -size / 2,
              marginTop: -size / 2,
              borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.14)',
              transformStyle: 'preserve-3d',
            }}
            initial={{ opacity: 0, rotateX: 72 }}
            animate={{
              opacity: (isDark ? 0.35 : 0.52) - i * 0.08,
              rotateX: 68 + i * 4,
              rotateZ: i % 2 === 0 ? 360 : -360,
            }}
            transition={{
              opacity: { duration: 1, delay: i * 0.15 },
              rotateZ: { duration: 40 + i * 12, repeat: Infinity, ease: 'linear' },
            }}
          />
        ))}
        <svg className={`absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2 ${isDark ? 'opacity-30' : 'opacity-55'}`} width="360" height="360" viewBox="0 0 360 360">
          <motion.path
            d="M180 30 L330 280 L30 280 Z"
            fill="none"
            stroke={isDark ? 'rgba(225,6,0,0.35)' : 'rgba(225,6,0,0.55)'}
            strokeWidth="1"
            strokeDasharray="8 6"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2.5, ease: 'easeInOut' }}
          />
        </svg>
      </div>

      {FLOATS.map((f) => (
        <FloatingEducatorWindow
          key={f.topic}
          {...f}
          mouseX={mouseX}
          mouseY={mouseY}
          isDark={isDark}
          borderColor={C.border}
        />
      ))}

      <div className="relative z-[1] mx-auto max-w-4xl px-6 pb-28 pt-36 text-center">
        <h1
          style={{
            fontFamily: 'var(--serif)',
            fontSize: 'clamp(2.4rem, 5vw, 3.8rem)',
            fontWeight: 400,
            lineHeight: 1.1,
            letterSpacing: '-0.01em',
            color: C.text,
            marginBottom: '1.5rem',
          }}
        >
          {['Build', 'a', 'course', 'from'].map((w, i) => (
            <motion.span
              key={w}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.06, duration: 0.55 }}
              className="mr-[0.3em] inline-block"
            >
              {w}{' '}
            </motion.span>
          ))}
          <br />
          <motion.em
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.45, type: 'spring', stiffness: 180 }}
            style={{ fontStyle: 'italic', color: C.red }}
          >
            a YouTube video
          </motion.em>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          style={{
            fontSize: '1.05rem',
            fontWeight: 300,
            lineHeight: 1.75,
            color: C.text2,
            maxWidth: 540,
            margin: '0 auto 2rem',
          }}
        >
          Connect your channel or paste a link in Educator Studio — Quib generates modules, quizzes, and a course you can publish to the catalog.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          className="mx-auto mb-8 max-w-md overflow-hidden rounded-xl text-left font-mono text-[10px] backdrop-blur-md"
          style={{ border: `1px solid ${C.border}`, background: isDark ? 'rgba(10,10,10,0.65)' : 'rgba(255,255,255,0.75)' }}
        >
          <div className="flex items-center gap-2 border-b px-3 py-2" style={{ borderColor: C.border }}>
            <span className="size-1.5 rounded-full bg-green-500" />
            <span style={{ color: C.text3 }}>Educator Studio · ready</span>
          </div>
          <motion.p
            className="px-3 py-2.5"
            style={{ color: C.text }}
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            youtube.com/watch?v=… → modules → quizzes → publish
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75 }}
          className="flex items-center justify-center gap-3"
        >
          <motion.div style={{ x: btnX, y: btnY }}>
            <button
              type="button"
              onClick={() => goToEducatorStudio(navigate)}
              className="relative overflow-hidden rounded-lg px-7 py-3 text-[0.875rem] font-[600]"
              style={{ background: C.red, color: '#fff', border: 'none', cursor: 'pointer' }}
            >
              <motion.span
                className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 1.2 }}
              />
              Build Your Course
            </button>
          </motion.div>
          <button
            type="button"
            onClick={() => scrollToSection('how-it-works')}
            className="rounded-lg px-6 py-3 text-[0.875rem] font-[500]"
            style={{ background: 'transparent', color: C.text2, border: `1px solid ${C.border2}`, cursor: 'pointer' }}
          >
            See How It Works
          </button>
        </motion.div>
      </div>
    </section>
  );
}
