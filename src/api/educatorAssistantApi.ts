import axios from 'axios';
import type { CourseUpdatePayload } from '../types/courseGeneration';

export interface EducatorAssistantResponse {
  reply: string;
  hasCourseChanges: boolean;
  courseUpdate: CourseUpdatePayload | null;
}

export async function sendEducatorAssistantMessage(
  courseId: string,
  message: string,
): Promise<EducatorAssistantResponse> {
  const { data } = await axios.post<EducatorAssistantResponse>(
    `/api/educator/courses/${courseId}/assistant`,
    { message },
  );
  return data;
}
