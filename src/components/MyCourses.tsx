import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { ArrowLeft, CheckCircle2, Circle } from 'lucide-react';
import { fetchEnrollments } from '../api/catalogApi';
import type { EnrollmentSummary } from '../types/catalog';
import { ytThumb } from '../utils/catalogMap';

const T = {
  bg: '#0C0C0C',
  surface: '#141414',
  border: 'rgba(255,255,255,0.07)',
  accent: '#6366F1',
  green: '#22C55E',
  t1: '#F4F4F5',
  t2: '#A1A1AA',
  t3: '#71717A',
};

type Filter = 'in_progress' | 'completed';

export function MyCourses() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const filter = (searchParams.get('filter') as Filter) || 'in_progress';
  const [enrollments, setEnrollments] = useState<EnrollmentSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEnrollments()
      .then(setEnrollments)
      .catch(() => setEnrollments([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (filter === 'completed') {
      return enrollments.filter((e) => e.status === 'completed' || (e.progress ?? 0) >= 100);
    }
    return enrollments.filter((e) => e.status !== 'completed' && (e.progress ?? 0) < 100);
  }, [enrollments, filter]);

  const setFilter = (next: Filter) => {
    setSearchParams({ filter: next });
  };

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.t1, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <header
        className="sticky top-0 z-50 flex items-center gap-4 px-6 py-4"
        style={{ background: 'rgba(12,12,12,0.92)', borderBottom: `1px solid ${T.border}`, backdropFilter: 'blur(12px)' }}
      >
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-sm"
          style={{ color: T.t2, background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <ArrowLeft size={16} />
          Dashboard
        </button>
        <h1 className="text-lg font-semibold flex-1">My Courses</h1>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex gap-2 mb-8">
          {([
            { id: 'in_progress' as const, label: 'In Progress', icon: Circle },
            { id: 'completed' as const, label: 'Completed', icon: CheckCircle2 },
          ]).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setFilter(id)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
              style={{
                background: filter === id ? 'rgba(99,102,241,0.15)' : T.surface,
                border: `1px solid ${filter === id ? 'rgba(99,102,241,0.35)' : T.border}`,
                color: filter === id ? T.t1 : T.t2,
                cursor: 'pointer',
              }}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-sm" style={{ color: T.t3 }}>Loading…</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-sm" style={{ color: T.t2 }}>
              {filter === 'completed' ? 'No completed courses yet.' : 'No courses in progress.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((e) => {
              const thumb = e.youtubeVideoId ? ytThumb(e.youtubeVideoId) : undefined;
              const pct = Math.round(e.progress ?? 0);
              return (
                <button
                  key={e.courseId}
                  type="button"
                  onClick={() => navigate(`/course-details/${e.courseId}`)}
                  className="w-full flex gap-4 p-4 rounded-2xl text-left"
                  style={{ background: T.surface, border: `1px solid ${T.border}`, cursor: 'pointer' }}
                >
                  <div
                    className="w-28 flex-shrink-0 rounded-lg overflow-hidden aspect-video"
                    style={{ background: '#1a1a1a' }}
                  >
                    {thumb && <img src={thumb} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-sm font-semibold truncate">{e.title}</h2>
                    <p className="text-xs mt-1" style={{ color: T.t3 }}>
                      {e.channel || e.category} · {filter === 'completed' ? 'Completed' : `${pct}% complete`}
                    </p>
                    {filter !== 'completed' && (
                      <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: T.accent }} />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
