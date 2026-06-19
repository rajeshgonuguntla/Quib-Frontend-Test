import { useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { Sun, Moon, ArrowRight } from 'lucide-react';
import { useTheme, getC } from './ThemeContext';
import { CubeMorphBackground } from './CubeMorphBackground';

export function Educators() {
  const { isDark, toggleTheme } = useTheme();
  const C = getC(isDark);
  const navigate = useNavigate();

  // Scroll reveal
  const revealRefs = useRef<(HTMLElement | null)[]>([]);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add('cert-in');
        });
      },
      { threshold: 0.08 }
    );
    revealRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);
  const addRef = (el: HTMLElement | null) => {
    if (el && !revealRefs.current.includes(el)) revealRefs.current.push(el);
  };

  const navBg = isDark ? 'rgba(6,6,8,0.88)' : 'rgba(255,255,255,0.85)';

  const agents = [
    { emoji: '📝', name: 'Auto-Generated Quizzes', desc: 'Quib watches your video and creates a full set of quiz questions — multiple choice, short answer, and more — matched to the actual content.', tags: ['Auto-Generated', 'Multiple Formats', 'Instant'] },
    { emoji: '📄', name: 'Video Summaries', desc: 'Every course comes with a structured summary of the video so students can review key concepts without rewatching the whole thing.', tags: ['Key Concepts', 'Time-Saving', 'Revision'] },
    { emoji: '🎯', name: 'Topic Segmentation', desc: 'Quib automatically breaks the video into logical sections, making it easy for students to navigate and focus on specific parts of the material.', tags: ['Structured', 'Navigation', 'Chapters'] },
    { emoji: '📊', name: 'Progress Tracking', desc: 'See how each student is performing across every question — identify gaps before they become problems and focus your time where it matters most.', tags: ['Analytics', 'Gaps', 'Insights'] },
    { emoji: '🏆', name: 'Certificates of Completion', desc: 'Students who pass the course quiz earn a verifiable certificate they can share with employers or include in their portfolio.', tags: ['Verifiable', 'Shareable', 'Credential'] },
    { emoji: '🔗', name: 'One-Link Sharing', desc: 'Share a single link with your class. No sign-up friction, no setup on the student side — just click and start learning.', tags: ['Instant Access', 'No Friction', 'Simple'] },
  ];

  const stats = [
    { num: '30s', label: 'Course Setup Time' },
    { num: '100%', label: 'YouTube Compatible' },
    { num: '40+', label: 'Subject Areas' },
    { num: '98%', label: 'Educator Satisfaction' },
  ];

  const steps = [
    { num: '01', title: 'Paste a YouTube Link', desc: 'Drop in any YouTube video URL — a lecture, a documentary, a tutorial, anything. Quib processes the full transcript and understands the content in seconds.' },
    { num: '02', title: 'Quib Builds Your Course', desc: 'Quib automatically generates quizzes, summaries, and topic breakdowns from the video. No editing, no manual work — your course is ready before the page finishes loading.' },
    { num: '03', title: 'Share With Your Students', desc: 'Send a single link to your class. Students watch, learn, and take the quiz — earning a certificate when they pass. You see every result in real time.' },
  ];

  return (
    <div style={{ background: C.bg, color: C.text, fontFamily: "var(--display)", overflowX: 'hidden' }}>

      {/* ═══ NAV ═══ */}
      <nav
        className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-5 md:px-10"
        style={{ height: 60, background: navBg, backdropFilter: 'blur(20px)', borderBottom: `1px solid ${C.border}` }}
      >
        <Link to="/" className="flex items-center gap-1.5 no-underline" style={{ color: C.text }}>
          <span className="text-[1.05rem] font-[700] tracking-tight">Quib</span>
        </Link>

        <ul className="hidden md:flex gap-7 list-none absolute left-1/2 -translate-x-1/2">
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
            onClick={toggleTheme}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
            style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', border: `1px solid ${C.border}`, color: C.text2, cursor: 'pointer' }}
          >
            {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
          <Link
            to="/signin"
            className="text-[0.82rem] font-[400] no-underline transition-opacity hover:opacity-80"
            style={{ color: C.text2 }}
          >
            Sign in
          </Link>
          <Link
            to="/signin"
            className="text-[0.82rem] font-[600] no-underline px-[18px] py-2 rounded-md transition-all hover:opacity-90"
            style={{ background: C.text, color: C.bg }}
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <section style={{ position: 'relative', overflow: 'hidden' }}>
        <CubeMorphBackground isDark={isDark} />
        <div className="max-w-4xl mx-auto px-6 pt-36 pb-28 text-center" style={{ position: 'relative', zIndex: 1 }}>
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8"
            style={{
              background: C.redDim,
              border: `1px solid ${isDark ? 'rgba(225,6,0,0.2)' : 'rgba(225,6,0,0.15)'}`,
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: C.red }}
            />
            <span
              style={{
                fontFamily: "var(--mono)",
                fontSize: '0.65rem',
                fontWeight: 600,
                letterSpacing: '0.12em',
                textTransform: 'uppercase' as const,
                color: C.red,
              }}
            >
              For Educators
            </span>
          </div>

          <h1
            style={{
              fontFamily: "var(--serif)",
              fontSize: 'clamp(2.4rem, 5vw, 3.8rem)',
              fontWeight: 400,
              lineHeight: 1.1,
              letterSpacing: '-0.01em',
              color: C.text,
              marginBottom: '1.5rem',
            }}
          >
            Build a course from<br />
            <em style={{ fontStyle: 'italic', color: C.red }}>a YouTube video</em>
          </h1>

          <p
            style={{
              fontSize: '1.05rem',
              fontWeight: 300,
              lineHeight: 1.75,
              color: C.text2,
              maxWidth: 540,
              margin: '0 auto 2.5rem',
            }}
          >
            Paste any YouTube link and Quib instantly builds a full course — quizzes, summaries, and certificates included. No setup, no editing, ready in seconds.
          </p>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => navigate('/educator-studio')}
              className="px-7 py-3 rounded-lg text-[0.875rem] font-[600] transition-all"
              style={{
                background: C.red,
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              Build Your Course
            </button>
            <button
              className="px-6 py-3 rounded-lg text-[0.875rem] font-[500] transition-all"
              style={{
                background: 'transparent',
                color: C.text2,
                border: `1px solid ${C.border2}`,
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = C.text3)}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = C.border2)}
            >
              See How It Works
            </button>
          </div>
        </div>
      </section>

      {/* ═══ STATS BAR ═══ */}
      <section ref={addRef} className="cert-reveal" style={{ borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4">
            {stats.map((s, i) => (
              <div
                key={i}
                className="py-8 text-center"
                style={{ borderRight: i < stats.length - 1 ? `1px solid ${C.border}` : 'none' }}
              >
                <div style={{ fontFamily: "var(--serif)", fontSize: '2rem', color: C.red, marginBottom: 4 }}>
                  {s.num}
                </div>
                <div style={{ fontSize: '0.75rem', color: C.text3, letterSpacing: '0.03em' }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section ref={addRef} className="cert-reveal py-24">
        <div className="max-w-5xl mx-auto px-6">
          <p
            style={{
              fontFamily: "var(--mono)",
              fontSize: '0.62rem',
              letterSpacing: '0.14em',
              textTransform: 'uppercase' as const,
              color: C.red,
              marginBottom: 12,
            }}
          >
            How It Works
          </p>
          <h2
            style={{
              fontFamily: "var(--serif)",
              fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)',
              fontWeight: 400,
              lineHeight: 1.2,
              color: C.text,
              marginBottom: 12,
            }}
          >
            Three steps to a<br />ready-to-share course
          </h2>
          <p style={{ fontSize: '0.9rem', color: C.text2, lineHeight: 1.7, maxWidth: 480, marginBottom: 48 }}>
            No coding, no complexity. Just a YouTube link and you're done.
          </p>

          <div
            className="grid md:grid-cols-3 overflow-hidden rounded-2xl"
            style={{ border: `1px solid ${C.border}` }}
          >
            {steps.map((s, i) => (
              <div
                key={i}
                className="p-8 md:p-10"
                style={{
                  background: C.bg,
                  borderRight: i < steps.length - 1 ? `1px solid ${C.border}` : 'none',
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--serif)",
                    fontSize: '2.8rem',
                    color: isDark ? 'rgba(225,6,0,0.12)' : 'rgba(225,6,0,0.1)',
                    lineHeight: 1,
                    marginBottom: 20,
                  }}
                >
                  {s.num}
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: C.text, marginBottom: 10, letterSpacing: '-0.01em' }}>
                  {s.title}
                </h3>
                <p style={{ fontSize: '0.82rem', color: C.text2, lineHeight: 1.7 }}>
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ AGENT ARCHETYPES ═══ */}
      <section ref={addRef} className="cert-reveal py-24" style={{ background: C.bg1 }}>
        <div className="max-w-5xl mx-auto px-6">
          <p
            style={{
              fontFamily: "var(--mono)",
              fontSize: '0.62rem',
              letterSpacing: '0.14em',
              textTransform: 'uppercase' as const,
              color: C.red,
              marginBottom: 12,
            }}
          >
            What You Get
          </p>
          <h2
            style={{
              fontFamily: "var(--serif)",
              fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)',
              fontWeight: 400,
              lineHeight: 1.2,
              color: C.text,
              marginBottom: 12,
            }}
          >
            Everything included,<br />built from your video
          </h2>
          <p style={{ fontSize: '0.9rem', color: C.text2, lineHeight: 1.7, maxWidth: 480, marginBottom: 48 }}>
            One YouTube link generates all of this — automatically, in seconds.
          </p>

          <div className="grid md:grid-cols-2 gap-5">
            {agents.map((a, i) => (
              <div
                key={i}
                className="p-8 rounded-2xl transition-all duration-300"
                style={{
                  background: C.bg,
                  border: `1px solid ${C.border}`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = isDark ? 'rgba(225,6,0,0.2)' : 'rgba(225,6,0,0.15)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = C.border;
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 text-xl"
                  style={{ background: C.redDim, border: `1px solid ${isDark ? 'rgba(225,6,0,0.15)' : 'rgba(225,6,0,0.1)'}` }}
                >
                  {a.emoji}
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: C.text, marginBottom: 8, letterSpacing: '-0.01em' }}>
                  {a.name}
                </h3>
                <p style={{ fontSize: '0.82rem', color: C.text2, lineHeight: 1.65, marginBottom: 16 }}>
                  {a.desc}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {a.tags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        fontSize: '0.62rem',
                        fontWeight: 500,
                        letterSpacing: '0.03em',
                        padding: '3px 10px',
                        borderRadius: 4,
                        background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                        border: `1px solid ${C.border}`,
                        color: C.text2,
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIAL ═══ */}
      <section ref={addRef} className="cert-reveal" style={{ borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
        <div className="max-w-3xl mx-auto px-6 py-20 text-center">
          <blockquote
            style={{
              fontFamily: "var(--serif)",
              fontSize: 'clamp(1.3rem, 2.5vw, 1.7rem)',
              fontStyle: 'italic',
              fontWeight: 400,
              lineHeight: 1.5,
              color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.65)',
              marginBottom: 24,
            }}
          >
            "I pasted a YouTube lecture into Quib and had a full quiz-based course ready in under 30 seconds. My students are finally engaging with the material outside of class."
          </blockquote>
          <div style={{ fontSize: '0.82rem', color: C.text2 }}>
            <strong style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)', fontWeight: 600 }}>Dr. Sarah Chen</strong>
            {' — Professor of Chemistry, Stanford University'}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section ref={addRef} className="cert-reveal py-24">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2
            style={{
              fontFamily: "var(--serif)",
              fontSize: 'clamp(2rem, 4vw, 2.8rem)',
              fontWeight: 400,
              lineHeight: 1.15,
              color: C.text,
              marginBottom: 20,
            }}
          >
            Turn any YouTube video<br />
            <em style={{ fontStyle: 'italic', color: C.red }}>into a course today</em>
          </h2>
          <p style={{ fontSize: '0.95rem', color: C.text2, lineHeight: 1.7, maxWidth: 440, margin: '0 auto 36px' }}>
            Join hundreds of educators already using Quib to turn YouTube videos into courses their students actually engage with.
          </p>
          <button
            onClick={() => navigate('/educator-studio')}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg text-[0.9rem] font-[600] transition-all"
            style={{
              background: C.red,
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            Get Started — It's Free <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="px-6 md:px-10 py-12" style={{ background: C.bg1, borderTop: `1px solid ${C.border}` }}>
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-4 gap-10 mb-12">
            <div>
              <span className="text-[1.05rem] font-[700] tracking-tight" style={{ color: C.text }}>Quib</span>
              <p className="text-sm mt-3" style={{ color: C.text2, lineHeight: 1.6 }}>
                Turn any YouTube video into a full course — quizzes, summaries, and certificates in seconds.
              </p>
            </div>
            <div>
              <h4 className="font-[600] mb-3 text-[0.82rem]" style={{ color: C.text }}>Product</h4>
              <ul className="space-y-2 text-[0.82rem] list-none p-0">
                <li><Link to="/" className="no-underline transition-opacity hover:opacity-80" style={{ color: C.text2 }}>Features</Link></li>
                <li><Link to="/educators" className="no-underline transition-opacity hover:opacity-80" style={{ color: C.text2 }}>For Educators</Link></li>
                <li><a href="#" className="no-underline transition-opacity hover:opacity-80" style={{ color: C.text2 }}>Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-[600] mb-3 text-[0.82rem]" style={{ color: C.text }}>Company</h4>
              <ul className="space-y-2 text-[0.82rem] list-none p-0">
                <li><a href="#" className="no-underline transition-opacity hover:opacity-80" style={{ color: C.text2 }}>About</a></li>
                <li><a href="#" className="no-underline transition-opacity hover:opacity-80" style={{ color: C.text2 }}>Blog</a></li>
                <li><a href="#" className="no-underline transition-opacity hover:opacity-80" style={{ color: C.text2 }}>Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-[600] mb-3 text-[0.82rem]" style={{ color: C.text }}>Legal</h4>
              <ul className="space-y-2 text-[0.82rem] list-none p-0">
                <li><a href="#" className="no-underline transition-opacity hover:opacity-80" style={{ color: C.text2 }}>Privacy</a></li>
                <li><a href="#" className="no-underline transition-opacity hover:opacity-80" style={{ color: C.text2 }}>Terms</a></li>
                <li><a href="#" className="no-underline transition-opacity hover:opacity-80" style={{ color: C.text2 }}>Contact</a></li>
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
