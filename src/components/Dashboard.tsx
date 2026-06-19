import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { ArrowUpRight, Clock, Star, TrendingUp, Users } from 'lucide-react';
import axios from 'axios';
import { CREATORS } from '../data/creators';
import { fetchCourses, fetchEnrollments, fetchPopularCreators } from '../api/catalogApi';
import { useUserProfile } from '../context/UserProfileContext';
import { getFirstName } from '../utils/userDisplay';
import { courseToCuratedCard, ytThumb } from '../utils/catalogMap';
import { useTheme } from './ThemeContext';
import { getShellTheme, neutralTag, type ShellTheme } from '../utils/shellTheme';
import { useShell } from '../shell/ShellContext';
import { StaggerChildren, StaggerItem } from '../shell/motion';
import { Button } from './ui/button';
import { Card } from './ui/card';

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
};

type TrendingItem = {
  id: string;
  name: string;
  sub: string;
  videos: string;
  img: string;
};

export function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark } = useTheme();
  const T = getShellTheme(isDark);
  const { profile } = useUserProfile();
  const { libraryStats } = useShell();
  const firstName = getFirstName(profile);

  const [inProgress, setInProgress] = useState<ProgressItem[]>([]);
  const [curated, setCurated] = useState<CuratedCard[]>([]);
  const [trending, setTrending] = useState<TrendingItem[]>([]);

  useEffect(() => {
    const incomingPlaylistUrl = location.state?.playlistUrl as string | undefined;
    const incomingVideoUrl = location.state?.youtubeUrl as string | undefined;
    if (incomingPlaylistUrl) {
      navigate('/playlist-setup/new', { state: { playlistUrl: incomingPlaylistUrl }, replace: true });
      return;
    }
    if (incomingVideoUrl) {
      navigate('/quiz-setup/new', { state: { youtubeUrl: incomingVideoUrl }, replace: true });
    }
  }, [location.state, navigate]);

  useEffect(() => {
    const load = async () => {
      try {
        const [quizzesRes, popular, courses, enrollments] = await Promise.all([
          axios.get('/api/quizzes').catch(() => ({ data: [] })),
          fetchPopularCreators().catch(() => []),
          fetchCourses({ category: 'Web Development', limit: 4 }).catch(() => []),
          fetchEnrollments().catch(() => []),
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

        if (courses.length > 0) setCurated(courses.map(courseToCuratedCard));

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
          }) => {
            const total = e.lessonCount && e.lessonCount > 0 ? e.lessonCount : 10;
            return {
              id: e.courseId,
              title: e.title,
              instructor: e.channel,
              tag: e.category,
              progress: e.progress,
              timeLeft: e.durationLabel ?? '—',
              lessons: { done: Math.round((e.progress / 100) * total), total },
              image: e.youtubeVideoId ? ytThumb(e.youtubeVideoId) : ytThumb('dQw4w9WgXcQ'),
              kind: 'course' as const,
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
      } catch {
        /* defaults */
      }
    };
    void load();
  }, [location.pathname]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const coursesInProgress = libraryStats.inProgress + libraryStats.saved;

  return (
    <StaggerChildren className="space-y-8">
      <StaggerItem>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-label mb-2 text-muted-foreground">{greeting()}</p>
            <h1 className="font-serif-display text-2xl tracking-tight sm:text-3xl">Welcome back, {firstName}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              You have <span className="font-medium text-foreground">{coursesInProgress}</span> course
              {coursesInProgress === 1 ? '' : 's'} to continue.
            </p>
          </div>
          <Button variant="outline" size="sm" className="hidden sm:inline-flex" onClick={() => navigate('/browse-courses')}>
            Browse all <ArrowUpRight size={14} />
          </Button>
        </div>
      </StaggerItem>

      <StaggerItem>
        <SectionHeader theme={T} label="Continue learning" icon={<Clock size={14} />} action="View all" onAction={() => navigate('/my-courses')} />
        {inProgress.length === 0 ? (
          <p className="text-sm text-muted-foreground">No courses or quizzes in progress yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {inProgress.map((item) => (
              <ProgressCard
                key={item.id}
                theme={T}
                item={item}
                onOpen={() =>
                  item.kind === 'course'
                    ? navigate(`/course-details/${item.id}`, { state: { from: `${location.pathname}${location.search}` } })
                    : navigate(`/quiz/${item.id}`)
                }
              />
            ))}
          </div>
        )}
      </StaggerItem>

      <StaggerItem>
        <SectionHeader theme={T} label="Curated for you" icon={<Star size={14} />} action="See all" onAction={() => navigate('/browse-courses')} />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {(curated.length > 0 ? curated : FALLBACK_CURATED).map((c) => (
            <CourseCard
              key={String(c.id)}
              theme={T}
              course={c}
              onOpen={() => {
                if (typeof c.id === 'string' && c.id.includes('-')) {
                  navigate(`/course-details/${c.id}`, { state: { from: `${location.pathname}${location.search}` } });
                }
              }}
            />
          ))}
        </div>
      </StaggerItem>

      <StaggerItem>
        <TrendingPanel theme={T} items={trending} onViewAll={() => navigate('/educators')} onSelect={(id) => navigate(`/educator/${id}`)} />
      </StaggerItem>
    </StaggerChildren>
  );
}

function SectionHeader({
  label,
  icon,
  action,
  onAction,
  theme,
}: {
  label: string;
  icon?: React.ReactNode;
  action?: string;
  onAction?: () => void;
  theme: ShellTheme;
}) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        {icon && <span className="text-muted-foreground">{icon}</span>}
        <h2 className="text-sm font-medium text-foreground">{label}</h2>
      </div>
      {action && onAction && (
        <button type="button" onClick={onAction} className="text-xs text-muted-foreground transition-opacity hover:opacity-70">
          {action} →
        </button>
      )}
    </div>
  );
}

