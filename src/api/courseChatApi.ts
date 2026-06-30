import axios from 'axios';

export interface CourseChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface CourseChatResponse {
  reply: string;
}

export async function sendCourseChat(
  courseId: string,
  message: string,
  options?: {
    lessonId?: string;
    moduleId?: string;
  },
): Promise<CourseChatResponse> {
  const res = await axios.post<CourseChatResponse>(`/api/courses/${courseId}/chat`, {
    message,
    lessonId: options?.lessonId,
    moduleId: options?.moduleId,
  });
  return res.data;
}
