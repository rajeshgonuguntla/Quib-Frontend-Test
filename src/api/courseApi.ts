import axios from 'axios';

export async function enrollCourse(courseId: string): Promise<void> {
  await axios.post(`/api/courses/${courseId}/enroll`);
}

export async function fetchCourseProgress(courseId: string): Promise<string[]> {
  const res = await axios.get<{ completedLessonIds: string[] }>(`/api/courses/${courseId}/progress`);
  return res.data?.completedLessonIds ?? [];
}

export async function completeLesson(courseId: string, lessonId: string): Promise<void> {
  await axios.post(`/api/courses/${courseId}/lessons/${lessonId}/complete`);
}

export async function submitModuleQuiz(
  courseId: string,
  moduleId: string,
  answers: Record<string, number>,
): Promise<void> {
  await axios.post(`/api/courses/${courseId}/modules/${moduleId}/quiz-submit`, answers);
}
