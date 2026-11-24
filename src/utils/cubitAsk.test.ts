import { describe, expect, it } from 'vitest';
import type { EnrollmentSummary } from '../types/catalog';
import { cubitAskError, isCubitQuestion, pickCubitAskCourse } from './cubitAsk';

function enrollment(courseId: string, status: string): EnrollmentSummary {
  return {
    enrollmentId: courseId,
    courseId,
    title: courseId,
    channel: 'Cubit',
    category: 'Math',
    status,
    progress: 10,
  };
}

describe('cubit search ask', () => {
  it('treats a sentence as a Cubit question and a YouTube link as a course start', () => {
    expect(isCubitQuestion('Why does the slope stay constant?')).toBe(true);
    expect(isCubitQuestion('https://www.youtube.com/watch?v=abc123def45')).toBe(false);
    expect(isCubitQuestion('https://example.com/notes.pdf')).toBe(false);
    expect(isCubitQuestion('  ')).toBe(false);
  });

  it('asks the in-progress course before any other enrollment', () => {
    const saved = enrollment('saved-course', 'saved');
    const current = enrollment('current-course', 'in-progress');
    expect(pickCubitAskCourse([saved, current])?.courseId).toBe('current-course');
    expect(pickCubitAskCourse([saved])?.courseId).toBe('saved-course');
    expect(pickCubitAskCourse([])).toBeNull();
  });

  it('uses the tutor message when the learner is not enrolled', () => {
    const err = {
      isAxiosError: true,
      response: { status: 403, data: { message: 'Enroll in this course to use the tutor' } },
      message: 'Forbidden',
    };
    expect(cubitAskError(err)).toBe('Enroll in this course to use the tutor');
  });
});
