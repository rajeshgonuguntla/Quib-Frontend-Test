import type { EnrollmentSummary } from '../../types/catalog';

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

function percent(value: number | null | undefined): number | null {
  if (value == null || Number.isNaN(value)) return null;
  return Math.round(value);
}

/** Every course from the profile list (the same set as View all), in the course-table row shape. */
export function toEnrollmentRows(courses: EnrollmentSummary[]): PublishedCourseRow[] {
  return courses.map((course) => ({
    courseId: course.courseId,
    title: course.title,
    initials: initials(course.title),
    status: 'published' as const,
    link: null,
    subtitle: [course.channel, course.category].filter(Boolean).join(' · ') || null,
    students: null,
    completionPct: percent(course.progress),
    avgScorePct: percent(course.score),
    updatedLabel: course.durationLabel?.trim() || '–',
  }));
}
