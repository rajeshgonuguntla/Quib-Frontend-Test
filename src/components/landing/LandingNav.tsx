import { Link } from 'react-router';
import { ThemeToggle } from '../ThemeToggle';
import { motion } from 'framer-motion';
import { isTokenValid, useAuthSessionKey } from '../../auth';
import { CUBIT_LOGO } from '../../cubit/subjects';

type LandingNavProps = {
  isDark: boolean;
};

/** ponytail: Governments page/route kept; flip true when the nav tab should return. */
const SHOW_GOVERNMENTS_NAV = false;

export function LandingNav({ isDark }: LandingNavProps) {
  const sessionKey = useAuthSessionKey();
  const signedIn = sessionKey !== 'guest' && isTokenValid();

  return (
    <motion.nav
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      className="fixed top-0 left-0 right-0 z-[100] flex h-14 items-center justify-between border-b border-[var(--landing-border)] px-5 backdrop-blur-xl md:px-8"
      style={{ background: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.8)' }}
    >
      <Link to="/" className="flex items-center gap-2 no-underline" aria-label="Cubit">
        <img src={CUBIT_LOGO} alt="Cubit" width={30} height={30} className="size-[30px] shrink-0 object-contain" />
      </Link>

      <ul className="absolute left-1/2 hidden -translate-x-1/2 list-none gap-8 md:flex">
        {[
          { label: 'Learn', href: '/#learn' },
          { label: 'Create', href: '/#create' },
          { label: 'Ask', href: '/#ask' },
          { label: 'Features', href: '/#features' },
          ...(SHOW_GOVERNMENTS_NAV ? [{ label: 'Governments', href: '/governments' }] : []),
        ].map((l) => (
          <li key={l.label}>
            {l.href.startsWith('/governments') ? (
              <Link to={l.href} className="text-sm text-[var(--landing-muted)] no-underline transition-colors hover:text-[var(--landing-fg)]">
                {l.label}
              </Link>
            ) : (
              <a href={l.href} className="text-sm text-[var(--landing-muted)] no-underline transition-colors hover:text-[var(--landing-fg)]">
                {l.label}
              </a>
            )}
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-2">
        <ThemeToggle size="sm" />
        {signedIn ? (
          <Link
            to="/dashboard"
            className="inline-flex min-h-11 items-center rounded-md bg-[var(--landing-fg)] px-3.5 text-sm font-medium text-[var(--landing-bg)] no-underline transition-opacity hover:opacity-90"
          >
            Dashboard
          </Link>
        ) : (
          <>
            <Link to="/signin" className="hidden text-sm text-[var(--landing-muted)] no-underline transition-colors hover:text-[var(--landing-fg)] sm:inline">
              Log in
            </Link>
            <Link
              to="/signin"
              className="inline-flex min-h-11 items-center rounded-md bg-[var(--landing-fg)] px-3.5 text-sm font-medium text-[var(--landing-bg)] no-underline transition-opacity hover:opacity-90"
            >
              Sign up
            </Link>
          </>
        )}
      </div>
    </motion.nav>
  );
}
