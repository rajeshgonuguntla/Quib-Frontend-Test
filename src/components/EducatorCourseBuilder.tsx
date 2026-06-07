import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import axios from 'axios';
import { Sun, Moon, ArrowRight, Youtube } from 'lucide-react';
import { useTheme, getC } from './ThemeContext';

function getPlaylistValidationError(value: string) {
  try {
    const parsed = new URL(value);
    const isYoutube = parsed.hostname.includes('youtube.com') || parsed.hostname.includes('youtu.be');
    if (!isYoutube) {
      return 'Please paste a valid YouTube playlist URL.';
    }
    if (!parsed.searchParams.get('list')) {
      return "Only YouTube playlists are supported. Use a URL that contains a 'list' parameter.";
    }
    return null;
  } catch {
    return 'Please paste a valid YouTube playlist URL.';
  }
}

const SUGGESTIONS = [
  { label: 'Machine Learning Basics', url: 'https://www.youtube.com/watch?v=ukzFI9rgwfU' },
  { label: 'Intro to React', url: 'https://www.youtube.com/watch?v=SqcY0GlETPk' },
  { label: 'Python for Beginners', url: 'https://www.youtube.com/watch?v=_uQrJ0TkZlc' },
  { label: 'History of Ancient Rome', url: 'https://www.youtube.com/watch?v=OP4SjTJRQes' },
];

