import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import {
  ArrowUpRight,
  Bell,
  BookMarked,
  CheckCircle2,
  ChevronRight,
  Circle,
  Clock,
  GraduationCap,
  HelpCircle,
  Home,
  Play,
  Search,
  Settings,
  Star,
  TrendingUp,
  Users,
} from 'lucide-react';
import axios from 'axios';
import { clearToken } from '../auth';
import { CREATORS } from '../data/creators';
import {
  fetchCourses,
  fetchEnrollments,
  fetchEnrollmentStats,
  fetchPopularCreators,
  searchCourses,
} from '../api/catalogApi';
import type { CourseSearchResult, EnrollmentStats } from '../types/catalog';
import { useUserProfile } from '../context/UserProfileContext';
import { UserAvatar } from './UserAvatar';
import { SidebarNavItem } from './SidebarNavItem';
import { getFirstName } from '../utils/userDisplay';
import { courseToCuratedCard, ytThumb } from '../utils/catalogMap';

const T = {
  bg: '#0C0C0C',
  surface: '#141414',
  border: 'rgba(255,255,255,0.07)',
  borderMd: 'rgba(255,255,255,0.12)',
  accent: '#6366F1',
  accentBg: 'rgba(99,102,241,0.1)',
  accentBd: 'rgba(99,102,241,0.22)',
  accentLt: '#818CF8',
  green: '#22C55E',
  greenBg: 'rgba(34,197,94,0.08)',
  amber: '#F59E0B',
  t1: '#F4F4F5',
  t2: '#A1A1AA',
  t3: '#71717A',
  t4: '#3F3F46',
};
const FONT = "'Inter', system-ui, -apple-system, sans-serif";

const FALLBACK_CURATED = [
  {
    id: 1,
    title: 'Web Development Masterclass',
    instructor: 'Emma Johnson',
    tag: 'Web Dev',
    rating: '4.7',
    students: '203k',
    duration: '56h',
    image: 'https://images.unsplash.com/photo-1593720213428-28a5b9e94613?w=600&q=80',
  },
  {
    id: 2,
    title: 'Neural Networks from Scratch',
    instructor: 'Andrej Karpathy',
    tag: 'AI & ML',
    rating: '4.9',
    students: '156k',
    duration: '12h',
    image: 'https://images.unsplash.com/photo-1617119895969-f4ea56f5538b?w=600&q=80',
  },
  {
    id: 3,
    title: 'The Essence of Linear Algebra',
    instructor: '3Blue1Brown',
    tag: 'Mathematics',
    rating: '4.9',
    students: '430k',
    duration: '8h',
    image: 'https://images.unsplash.com/photo-1773999088123-4468344c84ce?w=600&q=80',
  },
  {
    id: 4,
    title: 'TypeScript from Zero to Hero',
    instructor: 'Matt Pocock',
    tag: 'Programming',
    rating: '4.8',
    students: '98k',
    duration: '22h',
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&q=80',
  },
];

const tagColors: Record<string, { color: string; bg: string }> = {
  'AI & ML': { color: '#818CF8', bg: 'rgba(129,140,248,0.1)' },
  Programming: { color: '#34D399', bg: 'rgba(52,211,153,0.08)' },
  Mathematics: { color: '#FB923C', bg: 'rgba(251,146,60,0.08)' },
  'Web Dev': { color: '#38BDF8', bg: 'rgba(56,189,248,0.08)' },
  Quiz: { color: '#818CF8', bg: 'rgba(129,140,248,0.1)' },
};

type CuratedCard = ReturnType<typeof courseToCuratedCard>;

type ProgressItem = {
  id: string;
  title: string;
  instructor: string;
  tag: string;
  progress: number;
  timeLeft: string;
  lessons: { done: number; total: number };
  image: string;
  kind?: 'course' | 'quiz';
  status?: string;
};

