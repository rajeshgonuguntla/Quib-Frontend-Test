import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, BookOpen, Search } from 'lucide-react';
import { fetchCourses } from '../api/catalogApi';
import type { CatalogCourseSummary } from '../types/catalog';
import { courseToCuratedCard } from '../utils/catalogMap';

const T = {
  bg: '#0C0C0C',
  surface: '#141414',
  border: 'rgba(255,255,255,0.07)',
  accent: '#6366F1',
  t1: '#F4F4F5',
  t2: '#A1A1AA',
  t3: '#71717A',
};

export function BrowseCourses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<CatalogCourseSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    fetchCourses({ limit: 100 })
      .then(setCourses)
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = courses.filter((c) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      c.title?.toLowerCase().includes(q)
      || c.category?.toLowerCase().includes(q)
      || c.channelName?.toLowerCase().includes(q)
    );
  });

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
        <div className="flex items-center gap-2 flex-1">
          <BookOpen size={18} style={{ color: T.accent }} />
          <h1 className="text-lg font-semibold">Browse Courses</h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <p className="text-sm mb-6" style={{ color: T.t2 }}>
          Published courses from educators on Quib.
        </p>

        <div
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl mb-8"
          style={{ background: T.surface, border: `1px solid ${T.border}` }}
        >
          <Search size={16} style={{ color: T.t3 }} />
          <input
            type="search"
            placeholder="Search by title, category, or channel…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: T.t1 }}
          />
        </div>

        {loading ? (
          <p className="text-sm" style={{ color: T.t3 }}>Loading courses…</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-sm" style={{ color: T.t2 }}>No published courses yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((course) => {
              const card = courseToCuratedCard(course);
              return (
                <button
                  key={course.courseId}
                  type="button"
                  onClick={() => navigate(`/course-details/${course.courseId}`)}
                  className="text-left rounded-2xl overflow-hidden transition-transform hover:scale-[1.01]"
                  style={{ background: T.surface, border: `1px solid ${T.border}`, cursor: 'pointer' }}
                >
                  <div className="aspect-video w-full overflow-hidden" style={{ background: '#1a1a1a' }}>
                    <img src={card.image} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="p-4">
                    <span
                      className="text-[0.65rem] font-semibold uppercase tracking-wide px-2 py-0.5 rounded"
                      style={{ background: 'rgba(99,102,241,0.12)', color: T.accent }}
                    >
                      {card.tag}
                    </span>
                    <h2 className="text-[0.95rem] font-semibold mt-2 leading-snug" style={{ color: T.t1 }}>
                      {card.title}
                    </h2>
                    <p className="text-[0.78rem] mt-1" style={{ color: T.t3 }}>
                      {card.instructor}
                    </p>
                    <p className="text-[0.72rem] mt-2" style={{ color: T.t3 }}>
                      {course.moduleCount ?? '—'} modules · {course.difficulty ?? 'Mixed'}
                    </p>
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