export function EducatorCourseBuilder() {
  const { isDark, toggleTheme } = useTheme();
  const C = getC(isDark);
  const navigate = useNavigate();
  const [url, setUrl] = useState('');
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navBg = isDark ? 'rgba(6,6,8,0.88)' : 'rgba(255,255,255,0.85)';

  // Spinner animation styles
  const spinnerStyles = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `;

  const handleBuild = async () => {
    const trimmed = url.trim();
    if (!trimmed || loading) return;

    setLoading(true);
    setError(null);

    const validationError = getPlaylistValidationError(trimmed);
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post('/api/course/generate', { youtubeUrl: trimmed });
      const courseId = res.data?.courseId;
      if (courseId) {
        navigate(`/course-details/${courseId}`, {
          state: { youtubeUrl: trimmed, courseId, from: '/educator-course-builder' },
        });
      } else {
        navigate('/course-details', { state: { youtubeUrl: trimmed, from: '/educator-course-builder' } });
      }
    } catch (err) {
      setError('Unable to generate the course. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{spinnerStyles}</style>
      <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: 'var(--display)', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Loading Overlay */}
      {loading && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: isDark ? 'rgba(6,6,8,0.7)' : 'rgba(255,255,255,0.7)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: C.redDim, border: `1px solid ${C.red}` }}>
              <div
                style={{
                  width: '1.5rem',
                  height: '1.5rem',
                  border: `2px solid ${isDark ? 'rgba(225,6,0,0.3)' : 'rgba(225,6,0,0.2)'}`,
                  borderTop: `2px solid ${C.red}`,
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                }}
              />
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '1rem', fontWeight: 600, color: C.text, margin: '0 0 0.5rem 0' }}>Building your course…</p>
              <p style={{ fontSize: '0.875rem', color: C.text2, margin: 0 }}>This may take a moment</p>
            </div>
          </div>
        </div>
      )}

      {/* NAV */}
      <nav
        className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-5 md:px-10"
        style={{ height: 60, background: navBg, backdropFilter: 'blur(20px)', borderBottom: `1px solid ${C.border}` }}
      >
        <Link to="/" className="flex items-center gap-1.5 no-underline" style={{ color: C.text }}>
          <span className="text-[1.05rem] font-[700] tracking-tight">Quib</span>
        </Link>

        <ul className="hidden md:flex gap-7 list-none absolute left-1/2 -translate-x-1/2">
          {[{ label: 'Platform', href: '/' }, { label: 'For Educators', href: '/educators' }].map((l) => (
            <li key={l.label}>
              <Link to={l.href} className="text-[0.875rem] font-[400] no-underline transition-opacity hover:opacity-100" style={{ color: C.text2, letterSpacing: '0.01em', opacity: 0.8 }}>
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <button onClick={toggleTheme} className="w-8 h-8 rounded-lg flex items-center justify-center transition-all" style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', border: `1px solid ${C.border}`, color: C.text2, cursor: 'pointer' }}>
            {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
          <Link to="/signin" className="text-[0.82rem] font-[600] no-underline px-[18px] py-2 rounded-md transition-all hover:opacity-90" style={{ background: C.text, color: C.bg }}>
            Sign in
          </Link>
        </div>
      </nav>

      {/* MAIN */}
      <div className="flex-1 flex flex-col items-center justify-center px-6" style={{ paddingTop: 60 }}>
        <div className="w-full max-w-5xl">
          {/* Heading */}
          <div className="text-center mb-10">
            <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(2rem, 4.5vw, 3rem)', fontWeight: 400, lineHeight: 1.15, color: C.text, marginBottom: 16, letterSpacing: '-0.02em' }}>
              Build a Course from a YouTube Video
            </h1>
            <p style={{ fontSize: '1rem', color: C.text2, lineHeight: 1.6, maxWidth: 540, margin: '0 auto' }}>
              Paste a YouTube playlist link below. Sign in first so you can publish the course for other learners to discover.
            </p>
          </div>

          {/* Suggestion cards */}
          <div className="grid grid-cols-4 gap-3 mb-5">
            {SUGGESTIONS.map((s) => (
              <button
                key={s.label}
                onClick={() => setUrl(s.url)}
                className="flex items-center justify-between w-full px-3 py-2 rounded-xl text-left transition-all duration-150"
                style={{ background: C.bg1, border: `1px solid ${C.border}`, color: C.text, cursor: 'pointer' }}
                onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.borderColor = isDark ? 'rgba(225,6,0,0.25)' : 'rgba(225,6,0,0.2)'; e.currentTarget.style.background = C.bg2; }}
                onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.bg1; }}
              >
                <span className="text-[0.875rem] font-[500]">{s.label}</span>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: C.redDim, border: `1px solid ${isDark ? 'rgba(225,6,0,0.15)' : 'rgba(225,6,0,0.1)'}` }}>
                  <Youtube className="w-3.5 h-3.5" style={{ color: C.red }} />
                </div>
              </button>
            ))}
          </div>

          {/* Input */}
          <div
            className="rounded-2xl overflow-hidden transition-all duration-200"
            style={{ border: `1.5px solid ${focused ? C.red : C.border2}`, background: C.bg1, boxShadow: focused ? `0 0 0 3px ${isDark ? 'rgba(225,6,0,0.12)' : 'rgba(225,6,0,0.08)'}` : 'none' }}
          >
            <div className="flex items-start gap-3 p-4">
              <Youtube className="w-5 h-5 mt-1 flex-shrink-0 transition-colors" style={{ color: focused ? C.red : C.text3 }} />
              <textarea
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleBuild(); } }}
                placeholder="Paste a YouTube URL here… e.g. https://www.youtube.com/watch?v=..."
                rows={7}
                className="w-full resize-none outline-none bg-transparent text-[0.95rem] leading-relaxed"
                style={{ color: C.text, fontFamily: 'var(--display)', caretColor: C.red }}
              />
            </div>

            <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: `1px solid ${C.border}`, background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }}>
              <span className="text-[0.75rem]" style={{ color: C.text3 }}>
                Press <kbd style={{ padding: '1px 5px', borderRadius: 4, background: C.bg2, border: `1px solid ${C.border2}`, fontFamily: 'var(--mono)', fontSize: '0.7rem', color: C.text2 }}>Enter</kbd> to build
              </span>
              <button
                onClick={handleBuild}
                disabled={!url.trim() || loading}
                className="flex items-center gap-2 px-5 py-2 rounded-lg text-[0.82rem] font-[600] transition-all"
                style={{
                  background: url.trim() && !loading ? C.red : isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                  color: url.trim() && !loading ? '#fff' : C.text3,
                  border: 'none',
                  cursor: url.trim() && !loading ? 'pointer' : 'not-allowed',
                  boxShadow: url.trim() && !loading ? '0 2px 12px rgba(225,6,0.3)' : 'none',
                  transition: 'all 0.2s',
                }}
              >
                {loading ? 'Building…' : 'Build Course'} <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {error ? (
            <p className="text-center mt-4 text-[0.875rem]" style={{ color: C.red, opacity: 0.95 }}>
              {error}
            </p>
          ) : null}

          {/* Hint */}
          <p className="text-center mt-8 text-[0.875rem]" style={{ color: C.red, opacity: 0.85 }}>
            Any YouTube video becomes a full course — quizzes, summaries, and certificates included.
          </p>
        </div>
      </div>
      </div>
    </>
  );
}
