import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Play } from 'lucide-react';
import axios from 'axios';
import { fetchEnrollments } from '../api/catalogApi';
import { useUserProfile } from '../context/UserProfileContext';
import { getFirstName } from '../utils/userDisplay';
import { ytThumb } from '../utils/catalogMap';
import { StudentMasterInput } from './StudentMasterInput';

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

export function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useUserProfile();
  const firstName = getFirstName(profile);

  const [inProgress, setInProgress] = useState<ProgressItem[]>([]);

  useEffect(() => {
    const incomingPlaylistUrl = location.state?.playlistUrl as string | undefined;
    const incomingVideoUrl = location.state?.youtubeUrl as string | undefined;
    const startTool = location.state?.startTool as string | undefined;
    if (incomingPlaylistUrl) {
      navigate('/course-builder', { state: { youtubeUrl: incomingPlaylistUrl, startTool }, replace: true });
      return;
    }
    if (incomingVideoUrl) {
      navigate('/course-builder', { state: { youtubeUrl: incomingVideoUrl, startTool }, replace: true });
    }
  }, [location.state, navigate]);

  useEffect(() => {
    const load = async () => {
      try {
        const [quizzesRes, enrollments] = await Promise.all([
          axios.get('/api/quizzes').catch(() => ({ data: [] })),
          fetchEnrollments().catch(() => []),
        ]);

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
              image: e.youtubeVideoId ? ytThumb(e.youtubeVideoId) : '',
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
            image: q.thumbnailUrl || '',
            kind: 'quiz' as const,
          }));

        setInProgress([...fromEnrollments, ...fromQuizzes].slice(0, 3));
      } catch {
        /* defaults */
      }
    };
    void load();
  }, [location.pathname]);

  return (
    <div>
      <h1
        className="mb-5"
        style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.015em', color: 'var(--ink)' }}
      >
        {firstName ? `Welcome back, ${firstName}` : 'Welcome back'}
      </h1>

      <StudentMasterInput />

      <div className="my-5 h-px bg-[var(--border)]" />

      <div className="mb-5 flex items-end justify-between">
        <h2 style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--ink-soft)' }}>
          Continue learning
        </h2>
        <button
          type="button"
          onClick={() => navigate('/library?tab=in_progress')}
          className="flex items-center gap-1 pb-0.5 text-[var(--ink-faint)] transition-colors hover:text-[var(--accent)]"
          style={{ fontFamily: 'var(--mono)', fontSize: 12 }}
        >
          View all
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M5 12h14" />
            <path d="M13 6l6 6-6 6" />
          </svg>
        </button>
      </div>

      {inProgress.length === 0 ? (
        <p className="text-[13px] text-[var(--ink-soft)]">No courses or quizzes in progress yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-[18px] md:grid-cols-3">
          {inProgress.map((item) => (
            <ProgressCard
              key={item.id}
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
    </div>
  );
}

function thumbGlyph(tag: string): string {
  const t = tag.toLowerCase();
  if (t.includes('program') || t.includes('python') || t.includes('web')) return '>>>';
  if (t.includes('quiz')) return '?';
  return '{ }';
}

function ProgressCard({ item, onOpen }: { item: ProgressItem; onOpen: () => void }) {
  const current = item.progress > 0;
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group overflow-hidden rounded-[13px] border border-[var(--border)] bg-[var(--surface)] text-left transition-[border-color] duration-150 hover:border-[var(--ink-faint)]"
    >
      <div className="relative flex aspect-[16/10] items-center justify-center overflow-hidden border-b border-[var(--border)] bg-[var(--fill)]">
        {item.image ? (
          <img
            src={item.image}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : null}
        <span
          className="absolute left-2.5 top-2.5 z-[1] rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1 uppercase text-[var(--ink-soft)]"
          style={{ fontFamily: 'var(--mono)', fontSize: 9.5, letterSpacing: '0.05em' }}
        >
          {item.tag}
        </span>
        <span
          className="text-[34px] font-medium tracking-[-0.02em] text-[var(--ink-faint)] opacity-50"
          style={{ fontFamily: 'var(--mono)' }}
        >
          {thumbGlyph(item.tag)}
        </span>
        <span className="absolute z-[2] flex size-10 items-center justify-center rounded-full bg-[rgba(10,10,10,0.55)] opacity-0 transition-opacity group-hover:opacity-100">
          <Play size={14} className="ml-0.5 fill-white text-white" />
        </span>
      </div>
      <div className="px-[15px] pb-4 pt-3.5">
        <h3 className="mb-1 line-clamp-2 text-[14px] font-bold leading-[1.3] tracking-[-0.01em]">{item.title}</h3>
        <p className="mb-3 text-xs text-[var(--ink-soft)]">{item.instructor}</p>
        <div className="mb-1.5 flex items-center justify-between">
          <span
            className="text-[var(--ink-faint)] transition-colors group-hover:text-[var(--accent)]"
            style={{ fontFamily: 'var(--mono)', fontSize: 10.5 }}
          >
            {item.lessons.done} / {item.lessons.total} lessons
          </span>
          <span
            style={{
              fontFamily: 'var(--mono)',
              fontSize: 10.5,
              fontWeight: 500,
              color: current ? 'var(--accent)' : 'var(--ink-soft)',
            }}
          >
            {item.progress}%
          </span>
        </div>
        <div className="h-1 overflow-hidden rounded-full bg-[var(--fill)]">
          <div
            className="h-full rounded-full"
            style={{
              width: `${Math.max(item.progress, current ? 2 : 0)}%`,
              background: current ? 'var(--accent)' : 'var(--border)',
            }}
          />
        </div>
      </div>
    </button>
  );
}
