import { useState, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useUserProfile } from '../context/UserProfileContext';
import { UserAvatar } from './UserAvatar';
import { SidebarNavItem } from './SidebarNavItem';
import { getDisplayName, getFirstName } from '../utils/userDisplay';
import {
  Bell,
  BookMarked,
  BookOpen,
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
  Trophy,
  Users,
} from 'lucide-react';

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

const inProgress = [
  {
    id: 'python-data-science',
    title: 'Python for Data Science',
    instructor: 'Dr. Sarah Chen',
    tag: 'AI & ML',
    progress: 68,
    timeLeft: '14h',
    lessons: { done: 28, total: 42 },
    image: 'https://images.unsplash.com/photo-1760548425425-e42e77fa38f1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXRhJTIwc2NpZW5jZSUyMHB5dGhvbiUyMGNvZGUlMjBkYXJrJTIwc2NyZWVufGVufDF8fHx8MTc3ODIxNzcxMXww&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 'advanced-algorithms',
    title: 'Advanced Algorithms',
    instructor: 'Prof. Michael Roberts',
    tag: 'Programming',
    progress: 34,
    timeLeft: '25h',
    lessons: { done: 13, total: 38 },
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&q=80',
  },
  {
    id: 'ml-fundamentals',
    title: 'ML Fundamentals',
    instructor: 'Dr. Alex Kumar',
    tag: 'AI & ML',
    progress: 12,
    timeLeft: '29h',
    lessons: { done: 4, total: 33 },
    image: 'https://images.unsplash.com/photo-1647356161576-4e80c6619a0e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXJrJTIwbmV1cmFsJTIwbmV0d29yayUyMEFJJTIwYWJzdHJhY3R8ZW58MXx8fHwxNzc4MTY1Mzg4fDA&ixlib=rb-4.1.0&q=80&w=1080',
  },
];

const topCourse = {
  title: 'Python for Data Science',
  instructor: 'Dr. Sarah Chen',
  tag: 'Top Course',
  rating: '4.9',
  students: '280k',
  duration: '42 lessons',
  progress: 68,
  image: 'https://images.unsplash.com/photo-1760548425425-e42e77fa38f1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXRhJTIwc2NpZW5jZSUyMHB5dGhvbiUyMGNvZGUlMjBkYXJrJTIwc2NyZWVufGVufDF8fHx8MTc3ODIxNzcxMXww&ixlib=rb-4.1.0&q=80&w=1080',
};

