import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams, Navigate } from 'react-router';
import axios from 'axios';
import {
  BookMarked,
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  FileText,
  Play,
} from 'lucide-react';
import { fetchEnrollments } from '../api/catalogApi';
import type { EnrollmentSummary } from '../types/catalog';
import { ytThumb } from '../utils/catalogMap';
import { useShell } from '../shell/ShellContext';
import { PageHeader } from '../shell/PageHeader';
import { StaggerChildren, StaggerItem } from '../shell/motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';

type LibraryTab = 'in_progress' | 'saved' | 'completed';

type QuizListItem = {
  id: string;
  title: string;
  status: string;
  score: number | null;
  date: string;
  duration: string;
  questions: number;
};

const TAB_META: Record<LibraryTab, { title: string; description: string }> = {
  in_progress: {
    title: 'Library',
    description: 'Courses you are still working through.',
  },
  saved: {
    title: 'Library',
    description: 'Quizzes you have generated and saved.',
  },
  completed: {
    title: 'Library',
    description: 'Courses you have finished.',
  },
};

function normalizeTab(raw: string | null): LibraryTab {
  if (raw === 'saved' || raw === 'completed' || raw === 'in_progress') return raw;
  if (raw === 'quizzes') return 'saved';
  return 'in_progress';
}

/** Old /my-courses?filter=completed bookmarks → Library tabs. */
export function MyCoursesRedirect() {
  const [params] = useSearchParams();
  const tab = params.get('filter') === 'completed' ? 'completed' : 'in_progress';
  return <Navigate to={`/library?tab=${tab}`} replace />;
}

export function Library() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { libraryStats } = useShell();
  const tab = normalizeTab(searchParams.get('tab') ?? searchParams.get('filter'));

  const [enrollments, setEnrollments] = useState<EnrollmentSummary[]>([]);
  const [quizzes, setQuizzes] = useState<QuizListItem[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingQuizzes, setLoadingQuizzes] = useState(true);

  useEffect(() => {
    fetchEnrollments()
      .then(setEnrollments)
      .catch(() => setEnrollments([]))
      .finally(() => setLoadingCourses(false));
  }, []);

  useEffect(() => {
    axios
      .get('/api/quizzes')
      .then((res) => {
        const mapped: QuizListItem[] = (res.data ?? []).map((q: {
          id: string;
          title: string;
          status: string;
          latestScorePercent?: number;
          questionCount?: number;
          durationLabel?: string;
          createdAt?: string;
        }) => ({
          id: q.id,
          title: q.title,
          status: q.status === 'in_progress' ? 'in-progress' : q.status,
          score: q.latestScorePercent ?? null,
          date: q.createdAt ? new Date(q.createdAt).toLocaleDateString() : '',
          duration: q.durationLabel ?? '--',
          questions: q.questionCount ?? 0,
        }));
        setQuizzes(mapped);
      })
      .catch(() => setQuizzes([]))
      .finally(() => setLoadingQuizzes(false));
  }, []);

  const inProgress = useMemo(
    () => enrollments.filter((e) => e.status !== 'completed' && (e.progress ?? 0) < 100),
    [enrollments],
  );
  const completed = useMemo(
    () => enrollments.filter((e) => e.status === 'completed' || (e.progress ?? 0) >= 100),
    [enrollments],
  );

  const setTab = (next: string) => {
    setSearchParams({ tab: next }, { replace: true });
  };

  const meta = TAB_META[tab];
  const counts = {
    in_progress: libraryStats.inProgress || inProgress.length,
    saved: libraryStats.saved || quizzes.length,
    completed: libraryStats.completed || completed.length,
  };

  return (
    <div>
      <PageHeader
        label="Your learning"
        title={meta.title}
        description={meta.description}
      />

      <Tabs value={tab} onValueChange={setTab} className="mb-8">
        <TabsList className="h-10 w-full justify-start gap-0.5 overflow-x-auto sm:w-auto">
          <TabsTrigger value="in_progress" className="gap-1.5 px-3.5">
            <Circle size={14} />
            In progress
            <span className="tabular-nums text-muted-foreground">{counts.in_progress}</span>
          </TabsTrigger>
          <TabsTrigger value="saved" className="gap-1.5 px-3.5">
            <BookMarked size={14} />
            Saved
            <span className="tabular-nums text-muted-foreground">{counts.saved}</span>
          </TabsTrigger>
          <TabsTrigger value="completed" className="gap-1.5 px-3.5">
            <CheckCircle2 size={14} />
            Completed
            <span className="tabular-nums text-muted-foreground">{counts.completed}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="in_progress">
          <CourseList
            loading={loadingCourses}
            items={inProgress}
            empty="No courses in progress."
            mode="in_progress"
            onOpen={(id) => navigate(`/course-details/${id}`)}
          />
        </TabsContent>

        <TabsContent value="saved">
          <QuizList
            loading={loadingQuizzes}
            items={quizzes}
            onOpenQuiz={(id) => navigate(`/quiz/${id}`)}
            onOpenResults={(id) => navigate(`/results/${id}`)}
            onCreate={() => navigate('/dashboard')}
          />
        </TabsContent>

        <TabsContent value="completed">
          <CourseList
            loading={loadingCourses}
            items={completed}
            empty="No completed courses yet."
            mode="completed"
            onOpen={(id) => navigate(`/course-details/${id}`)}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CourseList({
  loading,
  items,
  empty,
  mode,
  onOpen,
}: {
  loading: boolean;
  items: EnrollmentSummary[];
  empty: string;
  mode: 'in_progress' | 'completed';
  onOpen: (courseId: string) => void;
}) {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="flex gap-4 p-4">
            <Skeleton className="aspect-video w-28 shrink-0 rounded-md" />
            <div className="flex-1 space-y-2 py-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-px w-full" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return <Card className="py-16 text-center text-sm text-muted-foreground">{empty}</Card>;
  }

  return (
    <StaggerChildren className="space-y-2">
      {items.map((e) => {
        const thumb = e.youtubeVideoId ? ytThumb(e.youtubeVideoId) : undefined;
        const pct = Math.round(e.progress ?? 0);
        return (
          <StaggerItem key={e.courseId}>
            <Card
              className="flex cursor-pointer gap-4 p-4 transition-colors hover:border-border/80"
              onClick={() => onOpen(e.courseId)}
            >
              <div className="aspect-video w-28 shrink-0 overflow-hidden rounded-md bg-muted">
                {thumb && <img src={thumb} alt="" className="h-full w-full object-cover" />}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-sm font-medium">{e.title}</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  {e.channel || e.category} · {mode === 'completed' ? 'Completed' : `${pct}% complete`}
                </p>
                {mode !== 'completed' && (
                  <div className="mt-3 h-px overflow-hidden rounded-full bg-muted">
                    <div className="h-full bg-[var(--brand)]" style={{ width: `${pct}%` }} />
                  </div>
                )}
              </div>
            </Card>
          </StaggerItem>
        );
      })}
    </StaggerChildren>
  );
}

