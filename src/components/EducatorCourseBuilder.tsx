import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Sun, Moon, ArrowRight, Youtube } from 'lucide-react';
import { useTheme, getC } from './ThemeContext';
import { courseGenStateFromYoutubeUrl, getYoutubeUrlValidationError } from '../utils/youtubeUrl';

const SUGGESTIONS = [
  { label: 'Single video — React Hooks', url: 'https://www.youtube.com/watch?v=TNhaISOUy6Q' },
  { label: 'Single video — Python intro', url: 'https://www.youtube.com/watch?v=_uQrJ0TkZlc' },
  { label: 'Playlist — React', url: 'https://www.youtube.com/playlist?list=PLC3y8-rFHvwgg3vaYJgHGnModB54rxOk3' },
  { label: 'Playlist — Python', url: 'https://www.youtube.com/playlist?list=PLsyeobz2JL3lLTXGRnXuS6E4CQZYy8d4S' },
];

/** @deprecated Use EducatorStudio — kept as redirect target compatibility */
export function EducatorCourseBuilder() {
  const { isDark, toggleTheme } = useTheme();
  const C = getC(isDark);
  const navigate = useNavigate();
  const [url, setUrl] = useState('');
  const [focused, setFocused] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navBg = isDark ? 'rgba(6,6,8,0.88)' : 'rgba(255,255,255,0.85)';

  const handleBuild = () => {
    const trimmed = url.trim();
    if (!trimmed) return;

    setError(null);
    const validationError = getYoutubeUrlValidationError(trimmed);
    if (validationError) {
      setError(validationError);
      return;
    }

    const state = courseGenStateFromYoutubeUrl(trimmed, '/educator-studio');
    if (!state) {
      setError('Invalid YouTube URL');
      return;
    }
    navigate('/course-details', { state });
  };

  return (
    <>
      <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: 'var(--display)', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <nav
        className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-5 md:px-10"
        style={{ height: 60, background: navBg, backdropFilter: 'blur(20px)', borderBottom: `1px solid ${C.border}` }}
      >
        <Link to="/educator-studio" className="flex items-center gap-1.5 no-underline" style={{ color: C.text }}>
          <span className="text-[1.05rem] font-[700] tracking-tight">Quib Studio</span>
        </Link>
        <div className="flex items-center gap-3">
          <button onClick={toggleTheme} className="w-8 h-8 rounded-lg flex items-center justify-center transition-all" style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', border: `1px solid ${C.border}`, color: C.text2, cursor: 'pointer' }}>
            {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
          <Link to="/signin" className="text-[0.82rem] font-[600] no-underline px-[18px] py-2 rounded-md transition-all hover:opacity-90" style={{ background: C.text, color: C.bg }}>
            Sign in
          </Link>
        </div>
      </nav>

      <div className="flex-1 flex flex-col items-center justify-center px-6" style={{ paddingTop: 60 }}>
        <div className="w-full max-w-5xl">
          <div className="text-center mb-10">
            <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(2rem, 4.5vw, 3rem)', fontWeight: 400, lineHeight: 1.15, color: C.text, marginBottom: 16, letterSpacing: '-0.02em' }}>
              Build a course from YouTube
            </h1>
            <p style={{ fontSize: '1rem', color: C.text2, lineHeight: 1.6, maxWidth: 540, margin: '0 auto' }}>
              Paste a single video URL or a full playlist. Sign in first to publish your course.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
            {SUGGESTIONS.map((s) => (
              <button
                key={s.label}
                onClick={() => setUrl(s.url)}
                className="flex items-center justify-between w-full px-3 py-2 rounded-xl text-left transition-all duration-150"
                style={{ background: C.bg1, border: `1px solid ${C.border}`, color: C.text, cursor: 'pointer' }}
              >
                <span className="text-[0.78rem] font-[500] leading-snug">{s.label}</span>
                <Youtube className="w-3.5 h-3.5 flex-shrink-0" style={{ color: C.red }} />
              </button>
            ))}
          </div>

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
                placeholder="Paste a YouTube video or playlist URL…"
                rows={5}
                className="w-full resize-none outline-none bg-transparent text-[0.95rem] leading-relaxed"
                style={{ color: C.text, fontFamily: 'var(--display)', caretColor: C.red }}
              />
            </div>

            <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: `1px solid ${C.border}`, background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }}>
              <span className="text-[0.75rem]" style={{ color: C.text3 }}>One video or a full playlist</span>
              <button
                onClick={handleBuild}
                disabled={!url.trim()}
                className="flex items-center gap-2 px-5 py-2 rounded-lg text-[0.82rem] font-[600] transition-all"
                style={{
                  background: url.trim() ? C.red : isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                  color: url.trim() ? '#fff' : C.text3,
                  border: 'none',
                  cursor: url.trim() ? 'pointer' : 'not-allowed',
                }}
              >
                Build Course <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {error && (
            <p className="text-center mt-4 text-[0.875rem]" style={{ color: C.red }}>{error}</p>
          )}
        </div>
      </div>
      </div>
    </>
  );
}
