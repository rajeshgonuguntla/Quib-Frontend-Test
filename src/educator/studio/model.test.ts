import { describe, expect, it } from 'vitest';
import { courseCounts, detectLink, findCourseRow, isLiveStudioCourse, isSeededCourse, studioPath, visibleCourses } from './model';

describe('studio static sample', () => {
  it('treats the SAT slug and the list id as the seeded course', () => {
    expect(isSeededCourse('sat-math-sprint')).toBe(true);
    expect(isSeededCourse('sm')).toBe(true);
    expect(isSeededCourse('gv')).toBe(false);
    expect(isLiveStudioCourse('sat-math-sprint')).toBe(false);
    expect(isLiveStudioCourse('gv')).toBe(false);
    expect(isLiveStudioCourse('11111111-1111-1111-1111-111111111111')).toBe(true);
    expect(studioPath('sm')).toBe('/educator-studio/sat-math-sprint');
    expect(studioPath('gv')).toBe('/educator-studio/gv');
    expect(findCourseRow('sat-math-sprint')?.title).toBe('SAT Math Sprint');
  });

  it('filters and searches the sample course list', () => {
    expect(courseCounts(null)).toEqual({ all: 5, published: 3, draft: 2 });
    expect(courseCounts('ds')).toEqual({ all: 4, published: 3, draft: 1 });
    expect(visibleCourses('draft', '', null).map((row) => row.courseId)).toEqual(['gq', 'ds']);
    expect(visibleCourses('all', 'gre', null).map((row) => row.courseId)).toEqual(['gv', 'gq']);
    expect(visibleCourses('published', 'zzz', null)).toEqual([]);
  });

  it('detects the link kinds the empty studio accepts', () => {
    expect(detectLink('https://www.youtube.com/playlist?list=PLsat')).toBe('playlist');
    expect(detectLink('https://youtu.be/abc')).toBe('video');
    expect(detectLink('https://example.com/notes.pdf')).toBe('pdf');
    expect(detectLink('https://example.com/sat')).toBe('web');
    expect(detectLink('not a link')).toBe('invalid');
  });
});