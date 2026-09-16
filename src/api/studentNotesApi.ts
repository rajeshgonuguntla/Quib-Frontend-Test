import axios from 'axios';

export interface StudentLessonNote {
  content: string;
  updatedAt?: string | null;
}

export async function fetchMyLessonNotes(
  courseId: string,
  lessonId: string,
): Promise<StudentLessonNote> {
  const res = await axios.get<StudentLessonNote>(
    `/api/courses/${courseId}/lessons/${lessonId}/my-notes`,
  );
  return res.data;
}

export async function saveMyLessonNotes(
  courseId: string,
  lessonId: string,
  content: string,
): Promise<StudentLessonNote> {
  const res = await axios.put<StudentLessonNote>(
    `/api/courses/${courseId}/lessons/${lessonId}/my-notes`,
    { content },
  );
  return res.data;
}
