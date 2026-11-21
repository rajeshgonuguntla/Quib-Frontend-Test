import { useState, useEffect } from 'react';
import { useLocation } from 'react-router';
import { motion } from 'framer-motion';
import { isTokenValid, useAuthSessionKey } from '../auth';
import { useTheme } from './ThemeContext';
import { CubeLoader } from './CubeLoader';
import { LandingNav } from './landing/LandingNav';
import { LandingPanelOverlay, useLandingPanel } from './landing/LandingPanelOverlay';
import { StudentMasterInput } from './StudentMasterInput';
import GoogleLoginButton from './GoogleLoginButton';
import { CUBIT_LOGO } from '../cubit/subjects';

export function LandingPage() {
  const location = useLocation();
  const { isDark } = useTheme();
  const sessionKey = useAuthSessionKey();
  const signedIn = sessionKey !== 'guest' && isTokenValid();
  const [isLoading, setIsLoading] = useState(false);
  const { panel, setPanel } = useLandingPanel();

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
              <StudentMasterInput signedIn={signedIn} />
              {!signedIn && (
                <div className="mt-4 flex flex-col items-center">
                  <p className="mb-2 text-center text-sm text-[var(--landing-muted)]">
                    Students and educators log in
                  </p>
                  <div
                    data-landing-google-signin
                    className="signin-google-wrap flex w-full justify-center"
                  >
                    <GoogleLoginButton
                      signInIntent="student"
                      theme={isDark ? 'filled_black' : 'outline'}
                      size="large"
                    />
                  </div>
                </div>
              )}
            </motion.div>

            <p className="landing-hero-trust mt-8 text-sm text-[var(--landing-muted)]">Free to try. No credit card.</p>
          </motion.div>
        </div>
      </section>

      <LandingPanelOverlay panel={panel} onClose={() => setPanel(null)} />
    </div>
  );
}
