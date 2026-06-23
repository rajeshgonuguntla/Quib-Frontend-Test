import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { LandingThumb } from '../landing/LandingThumb';
import type { LandingThumbTopic } from '../landing/landingThumbnails';

type ThemeColors = {
  bg: string;
  text: string;
  text2: string;
  text3: string;
  border: string;
  red: string;
};

const STEPS = [
  {
    num: '01',
    title: 'Connect or paste',
    desc: 'Link your YouTube channel in Educator Studio, or paste a video or playlist URL directly.',
    topic: 'studio' as LandingThumbTopic,
  },
  {
    num: '02',
    title: 'Quib builds the course',
    desc: 'Quib generates modules, lessons, and quizzes from the video content. Course generation can take a few minutes.',
    topic: 'machine-learning' as LandingThumbTopic,
  },
  {
    num: '03',
    title: 'Publish to the catalog',
    desc: 'Review your course, publish it, and share it with learners on Quib.',
    topic: 'course-catalog' as LandingThumbTopic,
  },
];

export function EducatorsPipeline({ C, isDark }: { C: ThemeColors; isDark: boolean }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const t = setInterval(() => setActive((a) => (a + 1) % STEPS.length), 3500);
    return () => clearInterval(t);
  }, [inView]);

  return (
    <section ref={ref} id="how-it-works" className="cert-reveal py-24">
      <div className="relative mx-auto max-w-5xl px-6">
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          style={{
            fontFamily: 'var(--mono)',
            fontSize: '0.62rem',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: C.red,
            marginBottom: 12,
          }}
        >
          How It Works
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          style={{
            fontFamily: 'var(--serif)',
            fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)',
            fontWeight: 400,
            lineHeight: 1.2,
            color: C.text,
            marginBottom: 12,
          }}
        >
          Three steps to a<br />
          ready-to-share course
        </motion.h2>
        <p style={{ fontSize: '0.9rem', color: C.text2, lineHeight: 1.7, maxWidth: 480, marginBottom: 48 }}>
          No manual course authoring — start from video you already have on YouTube.
        </p>

        {/* Flow connector — desktop */}
        <svg className="pointer-events-none absolute left-6 right-6 top-[280px] hidden h-24 md:block" preserveAspectRatio="none">
          <motion.path
            d="M 120 40 C 280 40, 280 40, 440 40 C 600 40, 600 40, 760 40"
            fill="none"
            stroke="rgba(225,6,0,0.25)"
            strokeWidth="1"
            className="educators-flow-path"
            initial={{ pathLength: 0 }}
            animate={inView ? { pathLength: 1 } : {}}
            transition={{ duration: 1.5 }}
          />
        </svg>

        <div className="grid gap-5 md:grid-cols-3" style={{ perspective: 1000 }}>
          {STEPS.map((step, i) => {
            const isActive = active === i;
            return (
              <motion.article
                key={step.num}
                initial={{ opacity: 0, y: 32, rotateX: 12 }}
                animate={
                  inView
                    ? {
                        opacity: isActive ? 1 : 0.55,
                        y: 0,
                        rotateX: isActive ? 0 : 6,
                        scale: isActive ? 1.02 : 0.98,
                      }
                    : {}
                }
                transition={{ delay: i * 0.12, duration: 0.55 }}
                onMouseEnter={() => setActive(i)}
                className={`educators-pipeline-card rounded-2xl ${isActive ? 'is-active' : ''}`}
              >
                {isActive && <div className="educators-pipeline-beam pointer-events-none absolute -inset-px rounded-2xl opacity-100" />}
                <div
                  className="relative overflow-hidden rounded-2xl p-6 md:p-8"
                  style={{
                    background: C.bg,
                    border: `1px solid ${isActive ? 'rgba(225,6,0,0.35)' : C.border}`,
                    boxShadow: isActive ? '0 20px 60px rgba(225,6,0,0.08)' : 'none',
                  }}
                >
                  <LandingThumb topic={step.topic} className="mb-5 aspect-video w-full rounded-lg" showPlay={false} />
                  <div
                    style={{
                      fontFamily: 'var(--serif)',
                      fontSize: '2.4rem',
                      color: isDark ? 'rgba(225,6,0,0.15)' : 'rgba(225,6,0,0.1)',
                      lineHeight: 1,
                      marginBottom: 12,
                    }}
                  >
                    {step.num}
                  </div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: C.text, marginBottom: 10 }}>{step.title}</h3>
                  <p style={{ fontSize: '0.82rem', color: C.text2, lineHeight: 1.7 }}>{step.desc}</p>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