const curated = [
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
    image: 'https://images.unsplash.com/photo-1617119895969-f4ea56f5538b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXJrJTIwY3liZXJwdW5rJTIwdGVjaG5vbG9neSUyMGRyYW1hdGljJTIwY2luZW1hdGljfGVufDF8fHx8MTc3ODE2NTc1NHww&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 3,
    title: 'The Essence of Linear Algebra',
    instructor: '3Blue1Brown',
    tag: 'Mathematics',
    rating: '4.9',
    students: '430k',
    duration: '8h',
    image: 'https://images.unsplash.com/photo-1773999088123-4468344c84ce?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYXRoZW1hdGljcyUyMHZpc3VhbGl6YXRpb24lMjBkYXJrJTIwYmx1ZXxlbnwxfHx8fDE3NzgxNjUzODl8MA&ixlib=rb-4.1.0&q=80&w=1080',
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

const trending = [
  { id: 1, name: 'Lex Fridman', sub: 'Long-form AI & science interviews', videos: '430+', img: 'https://images.unsplash.com/photo-1598525112964-8f526c4084e2?w=200&q=80' },
  { id: 2, name: 'Two Minute Papers', sub: 'AI research explained simply', videos: '620+', img: 'https://images.unsplash.com/photo-1763568258143-904ea924ac53?w=200&q=80' },
  { id: 3, name: 'Stanford Online', sub: 'World-class university lectures', videos: '1100+', img: 'https://images.unsplash.com/photo-1676354555185-df7a1eb39608?w=200&q=80' },
  { id: 4, name: 'sentdex', sub: 'Python & machine learning tutorials', videos: '1300+', img: 'https://images.unsplash.com/photo-1667372531881-6f975b1c86db?w=200&q=80' },
  { id: 5, name: 'Organic Chemistry Tutor', sub: 'Math, science, and exam walkthroughs', videos: '3200+', img: 'https://images.unsplash.com/photo-1562411054-261f857a7c62?w=200&q=80' },
];

const tagColors: Record<string, { color: string; bg: string }> = {
  'AI & ML': { color: '#818CF8', bg: 'rgba(129,140,248,0.1)' },
  Programming: { color: '#34D399', bg: 'rgba(52,211,153,0.08)' },
  Mathematics: { color: '#FB923C', bg: 'rgba(251,146,60,0.08)' },
  'Web Dev': { color: '#38BDF8', bg: 'rgba(56,189,248,0.08)' },
};

type NavId = 'dashboard' | 'browse' | 'trending' | 'progress' | 'saved' | 'completed' | 'settings' | 'help';

export function HomeFeed() {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useUserProfile();
  const displayName = getDisplayName(profile);
  const firstName = getFirstName(profile);

  const isNavActive = (id: NavId) => {
    if (id === 'dashboard') return location.pathname === '/dashboard' || location.pathname === '/home';
    if (id === 'browse' || id === 'trending') return location.pathname.startsWith('/browse-courses') || location.pathname.startsWith('/educator/');
    if (id === 'progress' || id === 'saved' || id === 'completed') return location.pathname.startsWith('/my-quizzes');
    if (id === 'settings' || id === 'help') return location.pathname.startsWith('/settings');
    return false;
  };

  const goToNav = (id: NavId) => {
    if (id === 'browse' || id === 'trending') navigate('/browse-courses');
    else if (id === 'progress' || id === 'saved' || id === 'completed') navigate('/my-quizzes');
    else if (id === 'settings' || id === 'help') navigate('/settings');
    else navigate('/dashboard');
  };

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
            <span className="text-sm font-semibold tracking-tight text-zinc-100">Qualia</span>
            <span className="-mt-0.5 block text-[10px] text-zinc-600">Learning Platform</span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4" style={{ scrollbarWidth: 'none' }}>
          <NavGroup label="Menu">
            {[
              { id: 'dashboard' as const, label: 'Dashboard', icon: <Home size={15} /> },
              { id: 'browse' as const, label: 'Browse Courses', icon: <Search size={15} /> },
              { id: 'trending' as const, label: 'Trending', icon: <TrendingUp size={15} /> },
            ].map((item) => (
              <SidebarNavItem key={item.id} item={item} active={isNavActive(item.id)} onClick={() => goToNav(item.id)} />
            ))}
          </NavGroup>

          <NavGroup label="Library">
            {[
              { id: 'progress' as const, label: 'In Progress', icon: <Circle size={15} />, badge: '3' },
              { id: 'saved' as const, label: 'Saved', icon: <BookMarked size={15} /> },
              { id: 'completed' as const, label: 'Completed', icon: <CheckCircle2 size={15} />, badge: '7' },
            ].map((item) => (
              <SidebarNavItem key={item.id} item={item} active={isNavActive(item.id)} onClick={() => goToNav(item.id)} />
            ))}
          </NavGroup>

          <NavGroup label="Account">
            {[
              { id: 'settings' as const, label: 'Settings', icon: <Settings size={15} /> },
              { id: 'help' as const, label: 'Help & Support', icon: <HelpCircle size={15} /> },
            ].map((item) => (
              <SidebarNavItem key={item.id} item={item} active={isNavActive(item.id)} onClick={() => goToNav(item.id)} />
            ))}
          </NavGroup>
        </nav>

        <div className="shrink-0 p-3" style={{ borderTop: `1px solid ${T.border}` }}>
          <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-150 hover:bg-white/[0.06] active:scale-[0.98] active:bg-white/[0.08]">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white" style={{ background: T.accent }}>
              {avatarLetter}
            </div>
            <div className="min-w-0 flex-1 text-left">
              <div className="mb-0.5 truncate text-sm font-medium leading-none text-zinc-200">{displayName}</div>
              <div className="truncate text-[11px] text-zinc-600">{profile?.email ?? ''}</div>
            </div>
            <ChevronRight size={13} className="shrink-0" style={{ color: T.t4 }} />
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
            <button
              className="flex h-8 items-center gap-2 rounded-lg px-3 text-[13px] transition-colors"
              style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.t3 }}
            >
              <Search size={13} />
              <span>Search courses…</span>
              <span
                className="ml-3 hidden items-center gap-0.5 rounded px-1.5 py-0.5 text-[11px] md:inline-flex"
                style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${T.border}`, color: T.t4 }}
              >
                ⌘K
              </span>
            </button>

            <button className="relative flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-white/[0.05]" style={{ color: T.t3 }}>
              <Bell size={15} />
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full" style={{ background: T.accent }} />
            </button>

            <UserAvatar profile={profile} size="md" className="cursor-pointer" />
          </div>
        </header>

        <div className="mx-auto w-full max-w-[1360px] flex-1 px-8 pb-20 pt-8">
          <div className="mb-8">
            <p className="mb-1.5 text-[12px] font-medium uppercase tracking-widest" style={{ color: T.t3 }}>
              Good morning
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
              You have <strong className="font-medium text-white">3 courses</strong> in progress. Ready to continue?
            </p>
          </div>

          <div className="space-y-8">
            <DashboardSection>
              <SectionHeader label="Top Course" icon={<Trophy size={14} />} action="Browse all" />
              <TopCourseCard course={topCourse} onStart={() => navigate('/quiz-setup/new')} />
            </DashboardSection>

            <DashboardSection>
              <SectionHeader label="Continue learning" icon={<Clock size={14} />} action="View all" />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {inProgress.map((item) => (
                  <ProgressCard key={item.id} item={item} onResume={() => navigate(`/quiz/${item.id}`)} />
                ))}
              </div>
            </DashboardSection>

            <DashboardSection>
              <SectionHeader label="Curated for you" icon={<Star size={14} />} action="See all" />
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {curated.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            </DashboardSection>

            <div>
              <TrendingPanel />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NavGroup({ label, children }: { label: string; children: ReactNode }) {
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
}: {
  label: string;
  icon?: ReactNode;
  accent?: string;
  action?: string;
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
      {action && (
        <button className="text-[12px] transition-colors hover:text-zinc-300" style={{ color: T.t4 }}>
          {action} →
        </button>
      )}
    </div>
  );
}

function DashboardSection({ children }: { children: ReactNode }) {
  return (
    <section
      className="rounded-xl p-4 md:p-5"
      style={{
        background: 'rgba(255,255,255,0.018)',
        border: `1px solid ${T.border}`,
      }}
    >
      {children}
    </section>
  );
}

function TopCourseCard({ course, onStart }: { course: typeof topCourse; onStart: () => void }) {
  return (
    <div
      className="grid overflow-hidden rounded-xl lg:grid-cols-[360px_1fr]"
      style={{ background: T.surface, border: `1px solid ${T.border}` }}
    >
      <div className="relative min-h-[220px] overflow-hidden">
        <img
          src={course.image}
          alt={course.title}
          className="absolute inset-0 h-full w-full object-cover opacity-80 transition-transform duration-500 hover:scale-[1.03]"
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(12,12,12,0.72), rgba(12,12,12,0.05))' }} />
        <div
          className="absolute left-4 top-4 rounded px-2 py-1 text-[11px] font-semibold"
          style={{ background: T.accentBg, border: `1px solid ${T.accentBd}`, color: T.accentLt }}
        >
          {course.tag}
        </div>
      </div>

      <div className="flex flex-col justify-between gap-8 p-5 md:p-6">
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-3 text-[12px]" style={{ color: T.t3 }}>
            <span className="flex items-center gap-1.5">
              <Star size={12} className="fill-amber-400 text-amber-400" />
              {course.rating}
            </span>
            <span className="flex items-center gap-1.5">
              <Users size={12} />
              {course.students} students
            </span>
            <span className="flex items-center gap-1.5">
              <BookOpen size={12} />
              {course.duration}
            </span>
          </div>
          <h2 className="text-[1.45rem] font-semibold leading-tight text-white md:text-[1.85rem]">
            {course.title}
          </h2>
          <p className="mt-2 text-[13px]" style={{ color: T.t3 }}>
            {course.instructor}
          </p>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between text-[12px]">
            <span style={{ color: T.t3 }}>Course progress</span>
            <span className="font-semibold" style={{ color: T.accentLt }}>{course.progress}%</span>
          </div>
          <div className="h-[4px] rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <div className="h-full rounded-full" style={{ width: `${course.progress}%`, background: T.accent }} />
          </div>
          <button
            className="mt-5 rounded-lg px-4 py-2 text-[13px] font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ background: T.accent, boxShadow: '0 2px 12px -2px rgba(99,102,241,0.4)' }}
            onClick={onStart}
          >
            Resume course
          </button>
        </div>
      </div>
    </div>
  );
}

function ProgressCard({ item, onResume }: { item: (typeof inProgress)[number]; onResume: () => void }) {
  const tag = tagColors[item.tag] ?? { color: T.t2, bg: 'rgba(255,255,255,0.06)' };

  return (
    <div
      className="group cursor-pointer overflow-hidden rounded-xl transition-all duration-200 hover:border-white/[0.13]"
      style={{ background: T.surface, border: `1px solid ${T.border}` }}
      onClick={onResume}
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
            fontFamily: FONT,
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
        <h3 className="mb-0.5 truncate" style={{ fontSize: '0.82rem', fontWeight: 600, letterSpacing: '-0.01em', color: T.t1 }}>
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

function CourseCard({ course }: { course: (typeof curated)[number] }) {
  const tag = tagColors[course.tag] ?? { color: T.t2, bg: 'rgba(255,255,255,0.06)' };

  return (
    <div
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
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)' }}
          >
            <Play size={12} className="ml-0.5 fill-white text-white" />
          </div>
        </div>
      </div>
      <div className="p-3.5">
        <span className="mb-2 inline-block rounded px-2 py-0.5 text-[10px] font-medium" style={{ color: tag.color, background: tag.bg }}>
          {course.tag}
        </span>
        <h3
          className="mb-1 line-clamp-2"
          style={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: '-0.01em', color: T.t1, lineHeight: 1.35 }}
        >
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

function TrendingPanel() {
  return (
    <section
      className="relative overflow-hidden rounded-2xl px-5 py-5 md:px-7 md:py-7"
      style={{
        background: 'rgba(255,255,255,0.018)',
        border: `1px solid ${T.border}`,
      }}
    >
      <div
        className="absolute inset-0 opacity-100"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.025), transparent 32%)',
        }}
      />
      <div className="relative">
        <div className="flex items-center gap-3">
          <TrendingUp size={19} style={{ color: '#C46E24' }} />
          <h2 className="text-xl font-semibold text-zinc-200 md:text-2xl" style={{ letterSpacing: '-0.02em' }}>
            Trending Creators
          </h2>
        </div>

        <div className="mt-8 flex flex-col gap-3">
          {trending.map((creator, index) => {
            const highlighted = index === 1;

            return (
              <button
                key={creator.id}
                className="group flex w-full items-center gap-4 rounded-xl px-3 py-3 text-left transition-all duration-200 md:gap-5 md:px-4 md:py-4"
                style={{
                  background: highlighted ? T.surface : 'transparent',
                  border: highlighted ? `1px solid ${T.border}` : '1px solid transparent',
                }}
              >
                <div className="relative h-14 w-14 shrink-0 md:h-16 md:w-16">
                  <div
                    className="h-full w-full overflow-hidden rounded-full transition-all duration-200 group-hover:ring-2 group-hover:ring-indigo-500/35"
                    style={{ border: `1px solid ${highlighted ? T.accentBd : T.borderMd}` }}
                  >
                    <img src={creator.img} alt={creator.name} className="h-full w-full object-cover opacity-80 transition-opacity group-hover:opacity-100" />
                  </div>
                  <span
                    className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-semibold text-white"
                    style={{
                      background: T.accent,
                      border: `2px solid ${T.bg}`,
                    }}
                  >
                    {index + 1}
                  </span>
                </div>

                <div className="min-w-0">
                  <h3
                    className="truncate text-[15px] font-semibold md:text-base"
                    style={{ color: highlighted ? '#A5B4FC' : T.t1, letterSpacing: '-0.01em' }}
                  >
                    {creator.name}
                  </h3>
                  <p className="mt-1 truncate text-[13px] md:text-sm" style={{ color: T.t3 }}>
                    {creator.sub}
                  </p>
                  <span
                    className="mt-3 inline-flex rounded-md px-2.5 py-1 text-[12px] font-semibold"
                    style={{
                      background: 'rgba(255,255,255,0.045)',
                      border: `1px solid ${T.border}`,
                      color: T.t2,
                    }}
                  >
                    {creator.videos} videos
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
