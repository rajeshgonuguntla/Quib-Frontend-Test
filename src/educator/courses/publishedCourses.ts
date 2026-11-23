import type { OwnedCourseSummary } from '../../types/courseGeneration';

export type PublishedCourseRow = {
  courseId: string;
  title: string;
  initials: string;
  status: 'published';
  link: string | null;
  subtitle: string | null;
  students: number | null;
  completionPct: number | null;
  avgScorePct: number | null;
  updatedLabel: string;
};

function initials(title: string): string {
  const letters = title
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0] ?? '')
    .join('');
  return (letters || 'C').toUpperCase();
}

function updatedLabel(iso?: string): string {
  if (!iso) return '–';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '–';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

/** Courses this profile has published, in the My courses row shape. */
export function toPublishedRows(courses: OwnedCourseSummary[]): PublishedCourseRow[] {
  return courses
    .filter((course) => course.published)
    .map((course) => ({
      courseId: course.courseId,
      title: course.title,
      initials: initials(course.title),
      status: 'published' as const,
      link: null,
      subtitle: `${course.moduleCount} modules`,
      students: null,
      completionPct: null,
      avgScorePct: null,
      updatedLabel: updatedLabel(course.updatedAt ?? course.createdAt),
    }));
}