function QuizList({
  loading,
  items,
  onOpenQuiz,
  onOpenResults,
  onCreate,
}: {
  loading: boolean;
  items: QuizListItem[];
  onOpenQuiz: (id: string) => void;
  onOpenResults: (id: string) => void;
  onCreate: () => void;
}) {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <Card className="py-16 text-center">
        <CardContent>
          <FileText className="mx-auto mb-3 size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No saved quizzes yet.</p>
          <Button className="mt-4" size="sm" onClick={onCreate}>Create quiz</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <StaggerChildren className="space-y-2">
      {items.map((quiz) => (
        <StaggerItem key={quiz.id}>
          <Card className="transition-colors hover:border-border/80">
            <CardContent className="flex gap-4 p-4">
              <div className="flex size-16 shrink-0 items-center justify-center rounded-md bg-muted">
                <Play size={20} className="text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-start justify-between gap-2">
                  <h3 className="truncate text-sm font-medium">{quiz.title}</h3>
                  <Badge variant="muted">{quiz.status.replace('-', ' ')}</Badge>
                </div>
                <div className="mb-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Calendar size={12} />{quiz.date}</span>
                  <span className="flex items-center gap-1"><Clock size={12} />{quiz.duration}</span>
                  <span className="flex items-center gap-1"><FileText size={12} />{quiz.questions} questions</span>
                </div>
                <div className="flex gap-2">
                  {quiz.status === 'completed' ? (
                    <Button size="sm" variant="default" onClick={() => onOpenResults(quiz.id)}>View results</Button>
                  ) : (
                    <Button size="sm" onClick={() => onOpenQuiz(quiz.id)}>
                      {quiz.status === 'in-progress' ? 'Resume' : 'Start'}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </StaggerItem>
      ))}
    </StaggerChildren>
  );
}
