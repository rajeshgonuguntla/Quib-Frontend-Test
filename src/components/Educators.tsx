import { useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme, getC } from './ThemeContext';
import { EducatorsHero } from './educators/EducatorsHero';
import { EducatorsPipeline } from './educators/EducatorsPipeline';
import { EducatorsCapabilities } from './educators/EducatorsCapabilities';
import { EducatorsCta } from './educators/EducatorsCta';
import { QuibLogo } from './QuibLogo';
import { scrollToSection } from '../utils/navigation';
import '../styles/educators.css';

export function Educators() {
  const { isDark, toggleTheme } = useTheme();
  const C = getC(isDark);
  const navigate = useNavigate();

  useEffect(() => {
    if (window.location.hash === '#how-it-works') {
      scrollToSection('how-it-works');
    }
  }, []);

  const revealRefs = useRef<(HTMLElement | null)[]>([]);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add('cert-in');
        });
      },
      { threshold: 0.08 },
    );
    revealRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const addRef = (el: HTMLElement | null) => {
    if (el && !revealRefs.current.includes(el)) revealRefs.current.push(el);
  };

  const navBg = isDark ? 'rgba(6,6,8,0.88)' : 'rgba(255,255,255,0.85)';

  const stats = [
    { num: 'YouTube', label: 'Native input' },
    { num: 'Studio', label: 'Educator workspace' },
    { num: 'AI', label: 'Quiz generation' },
    { num: 'Free', label: 'To try today' },
  ];

  return (
    <div className={`educators-page min-h-screen ${isDark ? '' : 'light'}`} style={{ background: C.bg, color: C.text, fontFamily: 'var(--display)', overflowX: 'hidden' }}>
      <nav
        className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-5 md:px-10"
        style={{ height: 60, background: navBg, backdropFilter: 'blur(20px)', borderBottom: `1px solid ${C.border}` }}
      >
        <Link to="/" className="no-underline" style={{ color: C.text }}>
          <QuibLogo
            size={18}
            wordmarkClassName="text-[1.05rem] font-[700] tracking-tight"
          />
        </Link>

        <ul className="absolute left-1/2 hidden -translate-x-1/2 list-none gap-7 md:flex">
          {[
            { label: 'Platform', href: '/' },
            { label: 'For Educators', href: '/educators' },
          ].map((l) => (
            <li key={l.label}>
              <Link
                to={l.href}
                className="text-[0.875rem] font-[400] no-underline transition-opacity hover:opacity-100"
                style={{ color: C.text2, letterSpacing: '0.01em', opacity: 0.8 }}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            className="flex size-8 items-center justify-center rounded-lg transition-all"
            style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', border: `1px solid ${C.border}`, color: C.text2, cursor: 'pointer' }}
          >
            {isDark ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
          </button>
          <Link to="/signin" className="text-[0.82rem] font-[400] no-underline transition-opacity hover:opacity-80" style={{ color: C.text2 }}>
            Sign in
          </Link>
          <Link
            to="/signin"
            className="rounded-md px-[18px] py-2 text-[0.82rem] font-[600] no-underline transition-all hover:opacity-90"
            style={{ background: C.text, color: C.bg }}
          >
            Get Started
          </Link>
        </div>
      </nav>

      <EducatorsHero isDark={isDark} C={C} navigate={navigate} />

      <section ref={addRef} className="cert-reveal relative" style={{ borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
        <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-40">
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.span
              key={i}
              className="absolute size-1 rounded-full bg-[#e10600]"
              style={{ left: `${8 + i * 8}%`, top: `${20 + (i % 3) * 25}%` }}
              animate={{ opacity: [0, 0.8, 0], y: [0, i % 2 === 0 ? -20 : 20] }}
              transition={{ duration: 2.5 + i * 0.2, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </div>
        <div className="relative mx-auto max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-4">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="py-8 text-center"
                style={{ borderRight: i < stats.length - 1 ? `1px solid ${C.border}` : 'none' }}
              >
                <div style={{ fontFamily: 'var(--serif)', fontSize: '1.75rem', color: C.red, marginBottom: 4 }}>{s.num}</div>
                <div style={{ fontSize: '0.75rem', color: C.text3, letterSpacing: '0.03em' }}>{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <EducatorsPipeline C={C} isDark={isDark} />
      <EducatorsCapabilities C={C} isDark={isDark} />
      <EducatorsCta C={C} navigate={navigate} />

      <footer className="px-6 py-12 md:px-10" style={{ background: C.bg1, borderTop: `1px solid ${C.border}` }}>
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 grid gap-10 md:grid-cols-4">
            <div style={{ color: C.text }}>
              <QuibLogo
                size={18}
                wordmarkClassName="text-[1.05rem] font-[700] tracking-tight"
                variant={isDark ? 'dark' : 'light'}
              />
              <p className="mt-3 text-sm" style={{ color: C.text2, lineHeight: 1.6 }}>
                Turn YouTube videos into structured courses with modules, quizzes, and certificates.
              </p>
            </div>
            <div>
              <h4 className="mb-3 text-[0.82rem] font-[600]" style={{ color: C.text }}>Product</h4>
              <ul className="list-none space-y-2 p-0 text-[0.82rem]">
                <li><Link to="/" className="no-underline transition-opacity hover:opacity-80" style={{ color: C.text2 }}>Features</Link></li>
                <li><Link to="/educators" className="no-underline transition-opacity hover:opacity-80" style={{ color: C.text2 }}>For Educators</Link></li>
                <li><Link to="/signin" className="no-underline transition-opacity hover:opacity-80" style={{ color: C.text2 }}>Get Started</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-[0.82rem] font-[600]" style={{ color: C.text }}>Company</h4>
              <ul className="list-none space-y-2 p-0 text-[0.82rem]">
                <li><Link to="/educators#how-it-works" className="no-underline transition-opacity hover:opacity-80" style={{ color: C.text2 }}>How It Works</Link></li>
                <li><Link to="/" className="no-underline transition-opacity hover:opacity-80" style={{ color: C.text2 }}>Platform</Link></li>
                <li><a href="mailto:support@quibb.ai" className="no-underline transition-opacity hover:opacity-80" style={{ color: C.text2 }}>Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-[0.82rem] font-[600]" style={{ color: C.text }}>Legal</h4>
              <ul className="list-none space-y-2 p-0 text-[0.82rem]">
                <li><a href="mailto:support@quibb.ai?subject=Privacy" className="no-underline transition-opacity hover:opacity-80" style={{ color: C.text2 }}>Privacy</a></li>
                <li><a href="mailto:support@quibb.ai?subject=Terms" className="no-underline transition-opacity hover:opacity-80" style={{ color: C.text2 }}>Terms</a></li>
                <li><a href="mailto:support@quibb.ai" className="no-underline transition-opacity hover:opacity-80" style={{ color: C.text2 }}>Support</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 text-center text-[0.78rem]" style={{ borderTop: `1px solid ${C.border}`, color: C.text3 }}>
            © 2026 Quib. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
