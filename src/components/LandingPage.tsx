import { useState, useEffect, useRef, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, GraduationCap, Upload } from 'lucide-react';
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

function LearnMock() {
  return (
    <div className="p-4 md:p-6">
      <div className="mb-3 flex items-center gap-2 border-b border-[var(--landing-border)] pb-3">
        <BookOpen size={14} className="text-[var(--landing-muted)]" />
        <span className="font-mono text-xs text-[var(--landing-muted)]">Browse courses</span>
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
        3 videos selected · Build course
      </motion.div>
    </div>
  );
}

export function LandingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark } = useTheme();
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isPlaylistUrl = (url: string) => url.includes('list=');

  const handleGenerate = () => {
    if (!youtubeUrl.trim()) return;
    if (isPlaylistUrl(youtubeUrl)) {
      navigate('/signin', { state: { playlistUrl: youtubeUrl.trim() } });
    } else {
      navigate('/signin', { state: { youtubeUrl: youtubeUrl.trim() } });
    }
  };

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

      {/* Hero — Vercel-style minimal */}
      <section className="relative flex min-h-screen flex-col items-center justify-center px-5 pt-14 text-center md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          className="relative z-10 max-w-3xl"
        >
          <p className="landing-mono-label mb-6">Learning infrastructure</p>
          <h1 className="text-4xl font-semibold leading-[1.08] tracking-tight text-[var(--landing-fg)] md:text-6xl lg:text-7xl">
            Turn your YouTube videos into a real course.
          </h1>
          <p className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-[var(--landing-muted)] md:text-lg">
            Paste a link. Get structured courses, quizzes, and progress — built for learners and creators.
          </p>

          <motion.form
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            onSubmit={(e: FormEvent) => { e.preventDefault(); handleGenerate(); }}
            className="mx-auto mt-10 flex w-full max-w-xl overflow-hidden rounded-lg border border-[var(--landing-border)] bg-[var(--landing-card)]"
          >
            <input
              type="text"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="Paste a YouTube URL…"
              className="min-w-0 flex-1 bg-transparent px-4 py-3 font-mono text-sm text-[var(--landing-fg)] outline-none placeholder:text-[var(--landing-muted)]"
            />
            <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(e: ChangeEvent<HTMLInputElement>) => { e.target.value = ''; }} />
            <button type="button" onClick={() => fileInputRef.current?.click()} className="border-l border-[var(--landing-border)] px-3 text-[var(--landing-muted)] transition-colors hover:text-[var(--landing-fg)]">
              <Upload size={16} />
            </button>
            <button type="submit" className="flex items-center gap-1.5 border-l border-[var(--landing-border)] bg-[var(--landing-fg)] px-5 py-3 text-sm font-medium text-[var(--landing-bg)] transition-opacity hover:opacity-90">
              Start <ArrowRight size={14} />
            </button>
          </motion.form>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="landing-mono-label mt-4"
          >
            Free to try · No credit card
          </motion.p>
        </motion.div>
      </section>

      {/* Platform blocks — like Vercel Agents / Apps / Platforms */}
      <PlatformSection
        id="learn"
        title="Learn"
        description="Browse structured courses from top YouTube educators. Track progress, take quizzes, earn certificates."
        stat="Turn YouTube lessons into courses you can follow, quiz, and complete."
        features={['Course catalog', 'Progress tracking', 'AI quizzes', 'Certificates']}
        mock={<LearnMock />}
      />

      <PlatformSection
        id="create"
        title="Create"
        description="Connect your YouTube channel or paste any URL. Build courses from one video or an entire playlist."
        stat="Connect your channel or paste a URL — then generate and publish a course."
        features={['YouTube OAuth', 'Channel video picker', 'URL paste', 'Publish to catalog']}
        mock={<CreateMock />}
        reverse
      />

      <BentoGrid />

      <FeaturesSection />

      <CtaSection />

      {/* Footer */}
      <footer className="border-t border-[var(--landing-border)] px-5 py-12 md:px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 md:flex-row">
          <div>
            <span className="text-sm font-semibold text-[var(--landing-fg)]">Quib</span>
            <p className="mt-2 max-w-xs text-sm text-[var(--landing-muted)]">Learn from top YouTube educators with AI-powered courses.</p>
          </div>
          <div className="flex gap-12">
            {[
              { title: 'Product', links: [{ l: 'Features', h: '/#features' }, { l: 'Sign in', h: '/signin' }] },
              { title: 'Company', links: [{ l: 'How it works', h: '/#learn' }, { l: 'Support', h: 'mailto:support@quibb.ai' }] },
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
        <p className="mx-auto mt-10 max-w-6xl text-xs text-[var(--landing-muted)]">© 2026 Quib. All rights reserved.</p>
      </footer>
    </div>
  );
}
