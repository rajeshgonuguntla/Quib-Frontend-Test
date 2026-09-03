import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams, Navigate } from 'react-router';
import axios from 'axios';
import { fetchEnrollments } from '../api/catalogApi';
import type { EnrollmentSummary } from '../types/catalog';
import { ytThumb } from '../utils/catalogMap';
import { useShell } from '../shell/ShellContext';
import { CourseCard, type CourseCardModel } from './CourseCard';

type ProgressTab = 'all' | 'in_progress' | 'saved' | 'completed';

type QuizListItem = {
  id: string;
  title: string;
  status: string;
  score: number | null;
  questions: number;
  thumbnailUrl?: string;
};

function normalizeTab(raw: string | null): ProgressTab {
  if (raw === 'all' || raw === 'saved' || raw === 'completed' || raw === 'in_progress') return raw;
  if (raw === 'quizzes') return 'saved';
  return 'all';
}

export function MyCoursesRedirect() {
  const [params] = useSearchParams();
  const tab = params.get('filter') === 'completed' ? 'completed' : 'in_progress';
  return <Navigate to={`/library?tab=${tab}`} replace />;
}

function enrollmentCard(e: EnrollmentSummary): CourseCardModel {
  const total = e.lessonCount && e.lessonCount > 0 ? e.lessonCount : 0;
  const progress = e.progress ?? 0;
  return {
    id: e.courseId,
    title: e.title,
    creator: e.channel || 'Educator',
    tag: e.category || 'General',
    progress,
    lessonsDone: total ? Math.round((progress / 100) * total) : 0,
    lessonsTotal: total,
    current: e.status === 'in-progress' || progress > 0,
    image: e.youtubeVideoId ? ytThumb(e.youtubeVideoId) : undefined,
  };
}

function quizCard(q: QuizListItem): CourseCardModel {
  const progress = q.score ?? (q.status === 'in-progress' ? 40 : 0);
  return {
    id: q.id,
    title: q.title,
    creator: 'Your library',
    tag: 'Quiz',
    progress,
    lessonsDone: 0,
    lessonsTotal: q.questions,
    current: q.status === 'in-progress' || progress > 0,
    image: q.thumbnailUrl,
  };
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
          thumbnailUrl?: string;
        }) => ({
          id: q.id,
          title: q.title,
          status: q.status === 'in_progress' ? 'in-progress' : q.status,
          score: q.latestScorePercent ?? null,
          questions: q.questionCount ?? 0,
          thumbnailUrl: q.thumbnailUrl,
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

  const setTab = (next: ProgressTab) => {
    setSearchParams({ tab: next }, { replace: true });
  };

  const counts = {
    all: enrollments.length,
    in_progress: libraryStats.inProgress || inProgress.length,
    saved: libraryStats.saved || quizzes.length,
    completed: libraryStats.completed || completed.length,
  };

  const loading = tab === 'saved' ? loadingQuizzes : loadingCourses;
  const cards: { item: CourseCardModel; kind: 'course' | 'quiz'; status?: string }[] =
    tab === 'saved'
      ? quizzes.map((q) => ({ item: quizCard(q), kind: 'quiz', status: q.status }))
      : (tab === 'completed' ? completed : tab === 'in_progress' ? inProgress : enrollments)
        .map((e) => ({ item: enrollmentCard(e), kind: 'course' as const }));

  return (
    <section className="browse-hero">
      <div className="eyebrow eyebrow-heading">Progress</div>

      <div className="status-tabs">
        {([
          ['all', 'All courses', counts.all],
          ['in_progress', 'In progress', counts.in_progress],
          ['saved', 'Saved', counts.saved],
          ['completed', 'Completed', counts.completed],
        ] as const).map(([id, label, count]) => (
          <button
            key={id}
            type="button"
            className={`status-tab${tab === id ? ' active' : ''}`}
            onClick={() => setTab(id)}
          >
            {label}
            <span className="status-tab-count">{count}</span>
          </button>
        ))}
      </div>

      <div className="card-divider" />

      {loading ? (
        <div className="course-grid">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="course-card" style={{ minHeight: 220, pointerEvents: 'none' }} />
          ))}
        </div>
      ) : cards.length === 0 ? (
        <div className="empty-state">
          <div className="empty-glyph">[ ]</div>
          <div className="empty-title">Nothing here yet</div>
          <div className="empty-sub">Courses will show up here once they&apos;re in progress, saved, or completed.</div>
        </div>
      ) : (
        <div className="course-grid">
          {cards.map(({ item, kind, status }) => (
            <CourseCard
              key={`${kind}-${item.id}`}
              item={item}
              onOpen={() => {
                if (kind === 'quiz') {
                  if (status === 'completed') navigate(`/results/${item.id}`);
                  else navigate(`/quiz/${item.id}`);
                  return;
                }
                navigate(`/course-details/${item.id}`);
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}
