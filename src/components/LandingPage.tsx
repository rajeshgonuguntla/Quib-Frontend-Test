import { useState, useEffect } from 'react';
import { useLocation } from 'react-router';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useTheme } from './ThemeContext';
import { CubeLoader } from './CubeLoader';
import { LandingNav } from './landing/LandingNav';
import {
  LandingFeaturesContent,
  LandingLearnContent,
  type LandingPanelId,
} from './landing/LandingSimpleBelow';
import { StudentMasterInput } from './StudentMasterInput';
import { CUBIT_LOGO } from '../cubit/subjects';

export function LandingPage() {
  const location = useLocation();
  const { isDark } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [panel, setPanel] = useState<LandingPanelId | null>(null);

  useEffect(() => {
    if (location.state?.fromSignup) {
      setIsLoading(true);
      const timer = setTimeout(() => setIsLoading(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    if (!panel) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPanel(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [panel]);

  if (isLoading) return <CubeLoader />;

  return (
    <div className={`landing-page h-dvh overflow-hidden ${isDark ? '' : 'light'}`}>
      <div className="landing-grid-bg pointer-events-none fixed inset-0" />
      <LandingNav
        isDark={isDark}
        activePanel={panel}
        onOpenPanel={(id) => setPanel((prev) => (prev === id ? null : id))}
        onClosePanel={() => setPanel(null)}
      />

      <section id="ask" className="landing-hero-stack relative px-5 md:px-8">
        <div className="landing-hero-viewport mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center">
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
            <h1
              className="mt-5 text-[26px] font-semibold leading-snug tracking-tight text-[var(--landing-fg)] md:text-[32px]"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Your Personal Tutor
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-[var(--landing-muted)] md:text-lg">
              Get help with anything you come across in the classroom — explanations, practice, and answers.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="cuib-app mx-auto mt-10 w-full max-w-xl text-left"
              style={{ background: 'transparent' }}
            >
              <StudentMasterInput signedIn={false} />
            </motion.div>

            <p className="landing-hero-trust mt-8 text-sm text-[var(--landing-muted)]">Free to try. No credit card.</p>
          </motion.div>
        </div>
      </section>

      <AnimatePresence>
        {panel ? (
          <motion.div
            key={panel}
            role="dialog"
            aria-modal="true"
            aria-label={panel === 'features' ? 'Features' : 'Learn'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[90] flex flex-col bg-[var(--landing-bg)] pt-14"
          >
            <div className="landing-grid-bg pointer-events-none absolute inset-0" />
            <div className="relative flex shrink-0 items-center justify-end px-5 py-3 md:px-8">
              <button
                type="button"
                onClick={() => setPanel(null)}
                className="inline-flex size-11 items-center justify-center rounded-lg text-[var(--landing-muted)] transition-colors hover:bg-[var(--landing-card)] hover:text-[var(--landing-fg)]"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            <div className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-16 md:px-8">
              {panel === 'features' ? <LandingFeaturesContent /> : <LandingLearnContent />}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