function ProgressCard({ item, onOpen, theme }: { item: ProgressItem; onOpen: () => void; theme: ShellTheme }) {
  return (
    <Card className="group cursor-pointer overflow-hidden transition-colors hover:border-border/80" onClick={onOpen}>
      <div className="relative aspect-video overflow-hidden">
        <img src={item.image} alt={item.title} className="h-full w-full object-cover transition-opacity group-hover:opacity-90" />
        <span className="text-label absolute left-3 top-3 rounded-md bg-black/60 px-2 py-1 text-zinc-200 backdrop-blur-sm">{item.tag}</span>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-border">
          <div className="h-full bg-[var(--brand)]" style={{ width: `${item.progress}%` }} />
        </div>
      </div>
      <div className="p-4">
        <h3 className="truncate text-sm font-medium">{item.title}</h3>
        <p className="mt-1 text-xs text-muted-foreground">{item.instructor}</p>
        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
          <span>{item.lessons.done} / {item.lessons.total} lessons</span>
          <span className="font-medium tabular-nums text-foreground">{item.progress}%</span>
        </div>
        <div className="mt-2 h-px overflow-hidden rounded-full bg-muted">
          <div className="h-full bg-[var(--brand)]" style={{ width: `${item.progress}%` }} />
        </div>
      </div>
    </Card>
  );
}

function CourseCard({
  course,
  onOpen,
  theme,
}: {
  course: CuratedCard | (typeof FALLBACK_CURATED)[0];
  onOpen?: () => void;
  theme: ShellTheme;
}) {
  const tag = neutralTag(theme);
  return (
    <Card
      role={onOpen ? 'button' : undefined}
      tabIndex={onOpen ? 0 : undefined}
      onClick={onOpen}
      onKeyDown={onOpen ? (e) => e.key === 'Enter' && onOpen() : undefined}
      className="group cursor-pointer overflow-hidden transition-colors hover:border-border/80"
    >
      <div className="relative aspect-video overflow-hidden">
        <img src={course.image} alt={course.title} className="h-full w-full object-cover transition-opacity group-hover:opacity-90" />
        <div className="absolute right-2 top-2 flex items-center gap-1 rounded-md bg-black/65 px-1.5 py-0.5 text-xs tabular-nums text-zinc-100 backdrop-blur-sm">
          <Star size={10} className="fill-amber-400 text-amber-400" /> {course.rating}
        </div>
      </div>
      <div className="p-3.5">
        <span className="text-label inline-block rounded-md px-2 py-0.5" style={{ color: tag.color, background: tag.bg }}>{course.tag}</span>
        <h3 className="mt-2 line-clamp-2 text-sm font-medium leading-snug">{course.title}</h3>
        <p className="mt-1 text-xs text-muted-foreground">{course.instructor}</p>
        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
          <Users size={11} /> {course.students}
          <span>·</span>
          <Clock size={11} /> {course.duration}
        </div>
      </div>
    </Card>
  );
}

function formatVideoLabel(videos: string) {
  return videos.toLowerCase().includes('video') ? videos : `${videos} videos`;
}

function TrendingPanel({
  items,
  onViewAll,
  onSelect,
  theme,
}: {
  items: TrendingItem[];
  onViewAll: () => void;
  onSelect: (id: string) => void;
  theme: ShellTheme;
}) {
  if (items.length === 0) {
    return <Card className="p-6 text-center text-sm text-muted-foreground">No trending creators yet</Card>;
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <TrendingUp size={15} className="text-muted-foreground" />
        <h2 className="text-sm font-medium">Trending creators</h2>
      </div>
      <div className="divide-y divide-border">
        {items.map((creator, index) => (
          <button
            key={creator.id}
            type="button"
            onClick={() => onSelect(creator.id)}
            className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-accent/50"
          >
            <div className="relative shrink-0">
              <img src={creator.img} alt={creator.name} className="size-10 rounded-full border border-border object-cover" />
              <span className="absolute -bottom-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-[var(--brand)] text-[10px] font-medium text-white">
                {index + 1}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{creator.name}</p>
              <p className="truncate text-xs text-muted-foreground">{creator.sub}</p>
              <span className="text-label mt-2 inline-block rounded-md bg-muted px-2 py-0.5 text-muted-foreground">
                {formatVideoLabel(creator.videos)}
              </span>
            </div>
          </button>
        ))}
      </div>
      <div className="border-t border-border px-4 py-3 text-right">
        <button type="button" onClick={onViewAll} className="text-xs text-muted-foreground transition-opacity hover:opacity-70">
          View all creators →
        </button>
      </div>
    </Card>
  );
}
