import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import axios from 'axios';
import { PageHeader } from '../shell/PageHeader';
import { CourseCard, type CourseCardModel } from './CourseCard';

type QuizListItem = {
  id: string;
  title: string;
  status: string;
  score: number | null;
  questions: number;
  thumbnailUrl?: string;
  examType?: string;
};

function quizCard(q: QuizListItem): CourseCardModel {
  const progress = q.score ?? (q.status === 'in-progress' ? 40 : 0);
  const examTag = q.examType ? `${q.examType.toUpperCase()} exam` : 'Quiz';
  return {
    id: q.id,
    title: q.title,
    creator: 'Your library',
    tag: examTag,
    progress,
    lessonsDone: 0,
    lessonsTotal: q.questions,
    current: q.status === 'completed' || progress > 0,
    image: q.thumbnailUrl,
  };
}

export function ReviewPage() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<QuizListItem[]>([]);
  const [loading, setLoading] = useState(true);

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
          examType?: string;
        }) => ({
          id: q.id,
          title: q.title,
          status: q.status === 'in_progress' ? 'in-progress' : q.status,
          score: q.latestScorePercent ?? null,
          questions: q.questionCount ?? 0,
          thumbnailUrl: q.thumbnailUrl,
          examType: q.examType,
        }));
        setQuizzes(mapped.filter((q) => q.status === 'completed' || q.score != null));
      })
      .catch(() => setQuizzes([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader
        title="Review"
        description="Open a finished quiz to go through the questions again."
      />

      {loading ? (
        <div className="course-grid">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="course-card" style={{ minHeight: 220, pointerEvents: 'none' }} />
          ))}
        </div>
      ) : quizzes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-glyph">[ ]</div>
          <div className="empty-title">Nothing to review yet</div>
          <div className="empty-sub">Finish a practice quiz and it will show up here.</div>
        </div>
      ) : (
        <div className="course-grid">
          {quizzes.map((q) => (
            <CourseCard
              key={q.id}
              item={quizCard(q)}
              onOpen={() => navigate(`/results/${q.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
