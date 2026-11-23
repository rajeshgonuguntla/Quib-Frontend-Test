import { Fragment, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { ChevronRight, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useRequireStudioV2 } from '../../hooks/useRequireStudioV2';
import { PageHeader } from '../../shell/PageHeader';
import { courseCounts, myCourseRows, myCourseStats, studioPath, visibleCourses, type CourseFilter } from '../studio/model';
import { CourseAnalyticsPanel } from './CourseAnalyticsPanel';

type Row = (typeof myCourseRows)[number];

function Meter({ value }: { value: number | null }) {
  if (value == null) return <span className="text-[var(--ink-faint)]">–</span>;
  return (
    <span className="inline-flex min-w-[88px] items-center gap-2">
      <span className="h-1 w-14 overflow-hidden rounded-full bg-[var(--fill)]">
        <span data-accent="progress" className="block h-1 rounded-full bg-[var(--accent)]" style={{ width: `${value}%` }} />
      </span>
      <span className="font-[family-name:var(--mono)] text-[12px] text-[var(--ink-soft)]">{value}%</span>
    </span>
  );
}

function Status({ status }: { status: Row['status'] }) {
  if (status === 'published') {
    return <span data-accent="status" className="rounded-full bg-[var(--accent-soft)] px-2 py-0.5 text-[10px] font-semibold tracking-[0.04em] text-[var(--accent)]">PUBLISHED</span>;
  }
  return <span className="rounded-full bg-[var(--fill)] px-2 py-0.5 text-[10px] font-semibold tracking-[0.04em] text-[var(--ink-soft)]">DRAFT</span>;
}

function useIsPhone() {
  const [phone, setPhone] = useState(() => window.matchMedia('(max-width: 767px)').matches);
  useEffect(() => {
    const query = window.matchMedia('(max-width: 767px)');
    const onChange = () => setPhone(query.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);
  return phone;
}

export function MyCoursesPage() {
  useRequireStudioV2();
  const phone = useIsPhone();
  const [filter, setFilter] = useState<CourseFilter>('all');
  const [query, setQuery] = useState('');
  const [removed, setRemoved] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  const rows = useMemo(() => visibleCourses(filter, query, removed), [filter, query, removed]);
  const counts = useMemo(() => courseCounts(removed), [removed]);

  const remove = (row: Row) => {
    setRemoved(row.courseId);
    setOpenId(null);
    setNotice(`Deleted “${row.title}”.`);
  };

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        label="Create"
        title="My courses"
        titleTestId="page-title"
        description="Your drafts and published courses, and how students are doing in each one."
        actions={
          <Link to="/educator-studio" data-testid="new-course" data-accent="primary" className="inline-flex h-11 items-center gap-1.5 rounded-lg bg-[var(--accent)] px-4 text-sm font-semibold text-white">
            <Plus size={16} /> New course
          </Link>
        }
      />
      <div className="mb-6 grid grid-cols-2 overflow-hidden rounded-xl border border-[var(--border)] md:grid-cols-4">
        {myCourseStats.map((stat, index) => (
          <div key={stat.label} data-testid="stat" className={`px-4 py-3 ${index > 0 ? 'border-[var(--border)] md:border-l' : ''} ${index >= 2 ? 'border-t md:border-t-0' : ''}`}>
            <p className="text-label text-[10px] text-[var(--ink-faint)]">{stat.label}</p>
            <p className="mt-1 text-[28px] font-semibold tracking-[-0.04em] text-[var(--ink)]">
              {stat.label === 'Courses' ? counts.all : stat.value}
            </p>
            <p className="text-[12px] text-[var(--ink-soft)]">
              {stat.label === 'Courses' ? `${counts.published} published · ${counts.draft} drafts` : stat.sub}
            </p>
          </div>
        ))}
      </div>
      <div data-testid="course-filter" className="mb-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div role="tablist" className="flex items-center gap-1">
          {([
            ['all', 'All', counts.all],
            ['published', 'Published', counts.published],
            ['draft', 'Drafts', counts.draft],
          ] as const).map(([id, label, count]) => {
            const active = filter === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                data-testid="filter-tab"
                data-filter={id}
                aria-selected={active}
                className={`inline-flex h-11 items-center gap-1.5 rounded-lg px-2 text-[13px] md:h-9 ${active ? 'font-semibold text-[var(--ink)]' : 'text-[var(--ink-soft)]'}`}
                onClick={() => setFilter(id)}
              >
                {label}
                <span data-testid="filter-count" data-accent={active ? 'status' : undefined} className={`rounded-full px-1.5 text-[11px] ${active ? 'bg-[var(--accent-soft)] text-[var(--accent)]' : 'text-[var(--ink-faint)]'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
        <label className="search-box md:max-w-xs">
          <Search size={14} />
          <input data-testid="course-search" value={query} placeholder="Search your courses" onChange={(event) => setQuery(event.target.value)} />
        </label>
      </div>
      {notice ? (
        <p role="status" className="mb-3 text-[13px] text-[var(--ink-soft)]">
          {notice}{' '}
          {removed ? (
            <button
              type="button"
              className="font-semibold text-[var(--ink)]"
              onClick={() => {
                const row = myCourseRows.find((item) => item.courseId === removed);
                setRemoved(null);
                setNotice(row ? `Restored “${row.title}”.` : null);
              }}
            >
              Undo
            </button>
          ) : null}
        </p>
      ) : null}
      {rows.length === 0 ? (
        <p data-testid="course-empty" className="py-10 text-center text-[14px] text-[var(--ink-soft)]">No courses match.</p>
      ) : phone ? (
        <div data-testid="course-cards" className="space-y-3">
          {rows.map((row) => (
            <article key={row.courseId} data-testid="course-card" data-course-id={row.courseId} className="rounded-xl border border-[var(--border)] p-3">
              <div className="flex items-start gap-3">
                <span className="grid size-10 place-items-center rounded-lg bg-[var(--fill)] text-[11px] font-semibold text-[var(--ink-soft)]">{row.initials}</span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-[var(--ink)]">{row.title}</p>
                  <p className="font-[family-name:var(--mono)] text-[11px] text-[var(--ink-faint)]">{row.link || row.subtitle}</p>
                  <div className="mt-2"><Status status={row.status} /></div>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-[12px] text-[var(--ink-soft)]">
                <span>{row.students ?? '–'} students</span>
                <Meter value={row.completionPct} />
              </div>
              <div className="mt-3 flex gap-2">
                <button type="button" data-testid="course-view-analytics" className="h-11 flex-1 rounded-lg border border-[var(--border)] text-[13px]" onClick={() => setOpenId(openId === row.courseId ? null : row.courseId)}>
                  View analytics
                </button>
                <Link data-testid="course-edit" to={studioPath(row.courseId)} className="inline-flex h-11 flex-1 items-center justify-center rounded-lg border border-[var(--border)] text-[13px] font-semibold text-[var(--ink)]">
                  {row.status === 'draft' ? 'Continue' : 'Edit'}
                </Link>
                <button type="button" aria-label={`Delete ${row.title}`} className="grid size-11 place-items-center rounded-lg border border-[var(--border)] text-[var(--ink-faint)]" onClick={() => remove(row)}>
                  <Trash2 size={16} />
                </button>
              </div>
              {openId === row.courseId ? <CourseAnalyticsPanel title={row.title} draft={row.status === 'draft'} onClose={() => setOpenId(null)} /> : null}
            </article>
          ))}
        </div>
      ) : (
        <div data-testid="course-table" className="overflow-hidden rounded-xl border border-[var(--border)]">
            <table className="w-full text-left text-[13px]">
              <thead className="text-label text-[10px] text-[var(--ink-faint)]">
                <tr className="border-b border-[var(--border)]">
                  <th className="px-3 py-2 font-medium">Course</th>
                  <th className="px-2 py-2 font-medium">Status</th>
                  <th className="px-2 py-2 font-medium">Students</th>
                  <th className="px-2 py-2 font-medium">Completion</th>
                  <th className="px-2 py-2 font-medium">Avg. score</th>
                  <th className="px-2 py-2 font-medium">Updated</th>
                  <th className="px-3 py-2 font-medium" />
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <Fragment key={row.courseId}>
                    <tr data-testid="course-row" data-course-id={row.courseId} className="border-b border-[var(--border)] last:border-b-0">
                      <td className="px-3 py-3">
                        <button type="button" className="flex items-center gap-3 text-left" aria-expanded={openId === row.courseId} onClick={() => setOpenId(openId === row.courseId ? null : row.courseId)}>
                          <ChevronRight size={14} className={`text-[var(--ink-faint)] ${openId === row.courseId ? 'rotate-90' : ''}`} />
                          <span className="grid size-9 place-items-center rounded-lg bg-[var(--fill)] text-[11px] font-semibold text-[var(--ink-soft)]">{row.initials}</span>
                          <span>
                            <span className="block font-semibold text-[var(--ink)]">{row.title}</span>
                            <span className="block font-[family-name:var(--mono)] text-[11px] text-[var(--ink-faint)]">{row.link || row.subtitle}</span>
                          </span>
                        </button>
                      </td>
                      <td className="px-2 py-3"><Status status={row.status} /></td>
                      <td className="px-2 py-3 font-[family-name:var(--mono)] text-[var(--ink)]">{row.students ?? '–'}</td>
                      <td className="px-2 py-3"><Meter value={row.completionPct} /></td>
                      <td className="px-2 py-3 font-[family-name:var(--mono)] text-[var(--ink-soft)]">{row.avgScorePct == null ? '–' : `${row.avgScorePct}%`}</td>
                      <td className="px-2 py-3 text-[var(--ink-soft)]">{row.updatedLabel}</td>
                      <td className="px-3 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button type="button" data-testid="course-view-analytics" className="h-9 px-2 text-[12px] text-[var(--ink-soft)]" aria-expanded={openId === row.courseId} onClick={() => setOpenId(openId === row.courseId ? null : row.courseId)}>
                            View analytics
                          </button>
                          <Link data-testid="course-edit" to={studioPath(row.courseId)} className="inline-flex h-9 items-center gap-1 rounded-lg border border-[var(--border)] px-2 text-[12px] font-semibold text-[var(--ink)]">
                            <Pencil size={13} /> {row.status === 'draft' ? 'Continue' : 'Edit'}
                          </Link>
                          <button type="button" aria-label={`Delete ${row.title}`} className="grid size-9 place-items-center text-[var(--ink-faint)]" onClick={() => remove(row)}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {openId === row.courseId ? (
                      <tr key={`${row.courseId}-analytics`}>
                        <td colSpan={7} className="p-0">
                          <CourseAnalyticsPanel title={row.title} draft={row.status === 'draft'} onClose={() => setOpenId(null)} />
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                ))}
              </tbody>
            </table>
        </div>
      )}
    </div>
  );
}
