import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { LandingThumb } from '../landing/LandingThumb';
import type { LandingThumbTopic } from '../landing/landingThumbnails';

type ThemeColors = {
  bg: string;
  bg1: string;
  text: string;
  text2: string;
  border: string;
  red: string;
};

const CAPABILITIES: Array<{
  title: string;
  desc: string;
  topic: LandingThumbTopic;
  tags: string[];
}> = [
  {
    title: 'AI-generated quizzes',
    desc: 'Quizzes built from your video content — multiple choice and more, tied to what you actually teach.',
    topic: 'quiz',
    tags: ['From transcript', 'Configurable', 'Per module'],
  },
  {
    title: 'Structured modules',
    desc: 'Videos become modules and lessons learners can follow in order instead of scrubbing a timeline.',
    topic: 'linear-algebra',
    tags: ['Modules', 'Lessons', 'Progress'],
  },
  {
    title: 'Educator Studio',
    desc: 'Connect YouTube OAuth, pick videos from your channel, or paste any URL you have rights to use.',
    topic: 'studio',
    tags: ['Channel OAuth', 'Video picker', 'URL paste'],
  },
  {
    title: 'Publish to catalog',
    desc: 'When your course is ready, publish it so learners can browse and enroll on Quib.',
    topic: 'course-catalog',
    tags: ['Catalog', 'Enrollments', 'Shareable'],
  },
  {
    title: 'Student certificates',
    desc: 'Learners who pass can earn verifiable certificates they can download or share.',
    topic: 'neural-networks',
    tags: ['Verified', 'Download', 'Share'],
  },
  {
    title: 'YouTube-first workflow',
    desc: 'Start from the platform where your lectures already live — no re-uploading or re-editing required.',
    topic: 'lecture',
    tags: ['YouTube', 'Playlists', 'Channels'],
  },
];

export function EducatorsCapabilities({ C, isDark }: { C: ThemeColors; isDark: boolean }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section ref={ref} className="cert-reveal py-24" style={{ background: C.bg1 }}>
      <div className="mx-auto max-w-5xl px-6">
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
          What You Get
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
          Everything included,<br />
          built from your video
        </motion.h2>
        <p style={{ fontSize: '0.9rem', color: C.text2, lineHeight: 1.7, maxWidth: 480, marginBottom: 48 }}>
          One starting point on YouTube — structured output on Quib.
        </p>

        <div className="grid gap-5 md:grid-cols-2">
          {CAPABILITIES.map((cap, i) => (
            <motion.div
              key={cap.title}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.08 }}
              className="educators-cap-card rounded-2xl"
              style={{ background: C.bg, border: `1px solid ${C.border}` }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = isDark ? 'rgba(225,6,0,0.25)' : 'rgba(225,6,0,0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = C.border;
              }}
            >
              <LandingThumb topic={cap.topic} className="aspect-[2.4/1] w-full rounded-t-2xl" showPlay={false} />
              <div className="p-6 md:p-8">
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: C.text, marginBottom: 8 }}>{cap.title}</h3>
                <p style={{ fontSize: '0.82rem', color: C.text2, lineHeight: 1.65, marginBottom: 16 }}>{cap.desc}</p>
                <div className="flex flex-wrap gap-1.5">
                  {cap.tags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        fontSize: '0.62rem',
                        fontWeight: 500,
                        padding: '3px 10px',
                        borderRadius: 4,
                        background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                        border: `1px solid ${C.border}`,
                        color: C.text2,
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
