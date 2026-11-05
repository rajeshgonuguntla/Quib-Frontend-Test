/** Persist that the learner opened the lesson player for this course. */

const key = (courseId: string) => `cuib:course-launched:${courseId}`;

export function markCourseLaunched(courseId: string): void {
  try {
    localStorage.setItem(key(courseId), '1');
  } catch {
    /* ignore quota / private mode */
  }
}

export function wasCourseLaunched(courseId: string): boolean {
  try {
    return localStorage.getItem(key(courseId)) === '1';
  } catch {
    return false;
  }
}

export function hasCourseProgress(progress: {
  progressPercent?: number;
  completedLessons?: number;
  completedLessonIds?: string[];
  passedQuizModules?: number;
}): boolean {
  if ((progress.progressPercent ?? 0) > 0) return true;
  if ((progress.completedLessons ?? 0) > 0) return true;
  if ((progress.completedLessonIds?.length ?? 0) > 0) return true;
  if ((progress.passedQuizModules ?? 0) > 0) return true;
  return false;
}
