import { describe, expect, it } from 'vitest';
import { toPublishedRows } from './publishedCourses';
import type { OwnedCourseSummary } from '../../types/courseGeneration';

const owned: OwnedCourseSummary[] = [
  { courseId: 'pub', title: 'Founder Letters', published: true, moduleCount: 4, updatedAt: '2026-11-02T12:00:00.000Z' },
  { courseId: 'draft', title: 'Still drafting', published: false, moduleCount: 1 },
];

describe('toPublishedRows', () => {
  it('keeps only courses this profile has published', () => {
    const rows = toPublishedRows(owned);
    expect(rows.map((row) => row.courseId)).toEqual(['pub']);
    expect(rows[0]).toMatchObject({
      title: 'Founder Letters',
      initials: 'FL',
      status: 'published',
      subtitle: '4 modules',
    });
  });
});
