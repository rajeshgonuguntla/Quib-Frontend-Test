import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { fetchCourses, fetchEnrollments } from '../api/catalogApi';
import type { CatalogCourseSummary, EnrollmentSummary } from '../types/catalog';
import { BROWSE_FILTERS, matchesBrowseCard } from '../utils/browseFilter';
import { ytThumb } from '../utils/catalogMap';
import { CourseCard } from './CourseCard';

function creatorName(c: CatalogCourseSummary): string {
  return c.educatorChannelTitle || c.ownerDisplayName || c.channelName || 'Educator';
}

export function BrowseCourses() {
  const navigate = useNavigate();
  const location = useLocation();
  const [courses, setCourses] = useState<CatalogCourseSummary[]>([]);
  const [enrollments, setEnrollments] = useState<EnrollmentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    let mounted = true;
    Promise.all([
      fetchCourses({ limit: 100 }),
      fetchEnrollments().catch(() => [] as EnrollmentSummary[]),
    ])
      .then(([list, enrolled]) => {
        if (!mounted) return;
        setCourses(list);
        setEnrollments(enrolled);
      })
      .catch(() => {
        if (mounted) setCourses([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  const progressByCourse = useMemo(() => {
    const map = new Map<string, EnrollmentSummary>();
    for (const e of enrollments) map.set(e.courseId, e);
    return map;
  }, [enrollments]);

  const visible = useMemo(
    () => courses.filter((c) => matchesBrowseCard({
      filter,
      query,
      category: c.category ?? '',
      title: c.title ?? '',
      creator: creatorName(c),
    })),
    [courses, filter, query],
  );

  const clearFilters = () => {
    setFilter('all');
    setQuery('');
  };

  return (
    <section className="browse-hero">
      <div className="eyebrow eyebrow-heading">Browse</div>

      <div className="browse-toolbar">
        <div className="search-box browse-search">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search courses, creators..."
            aria-label="Search courses, creators"
          />
        </div>
      </div>

      <div className="filter-row">
        {BROWSE_FILTERS.map((chip) => (
          <button
            key={chip.id}
            type="button"
            className={`filter-chip${filter === chip.id ? ' active' : ''}`}
            onClick={() => setFilter(chip.id)}
          >
            {chip.label}
          </button>
        ))}
      </div>

      <div className="card-divider" />

      {loading ? (
        <div className="course-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="course-card" style={{ minHeight: 220, pointerEvents: 'none' }} />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="empty-state">
          <div className="empty-glyph">[ ]</div>
          <div className="empty-title">No matches</div>
          <div className="empty-sub">Nothing here fits that filter and search combo. Try clearing one.</div>
          <button type="button" className="empty-clear" onClick={clearFilters}>Clear filters</button>
        </div>
      ) : (
        <div className="course-grid">
          {visible.map((course) => {
            const enrolled = progressByCourse.get(course.courseId);
            const total = enrolled?.lessonCount && enrolled.lessonCount > 0 ? enrolled.lessonCount : 0;
            const progress = enrolled?.progress ?? 0;
            return (
              <CourseCard
                key={course.courseId}
                item={{
                  id: course.courseId,
                  title: course.title,
                  creator: creatorName(course),
                  tag: course.category || 'General',
                  progress,
                  lessonsDone: total ? Math.round((progress / 100) * total) : 0,
                  lessonsTotal: total,
                  current: enrolled?.status === 'in-progress' || progress > 0,
                  image: course.youtubeVideoId ? ytThumb(course.youtubeVideoId) : undefined,
                }}
                onOpen={() => navigate(`/course-details/${course.courseId}`, {
                  state: { from: `${location.pathname}${location.search}` },
                })}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}
