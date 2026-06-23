import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import type { NavigateFunction } from 'react-router';
import { goToEducatorStudio } from '../../utils/navigation';

type ThemeColors = {
  text: string;
  text2: string;
  border: string;
  red: string;
};

export function EducatorsCta({ C, navigate }: { C: ThemeColors; navigate: NavigateFunction }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section ref={ref} className="cert-reveal relative overflow-hidden py-28">
      <div className="pointer-events-none absolute inset-0">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute left-1/2 top-1/2 size-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[rgba(225,6,0,0.25)]"
            animate={inView ? { scale: [1, 2.8], opacity: [0.4, 0] } : {}}
            transition={{ duration: 3, repeat: Infinity, delay: i * 0.9, ease: 'easeOut' }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        className="relative mx-auto max-w-3xl px-6 text-center"
      >
        <h2
          style={{
            fontFamily: 'var(--serif)',
            fontSize: 'clamp(2rem, 4vw, 2.8rem)',
            fontWeight: 400,
            lineHeight: 1.15,
            color: C.text,
            marginBottom: 20,
          }}
        >
          Turn any YouTube video
          <br />
          <em style={{ fontStyle: 'italic', color: C.red }}>into a course today</em>
        </h2>
        <p style={{ fontSize: '0.95rem', color: C.text2, lineHeight: 1.7, maxWidth: 440, margin: '0 auto 36px' }}>
          Open Educator Studio, connect your channel or paste a URL, and publish when you are ready.
        </p>
        <button
          type="button"
          onClick={() => goToEducatorStudio(navigate)}
          className="inline-flex items-center gap-2 rounded-lg px-8 py-3.5 text-[0.9rem] font-[600] transition-opacity hover:opacity-90"
          style={{ background: C.red, color: '#fff', border: 'none', cursor: 'pointer' }}
        >
          Get Started — It&apos;s Free <ArrowRight className="size-4" />
        </button>
      </motion.div>
    </section>
  );
}
