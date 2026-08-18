import type { LessonStudyToolResponse, StudyToolType } from '../api/studyRailApi';

// ponytail: session memory only — switching study tabs remounts StudyRailPanel.
// Ceiling: lost on full reload; upgrade: persist per user/lesson in Postgres.
const store = new Map<string, LessonStudyToolResponse>();

export function studyToolCacheKey(
  courseId: string,
  lessonId: string,
  tool: StudyToolType,
): string {
  return `${courseId}\0${lessonId}\0${tool}`;
}

export function readCachedStudyTool(
  courseId: string,
  lessonId: string,
  tool: StudyToolType,
): LessonStudyToolResponse | null {
  return store.get(studyToolCacheKey(courseId, lessonId, tool)) ?? null;
}

export function writeCachedStudyTool(
  courseId: string,
  lessonId: string,
  tool: StudyToolType,
  data: LessonStudyToolResponse,
): void {
  store.set(studyToolCacheKey(courseId, lessonId, tool), data);
}

export function clearStudyToolCache(): void {
  store.clear();
}
