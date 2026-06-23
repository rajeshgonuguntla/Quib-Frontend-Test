import { Link } from 'react-router';
import { ThemeToggle } from '../ThemeToggle';
import { motion } from 'framer-motion';

type LandingNavProps = {
  isDark: boolean;
};

export function LandingNav({ isDark }: LandingNavProps) {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      className="fixed top-0 left-0 right-0 z-[100] flex h-14 items-center justify-between border-b border-[var(--landing-border)] px-5 backdrop-blur-xl md:px-8"
      style={{ background: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.8)' }}
    >
      <Link to="/" className="flex items-center gap-2 no-underline">
        <span className="flex size-5 items-center justify-center">
          <svg viewBox="0 0 24 24" fill="currentColor" className="size-4 text-[var(--landing-fg)]">
            <path d="M12 2L2 22h20L12 2z" />
          </svg>
        </span>
        <span className="text-sm font-semibold tracking-tight text-[var(--landing-fg)]">Quib</span>
      </Link>

      <ul className="absolute left-1/2 hidden -translate-x-1/2 list-none gap-8 md:flex">
        {[
          { label: 'Learn', href: '#learn' },
          { label: 'Create', href: '#create' },
          { label: 'Features', href: '#features' },
        ].map((l) => (
          <li key={l.label}>
            <a href={l.href} className="text-sm text-[var(--landing-muted)] no-underline transition-colors hover:text-[var(--landing-fg)]">
              {l.label}
            </a>
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-2">
        <Link to="/educators" className="hidden text-sm text-[var(--landing-muted)] no-underline transition-colors hover:text-[var(--landing-fg)] md:inline">
          Educators
        </Link>
        <ThemeToggle size="sm" />
        <Link to="/signin" className="hidden text-sm text-[var(--landing-muted)] no-underline transition-colors hover:text-[var(--landing-fg)] sm:inline">
          Log in
        </Link>
        <Link
          to="/signin"
          className="rounded-md bg-[var(--landing-fg)] px-3.5 py-1.5 text-sm font-medium text-[var(--landing-bg)] no-underline transition-opacity hover:opacity-90"
        >
          Sign up
        </Link>
      </div>
    </motion.nav>
  );
}
