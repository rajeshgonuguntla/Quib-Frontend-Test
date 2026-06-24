import { Link, useLocation, useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, GraduationCap } from 'lucide-react';
import { useEffect } from 'react';
import GoogleLoginButton from './GoogleLoginButton';
import { useTheme } from './ThemeContext';
import { LandingNav } from './landing/LandingNav';

type SignInCardProps = {
  intent: 'creator' | 'student';
  icon: typeof GraduationCap;
  eyebrow: string;
  title: string;
  description: string;
  highlights: readonly { value: string; label: string }[];
  pendingUrl?: string;
  isDark: boolean;
  delay?: number;
};

function SignInCard({
  intent,
  icon: Icon,
  eyebrow,
  title,
  description,
  highlights,
  pendingUrl,
  isDark,
  delay = 0,
}: SignInCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className="flex h-full flex-col overflow-hidden rounded-xl border border-[var(--landing-border)] bg-[var(--landing-card)] shadow-sm"
    >
      <div className="flex items-center gap-2 border-b border-[var(--landing-border)] px-5 py-3">
        <Icon size={14} className="text-[var(--brand,#e10600)]" />
        <span className="landing-mono-label">{eyebrow}</span>
      </div>

      <div className="flex flex-1 flex-col px-5 py-6">
        <h2 className="text-xl font-semibold leading-tight tracking-tight text-[var(--landing-fg)] md:text-2xl">
          {title}
        </h2>

        <p className="mt-3 flex-1 text-sm leading-relaxed text-[var(--landing-muted)]">
          {description}
        </p>

        {pendingUrl && (
          <div className="mt-4 rounded-lg border border-[var(--landing-border)] bg-[var(--landing-bg)] px-3 py-2.5">
            <p className="landing-mono-label mb-1">Ready after sign-in</p>
            <p className="truncate font-mono text-xs text-[var(--landing-fg)]">{pendingUrl}</p>
          </div>
        )}

        <div className="signin-google-wrap mt-6">
          <GoogleLoginButton
            signInIntent={intent}
            theme={isDark ? 'filled_black' : 'outline'}
            size="large"
            width="100%"
          />
        </div>

        <div className="mt-6 grid grid-cols-3 gap-2 border-t border-[var(--landing-border)] pt-5">
          {highlights.map((item) => (
            <div key={item.label} className="text-center">
              <p className="font-mono text-sm font-semibold text-[var(--landing-fg)]">{item.value}</p>
              <p className="landing-mono-label mt-1 text-[0.6rem]">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export function SignIn() {
  const { isDark } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const pendingUrl =
    (location.state?.youtubeUrl as string | undefined) ||
    (location.state?.playlistUrl as string | undefined);

  useEffect(() => {
    if (location.hash) {
      navigate(`/${location.hash}`, { replace: true });
    }
  }, [location.hash, navigate]);

  return (
    <div className={`landing-page min-h-screen overflow-x-hidden ${isDark ? '' : 'light'}`}>
      <div className="landing-grid-bg pointer-events-none fixed inset-0" />
      <LandingNav isDark={isDark} />

      <section className="relative flex min-h-screen flex-col items-center justify-center px-5 pt-14 pb-12 md:px-8">
        <div className="relative z-10 w-full max-w-5xl">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="landing-mono-label mb-3 text-center"
          >
            Sign in
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mb-10 text-center text-2xl font-semibold tracking-tight text-[var(--landing-fg)] md:text-4xl"
          >
            Choose how you want to use Quib
          </motion.h1>

          <div className="grid gap-6 md:grid-cols-2">
            <SignInCard
              intent="creator"
              icon={GraduationCap}
              eyebrow="For creators"
              title="Turn your YouTube videos into a real course."
              description="Connect your channel, generate structured modules, and publish to the catalog."
              highlights={[
                { value: 'YouTube', label: 'Paste a URL' },
                { value: 'AI', label: 'Build course' },
                { value: 'Publish', label: 'To catalog' },
              ]}
              pendingUrl={pendingUrl}
              isDark={isDark}
              delay={0.1}
            />
            <SignInCard
              intent="student"
              icon={BookOpen}
              eyebrow="For students"
              title="Learn from structured educator courses."
              description="Browse courses, take AI quizzes, track progress, and earn certificates."
              highlights={[
                { value: 'Browse', label: 'Courses' },
                { value: 'AI', label: 'Quizzes' },
                { value: 'Track', label: 'Progress' },
              ]}
              pendingUrl={pendingUrl}
              isDark={isDark}
              delay={0.18}
            />
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="landing-mono-label mt-8 text-center"
          >
            Free to try · No credit card
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="mx-auto mt-6 max-w-lg text-center text-xs leading-relaxed text-[var(--landing-muted)]"
          >
            By continuing, you agree to Quib&apos;s Terms of Service and Privacy Policy.
          </motion.p>

          <Link
            to="/"
            className="mt-6 flex items-center justify-center gap-1.5 text-sm text-[var(--landing-muted)] no-underline transition-colors hover:text-[var(--landing-fg)]"
          >
            <ArrowLeft size={14} strokeWidth={2} />
            Back to home
          </Link>
        </div>
      </section>
    </div>
  );
}
