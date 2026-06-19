import { useState, useEffect, useRef, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, GraduationCap, Play, Upload } from 'lucide-react';
import { useTheme } from './ThemeContext';
import { CubeLoader } from './CubeLoader';
import { LandingNav } from './landing/LandingNav';
import { PlatformSection } from './landing/PlatformSection';
import { BentoGrid } from './landing/BentoGrid';

const TICKER = [
  'Top educators', 'Structured courses', 'Progress tracking', 'AI quizzes',
  'Certificates', 'Educator Studio', 'YouTube native', 'Learn at your pace',
];

function LearnMock() {
  return (
    <div className="p-4 md:p-6">
      <div className="mb-3 flex items-center gap-2 border-b border-[var(--landing-border)] pb-3">
        <BookOpen size={14} className="text-[var(--landing-muted)]" />
        <span className="font-mono text-xs text-[var(--landing-muted)]">Browse courses</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {['Linear Algebra', 'Web Dev', 'Machine Learning', 'TypeScript'].map((title, i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            viewport={{ once: true }}
            className="rounded-md border border-[var(--landing-border)] p-3"
          >
            <div className="mb-2 aspect-video rounded bg-[var(--landing-bg)]" />
            <p className="truncate text-xs font-medium text-[var(--landing-fg)]">{title}</p>
            <p className="text-[10px] text-[var(--landing-muted)]">12 modules</p>
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
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.02 }}
            className="aspect-video rounded border border-[var(--landing-border)] bg-[var(--landing-bg)] flex items-center justify-center"
          >
            <Play size={12} className="text-[var(--landing-muted)]" />
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

function TeachMock() {
  return (
    <div className="p-4 md:p-6 font-mono text-xs">
      <div className="mb-3 flex gap-1.5 border-b border-[var(--landing-border)] pb-3">
        <span className="size-2 rounded-full bg-red-500/80" />
        <span className="size-2 rounded-full bg-yellow-500/80" />
        <span className="size-2 rounded-full bg-green-500/80" />
        <span className="ml-1 text-[var(--landing-muted)]">course.json</span>
      </div>
      {[
        '{',
        '  "title": "Neural Networks",',
        '  "modules": 8,',
        '  "quizzes": 24,',
        '  "published": true',
        '}',
      ].map((line, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -4 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          viewport={{ once: true }}
          className="leading-relaxed text-[var(--landing-muted)]"
        >
          {line}
        </motion.div>
      ))}
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
            Learn from the best educators on YouTube
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

        {/* Ticker */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="absolute bottom-0 left-0 right-0 overflow-hidden border-t border-[var(--landing-border)] py-3"
        >
          <div className="landing-ticker flex w-max">
            {[...TICKER, ...TICKER].map((item, i) => (
              <span key={i} className="landing-mono-label inline-flex items-center gap-2 px-8 whitespace-nowrap">
                <span className="text-[var(--brand,#e10600)]">·</span>
                {item}
              </span>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Platform blocks — like Vercel Agents / Apps / Platforms */}
      <PlatformSection
        id="learn"
        title="Learn"
        description="Browse structured courses from top YouTube educators. Track progress, take quizzes, earn certificates."
        stat="Thousands of learners use Quib to turn video into real comprehension."
        features={['Course catalog', 'Progress tracking', 'AI quizzes', 'Certificates']}
        mock={<LearnMock />}
      />

      <PlatformSection
        id="create"
        title="Create"
        description="Connect your YouTube channel or paste any URL. Build courses from one video or an entire playlist."
        stat="Educators publish structured courses in minutes, not weeks."
        features={['YouTube OAuth', 'Multi-video picker', 'URL paste', 'One-click publish']}
        mock={<CreateMock />}
        reverse
      />

      <PlatformSection
        id="teach"
        title="Teach"
        description="Publish to the Quib catalog. Your audience gets modules, assessments, and timestamp-linked lessons."
        stat="Your content. Structured. Searchable. Shareable."
        features={['Public catalog', 'Module breakdown', 'Quiz generation', 'Analytics']}
        mock={<TeachMock />}
      />

      <BentoGrid />

      {/* Features bento */}
      <section id="features" className="border-t border-[var(--landing-border)] px-5 py-24 md:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Built for comprehension</h2>
          <p className="landing-mono-label mt-3 max-w-md">Every feature designed so learners actually understand — not just skim.</p>
          <div className="mt-12 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { tag: 'AI', title: 'Context-aware quizzes', desc: 'Questions that test understanding, not random sentences.' },
              { tag: 'Levels', title: 'Difficulty control', desc: 'Easy, medium, or hard — tuned to your audience.' },
              { tag: 'Global', title: 'Any language', desc: 'Works with educators teaching in dozens of languages.' },
              { tag: 'Share', title: 'LinkedIn certificates', desc: 'Share completions with one click.' },
            ].map((f, i) => (
              <motion.div
                key={f.tag}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                viewport={{ once: true }}
                className="landing-bento-card p-6"
              >
                <p className="landing-mono-label">{f.tag}</p>
                <h3 className="mt-3 text-sm font-semibold text-[var(--landing-fg)]">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--landing-muted)]">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative border-t border-[var(--landing-border)] px-5 py-32 text-center md:px-8">
        <div className="landing-glow pointer-events-none absolute inset-0" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative"
        >
          <h2 className="text-3xl font-semibold tracking-tight md:text-5xl">Start building with Quib</h2>
          <p className="mx-auto mt-4 max-w-md text-[var(--landing-muted)]">For learners and educators. Free to try today.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/signin" className="rounded-md bg-[var(--landing-fg)] px-6 py-3 text-sm font-medium text-[var(--landing-bg)] no-underline transition-opacity hover:opacity-90">
              Get started
            </Link>
            <Link to="/educators" className="rounded-md border border-[var(--landing-border)] px-6 py-3 text-sm text-[var(--landing-fg)] no-underline transition-colors hover:border-[var(--landing-muted)]">
              For educators
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--landing-border)] px-5 py-12 md:px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 md:flex-row">
          <div>
            <span className="text-sm font-semibold text-[var(--landing-fg)]">Quib</span>
            <p className="mt-2 max-w-xs text-sm text-[var(--landing-muted)]">Learn from top YouTube educators with AI-powered courses.</p>
          </div>
          <div className="flex gap-12">
            {[
              { title: 'Product', links: [{ l: 'Features', h: '#features' }, { l: 'Educators', h: '/educators' }, { l: 'Sign in', h: '/signin' }] },
              { title: 'Company', links: [{ l: 'How it works', h: '#learn' }, { l: 'Support', h: 'mailto:support@quibb.ai' }] },
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
