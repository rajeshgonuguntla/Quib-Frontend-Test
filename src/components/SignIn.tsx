import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import GoogleLoginButton from './GoogleLoginButton';
import { useTheme } from './ThemeContext';
import { ThemeToggle } from './ThemeToggle';
import ClickSpark from './effects/ClickSpark';
import '../styles/signin.css';

const FEATURES = [
  { value: 'AI', label: 'Quizzes' },
  { value: '70%', label: 'To pass' },
  { value: '∞', label: 'Videos' },
] as const;

export function SignIn() {
  const { isDark } = useTheme();

  return (
    <div className={`signin-page${isDark ? '' : ' light'}`}>
      <div className="signin-grid" aria-hidden />
      <div className="signin-vignette" aria-hidden />
      <div className="signin-orb signin-orb--red" aria-hidden />
      <div className="signin-orb signin-orb--violet" aria-hidden />

      <header className="signin-topbar">
        <Link to="/" className="signin-brand">
          <svg viewBox="0 0 24 24" fill="currentColor" className="signin-brand-mark" aria-hidden>
            <path d="M12 2L2 22h20L12 2z" />
          </svg>
          <span className="signin-brand-name">Quib</span>
        </Link>
        <ThemeToggle size="sm" />
      </header>

      <ClickSpark
        className="signin-shell"
        sparkColor={isDark ? '#ffb4a8' : '#e10600'}
        sparkSize={12}
        sparkRadius={22}
        sparkCount={10}
        duration={480}
        extraScale={1.15}
      >
        <motion.div
          className="signin-card-wrap"
          initial={{ opacity: 0, y: 28, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="signin-card">
            <div className="signin-card-inner">
              <h1 className="signin-title">
                <span className="signin-title-gradient">Learn. Prove.</span>
                <br />
                Level up.
              </h1>

              <p className="signin-subtitle">
                Sign in with Google to turn any YouTube lesson into quizzes, courses, and verified credentials.
              </p>

              <div className="signin-google-wrap">
                <GoogleLoginButton theme={isDark ? 'filled_black' : 'outline'} size="large" width="100%" />
              </div>

              <div className="signin-divider">Why Quib</div>

              <div className="signin-features">
                {FEATURES.map((item) => (
                  <div key={item.label} className="signin-feature">
                    <span className="signin-feature-value">{item.value}</span>
                    <span className="signin-feature-label">{item.label}</span>
                  </div>
                ))}
              </div>

              <p className="signin-legal">
                By continuing, you agree to Quib&apos;s Terms of Service and Privacy Policy. Certificates and learning
                data stay private to your account.
              </p>
            </div>
          </div>

          <Link to="/" className="signin-back">
            <ArrowLeft size={14} strokeWidth={2} />
            Back to home
          </Link>
        </motion.div>
      </ClickSpark>
    </div>
  );
}
