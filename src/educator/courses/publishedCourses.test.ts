import { describe, expect, it } from 'vitest';
import { toEnrollmentRows } from './publishedCourses';
import type { EnrollmentSummary } from '../../types/catalog';

const courses: EnrollmentSummary[] = [
  {
    enrollmentId: 'e1',
    courseId: 'letters',
    title: 'Founder Letters',
    channel: 'Cubit',
    category: 'Writing',
    status: 'in-progress',
    progress: 40,
    score: 88,
    durationLabel: '2h 10m',
  },
  {
    enrollmentId: 'e2',
    courseId: 'done',
    title: 'Finished sprint',
    channel: '',
    category: 'Math',
    status: 'completed',
    progress: 100,
    score: null,
  },
];

describe('toEnrollmentRows', () => {
  it('keeps every course from the profile list', () => {
    const rows = toEnrollmentRows(courses);
    expect(rows.map((row) => row.courseId)).toEqual(['letters', 'done']);
    expect(rows[0]).toMatchObject({
      title: 'Founder Letters',
      initials: 'FL',
      status: 'published',
      subtitle: 'Cubit · Writing',
      completionPct: 40,
      avgScorePct: 88,
      updatedLabel: '2h 10m',
    });
    expect(rows[1]).toMatchObject({
      subtitle: 'Math',
      completionPct: 100,
      avgScorePct: null,
      updatedLabel: '–',
    });
  });
});
