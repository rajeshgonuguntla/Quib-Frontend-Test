import { useRef, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { clearToken } from '../auth';
import {
  Home, FileText, Settings as SettingsIcon,
  LogOut, Sun, Moon, ChevronLeft, ChevronRight, ListVideo, Play,
} from 'lucide-react';
import { useTheme, getC } from './ThemeContext';
import { CREATORS, POPULAR, ALL_CREATORS, type Creator } from '../data/creators';
import { EDUCATORS_KEY } from './Onboarding';
import { YTThumbnail } from './YTThumbnail';

const NAV = [
  { id: 'home',       label: 'Home',       icon: Home,         path: '/home' },
  { id: 'my-quizzes', label: 'My Courses', icon: FileText,     path: '/my-quizzes' },
  { id: 'settings',   label: 'Settings',   icon: SettingsIcon, path: '/settings' },
];

const SCROLL_AMT = 600;

const TOPIC_SECTIONS = [
  { id: 'ai',    label: 'Explore more topics', title: 'AI & Machine Learning', category: 'AI / Machine Learning' },
  { id: 'math',  label: '',                    title: 'Mathematics',           category: 'Mathematics' },
  { id: 'prog',  label: '',                    title: 'Programming',           category: 'Programming' },
  { id: 'bio',   label: '',                    title: 'Science & Biology',     category: 'Biology' },
  { id: 'web',   label: '',                    title: 'Web Development',       category: 'Web Development' },
];

export function HomeFeed() {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const C = getC(isDark);

  const forYouCreators = useMemo(() => {
    try {
      const saved = localStorage.getItem(EDUCATORS_KEY);
      const ids: string[] = saved ? JSON.parse(saved) : [];
      if (ids.length > 0) {
        const ordered = ids.map(id => ALL_CREATORS.find(c => c.id === id)).filter(Boolean) as Creator[];
        return ordered;
      }
    } catch { /* ignore */ }
    return CREATORS;
  }, []);

  const [courseUrl, setCourseUrl] = useState('');
  const isPlaylist = courseUrl.includes('list=');
  const hasUrl = courseUrl.trim().length > 0;

  const handleCourseSearch = () => {
    if (!hasUrl) return;
    if (isPlaylist) {
      navigate('/playlist-setup/' + encodeURIComponent(courseUrl.trim()), { state: { playlistUrl: courseUrl.trim() } });
    } else {
      navigate('/quiz-setup/new', { state: { youtubeUrl: courseUrl.trim() } });
    }
  };

  const creatorScrollRef = useRef<HTMLDivElement>(null);
  const popularScrollRef = useRef<HTMLDivElement>(null);
  const topicScrollRefs = useRef<(HTMLDivElement | null)[]>([]);

  const scroll = (ref: React.RefObject<HTMLDivElement | null>, dir: 'left' | 'right') => {
    ref.current?.scrollBy({ left: dir === 'right' ? SCROLL_AMT : -SCROLL_AMT, behavior: 'smooth' });
  };

  const scrollTopic = (index: number, dir: 'left' | 'right') => {
    topicScrollRefs.current[index]?.scrollBy({ left: dir === 'right' ? SCROLL_AMT : -SCROLL_AMT, behavior: 'smooth' });
  };

  const handleCreatorClick = (creator: Creator) => navigate(`/educator/${creator.id}`);

  const scrollBtnStyle = {
    base:  { background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)', color: C.text2 },
    hover: { background: isDark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.12)', color: C.text },
  };

  return (
    <div className="min-h-screen flex" style={{ background: isDark ? '#0b0b0e' : '#ffffff', color: C.text, fontFamily: 'var(--display)' }}>

      {/* ── Left Sidebar ── */}
      <aside
        className="fixed left-0 top-0 h-screen flex flex-col z-30"
        style={{ width: 240, background: isDark ? '#0e0e12' : '#ffffff', borderRight: `1px solid ${C.border}` }}
      >
        <div className="px-5 pt-7 pb-6">
          <span className="text-[1.25rem] font-[800] tracking-tight" style={{ color: C.text }}>Quib</span>
        </div>

        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
          {NAV.map((item) => {
            const isActive = item.id === 'home';
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[0.85rem] font-[500] text-left transition-all duration-150"
                style={{
                  background: isActive ? (isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)') : 'transparent',
                  color: isActive ? C.text : C.text2,
                }}
                onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'; e.currentTarget.style.color = C.text; } }}
                onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.text2; } }}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" style={{ opacity: isActive ? 1 : 0.6 }} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="px-3 pb-5 pt-3 space-y-1" style={{ borderTop: `1px solid ${C.border}` }}>
          <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-[0.62rem] font-[700] text-white flex-shrink-0" style={{ background: C.red }}>
              RG
            </div>
            <p className="text-[0.82rem] font-[600] truncate" style={{ color: C.text }}>Rajesh G.</p>
          </div>
          <div className="flex gap-1.5 pt-1">
            <button
              onClick={toggleTheme}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[0.78rem] font-[500] transition-all duration-200"
              style={{ color: C.text3 }}
              onMouseEnter={(e) => { e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'; e.currentTarget.style.color = C.text; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.text3; }}
            >
              {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              {isDark ? 'Light' : 'Dark'}
            </button>
            <button
              onClick={() => { clearToken(); navigate('/'); }}
              className="flex items-center justify-center w-9 py-2 rounded-lg transition-all duration-200"
              style={{ color: C.text3 }}
              onMouseEnter={(e) => { e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'; e.currentTarget.style.color = C.red; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.text3; }}
              title="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main
        className="flex-1 overflow-y-auto feed-scroll"
        style={{ marginLeft: 240, height: '100vh', background: isDark ? '#0b0b0e' : '#ffffff' }}
      >

        {/* ── Course URL Bar ── */}
        <div className="px-8 pt-8 pb-2">
          <div
            className="rounded-2xl p-5"
            style={{ background: isDark ? '#0e0e12' : '#f7f7f8', border: `1px solid ${C.border}` }}
          >
            <div className="flex items-center gap-2 mb-3">
              <ListVideo className="w-4 h-4" style={{ color: C.red }} />
              <p className="text-[0.78rem] font-[600]" style={{ color: C.text }}>Request a course from an educator</p>
              <span
                className="ml-auto text-[0.65rem] font-[600] px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.25)' }}
              >
                Playlist recommended
              </span>
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={courseUrl}
                  onChange={(e) => setCourseUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCourseSearch()}
                  placeholder="Paste a YouTube playlist or video URL..."
                  className="w-full px-4 py-2.5 rounded-xl text-[0.82rem] outline-none transition-all"
                  style={{
                    background: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff',
                    border: `1px solid ${hasUrl ? (isPlaylist ? 'rgba(34,197,94,0.5)' : C.border2) : C.border}`,
                    color: C.text,
                    fontFamily: 'var(--mono)',
                    letterSpacing: '0.01em',
                    paddingRight: hasUrl ? '120px' : '16px',
                  }}
                />
                {hasUrl && (
                  <div
                    className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[0.62rem] font-[700]"
                    style={
                      isPlaylist
                        ? { background: 'rgba(34,197,94,0.12)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)' }
                        : { background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)', color: C.text3 }
                    }
                  >
                    <ListVideo className="w-2.5 h-2.5" />
                    {isPlaylist ? 'Playlist detected' : 'Single video'}
                  </div>
                )}
              </div>

              <button
                onClick={handleCourseSearch}
                disabled={!hasUrl}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[0.82rem] font-[600] text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: C.red, flexShrink: 0 }}
                onMouseEnter={(e) => { if (hasUrl) e.currentTarget.style.opacity = '0.88'; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                {isPlaylist ? 'Build course' : 'Start'}
              </button>
            </div>

            {hasUrl && !isPlaylist && (
              <p className="mt-2.5 text-[0.7rem]" style={{ color: C.text3 }}>
                💡 For a full multi-lesson course, use a YouTube <span style={{ color: C.text2, fontWeight: 600 }}>playlist URL</span> — it contains all related videos in order.
              </p>
            )}
          </div>
        </div>

        {/* Educators for you */}
        <div className="px-8 py-10">
          <SectionHeader
            label="Based on your interests"
            title="Educators for you"
            onLeft={() => scroll(creatorScrollRef, 'left')}
            onRight={() => scroll(creatorScrollRef, 'right')}
            btnStyle={scrollBtnStyle}
            C={C}
          />
          <CreatorRow creators={forYouCreators} scrollRef={creatorScrollRef} onCreatorClick={handleCreatorClick} C={C} />
        </div>

        {/* Popular this week */}
        <div className="px-8 pb-10">
          <div className="mb-8" style={{ borderTop: `1px solid ${C.border}` }} />
          <SectionHeader
            title="Popular this week"
            onLeft={() => scroll(popularScrollRef, 'left')}
            onRight={() => scroll(popularScrollRef, 'right')}
            btnStyle={scrollBtnStyle}
            C={C}
          />
          <div
            ref={popularScrollRef}
            className="overflow-x-auto"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}
          >
            <div className="grid grid-rows-3 grid-flow-col gap-x-8 gap-y-0" style={{ gridAutoColumns: '30%' }}>
              {POPULAR.map((creator, i) => (
                <div
                  key={creator.id}
                  className="flex items-center gap-4 py-4 cursor-pointer group"
                  style={{ borderBottom: i % 3 !== 2 ? `1px solid ${C.border}` : 'none' }}
                  onClick={() => handleCreatorClick(creator)}
                >
                  <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0" style={{ background: C.bg2 }}>
                    <YTThumbnail videoId={creator.videoId} alt={creator.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[0.88rem] font-[700] truncate" style={{ color: C.text }}>{creator.name}</p>
                    <p className="text-[0.75rem] mt-0.5 truncate" style={{ color: C.text3 }}>{creator.tagline}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Topic sections — all categories */}
        {TOPIC_SECTIONS.map((section, index) => {
          const creators = ALL_CREATORS.filter((c) => c.category === section.category);
          if (creators.length === 0) return null;
          return (
            <div key={section.id} className="px-8 pb-10">
              <div className="mb-8" style={{ borderTop: `1px solid ${C.border}` }} />
              <SectionHeader
                label={section.label || undefined}
                title={section.title}
                onLeft={() => scrollTopic(index, 'left')}
                onRight={() => scrollTopic(index, 'right')}
                btnStyle={scrollBtnStyle}
                C={C}
              />
              <CreatorRow
                creators={creators}
                scrollRef={{ current: null } as React.RefObject<HTMLDivElement | null>}
                scrollRefCallback={(el) => { topicScrollRefs.current[index] = el; }}
                onCreatorClick={handleCreatorClick}
                C={C}
              />
            </div>
          );
        })}
      </main>

      <style>{`
        .feed-scroll::-webkit-scrollbar { width: 6px; }
        .feed-scroll::-webkit-scrollbar-track { background: ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}; border-radius: 999px; }
        .feed-scroll::-webkit-scrollbar-thumb { background: ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.18)'}; border-radius: 999px; }
        .feed-scroll::-webkit-scrollbar-thumb:hover { background: ${isDark ? 'rgba(255,255,255,0.28)' : 'rgba(0,0,0,0.32)'}; }
      `}</style>
    </div>
  );
}

/* ── Reusable creator card row ── */
interface CreatorRowProps {
  creators: Creator[];
  scrollRef?: React.RefObject<HTMLDivElement | null>;
  scrollRefCallback?: (el: HTMLDivElement | null) => void;
  onCreatorClick: (c: Creator) => void;
  C: ReturnType<typeof getC>;
}

function CreatorRow({ creators, scrollRef, scrollRefCallback, onCreatorClick, C }: CreatorRowProps) {
  return (
    <div
      ref={(el) => {
        if (scrollRefCallback) scrollRefCallback(el);
        else if (scrollRef && 'current' in scrollRef) (scrollRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
      }}
      className="flex gap-4 overflow-x-auto pb-2"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}
    >
      {creators.map((creator) => (
        <div
          key={creator.id}
          className="flex-shrink-0 w-[210px] cursor-pointer group"
          onClick={() => onCreatorClick(creator)}
        >
          <div className="rounded-2xl overflow-hidden mb-3 relative" style={{ aspectRatio: '1/1', background: C.bg2 }}>
            <YTThumbnail videoId={creator.videoId} alt={creator.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.6) 100%)' }} />
            <div
              className="absolute bottom-3 left-3 px-2 py-0.5 rounded-full text-[0.62rem] font-[600]"
              style={{ background: creator.color + '33', color: '#fff', border: `1px solid ${creator.color}66`, backdropFilter: 'blur(8px)' }}
            >
              {creator.category}
            </div>
          </div>
          <p className="text-[0.88rem] font-[700] leading-snug truncate" style={{ color: C.text }}>{creator.name}</p>
          <p className="text-[0.75rem] mt-0.5 leading-snug" style={{ color: C.text3 }}>{creator.tagline}</p>
        </div>
      ))}
    </div>
  );
}

/* ── Section header with scroll arrows ── */
interface SectionHeaderProps {
  label?: string;
  title: string;
  onLeft: () => void;
  onRight: () => void;
  btnStyle: { base: React.CSSProperties; hover: React.CSSProperties };
  C: ReturnType<typeof getC>;
}

function SectionHeader({ label, title, onLeft, onRight, btnStyle, C }: SectionHeaderProps) {
  return (
    <div className="flex items-end justify-between mb-6">
      <div>
        {label && <p className="text-[0.72rem] font-[500] mb-1" style={{ color: C.text3 }}>{label}</p>}
        <h2 className="text-[1.3rem] font-[700] flex items-center gap-1" style={{ color: C.text }}>
          {title}
          <ChevronRight className="w-5 h-5" style={{ color: C.text2 }} />
        </h2>
      </div>
      <div className="flex items-center gap-2">
        {([['left', onLeft], ['right', onRight]] as const).map(([dir, handler]) => (
          <button
            key={dir}
            onClick={handler}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-150"
            style={btnStyle.base}
            onMouseEnter={(e) => Object.assign(e.currentTarget.style, btnStyle.hover)}
            onMouseLeave={(e) => Object.assign(e.currentTarget.style, btnStyle.base)}
          >
            {dir === 'left' ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        ))}
      </div>
    </div>
  );
}