export function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, setProfile } = useUserProfile();
  const firstName = getFirstName(profile);

  const incomingPlaylistUrl = location.state?.playlistUrl as string | undefined;
  const incomingVideoUrl = location.state?.youtubeUrl as string | undefined;

  const isNavActive = (path: string, id: string) => {
    if (id === 'dashboard') return location.pathname === '/dashboard' || location.pathname === '/home';
    if (id === 'browse') return location.pathname.startsWith('/browse-courses');
    if (id === 'studio') return location.pathname.startsWith('/educator-studio');
    if (id === 'trending') return location.pathname.startsWith('/educators') || location.pathname.startsWith('/educator/');
    if (id === 'progress') return location.pathname.startsWith('/my-courses') && !location.search.includes('filter=completed');
    if (id === 'completed') return location.pathname.startsWith('/my-courses') && location.search.includes('filter=completed');
    if (id === 'saved') return location.pathname.startsWith('/my-quizzes');
    if (id === 'settings' || id === 'help') return location.pathname.startsWith('/settings');
    return location.pathname === path;
  };

  useEffect(() => {
    if (incomingPlaylistUrl) {
      navigate('/playlist-setup/new', { state: { playlistUrl: incomingPlaylistUrl }, replace: true });
      return;
    }
    if (incomingVideoUrl) {
      navigate('/quiz-setup/new', { state: { youtubeUrl: incomingVideoUrl }, replace: true });
    }
  }, [incomingPlaylistUrl, incomingVideoUrl, navigate]);
  const [inProgress, setInProgress] = useState<ProgressItem[]>([]);
  const [curated, setCurated] = useState<CuratedCard[]>([]);
  const [trending, setTrending] = useState<TrendingItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CourseSearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const [libraryStats, setLibraryStats] = useState<EnrollmentStats>({
    total: 0,
    inProgress: 0,
    saved: 0,
    completed: 0,
    avgScore: 0,
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [quizzesRes, popular, courses, enrollments, enrollmentStats] = await Promise.all([
          axios.get('/api/quizzes').catch(() => ({ data: [] })),
          fetchPopularCreators().catch(() => []),
          fetchCourses({ category: 'Web Development', limit: 4 }).catch(() => []),
          fetchEnrollments().catch(() => []),
          fetchEnrollmentStats().catch(() => null),
        ]);

        const popularList =
          popular.length > 0
            ? popular
            : CREATORS.map((c) => ({
                id: c.id,
                name: c.name,
                tagline: c.tagline,
                videoCount: c.videoCount,
                youtubeVideoId: c.videoId,
              }));
        setTrending(
          popularList.slice(0, 6).map((c) => ({
            id: c.id,
            name: c.name,
            sub: c.tagline,
            videos: `${c.videoCount}+`,
            img: ytThumb('youtubeVideoId' in c && c.youtubeVideoId ? c.youtubeVideoId : (c as { videoId: string }).videoId),
          })),
        );

        if (courses.length > 0) {
          setCurated(courses.map(courseToCuratedCard));
        }

        const quizzes = (quizzesRes.data ?? []) as Array<{
          id: string;
          title: string;
          status: string;
          latestScorePercent?: number;
          thumbnailUrl?: string;
        }>;
        const fromEnrollments: ProgressItem[] = (enrollments ?? [])
          .filter((e: { status: string }) => e.status === 'in-progress' || e.status === 'saved')
          .slice(0, 3)
          .map((e: {
            courseId: string;
            title: string;
            channel: string;
            category: string;
            progress: number;
            youtubeVideoId?: string;
            durationLabel?: string;
            lessonCount?: number;
            status: string;
          }) => {
            const totalLessons = e.lessonCount && e.lessonCount > 0 ? e.lessonCount : 10;
            const doneLessons = Math.round((e.progress / 100) * totalLessons);
            return {
              id: e.courseId,
              title: e.title,
              instructor: e.channel,
              tag: e.category,
              progress: e.progress,
              timeLeft: e.durationLabel ?? '—',
              lessons: { done: doneLessons, total: totalLessons },
              image: e.youtubeVideoId ? ytThumb(e.youtubeVideoId) : ytThumb('dQw4w9WgXcQ'),
              kind: 'course' as const,
              status: e.status,
            };
          });

        const fromQuizzes: ProgressItem[] = quizzes
          .filter((q) => q.status === 'in_progress' || q.status === 'generated')
          .slice(0, 3)
          .map((q, i) => ({
            id: q.id,
            title: q.title,
            instructor: 'Your library',
            tag: 'Quiz',
            progress: q.latestScorePercent ?? (q.status === 'in_progress' ? 40 : 10),
            timeLeft: '—',
            lessons: { done: i + 1, total: 10 },
            image: q.thumbnailUrl || ytThumb('dQw4w9WgXcQ'),
            kind: 'quiz' as const,
          }));

        setInProgress([...fromEnrollments, ...fromQuizzes].slice(0, 3));
        if (enrollmentStats) {
          setLibraryStats(enrollmentStats);
        }
      } catch {
        /* keep defaults */
      }
    };
    void load();
  }, [location.pathname]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }
    setSearchLoading(true);
    const timer = window.setTimeout(() => {
      searchCourses(searchQuery, 12)
        .then((results) => {
          setSearchResults(results);
          setSearchOpen(true);
        })
        .catch(() => setSearchResults([]))
        .finally(() => setSearchLoading(false));
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const handleSignOut = () => {
    clearToken();
    setProfile(null);
    navigate('/signin');
  };

  const coursesInProgress = libraryStats.inProgress + libraryStats.saved;

  return (
    <div className="min-h-screen text-white" style={{ background: T.bg, fontFamily: FONT }}>
      <aside
        className="fixed inset-y-0 left-0 z-50 flex w-[240px] flex-col"
        style={{ background: '#0A0A0A', borderRight: `1px solid ${T.border}` }}
      >
        <div className="flex h-[57px] shrink-0 items-center gap-3 px-5" style={{ borderBottom: `1px solid ${T.border}` }}>
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg" style={{ background: T.accent }}>
            <GraduationCap size={14} className="text-white" />
          </div>
          <div>
            <span className="text-sm font-semibold tracking-tight text-zinc-100">Quib</span>
            <span className="-mt-0.5 block text-[10px] text-zinc-600">Learning Platform</span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4" style={{ scrollbarWidth: 'none' }}>
          <NavGroup label="Menu">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: <Home size={15} />, path: '/dashboard' },
              { id: 'browse', label: 'Browse Courses', icon: <Search size={15} />, path: '/browse-courses' },
              { id: 'studio', label: 'Educator Studio', icon: <GraduationCap size={15} />, path: '/educator-studio' },
              { id: 'trending', label: 'Trending', icon: <TrendingUp size={15} />, path: '/educators' },
            ].map((item) => (
              <SidebarNavItem
                key={item.id}
                item={item}
                active={isNavActive(item.path, item.id)}
                onClick={() => navigate(item.path)}
              />
            ))}
          </NavGroup>

          <NavGroup label="Library">
            {[
              { id: 'progress', label: 'In Progress', icon: <Circle size={15} />, badge: String(libraryStats.inProgress || '0'), path: '/my-courses' },
              { id: 'saved', label: 'Saved', icon: <BookMarked size={15} />, badge: String(libraryStats.saved || '0'), path: '/my-quizzes' },
              { id: 'completed', label: 'Completed', icon: <CheckCircle2 size={15} />, badge: String(libraryStats.completed || '0'), path: '/my-courses?filter=completed' },
            ].map((item) => (
              <SidebarNavItem
                key={item.id}
                item={item}
                active={isNavActive(item.path, item.id)}
                onClick={() => navigate(item.path)}
              />
            ))}
          </NavGroup>

          <NavGroup label="Account">
            {[
              { id: 'settings', label: 'Settings', icon: <Settings size={15} />, path: '/settings' },
              { id: 'help', label: 'Help & Support', icon: <HelpCircle size={15} />, path: '/settings' },
            ].map((item) => (
              <SidebarNavItem
                key={item.id}
                item={item}
                active={isNavActive(item.path, item.id)}
                onClick={() => navigate(item.path)}
              />
            ))}
          </NavGroup>
        </nav>

        <div className="shrink-0 p-3" style={{ borderTop: `1px solid ${T.border}` }}>
          <button
            type="button"
            onClick={() => navigate('/settings')}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-150 hover:bg-white/[0.06] active:scale-[0.98] active:bg-white/[0.08]"
          >
            <UserAvatar profile={profile} size="sm" />
            <div className="min-w-0 flex-1 text-left">
              <div className="mb-0.5 truncate text-sm font-medium leading-none text-zinc-200">{firstName}</div>
              <div className="truncate text-[11px] text-zinc-600">{profile?.email ?? 'Pro Plan'}</div>
            </div>
            <ChevronRight size={13} className="shrink-0" style={{ color: T.t4 }} />
          </button>
          <button
            type="button"
            onClick={handleSignOut}
            className="mt-2 w-full rounded-lg py-2 text-[12px] font-medium transition-all duration-150 hover:bg-white/[0.06] active:scale-[0.98] active:bg-white/[0.08]"
            style={{ color: T.t3, border: `1px solid ${T.border}` }}
          >
            Sign out
          </button>
        </div>
      </aside>

      <div className="ml-[240px] flex min-h-screen flex-col">
        <header
          className="sticky top-0 z-40 flex h-[57px] shrink-0 items-center justify-between px-8"
          style={{
            background: 'rgba(12,12,12,0.92)',
            borderBottom: `1px solid ${T.border}`,
            backdropFilter: 'blur(16px)',
          }}
        >
          <div className="flex items-center gap-1.5 text-[13px]">
            <span style={{ color: T.t3 }}>Dashboard</span>
            <ChevronRight size={12} style={{ color: T.t4 }} />
            <span className="font-medium" style={{ color: T.t1 }}>
              Overview
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div ref={searchRef} className="relative">
              <div
                className="flex h-8 min-w-[220px] items-center gap-2 rounded-lg px-3 text-[13px] md:min-w-[280px]"
                style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.t3 }}
              >
                <Search size={13} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.trim() && setSearchOpen(true)}
                  placeholder="Search by creator, playlist, or video…"
                  className="min-w-0 flex-1 bg-transparent text-[13px] outline-none"
                  style={{ color: T.t1 }}
                />
              </div>
              {searchOpen && searchQuery.trim() && (
                <div
                  className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-xl shadow-2xl"
                  style={{ background: T.surface, border: `1px solid ${T.border}` }}
                >
                  {searchLoading ? (
                    <p className="px-4 py-3 text-[12px]" style={{ color: T.t3 }}>Searching…</p>
                  ) : searchResults.length === 0 ? (
                    <p className="px-4 py-3 text-[12px]" style={{ color: T.t3 }}>No published courses found.</p>
                  ) : (
                    <div className="max-h-80 overflow-y-auto py-1">
                      {searchResults.map((result) => (
                        <button
                          key={result.courseId}
                          type="button"
                          onClick={() => {
                            setSearchOpen(false);
                            setSearchQuery('');
                            navigate(`/course-details/${result.courseId}`, {
                              state: { from: `${location.pathname}${location.search}` },
                            });
                          }}
                          className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-white/[0.05]"
                        >
                          {result.youtubeVideoId ? (
                            <img
                              src={ytThumb(result.youtubeVideoId)}
                              alt=""
                              className="h-10 w-16 shrink-0 rounded object-cover"
                            />
                          ) : (
                            <div className="flex h-10 w-16 shrink-0 items-center justify-center rounded" style={{ background: T.accentBg }}>
                              <BookMarked size={14} style={{ color: T.accent }} />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[13px] font-medium" style={{ color: T.t1 }}>{result.title}</p>
                            <p className="truncate text-[11px]" style={{ color: T.t3 }}>
                              {result.channelName ?? 'YouTube'}
                              {result.matchedOn ? ` · matched ${result.matchedOn}` : ''}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            <button
              type="button"
              className="relative flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-white/[0.05]"
              style={{ color: T.t3 }}
            >
              <Bell size={15} />
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full" style={{ background: T.accent }} />
            </button>
            <button type="button" onClick={() => navigate('/settings')} className="cursor-pointer">
              <UserAvatar profile={profile} size="md" />
            </button>
          </div>
        </header>

        <div className="mx-auto w-full max-w-[1360px] flex-1 px-8 pb-20 pt-8">
          <div className="mb-7 flex items-end justify-between">
            <div>
              <p className="mb-1.5 text-[12px] font-medium uppercase tracking-widest" style={{ color: T.t3 }}>
                {greeting()}
              </p>
              <h1
                className="text-white"
                style={{
                  fontSize: 'clamp(1.65rem, 3vw, 2.25rem)',
                  fontWeight: 700,
                  letterSpacing: '-0.03em',
                  lineHeight: 1.1,
                }}
              >
                Welcome back, {firstName}
              </h1>
              <p className="mt-2 text-sm" style={{ color: T.t2 }}>
                You have <strong className="font-medium text-white">{coursesInProgress} course{coursesInProgress === 1 ? '' : 's'}</strong> to continue.
                Ready to continue?
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/educators')}
              className="hidden items-center gap-1.5 rounded-lg px-4 py-2 text-[13px] transition-colors hover:bg-white/[0.06] md:flex"
              style={{ border: `1px solid ${T.border}`, color: T.t2 }}
            >
              Browse all <ArrowUpRight size={13} />
            </button>
          </div>

          <SectionHeader label="Continue learning" icon={<Clock size={14} />} action="View all" onAction={() => navigate('/my-quizzes')} />
          {inProgress.length === 0 ? (
            <p className="mb-8 text-[13px]" style={{ color: T.t4 }}>
              No courses or quizzes in progress yet.
            </p>
          ) : (
            <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
              {inProgress.map((item) => (
                <ProgressCard
                  key={item.id}
                  item={item}
                  onOpen={() =>
                    item.kind === 'course'
                      ? navigate(`/course-details/${item.id}`, {
                          state: { from: `${location.pathname}${location.search}` },
                        })
                      : navigate(`/quiz/${item.id}`)
                  }
                />
              ))}
            </div>
          )}

          <SectionHeader label="Curated for you" icon={<Star size={14} />} action="See all" onAction={() => navigate('/browse-courses')} />
          <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {(curated.length > 0 ? curated : FALLBACK_CURATED).map((c) => (
              <CourseCard
                key={String(c.id)}
                course={c}
                onOpen={() => {
                  if (typeof c.id === 'string' && c.id.includes('-')) {
                    navigate(`/course-details/${c.id}`, {
                      state: { from: `${location.pathname}${location.search}` },
                    });
                  }
                }}
              />
            ))}
          </div>

          <div className="mt-2">
            <TrendingPanel
              layout="bottom"
              items={trending}
              onViewAll={() => navigate('/educators')}
              onSelect={(id) => navigate(`/educator/${id}`)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function NavGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest" style={{ color: T.t4 }}>
        {label}
      </p>
      <div className="flex flex-col gap-0.5">{children}</div>
    </div>
  );
}

function SectionHeader({
  label,
  icon,
  accent,
  action,
  onAction,
}: {
  label?: string;
  icon?: React.ReactNode;
  accent?: string;
  action?: string;
  onAction?: () => void;
}) {
  const c = accent || T.t2;
  return (
    <div className="mb-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        {icon && <span style={{ color: c }}>{icon}</span>}
        <h2 className="font-semibold" style={{ fontSize: '0.875rem', letterSpacing: '-0.01em', color: T.t1 }}>
          {label}
        </h2>
      </div>
      {action && onAction && (
        <button type="button" onClick={onAction} className="text-[12px] transition-colors hover:text-zinc-300" style={{ color: T.t4 }}>
          {action} →
        </button>
      )}
    </div>
  );
}

function ProgressCard({ item, onOpen }: { item: ProgressItem; onOpen: () => void }) {
  const tag = tagColors[item.tag] ?? { color: T.t2, bg: 'rgba(255,255,255,0.06)' };
  return (
    <div
      className="group cursor-pointer overflow-hidden rounded-xl transition-all duration-200 hover:border-white/[0.13]"
      style={{ background: T.surface, border: `1px solid ${T.border}` }}
      onClick={onOpen}
    >
      <div className="relative aspect-video overflow-hidden">
        <img
          src={item.image}
          alt={item.title}
          className="h-full w-full object-cover opacity-70 transition-all duration-500 group-hover:scale-[1.03] group-hover:opacity-90"
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.05), rgba(0,0,0,0.6))' }} />
        <div
          className="absolute left-2.5 top-2.5 rounded px-2 py-0.5 text-[10px] font-medium"
          style={{
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(6px)',
            border: `1px solid ${T.border}`,
            color: tag.color,
          }}
        >
          {item.tag}
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ background: 'rgba(255,255,255,0.1)' }}>
          <div className="h-full" style={{ width: `${item.progress}%`, background: T.accent }} />
        </div>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)' }}
          >
            <Play size={14} className="ml-0.5 fill-white text-white" />
          </div>
        </div>
      </div>
      <div className="px-4 py-3.5">
        <h3 className="mb-0.5 truncate text-[0.82rem] font-semibold tracking-tight" style={{ color: T.t1 }}>
          {item.title}
        </h3>
        <p className="mb-3 text-[12px]" style={{ color: T.t3 }}>
          {item.instructor}
        </p>
        <div className="mb-2">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-[11px]" style={{ color: T.t3 }}>
              {item.lessons.done} / {item.lessons.total} lessons
            </span>
            <span className="text-[11px] font-semibold" style={{ color: T.accentLt }}>
              {item.progress}%
            </span>
          </div>
          <div className="h-[3px] rounded-full" style={{ background: 'rgba(255,255,255,0.07)' }}>
            <div className="h-full rounded-full" style={{ width: `${item.progress}%`, background: T.accent }} />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[11px]" style={{ color: T.t4 }}>
            {item.timeLeft} remaining
          </span>
          <span className="text-[11px] font-medium" style={{ color: T.accentLt }}>
            Resume →
          </span>
        </div>
      </div>
    </div>
  );
}

function CourseCard({
  course,
  onOpen,
}: {
  course: CuratedCard | (typeof FALLBACK_CURATED)[0];
  onOpen?: () => void;
}) {
  const tag = tagColors[course.tag] ?? { color: T.t2, bg: 'rgba(255,255,255,0.06)' };
  return (
    <div
      role={onOpen ? 'button' : undefined}
      tabIndex={onOpen ? 0 : undefined}
      onClick={onOpen}
      onKeyDown={onOpen ? (e) => e.key === 'Enter' && onOpen() : undefined}
      className="group cursor-pointer overflow-hidden rounded-xl transition-all duration-200 hover:border-white/[0.13]"
      style={{ background: T.surface, border: `1px solid ${T.border}` }}
    >
      <div className="relative aspect-video overflow-hidden">
        <img
          src={course.image}
          alt={course.title}
          className="h-full w-full object-cover opacity-75 transition-all duration-500 group-hover:scale-[1.04] group-hover:opacity-95"
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.65))' }} />
        <div
          className="absolute right-2 top-2 flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', border: `1px solid ${T.border}`, color: '#E4E4E7' }}
        >
          <Star size={9} className="fill-amber-400 text-amber-400" /> {course.rating}
        </div>
      </div>
      <div className="p-3.5">
        <span className="mb-2 inline-block rounded px-2 py-0.5 text-[10px] font-medium" style={{ color: tag.color, background: tag.bg }}>
          {course.tag}
        </span>
        <h3 className="mb-1 line-clamp-2 text-[0.8rem] font-semibold leading-snug tracking-tight" style={{ color: T.t1 }}>
          {course.title}
        </h3>
        <p className="mb-2.5 text-[11px]" style={{ color: T.t3 }}>
          {course.instructor}
        </p>
        <div className="flex items-center gap-2 text-[11px]" style={{ color: T.t4 }}>
          <Users size={10} /> {course.students}
          <span>·</span>
          <Clock size={10} /> {course.duration}
        </div>
      </div>
    </div>
  );
}

type TrendingItem = {
  id: string;
  name: string;
  sub: string;
  videos: string;
  img: string;
};

function formatVideoLabel(videos: string) {
  return videos.toLowerCase().includes('video') ? videos : `${videos} videos`;
}

function TrendingPanel({
  items,
  onViewAll,
  onSelect,
  layout = 'sidebar',
}: {
  items: TrendingItem[];
  onViewAll: () => void;
  onSelect: (id: string) => void;
  layout?: 'sidebar' | 'bottom';
}) {
  const isBottom = layout === 'bottom';
  if (items.length === 0) {
    return (
      <div
        className="rounded-2xl p-6 text-center text-[13px]"
        style={{
          background: 'linear-gradient(165deg, rgba(28,28,36,0.9) 0%, rgba(14,14,14,1) 100%)',
          border: `1px solid ${T.border}`,
          color: T.t4,
        }}
      >
        No trending creators yet
      </div>
    );
  }

  return (
    <div
      className="flex flex-col overflow-hidden rounded-2xl"
      style={{
        background: 'linear-gradient(165deg, rgba(28,28,36,0.92) 0%, rgba(12,12,14,1) 55%, rgba(10,10,12,1) 100%)',
        border: `1px solid ${T.border}`,
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
      }}
    >
      <div className="flex items-center gap-2 px-4 pb-1 pt-4">
        <TrendingUp size={16} strokeWidth={2.25} style={{ color: '#FB923C' }} />
        <h2 className="text-[15px] font-semibold tracking-tight" style={{ color: T.t1 }}>
          Trending Creators
        </h2>
      </div>

      <div className="flex flex-col gap-0.5 px-2 py-2">
        {items.map((creator, index) => (
          <button
            key={creator.id}
            type="button"
            onClick={() => onSelect(creator.id)}
            className="group flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-white/[0.06]"
          >
            <div className="relative shrink-0">
              <img
                src={creator.img}
                alt={creator.name}
                className="h-11 w-11 rounded-full object-cover"
                style={{ border: `1px solid ${T.borderMd}` }}
              />
              <span
                className="absolute -bottom-0.5 -right-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-0.5 text-[10px] font-bold leading-none text-white"
                style={{ background: '#4F6BFF', border: '2px solid #121218' }}
              >
                {index + 1}
              </span>
            </div>

            <div className="min-w-0 flex-1 pt-0.5">
              <p
                className="truncate text-[13px] font-semibold tracking-tight transition-colors group-hover:text-[#A5B4FC]"
                style={{ color: T.t1 }}
              >
                {creator.name}
              </p>
              <p className="mt-0.5 truncate text-[11px] leading-snug" style={{ color: T.t3 }}>
                {creator.sub}
              </p>
              <span
                className="mt-2 inline-block rounded-md px-2 py-0.5 text-[10px] font-medium"
                style={{ background: 'rgba(255,255,255,0.06)', color: '#9CA3AF' }}
              >
                {formatVideoLabel(creator.videos)}
              </span>
            </div>
          </button>
        ))}
      </div>

      <div className={`px-4 pb-4 pt-1 ${isBottom ? 'flex justify-end' : ''}`}>
        <button
          type="button"
          onClick={onViewAll}
          className={`rounded-lg py-2 text-[12px] font-medium transition-colors hover:bg-white/[0.05] ${isBottom ? 'px-4' : 'w-full'}`}
          style={{ color: T.t4 }}
        >
          View all creators →
        </button>
      </div>
    </div>
  );
}
