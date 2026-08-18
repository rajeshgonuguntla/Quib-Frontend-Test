import type {
  LessonStudyToolResponse,
  StudyBlank,
  StudyFlashcard,
  StudyToolType,
} from '../api/studyRailApi';

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

/** First-open set from course generation. Cache (regenerate) always wins. */
export function seedStudyToolFromLesson(
  tool: StudyToolType,
  seedFlashcards?: StudyFlashcard[],
  seedBlanks?: StudyBlank[],
): LessonStudyToolResponse | null {
  if (tool === 'flashcards' && seedFlashcards && seedFlashcards.length > 0) {
    return { type: 'flashcards', source: 'course', flashcards: seedFlashcards };
  }
  if (tool === 'blanks' && seedBlanks && seedBlanks.length > 0) {
    return { type: 'blanks', source: 'course', blanks: seedBlanks };
  }
  return null;
}

export function resolveStudyToolData(
  courseId: string,
  lessonId: string,
  tool: StudyToolType,
  seedFlashcards?: StudyFlashcard[],
  seedBlanks?: StudyBlank[],
): LessonStudyToolResponse | null {
  return readCachedStudyTool(courseId, lessonId, tool)
    ?? seedStudyToolFromLesson(tool, seedFlashcards, seedBlanks);
}
