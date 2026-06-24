import axios from 'axios';

export interface CourseProgress {
  completedLessonIds: string[];
  passedModuleIds: string[];
  progressPercent: number;
  totalLessons: number;
  completedLessons: number;
  totalQuizModules: number;
  passedQuizModules: number;
}

export async function enrollCourse(courseId: string): Promise<void> {
  await axios.post(`/api/courses/${courseId}/enroll`);
}

export async function fetchCourseProgress(courseId: string): Promise<CourseProgress> {
  const res = await axios.get<CourseProgress>(`/api/courses/${courseId}/progress`);
  return res.data ?? {
    completedLessonIds: [],
    passedModuleIds: [],
    progressPercent: 0,
    totalLessons: 0,
    completedLessons: 0,
    totalQuizModules: 0,
    passedQuizModules: 0,
  };
}

export async function completeLesson(courseId: string, lessonId: string): Promise<void> {
  await axios.post(`/api/courses/${courseId}/lessons/${lessonId}/complete`);
}

export interface ModuleQuizResult {
  score: number;
  total: number;
  passed: boolean;
}

export async function submitModuleQuiz(
  courseId: string,
  moduleId: string,
  answers: Record<string, number>,
): Promise<ModuleQuizResult> {
  const res = await axios.post<ModuleQuizResult>(
    `/api/courses/${courseId}/modules/${moduleId}/quiz-submit`,
    answers,
  );
  return res.data;
}
