import axios from 'axios';

export interface CourseChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface CourseChatResponse {
  reply: string;
}

export interface CourseChatThread {
  messages: CourseChatMessage[];
}

export async function fetchCourseChatThread(courseId: string): Promise<CourseChatMessage[]> {
  const res = await axios.get<CourseChatThread>(`/api/courses/${courseId}/chat`);
  const messages = res.data?.messages;
  if (!Array.isArray(messages)) return [];
  return messages.filter(
    (m): m is CourseChatMessage =>
      !!m
      && (m.role === 'user' || m.role === 'assistant')
      && typeof m.content === 'string'
      && m.content.trim().length > 0,
  );
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
