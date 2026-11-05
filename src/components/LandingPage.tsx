import { useState, useEffect, useRef, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, GraduationCap } from 'lucide-react';
import { useTheme } from './ThemeContext';
import { CubeLoader } from './CubeLoader';
import { LandingNav } from './landing/LandingNav';
import { PlatformSection } from './landing/PlatformSection';
import { BentoGrid } from './landing/BentoGrid';
import { FeaturesSection } from './landing/FeaturesSection';
import { CtaSection } from './landing/CtaSection';
import { LandingThumb } from './landing/LandingThumb';
import {
  LANDING_COURSE_THUMBNAILS,
  LANDING_STUDIO_TOPICS,
} from './landing/landingThumbnails';
import { CUBIT_LOGO, LANDING_BRAND_NAME } from '../cubit/subjects';

const LANDING_PHRASES = [
  'Paste a YouTube URL',
  'Generate a course from a playlist',
  'Ask about this lesson',
  'Make flashcards from the transcript',
];

function LearnMock() {
  return (
    <div className="p-4 md:p-6">
      <div className="mb-3 flex items-center gap-2 border-b border-[var(--landing-border)] pb-3">
        <BookOpen size={14} className="text-[var(--landing-muted)]" />
        <span className="font-mono text-xs text-[var(--landing-muted)]">Discover · AI-enriched catalog</span>
      </div>
      <div className="mb-3 rounded-md border border-dashed border-[var(--landing-border)] px-2 py-1.5 font-mono text-[9px] text-[var(--landing-muted)]">
        Cubit tutor · &ldquo;Summarize module 2 before my quiz&rdquo;
      </div>
      <div className="grid grid-cols-2 gap-2">
        {LANDING_COURSE_THUMBNAILS.map((course, i) => (
          <motion.div
            key={course.title}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            viewport={{ once: true }}
            className="rounded-md border border-[var(--landing-border)] p-3"
          >
            <LandingThumb
              topic={course.topic}
              label={course.title}
              className="mb-2 aspect-video rounded"
              duration={`${8 + i * 3}:${String(12 + i * 7).padStart(2, '0')}`}
            />
            <p className="truncate text-xs font-medium text-[var(--landing-fg)]">{course.title}</p>
            <p className="text-[10px] text-[var(--landing-muted)]">{course.modules} modules</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function CreateMock() {
  return (
    <div className="p-4 md:p-6">
      <div className="mb-3 flex items-center gap-2 border-b border-[var(--landing-border)] pb-3">
        <GraduationCap size={14} className="text-[var(--landing-muted)]" />
        <span className="font-mono text-xs text-[var(--landing-muted)]">Educator Studio</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {LANDING_STUDIO_TOPICS.map((topic, i) => (
          <motion.div
            key={topic}
            whileHover={{ scale: 1.02 }}
            className="aspect-video overflow-hidden rounded border border-[var(--landing-border)]"
          >
            <LandingThumb
              topic={topic}
              className="h-full w-full"
              selected={i < 3}
              duration={`${4 + i}:${String(10 + i * 11).padStart(2, '0')}`}
            />
          </motion.div>
        ))}
      </div>
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="mt-3 rounded-md border border-[var(--brand,#e10600)] bg-[rgba(225,6,0,0.08)] px-3 py-2 text-center font-mono text-[10px] text-[var(--landing-fg)]"
      >
        AI building modules · quizzes · lesson text
      </motion.div>
    </div>
  );
}

export function LandingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark } = useTheme();
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [phText, setPhText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const phraseIdx = useRef(0);
  const activeRef = useRef(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showTypewriter = !focused && !query.trim();

  const handleStart = (e: FormEvent) => {
    e.preventDefault();
    const value = query.trim();
    if (!value) {
      navigate('/signin');
      return;
    }
    if (value.includes('list=')) {
      navigate('/signin', { state: { playlistUrl: value } });
      return;
    }
    navigate('/signin', { state: { youtubeUrl: value } });
  };

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!showTypewriter || reduced) {
      activeRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
      setPhText(reduced ? LANDING_PHRASES[0]! : '');
      return;
    }

    activeRef.current = true;
    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        timerRef.current = setTimeout(resolve, ms);
      });

    const loop = async () => {
      while (activeRef.current) {
        const phrase = LANDING_PHRASES[phraseIdx.current % LANDING_PHRASES.length]!;
        for (let i = 0; i <= phrase.length; i++) {
          if (!activeRef.current) return;
          setPhText(phrase.slice(0, i));
          await wait(55);
        }
        await wait(1800);
        if (!activeRef.current) return;
        for (let i = phrase.length; i >= 0; i--) {
          if (!activeRef.current) return;
          setPhText(phrase.slice(0, i));
          await wait(30);
        }
        await wait(200);
        phraseIdx.current = (phraseIdx.current + 1) % LANDING_PHRASES.length;
      }
    };

    void loop();
    return () => {
      activeRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [showTypewriter]);

  useEffect(() => {
    if (location.state?.fromSignup) {
      setIsLoading(true);
      const timer = setTimeout(() => setIsLoading(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  if (isLoading) return <CubeLoader />;

  return (
    <div className={`landing-page min-h-screen overflow-x-hidden ${isDark ? '' : 'light'}`}>
      <div className="landing-grid-bg pointer-events-none fixed inset-0" />
      <LandingNav isDark={isDark} />

      <section id="ask" className="landing-hero-stack relative px-5 md:px-8">
        <div className="mx-auto w-full max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
            className="landing-hero-primary relative z-10 mx-auto w-full max-w-3xl text-center"
          >
          <div className="mx-auto flex items-center justify-center gap-3">
            <img
              src={CUBIT_LOGO}
              alt="Cubit"
              width={84}
              height={84}
              className="size-[72px] object-contain md:size-[84px]"
            />
            <span
              className="text-[44px] font-semibold leading-none tracking-tight md:text-[54px]"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600,
                color: isDark ? '#f5f5f5' : 'var(--landing-fg)',
              }}
            >
              Cubit
            </span>
          </div>
          <h1 className="text-4xl font-semibold leading-[1.08] tracking-tight text-[var(--landing-fg)] md:text-6xl lg:text-7xl">
            Personal tutor, whenever you need one.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-[var(--landing-muted)] md:text-lg">
            Get help with anything you come across in the classroom — explanations, practice, and answers, whenever you need them.
          </p>

          <motion.form
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            onSubmit={handleStart}
            className="mx-auto mt-10 flex w-full max-w-xl overflow-hidden rounded-lg border border-[var(--landing-border)] bg-[var(--landing-card)]"
          >
            <div className="relative min-w-0 flex-1">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder=" "
                className="relative z-[1] min-h-11 w-full bg-transparent px-4 text-[16px] text-[var(--landing-fg)] outline-none md:text-sm"
                style={{ fontFamily: 'var(--mono)' }}
                inputMode="text"
                autoComplete="off"
                aria-label="Paste a YouTube link or ask a learning question"
              />
              {showTypewriter && (
                <div className="pointer-events-none absolute inset-y-0 left-4 right-4 z-0 flex items-center gap-0.5 overflow-hidden whitespace-nowrap" aria-hidden>
                  <span className="truncate text-[16px] text-[var(--landing-muted)] md:text-sm" style={{ fontFamily: 'var(--mono)' }}>{phText}</span>
                  <span className="inline-block h-[13px] w-[1.5px] shrink-0 animate-pulse bg-[var(--landing-muted)] motion-reduce:hidden" />
                </div>
              )}
            </div>
            <button
              type="submit"
              className="inline-flex min-h-11 items-center gap-1.5 border-l border-[var(--landing-border)] bg-[var(--landing-fg)] px-5 text-sm font-medium text-[var(--landing-bg)] transition-opacity hover:opacity-90"
              aria-label="Start with Cubit"
            >
              Start <ArrowRight size={14} />
            </button>
          </motion.form>

          <p className="landing-hero-trust mt-8 text-sm text-[var(--landing-muted)]">Free to try. No credit card.</p>
          </motion.div>

          <FeaturesSection variant="belowHero" />
        </div>
      </section>

      <PlatformSection
        id="learn"
        title="Learn"
        description="Enroll in AI-structured courses, generate study tools from each lesson, and chat with a tutor grounded in the transcript."
        stat="Every lesson ships with quizzes, flashcards, notes, and a tutor that knows the material."
        features={['Course catalog', 'Study rail tools', 'Lesson tutor chat', 'Certificates']}
        mock={<LearnMock />}
      />

      <PlatformSection
        id="create"
        title="Create"
        description="Connect YouTube or paste URLs. Cubit drafts modules, assessments, and lesson copy you can edit before publish."
        stat="One channel or one link — full course generation, not a static playlist embed."
        features={['YouTube OAuth', 'AI course builder', 'Quiz & module drafts', 'Publish to catalog']}
        mock={<CreateMock />}
        reverse
      />

      <BentoGrid />

      <CtaSection />

      {/* Footer */}
      <footer className="border-t border-[var(--landing-border)] px-5 py-12 md:px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 md:flex-row">
          <div>
            <Link to="/" className="flex items-center gap-2 no-underline">
              <img src={CUBIT_LOGO} alt="" width={30} height={30} className="size-[30px] object-contain" />
              <span
                className="text-sm font-semibold tracking-tight text-[var(--landing-fg)]"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {LANDING_BRAND_NAME}
              </span>
            </Link>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-[var(--landing-muted)]">
              A personal tutor at your disposal — help with anything you come across in the classroom.
            </p>
          </div>
          <div className="flex gap-12">
            {[
              { title: 'Product', links: [{ l: 'Features', h: '/#features' }, { l: 'Sign in', h: '/signin' }] },
              { title: 'Legal', links: [{ l: 'Terms', h: '/terms' }, { l: 'Privacy', h: '/privacy' }] },
              { title: 'Company', links: [{ l: 'How it works', h: '/#learn' }, { l: 'Support', h: 'mailto:support@Cubit.ai' }] },
            ].map((col) => (
              <div key={col.title}>
                <p className="landing-mono-label mb-3">{col.title}</p>
                {col.links.map((link) => (
                  link.h.startsWith('/') ? (
                    <Link key={link.l} to={link.h} className="block py-1 text-sm text-[var(--landing-muted)] no-underline hover:text-[var(--landing-fg)]">{link.l}</Link>
                  ) : link.h.startsWith('#') ? (
                    <a key={link.l} href={link.h} className="block py-1 text-sm text-[var(--landing-muted)] no-underline hover:text-[var(--landing-fg)]">{link.l}</a>
                  ) : (
                    <a key={link.l} href={link.h} className="block py-1 text-sm text-[var(--landing-muted)] no-underline hover:text-[var(--landing-fg)]">{link.l}</a>
                  )
                ))}
              </div>
            ))}
          </div>
        </div>
        <p className="mx-auto mt-10 max-w-6xl text-xs text-[var(--landing-muted)]">© 2026 {LANDING_BRAND_NAME}. All rights reserved.</p>
      </footer>
    </div>
  );
}
