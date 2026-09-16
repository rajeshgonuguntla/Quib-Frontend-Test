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
    mode?: 'simplify';
    history?: CourseChatMessage[];
  },
): Promise<CourseChatResponse> {
  const res = await axios.post<CourseChatResponse>(`/api/courses/${courseId}/chat`, {
    message,
    lessonId: options?.lessonId,
    moduleId: options?.moduleId,
    mode: options?.mode,
    history: options?.history,
  });
  return res.data;
}
